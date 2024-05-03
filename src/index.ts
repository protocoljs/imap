import * as net from 'node:net'
import selectController from './controllers/select'
import examineController from './controllers/examine'

type capability = 'AUTH=PLAIN' | 'IDLE'

interface Options {
    capabilities?: capability[],
    debug?: boolean
}


/**
 * Creates an IMAP server using the provided options.
 * @param options - The configuration options for creating the server.
 * @returns An instance of `IMAPServer`.
 * @example
 * const options = {
 *   capabilities: ['AUTH=PLAIN'],
 *   debug: false
 * }
 * const server = imap(options)
 * server.authenticate({
 *     if (...) {
 *         return true
 *     }
 * })
 * server.listen()
 * @see Options for more details about what the options object can contain.
 */
export default function imap(options: Options) {
  return new IMAPServer(options)
}

class IMAPServer {
    constructor(options: Options) {
        let start = performance.now()
        const { capabilities = ['AUTH=PLAIN'], debug = false } = options
        let server = net.createServer({keepAlive: true}, (socket: any) => {
            console.log(`\x1b[35m ϟ \x1b[0m Socket with ${socket.localAddress}`)
            let loggedIn: boolean = false
            let selected: string | null = null
            socket.setEncoding('utf8')
            socket.write(`* OK [CAPABILITY IMAP4rev2 ${capabilities.join(' ')}] Server ready\n`)
            socket.on('data', (data: string) => {
                let [tag, command, ...options] = data.replace(/[\n\r]/g, '').split(' ')
                switch (command) {
                    case 'NOOP':
                        socket.write(`${tag} OK NOOP completed\n`)
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
                            socket.write(`* LIST (\\NoInferiors) "/" INBOX \n`)
                            socket.write(`* LIST (\\NoInferiors \\Drafts) "/" Drafts \n`)
                            socket.write(`* LIST (\\NoInferiors \\Sent) "/" Sent \n`)
                            socket.write(`* LIST (\\NoInferiors \\Junk) "/" Junk \n`)
                            socket.write(`* LIST (\\NoInferiors \\Trash) "/" Trash \n`)
                            socket.write(`* LIST (\\NoInferiors \\Archive) "/" Archives \n`)
                            socket.write(`${tag} OK LIST completed\n`)
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
                        console.error(` \x1b[41m ERROR \x1b[0m Command "${command.toString()}" not supported\n`)
                        socket.write(`${tag} BAD Rejected\n`)
                        break
                }
            })
            socket.on('close', () => {
                console.log(`\x1b[32m ϟ \x1b[0m Socket closed`)
            })
        })
        server.on('error', (error: any) => {
            console.error(` \x1b[41m ERROR \x1b[0m ${error.message}\n`)
        })
        server.on('listening', (error: any) => {
            console.log(`\x1b[32m → \x1b[0m Started in ${(performance.now() - start).toFixed(1)}ms`)
        })
        this.netServer = server
    }

    private checkAuthenticate : (username: string, password: string) => boolean = () => { return true }

    authenticate(func: (username: string, password: string) => boolean) {
        this.checkAuthenticate = func
    }

    private netServer: net.Server
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
                console.log(` \x1b[42m PRODUCTION \x1b[0m IMAP Protocol.js v${version}\n`)
                break
            case 'development':
                console.log(` \x1b[43m DEVELOPMENT \x1b[0m IMAP Protocol.js v${version}\n`)
                break
            default:
                break
        }
        console.log(`   \x1b[1m local \x1b[0m     imap://localhost:${port}`)
        if (['localhost', '127.0.0.1'].includes(hostname)) {
            console.log(`   \x1b[1m network \x1b[0m  \x1b[37m disabled\x1b[0m\n`)
        } else {
            console.log(`   \x1b[1m network \x1b[0m  \x1b[32m enabled\x1b[0m\n`)
        }
        if (version.includes('alpha') || version.includes('beta')) {
            console.log(`   \x1b[33m warning \x1b[0m   this is a \x1b[4mprerelease\x1b[0m, feature might be missing\n`)
        }
        this.netServer.listen({port: port, host: hostname})
    }
}