import * as core from '@actions/core'
import * as semantic from 'semantic-release'

import { inputs } from './inputs.js'
import { handleBranchesOption, handleCIOption, handleDryRunOption, handleExtends, handleRepositoryURLOption, handleTagFormat } from "./options.js"
import { cleanupTask, installSemanticReleaseTask, installTask, outputTask, setupTask } from './tasks.js'

async function release() {
    core.debug("initializing semantic-release action")

    if (core.getInput(inputs.working_directory)) {
        process.chdir(core.getInput(inputs.working_directory))
    }

    await setupTask()
    await installSemanticReleaseTask()
    await installTask(core.getInput(inputs.extra_plugins))
    await installTask(core.getInput(inputs.extends))

    if (core.getInput(inputs.unset_gha_env) === "true") {
        core.debug("unsetting GITHUB_ACTIONS env variable")
        delete process.env.GITHUB_ACTIONS
    }

    const result = await semantic.default({
        ...handleBranchesOption(),
        ...handleDryRunOption(),
        ...handleCIOption(),
        ...handleExtends(),
        ...handleTagFormat(),
        ...handleRepositoryURLOption(),
    })

    await cleanupTask()
    await outputTask(result)

    core.debug("completed semantic-release action")
}

release().catch(core.setFailed)
