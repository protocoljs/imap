export default function selectController(socket: any, tag: string, options: any, {loggedIn, selected} : {loggedIn: boolean, selected: string | null}) {
    if (loggedIn) {
        if (options.length == 1) {
            socket.write(`* 18 EXISTS\n`)
            socket.write(`* FLAGS (\\Answered \\Flagged \\Deleted \\Seen)\n`)
            socket.write(`* LIST () "/" ${selected}\n`)
            socket.write(`* OK [UIDVALIDITY 9877410381] UID validity date\n`)
            socket.write(`* OK [UIDNEXT 102] next UID\n`)
            socket.write(`* OK [PERMANENTFLAGS (\\Seen \\Deleted)] next UID\n`)
            socket.write(`${tag} OK [READ-ONLY] EXAMINE completed\n`)
        } else {
            socket.write(`${tag} BAD missing parameter\n`)
        }
    } else {
        socket.write(`${tag} NO [ALERT] authentication required\n`)
    }
}