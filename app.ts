import * as net from 'net'

type Capability = 'AUTH=PLAIN' | 'IDLE'

export default function imap({port=3000, host='localhost', capabilities=['AUTH=PLAIN'], debug=false} : {
    port?: number,
    host?: string,
    capabilities?: Capability[],
    debug?: boolean
}) {
    const server = net.createServer({allowHalfOpen: true, keepAlive: true}, (socket: any) => {
        let loggedIn: boolean = false
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
                    if (loggedIn) {

                        socket.write(`${tag} OK SELECT completed\n`)
                    } else {
                        socket.write(`${tag} NO [ALERT] authentication required\n`)
                    }
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
                        if (options[0] === 'PAUL' && options[1] === 'MICHEL') {
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
        socket.on('end', () => {
            console.log('Connection ended')
        })
    })
    server.on('error', (error: any) => {
        console.error(` \x1b[41m ERROR \x1b[0m ${error.message}\n`)
    })
}