import { exitCli } from './cli.js'
import { spinner, log } from '@clack/prompts'
import pLimit from 'p-limit'

const limit = pLimit(2)

const spin = spinner()

import { createRepositoryData } from './helpers.js'
import { cyan, green, yellow } from 'colorette'
import { Octokit } from '@octokit/rest'

function getOctokit(token) {
  if (!token && !process.env.GITHUB_TOKEN) {
    log.warning(
      yellow(
        'GitHub token is required. Please provide it via --token option or GITHUB_TOKEN environment variable.'
      )
    )
    exitCli()
    return
  }
  return new Octokit({ auth: token ?? process.env.GITHUB_TOKEN })
}

/**
 * Gets the list of local reapositories with relevant information.
 * @returns {Promise<object[]>} Array of objects with repository data.
 */
export async function getRepositories(token) {
  const octokit = getOctokit(token)
  const repos = await octokit.paginate(
    octokit.rest.repos.listForAuthenticatedUser,
    { per_page: 100, sort: 'updated' }
  )
  return repos.map(createRepositoryData)
}

/**
 * Delete a GitHub repository.
 * @param {string} owner - Repository owner (user or org).
 * @param {string} repo - Repository name.
 * @returns {Promise<boolean>} True if deleted, false on error.
 */
export async function deleteRepository(owner, repo, token) {
  try {
    const octokit = getOctokit(token)
    log.info(`Deleting repository ${owner}/${repo}...`)
    const result = await octokit.rest.repos.delete({ owner, repo })
    return {
      isFinished: true,
      isDeleted: result?.status >= 200 && result?.status < 300,
      result
    }
  } catch (error) {
    log.error(
      `Error deleting repository ${owner}/${repo}:`,
      error.message ?? error
    )
    return { isFinished: false, result: null }
  }
}

/**
 * Delete a GitHub repositories.
 * @param {string[]} owners - Repository names and owners in "name:owner" format.
 * @returns {Promise<boolean>} True if deleted, false on error.
 */
export async function deleteRepositories(owners, token) {
  const errors = []
  spin.start('Loading')

  const tasks = owners.map((ownerRepo) => {
    const [name, owner] = ownerRepo.split(':')
    return limit(async () => {
      try {
        const result = await deleteRepository(owner, name, token)
        return { owner, name, ...result }
      } catch (error) {
        return { owner, name, error }
      }
    })
  })

  const results = await Promise.all(tasks)

  results.forEach(({ owner, name, isDeleted, result, error }) => {
    if (error) {
      errors.push({ owner, name, error })
      log.error(`Failed to delete ${owner}/${name}: ${error?.message ?? error}`)
      return
    }
    if (isDeleted) {
      log.success(green(`Deleted ${owner}/${name}`))
    } else {
      errors.push({
        owner,
        name,
        error: new Error(`Unexpected status code: ${result?.status}`)
      })
      log.error(
        `Failed to delete ${owner}/${name}: Unexpected status code ${result?.status}`
      )
    }
  })

  spin.message('Finishing')

  if (errors.length > 0) {
    spin.stop()
    log.error('Some errors occurred during deletion')
    log.error(JSON.stringify(errors, null, 2))
    return false
  }

  spin.stop('Finished deleting repositories')
  return true
}

/**
 * Prints the list of repositories in the terminal with formatting and colors.
 * @returns {Promise<void>} No return value, prints to console.
 */
export async function printRepositories(token) {
  const repositories = await getRepositories(token)
  if (repositories.length === 0) {
    exitCli('No repositories found.')
  }
  repositories.forEach(({ name, isPrivate }) => {
    const repoText = isPrivate
      ? cyan(`${name} ${yellow(`(Private: ${isPrivate})`)}`)
      : cyan(`${name} ${green(`(Private: ${isPrivate})`)}`)
    log.info(repoText)
  })
}
