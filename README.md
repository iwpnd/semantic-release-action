<br />
<div align="center">
  <h3 align="center">semantic release action</h3>
  <p align="center">
 A TypeScript-based GitHub Action for <a href="https://github.com/semantic-release/semantic-release">semantic-release</a> with enhanced support for shareable configurations.
    <br />
    <a href="https://github.com/strava/hf2/issues">Report Bug</a>
    ·
    <a href="https://github.com/strava/hf2/issues">Request Feature</a>
  </p>
</div>

> [!IMPORTANT]
> Not ready for production use just yet.

## About

This action is a TypeScript refactor of [cycjimmy/semantic-release-action](https://github.com/cycjimmy/semantic-release-action), created to provide broader usability for shareable configurations. The key enhancement allows installation of shareable configurations directly from GitHub repositories using npm's GitHub syntax (e.g., `github:owner/repo`), enabling teams to maintain private or organization-specific semantic-release configurations without publishing to npm.

## Features

- Full TypeScript implementation
- Install shareable configurations from GitHub repositories
- Support for semantic-release v16+ 
- Configurable branch strategies
- Dry-run mode for validation
- Monorepo support with custom tag formats
- Flexible plugin system

## Quick Start

### Prerequisites

1. Configure [Semantic Release](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md#configuration) in your repository
2. Add required [secrets](https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets) for [authentication](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/ci-configuration.md#authentication)
3. Create a [workflow file](https://help.github.com/en/articles/workflow-syntax-for-github-actions)

### Basic Usage
```yaml
steps:
  - name: Checkout
    uses: actions/checkout@v4
    
  - name: Semantic Release
    uses: iwpnd/semantic-release-action@v1
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

> **Important**: `GITHUB_TOKEN` does not have permissions to operate on protected branches. For protected branches, use a [Personal Access Token](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line) instead. When using `@semantic-release/git` with protected branches, set `persist-credentials: false` in `actions/checkout@v4`.

## Configuration

### Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `semantic_version` | No | `21.1.1` | Semantic-release version or version range |
| `branches` | No | semantic-release defaults | Branches for releases (v16+) |
| `branch` | No | `master` | Single branch for releases (pre-v16) |
| `extra_plugins` | No | - | Additional plugins to install |
| `extends` | No | - | Shareable configurations to extend |
| `dry_run` | No | `false` | Run in dry-run mode |
| `ci` | No | `true` | Enable CI mode (v16+) |
| `unset_gha_env` | No | `false` | Unset GITHUB_ACTIONS environment variable |
| `working_directory` | No | workspace root | Working directory for semantic-release |
| `tag_format` | No | `v${version}` | Git tag format |
| `repository_url` | No | current repository | Git repository URL |

### Outputs

| Output | Description |
|--------|-------------|
| `new_release_published` | Whether a new release was published (`"true"` or `"false"`) |
| `new_release_version` | New release version (e.g., `"1.3.0"`) |
| `new_release_major_version` | Major version (e.g., `"1"`) |
| `new_release_minor_version` | Minor version (e.g., `"3"`) |
| `new_release_patch_version` | Patch version (e.g., `"0"`) |
| `new_release_channel` | Distribution channel |
| `new_release_notes` | Release notes |
| `new_release_git_head` | SHA of last commit in release |
| `new_release_git_tag` | Git tag for release |
| `last_release_version` | Previous release version |
| `last_release_git_head` | SHA of last commit in previous release |
| `last_release_git_tag` | Git tag of previous release |

## Usage Examples

### Specify Semantic Release Version
```yaml
- name: Semantic Release
  uses: iwpnd/semantic-release-action@v1
  with:
    semantic_version: 19.0.5
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Configure Branches (v16+)
```yaml
- name: Semantic Release
  uses: iwpnd/semantic-release-action@v1
  with:
    semantic_version: 16
    branches: |
      [
        '+([0-9])?(.{+([0-9]),x}).x',
        'master',
        'next',
        'next-major',
        {
          name: 'beta',
          prerelease: true
        },
        {
          name: 'alpha',
          prerelease: true
        }
      ]
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

See [branches configuration](https://semantic-release.gitbook.io/semantic-release/usage/configuration#branches) for more details.

### Install Extra Plugins

Plugins must be specified in both the action and your [release config](https://semantic-release.gitbook.io/semantic-release/usage/configuration#plugins):

**Workflow:**
```yaml
- name: Semantic Release
  uses: iwpnd/semantic-release-action@v1
  with:
    extra_plugins: |
      @semantic-release/changelog@6.0.0
      @semantic-release/git
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**Release config:**
```json
{
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/git"
  ]
}
```

### Extend Shareable Configurations

Use existing [shareable configurations](https://semantic-release.gitbook.io/semantic-release/usage/shareable-configurations) or reference GitHub repositories:
```yaml
- name: Semantic Release
  uses: iwpnd/semantic-release-action@v1
  with:
    extends: |
      @semantic-release/apm-config@^9.0.0
      github:myorg/semantic-release-config
      @mycompany/override-config
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Dry Run Mode
```yaml
- name: Semantic Release
  uses: iwpnd/semantic-release-action@v1
  with:
    dry_run: true
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Disable CI Mode

Useful for generating release versions in pull requests:
```yaml
- name: Semantic Release
  uses: iwpnd/semantic-release-action@v1
  with:
    ci: false
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Custom Working Directory
```yaml
- name: Semantic Release
  uses: iwpnd/semantic-release-action@v1
  with:
    working_directory: ./packages/my-package
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Custom Tag Format (Monorepos)
```yaml
- name: Semantic Release
  uses: iwpnd/semantic-release-action@v1
  with:
    tag_format: my-package-v${version}
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Validate PR Releases
```yaml
- name: Checkout
  uses: actions/checkout@v4
  
- name: Temporarily merge PR branch
  if: github.event_name == 'pull_request'
  run: |
    git config --global user.name github-actions
    git config --global user.email github-actions@github.com
    git merge --no-ff origin/${{ github.event.pull_request.head.ref }} \
      --message "${{ github.event.pull_request.title }}"
      
- name: Semantic Release
  uses: iwpnd/semantic-release-action@v1
  with:
    unset_gha_env: ${{ github.event_name == 'pull_request' }}
    ci: ${{ github.event_name == 'pull_request' && false || '' }}
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Using Outputs
```yaml
- name: Semantic Release
  id: semantic
  uses: iwpnd/semantic-release-action@v1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}

- name: Process release
  if: steps.semantic.outputs.new_release_published == 'true'
  run: |
    echo "Version: ${{ steps.semantic.outputs.new_release_version }}"
    echo "Major: ${{ steps.semantic.outputs.new_release_major_version }}"
    echo "Minor: ${{ steps.semantic.outputs.new_release_minor_version }}"
    echo "Patch: ${{ steps.semantic.outputs.new_release_patch_version }}"
```

## Publishing to GitHub Packages

Configure your `package.json`:
```json
{
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

## Changelog

See [CHANGELOG](CHANGELOG.md).

## Contributing

Contributions are neither expected nor encouraged. If you for whatever
reason you want to contribute here, create an issue describing your problem first.
Unsolicited PRs are going to be deleted straight up.

If we evaluated that you're in the right repository,
are of a clear state of mind and have cause to do what you wanna do, please
follow the steps below.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feat/my-amazing-feature`)
3. Commit your Changes (`git commit -m 'feat: some amazing feature'`)
4. Push to the Branch (`git push origin feat/my-amazing-feature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

## Contact

Benjamin Ramser - [@iwpnd](https://github.com/iwpnd) - iwpnd@posteo.com

Project Link: [https://github.com/iwpnd/semantic-release-action](https://github.com/iwpnd/semantic-release-action)

## Acknowledgments

This project is a TypeScript refactor and enhancement of [cycjimmy/semantic-release-action](https://github.com/cycjimmy/semantic-release-action). Special thanks to [@cycjimmy](https://github.com/cycjimmy) for the original implementation and ongoing maintenance of the upstream project.

<!-- Links -->
[version-image]: https://img.shields.io/github/package-json/v/iwpnd/semantic-release-action
[workflows-badge-image]: https://github.com/iwpnd/semantic-release-action/workflows/Test%20Release/badge.svg
[release-date-image]: https://img.shields.io/github/release-date/iwpnd/semantic-release-action
[release-url]: https://github.com/iwpnd/semantic-release-action/releases
[semantic-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-url]: https://github.com/semantic-release/semantic-release
[license-image]: https://img.shields.io/npm/l/@iwpnd/semantic-release-action.svg
[license-url]: https://github.com/iwpnd/semantic-release-action/blob/main/LICENSE
[changelog-url]: https://github.com/iwpnd/semantic-release-action/blob/main/docs/CHANGELOG.md
[github-packages-registry]: https://github.com/features/packages
