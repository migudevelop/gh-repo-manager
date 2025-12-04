#!/usr/bin/env node
import { Command } from 'commander'
import {
  deleteRepositories,
  getRepositories,
  printRepositories
} from './repository-manager.js'
import {
  showConfirmationPrompt,
  showDeletedRepositoriesMultiselectPrompt
} from './helpers.js'
import { outro, intro, log, note } from '@clack/prompts'
import { blueBright, greenBright, redBright } from 'colorette'

const EXIT_APP_MESSAGE = 'Thanks for use this cli'
const CANCEL_CODE = 0

/**
 * Initializes the gh-repo-manager CLI and defines the main options and actions.
 */
export function initCli() {
  const program = new Command()
  program
    .name('gh-repo-manager')
    .description('List and delete github repositories')
    .version('0.1.0')
    .option('-d, --delete', 'Delete repositories')
    .option('-t, --token <token>', 'GitHub token (overrides GITHUB_TOKEN env)')
    .action(async (options) => {
      intro(blueBright('Welcome to gh-repo-manager CLI!'))
      note('You can edit the file src/index.jsx', 'Next steps.')
      if (options?.delete) {
        const repositories = await getRepositories(options?.token)
        const selectedRepositories =
          await showDeletedRepositoriesMultiselectPrompt(repositories)

        const confirmed = await showConfirmationPrompt()

        if (confirmed) {
          const deleteResult = await deleteRepositories(
            selectedRepositories,
            options?.token
          )
          if (deleteResult) {
            exitCli(greenBright('Repositories deleted successfully.'))
          } else {
            exitCli(redBright('Error deleting repositories.'))
          }
        }
        exitCli()
      }
      await printRepositories(options?.token)
      exitCli()
    })

  program.parse(process.argv)
}

/**
 * Ends the CLI execution showing an exit message.
 * @param {string} [message=EXIT_APP_MESSAGE] - Message to display before exiting.
 */
export function exitCli(message = EXIT_APP_MESSAGE) {
  log.step('----------------------------------')
  outro(blueBright(message))
  process.exit(CANCEL_CODE)
}
