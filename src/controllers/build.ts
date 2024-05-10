// @ts-ignore
import config from ''

interface PackageConfig {
    mailboxes: object
}

export default function build() {
    console.log(config.mailboxes)
}