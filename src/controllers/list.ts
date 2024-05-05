export default function listController(socket: any, tag: string, options: string[]) {
    socket.write(`* LIST (\\NoInferiors) "/" INBOX \n`)
    socket.write(`* LIST (\\NoInferiors \\Drafts) "/" Drafts \n`)
    socket.write(`* LIST (\\NoInferiors \\Sent) "/" Sent \n`)
    socket.write(`* LIST (\\NoInferiors \\Junk) "/" Junk \n`)
    socket.write(`* LIST (\\NoInferiors \\Trash) "/" Trash \n`)
    socket.write(`* LIST (\\NoInferiors \\Archive) "/" Archives \n`)
    socket.write(`${tag} OK LIST completed\n`)
}