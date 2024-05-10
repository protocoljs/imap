#!/usr/bin/env node
import input from '@inquirer/input'
import select, { Separator } from '@inquirer/select'

const answer2 = select({
    message: 'Are you sure ?',
    choices: [
        {
            name: 'yes',
            value: 'npm',
            description: 'this is a sure action',
        },
        {
            name: 'no',
            value: 'yarn',
            description: 'this is a not sure action',
        },
    ],
})