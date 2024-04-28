import * as net from 'net'

type Capability = 'AUTH=PLAIN' | 'IDLE'

export default function imap({port=3000, host='localhost', capabilities=['AUTH=PLAIN'], debug=false} : {
    port?: number,
    host?: string,
    capabilities?: Capability[],
    debug?: boolean
}) {
    const server = net.createServer({allowHalfOpen: true, keepAlive: true}, (socket) => {
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
                case 'LIST':
                    socket.write('* LIST (\\Noselect) "/" ""\n')
                    socket.write(`${tag} OK LIST completed\n`)
                    break
                case 'CAPABILITY':
                    socket.write(`* CAPABILITY IMAP4rev2 ${capabilities.join(" ")}\n`)
                    socket.write(`${tag} OK CAPABILITY completed\n`)
                    break
                case 'LOGIN':
                    if (options.length >= 2) {
                        if (options[0] === 'PAUL' && options[1] === 'MICHEL') {
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
    server.listen({port: port, host: host, exclusive: true}, () => {
        console.log(` \x1b[42m START \x1b[0m IMAP Server is running\n`)
        console.log(`\x1b[1m local \x1b[0m     imap://localhost:${port}`)
        console.log(`\x1b[1m network \x1b[0m  \x1b[37m disabled\x1b[0m\n`)
    })
    server.on('error', (error) => {
        console.error(` \x1b[41m ERROR \x1b[0m ${error.message}\n`)
    })
}

imap({})