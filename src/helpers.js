import { isCancel, autocompleteMultiselect } from '@clack/prompts'
import { exitCli } from './cli.js'
import { bold, green, yellow } from 'colorette'
import { confirm } from '@clack/prompts'

export const CANCEL_MESSAGE = 'Execution is cancel'

/**
 * Creates a repository data object from an array of repository info.
 * @param {string[]} {} - Array with repository info fields.
 * @returns {object} Repository data object.
 */
export function createRepositoryData({ name, owner, private: isPrivate }) {
  return { name, owner: owner.login, isPrivate }
}

/**
 * Checks if the prompt was cancelled and exits if so.
 * @param {*} variableToCheck - Value to check for cancellation.
 */
export function checkPrompt(variableToCheck) {
  if (isCancel(variableToCheck)) {
    exitCli(yellow(CANCEL_MESSAGE))
  }
}

/**
 * Shows a multiselect prompt for repositories to delete.
 * @param {object[]} repositories - Array of repository data objects.
 * @returns {Promise<string[]>} Selected repository names.
 */
export async function showDeletedRepositoriesMultiselectPrompt(repositories) {
  if (repositories.length === 0) {
    exitCli('No repositories to delete.')
  }
  if (repositories.length === 1) {
    exitCli('ℹ️ Only one repository found, no need to delete.')
  }

  const options = repositories.map(({ name, owner, isPrivate }) => ({
    value: `${name}:${owner}`,
    label: isPrivate
      ? green(`${name} (Private: ${isPrivate})`)
      : yellow(`${name} (Private: ${isPrivate})`)
  }))

  const deletedRepositories = await autocompleteMultiselect({
    message: bold('Select repositories to delete:\n'),
    options,
    required: false,
    placeholder: 'Search...',
    maxItems: 10 // Maximum number of items to display at once
  })

  checkPrompt(deletedRepositories)

  return deletedRepositories
}

/**
 * Shows a confirmation prompt before deleting repositories.
 * @returns {Promise<boolean>} True if confirmed, false otherwise.
 */
export async function showConfirmationPrompt() {
  const confirmed = await confirm({
    message: bold(`Are you sure you want to delete the selected repositories?`)
  })

  checkPrompt(confirmed)
  return confirmed
}
