import { exec } from 'child_process'
import * as util from 'util'

/**
 * Promisified version of child_process.exec for running shell commands.
 * Returns a promise that resolves with stdout and stderr.
 *
 * @example
 * const { stdout, stderr } = await runCommand('npm install')
 */
export const runCommand = util.promisify(exec)
