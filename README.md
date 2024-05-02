# SimpleMailbox IMAP server

![NPM Version](https://img.shields.io/npm/v/%40simplemailbox%2Fimap?style=for-the-badge&logo=npm&color=blue&label=version)
![NPM Downloads](https://img.shields.io/npm/dy/%40simplemailbox%2Fimap?style=for-the-badge&logo=npm)

> ⚠️ **Warning**:
> this package is currently being built and may have features missing. Please use with caution.

Create your own, robust and easy to use IMAP server. Built with Node.js and Typescript, it offers high performance and a straightforward interface for setting up and launching your own IMAP server.

## Getting started

This package is available on **npm** as follows:

```
npm install @simplemailbox/imap
```

## Usage

Launching you own IMAP server has never been that simple! Here's a quick example to start.

```typescript
import imap from "@simplemailbox/imap"

const server = imap()
server.listen({port: 993, host: 'localhost'})
```