import * as net from 'node:net'
import selectController from './controllers/select'
import examineController from './controllers/examine'
import listController from "./controllers/list"
import build from "./controllers/build";

type capability = 'AUTH=PLAIN' | 'IDLE'

interface Options {
    capabilities?: capability[],
    debug?: boolean
}


/**
 * Creates an IMAP server using the provided options
 *
 * @param options - The configuration options for creating the server
 */
export default function imap(options: Options) {
  return new IMAPServer(options)
}

class IMAPServer {
    constructor(options: Options) {
        let start = performance.now()
        build()
        const { capabilities = ['AUTH=PLAIN'], debug = false } = options
        let server = net.createServer({keepAlive: true}, (socket: any) => {
            console.log(`\x1b[35mϟ\x1b[0m Socket with ${socket.localAddress}`)
            let loggedIn: boolean = false
            let selected: string | null = null
            let idleTag: string | null
            socket.setEncoding('utf8')
            socket.write(`* OK [CAPABILITY IMAP4rev2 ${capabilities.join(' ')}] Server ready\n`)
            socket.on('data', (data: string) => {
                if (idleTag && data.includes('DONE')) {
                    socket.write(`${idleTag} OK IDLE terminated\n`)
                }
                let [tag, command, ...options] = data.replace(/[\n\r]/g, '').split(' ')
                switch (command) {
                    case 'NOOP':
                        socket.write(`${tag} OK NOOP completed\n`)
                        break
                    case 'IDLE':
                        idleTag = tag
                        socket.write(`+ idling\n`)
                        break
                    case 'COPY':
                        idleTag = tag
                        if (options.length === 2) {
                            const [messagesList, toMailbox] = options
                            socket.write(`${tag} OK COPY completed\n`)
                        } else {
                            socket.write(`${tag} BAD COPY failed\n`)
                        }
                        break
                    case 'CREATE':
                        idleTag = tag
                        socket.write(`${tag} BAD\n`)
                        break
                    case 'DELETE':
                        idleTag = tag
                        socket.write(`${tag} BAD\n`)
                        break
                    case 'search':
                        idleTag = tag
                        socket.write(`${tag} BAD\n`)
                        break
                    case 'APPEND':
                        idleTag = tag
                        socket.write(`${tag} BAD\n`)
                        break
                    case 'LOGOUT':
                        socket.write('* BYE logging out\n')
                        socket.write(`${tag} OK LOGOUT completed\n`)
                        socket.destroySoon()
                        break
                    case 'SELECT':
                        selectController(socket, tag, options, {loggedIn: loggedIn, selected: selected})
                        break
                    case 'EXAMINE':
                        examineController(socket, tag, options, {loggedIn: loggedIn, selected: selected})
                        break
                    case 'LIST':
                        if (loggedIn) {
                            listController(socket, tag, options)
                        } else {
                            socket.write(`${tag} NO [ALERT] authentication required\n`)
                        }
                        break
                    case 'CAPABILITY':
                        socket.write(`* CAPABILITY IMAP4rev2 ${capabilities.join(" ")}\n`)
                        socket.write(`${tag} OK CAPABILITY completed\n`)
                        break
                    case 'LOGIN':
                        if (options.length == 2) {
                            if (this.checkAuthenticate(options[0], options[1])) {
                                loggedIn = true
                                socket.write(`${tag} OK LOGIN completed\n`)
                            } else {
                                socket.write(`${tag} NO LOGIN failure\n`)
                            }
                        } else {
                            socket.write(`${tag} BAD LOGIN invalid\n`)
                        }
                        break
                    case 'AUTHENTICATE':
                        socket.write(`${tag} OK AUTHENTICATE completed\n`)
                        break
                    default:
                        console.error(`\x1b[41m ERROR \x1b[0m Command "${command.toString()}" not supported\n`)
                        socket.write(`${tag} BAD rejected\n`)
                        break
                }
            })
            socket.on('close', () => {
                console.log(`\x1b[32mϟ\x1b[0m Socket closed`)
            })
        })
        server.on('error', (error: any) => {
            console.error(`\x1b[41m ERROR \x1b[0m ${error.message}\n`)
        })
        server.on('listening', (error: any) => {
            console.log(`\x1b[32m→\x1b[0m Started in ${(performance.now() - start).toFixed(1)}ms`)
        })
        this.netServer = server
    }

    private checkAuthenticate : (username: string, password: string) => boolean = () => { return true }

    /**
     * Allows you to implement your own authentication verifications
     *
     * @param func - Your own authentication function
     */
    authenticate(func: (username: string, password: string) => boolean) {
        this.checkAuthenticate = func
    }

    private netServer: net.Server

    /**
     * Starts the server on a specific port
     *
     * @param port - Port on which your server runs
     * @param hostname - Hostname to run your server on
     */
    listen({port=3000, hostname='localhost'} : {port?: number, hostname?: string}): void {
        let defaultFunction : (username: string, password: string) => boolean = () => { return true }
        if (this.checkAuthenticate === defaultFunction) {
            throw Error('Invalid authentication function')
        }
        let packageJson = require('../package.json')
        let version = packageJson.version
        let env = process.env.NODE_ENV || 'development'
        switch (env) {
            case 'production':
                console.log(`\x1b[42m PRODUCTION \x1b[0m IMAP Protocol.js v${version}\n`)
                break
            case 'development':
                console.log(`\x1b[43m DEVELOPMENT \x1b[0m IMAP Protocol.js v${version}\n`)
                break
            default:
                break
        }
        if (['localhost', '127.0.0.1'].includes(hostname)) {
            console.log(`   \x1b[1m local \x1b[0m     imap://localhost:${port}`)
            console.log(`   \x1b[1m network \x1b[0m  \x1b[37m disabled\x1b[0m\n`)
        } else {
            console.log(`   \x1b[1m address \x1b[0m     imap://${hostname}:${port}`)
            console.log(`   \x1b[1m network \x1b[0m  \x1b[32m enabled\x1b[0m\n`)
        }
        if (version.includes('alpha') || version.includes('beta')) {
            console.log(`   \x1b[33m warning \x1b[0m   this is a \x1b[4mprerelease\x1b[0m, some features may malfunction or be missing\n`)
        }
        this.netServer.listen({port: port, host: hostname})
    }
}