import * as core from '@actions/core'
import * as io from '@actions/io'
import * as path from 'path'
import * as semantic from 'semantic-release'

import { runCommand } from './exec.js'
import { inputs } from './inputs.js'
import { outputs } from './outputs.js'

/**
 * Installs additional npm packages specified in the extras parameter.
 * Strips quotes and newlines from the input before installation.
 * Runs silently unless RUNNER_DEBUG is set to '1'.
 *
 * @param extras - Space or newline-separated list of npm packages to install
 * @returns Promise that resolves when installation completes
 */
export async function installTask(extras: string): Promise<void> {
    if (!extras) {
        return
    }
    const replaced = extras.replace(/['"]/g, '').replace(/[\n\r]/g, ' ')
    const isSilent = process.env.RUNNER_DEBUG !== '1'
    const { stdout, stderr } = await runCommand(
        `npm install ${replaced} --no-audit ${isSilent ? '--silent' : ''}`,
        { cwd: path.resolve(__dirname, '..') }
    )
    core.debug(stdout)
    core.error(stderr)
}

/**
 * Sets up initial state for the action.
 * Sets the new_release_published output to 'false' as default.
 * Logs workspace and current working directory for debugging.
 *
 * @returns Promise that resolves when setup completes
 */
export async function setupTask(): Promise<void> {
    core.setOutput(outputs.new_release_published, 'false')
    core.debug('workspace: ' + path.resolve(__dirname, '..'))
    core.debug('process.cwd: ' + process.cwd())
    return Promise.resolve()
}

/**
 * Cleans up temporary files created during the action run.
 * Removes the .npmrc file to avoid leaking credentials.
 *
 * @returns Promise that resolves when cleanup completes
 */
export async function cleanupTask(): Promise<void> {
    await io.rmRF('.npmrc')
}

/**
 * Processes semantic-release results and sets GitHub Actions outputs.
 * Handles both the last release information and new release details.
 * Parses version into major, minor, and patch components.
 *
 * @param result - Result object from semantic-release execution
 * @returns Promise that resolves when all outputs are set
 */
export async function outputTask(result: semantic.Result): Promise<void> {
    if (!result) {
        core.debug("no release published")
        return
    }
    const { lastRelease, commits, nextRelease, releases } = result
    if (lastRelease.version) {
        core.debug(`last release was "${lastRelease.version}"`)
        core.setOutput(outputs.last_release_version, lastRelease.version)
        core.setOutput(outputs.last_release_git_head, lastRelease.gitHead)
        core.setOutput(outputs.last_release_git_tag, lastRelease.gitTag)
    }
    // NOTE: wrong types upstream, nextRelease is indeed optional on results
    // eslint-disable-next-line
    if (!nextRelease) {
        core.debug('no release published')
        return
    }
    core.debug(`published ${nextRelease.type} release version ${nextRelease.version} containing ${String(commits.length)} commits`)
    for (const release of releases) {
        core.debug(`release was published with plugin "${release.pluginName}"`)
    }
    const { version, channel, notes, gitHead, gitTag } = nextRelease
    const [major, minor, patch] = version.split(/\.|-|\s/g, 3)
    // set outputs
    core.setOutput(outputs.new_release_published, 'true')
    core.setOutput(outputs.new_release_version, version)
    core.setOutput(outputs.new_release_major_version, major)
    core.setOutput(outputs.new_release_minor_version, minor)
    core.setOutput(outputs.new_release_patch_version, patch)
    core.setOutput(outputs.new_release_channel, channel)
    core.setOutput(outputs.new_release_notes, notes)
    core.setOutput(outputs.new_release_git_head, gitHead)
    core.setOutput(outputs.new_release_git_tag, gitTag)
    return Promise.resolve()
}

/**
 * Installs semantic-release at the specified version.
 * If no version is specified or version is below 16, installs the latest version.
 * Versions 16 and above are installed with the specified version constraint.
 *
 * @returns Promise that resolves when semantic-release installation completes
 */
export async function installSemanticReleaseTask(): Promise<void> {
    const input = core.getInput(inputs.semantic_version)
    let semver = input
        ? `@${input}`
        : ""
    const [major,] = input.split(".")
    if (major !== "" && +major < 16) {
        semver = ""
    }
    const { stdout, stderr } = await runCommand(`npm install semantic-release${semver} --no-audit --silent`, {
        cwd: path.resolve(__dirname, '..')
    })
    core.debug(stdout)
    core.error(stderr)
}
