# Protocol.js

![NPM Version](https://img.shields.io/npm/v/%40protocoljs%2Fimap?style=for-the-badge&logo=npm&color=yellow&label=version)
![NPM Downloads](https://img.shields.io/npm/dy/%40protocoljs%2Fimap?style=for-the-badge&logo=npm)
![npms.io](https://img.shields.io/npms-io/maintenance-score/%40protocoljs%2Fimap?style=for-the-badge&logo=npm)

Create your own, robust and easy to use IMAP server. Built with Node.js and Typescript, this package offers a lightweight, high performance and straightforward interface for setting up and launching your own IMAP server.

## Installation

**Node LTS 20.x or higher**\
This package is available on **npm** as follows and supports both CommonJS and ECMAScript modules (ESM) projects:

```
npm install @protocoljs/imap
```

## Documentation

The official documentation is available at [https://protocoljs.github.io/docs](https://protocoljs.github.io/docs)

## Reporting

You can report issues and suggest features on [GitHub Issues](https://github.com/protocoljs/imap/issues).

## Simple example

Launching you own IMAP server has never been that simple! Here's a quick example to start.

```typescript
import imap from "@protocoljs/imap"

function myAuthenticationFunction() : boolean {
  // your custom authentication code
}

const server = imap()
server.authenticate(myAuthenticationFunction)
server.listen({port: 993, host: '0.0.0.0'})
```
