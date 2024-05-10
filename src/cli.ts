#!/usr/bin/env node
import input from '@inquirer/input'
import select, { Separator } from '@inquirer/select'

const answer2 = select({
  message: 'Are you sure ?',
  choices: [
    {
      name: 'npm',
      value: 'npm',
      description: 'npm is the most popular package manager',
    },
    {
      name: 'yarn',
      value: 'yarn',
      description: 'yarn is an awesome package manager',
    },
  ],
});