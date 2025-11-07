import * as core from '@actions/core'

import { inputs } from './inputs'

const globalOptions: core.InputOptions = { trimWhitespace: true }

/**
 * Branch configuration can be either a simple string or a detailed object
 * with prerelease, channel, and range options.
 */
export type BranchConfig =
    | string
    | { name: string; prerelease?: boolean; channel?: string; range?: string }

/**
 * Configuration for multiple branches.
 */
export type BranchesConfig = BranchConfig[]

/**
 * Option interface for branch configuration.
 */
export interface BranchOption {
    branches?: BranchesConfig | BranchConfig,
}

/**
 * Option interface for dry run mode.
 */
export interface DryRunOption {
    dryRun?: boolean,
}

/**
 * Option interface for CI configuration.
 */
export interface CIOption {
    ci?: boolean,
    noCI?: boolean,
}

/**
 * Option interface for extending semantic-release configurations.
 */
export interface ExtendsOption {
    extends?: string[]
}

/**
 * Option interface for Git tag format.
 */
export interface TagFormatOption {
    tagFormat?: string,
}

/**
 * Option interface for repository URL.
 */
export interface RepositoryURLOption {
    url?: string,
}

/**
 * Parses and handles the branches input from GitHub Actions.
 * Supports both single branch and multiple branches configuration.
 *
 * @returns Branch configuration option or empty object if no input provided
 */
export function handleBranchesOption(): BranchOption {
    const opt: BranchOption = {}

    const branches = core.getInput(inputs.branches, globalOptions)
    const branch = core.getInput(inputs.branch, globalOptions)

    core.debug(`branches input: ${branches}`)
    core.debug(`branch input: ${branch}`)

    const b = branches || branch || ""
    if (!b) {
        return opt
    }

    const objOrStr = parseJson(b)

    opt.branches = objOrStr

    return opt
}

/**
 * Parses and handles the dry run input from GitHub Actions.
 * When enabled, semantic-release will skip publishing.
 *
 * @returns Dry run option or empty object if no input provided
 */
export function handleDryRunOption(): DryRunOption {
    const opt: DryRunOption = {}
    const dryRun = core.getInput(inputs.dry_run, globalOptions)
    core.debug(`dryRun input: ${dryRun == "" ? "unset" : dryRun}`)

    if (!dryRun) {
        return opt
    }

    if (dryRun == "true") {
        opt.dryRun = true
        return opt

    }

    opt.dryRun = false
    return opt
}

/**
 * Parses and handles the CI mode input from GitHub Actions.
 * Controls whether semantic-release runs in CI mode.
 *
 * @returns CI option or empty object if no input provided
 */
export function handleCIOption(): CIOption {
    const opt: CIOption = {}
    const ci = core.getInput(inputs.ci, globalOptions)
    core.debug(`ci input: ${ci == "" ? "unset" : ci}`)

    if (!ci) {
        return opt
    }

    if (ci == "true") {
        opt.ci = true
        opt.noCI = false
        return opt

    }

    opt.ci = false
    opt.noCI = true
    return opt
}

/**
 * Parses and handles the extends input from GitHub Actions.
 * Extracts shareable configuration module names from various formats
 * (e.g., "owner/repo", "github:owner/repo", "@scope/package").
 *
 * Supports multiple modules separated by newlines.
 * Strips version specifiers (e.g., "@1.0.0", "#branch") from module names.
 *
 * @returns Extends option with array of module names or empty object if no input provided
 */
export function handleExtends(): ExtendsOption {
    const opt: ExtendsOption = {}

    const extend = core.getInput(inputs.extends, globalOptions)
    core.debug(`extend input raw:\n${extend}`)

    if (!extend) {
        return {}
    }

    //   ^\s*                             trim leading space
    //   (?:github:|gitlab:)?             optional "github:" or "gitlab:"
    //   (@?[^\/\s#@]+(?:\/[^\/\s#@]+)?)  capture either:
    //                                      - "@?owner/repo"
    //                                      - or single "repo"
    //                                      (no #, @, slash in each segment)
    //   (?:[@#].*)?                      drop anything from the first @ or # to end
    //   \s*$                             trim trailing space
    const RE =
        /^\s*(?:github:|gitlab:)?(@?[^/\s#@]+(?:\/[^/\s#@]+)?)(?:[@#].*)?\s*$/

    const extendModuleNames = extend
        .split(/\r?\n/)
        .map((line) => {
            const m = RE.exec(line.trim())
            return m ? m[1] : ""
        })
        .filter(Boolean)

    core.debug(`extendModuleNames processed:\n${JSON.stringify(extendModuleNames)}`)

    opt.extends = extendModuleNames

    return opt
}

/**
 * Parses and handles the tag format input from GitHub Actions.
 * Defines the Git tag format used by semantic-release.
 *
 * @returns Tag format option or empty object if no input provided
 */
export function handleTagFormat(): TagFormatOption {
    const opt: TagFormatOption = {}

    const tagFormat = core.getInput(inputs.tag_format, globalOptions)
    core.debug(`citagFormat input: ${tagFormat}`)

    if (!tagFormat) {
        return opt
    }

    opt.tagFormat = tagFormat
    return opt
}

/**
 * Parses and handles the repository URL input from GitHub Actions.
 * Allows overriding the default repository URL.
 *
 * @returns Repository URL option or empty object if no input provided
 */
export function handleRepositoryURLOption(): RepositoryURLOption {
    const opt: RepositoryURLOption = {}

    const repositoryURL = core.getInput(inputs.repository_url, globalOptions)
    core.debug(`repository_url input: ${repositoryURL}`)

    if (!repositoryURL) {
        return opt
    }

    opt.url = repositoryURL
    return opt
}

/**
 * Parses a JSON string into branch configuration.
 * Handles both single and double-encoded JSON strings.
 * Falls back to returning the original string if parsing fails.
 *
 * @param str - JSON string to parse
 * @returns Parsed branch configuration or original string
 */
export function parseJson(str: string): BranchConfig | BranchesConfig {
    try {
        const parsed = JSON.parse(str) as BranchesConfig

        // If the result is a string, try parsing again (double-encoded case)
        if (typeof parsed === 'string') {
            try {
                return JSON.parse(parsed) as BranchesConfig
            } catch {
                return parsed
            }
        }

        return parsed
    } catch {
        return str
    }
}
