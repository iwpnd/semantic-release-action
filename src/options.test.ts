import { ExtendsOption, handleBranchesOption, handleCIOption, handleDryRunOption, handleExtends, handleRepositoryURLOption, handleTagFormat } from "./options"

describe("options", () => {
    beforeEach(() => {
        if (process.env.LOGGER_SILENT === "true") {
            process.stdout.write = jest.fn()

        }
    })

    describe("extends", () => {
        afterEach(() => {
            delete process.env.INPUT_EXTENDS
        })

        it.each([
            { input: "foobar", expected: { extends: ["foobar"] } },
            { input: "@iwpnd/file@latest", expected: { extends: ["@iwpnd/file"] } },
            { input: "@iwpnd/file@v1.0.0", expected: { extends: ["@iwpnd/file"] } },
            { input: "github:@iwpnd/file@latest", expected: { extends: ["@iwpnd/file"] } },
            { input: "gitlab:@iwpnd/file@v1.0.0", expected: { extends: ["@iwpnd/file"] } },
            { input: "github:iwpnd/file", expected: { extends: ["iwpnd/file"] } },
            { input: "foo\r\nbar\r\n", expected: { extends: ["foo", "bar"] } },
            { input: " foobar ", expected: { extends: ["foobar"] } },
            { input: "", expected: {} },
        ] as { input: string, expected: ExtendsOption }[])('gets extends %s', ({ input, expected }) => {
            process.env.INPUT_EXTENDS = input

            expect(handleExtends()).toEqual(expected)
        })
    })

    describe("branches", () => {
        afterEach(() => {
            delete process.env.INPUT_BRANCHES
            delete process.env.INPUT_BRANCH
        })

        it('gets non-empty branches array', () => {
            process.env.INPUT_BRANCHES = '["main"]'

            expect(handleBranchesOption()).toEqual({ branches: ["main"] })
        })

        it('gets non-empty branches string', () => {
            process.env.INPUT_BRANCHES = '"main"'

            expect(handleBranchesOption()).toEqual({ branches: "main" })
        })

        it('gets non-empty branches string without double quotes', () => {
            process.env.INPUT_BRANCHES = "main"

            expect(handleBranchesOption()).toEqual({ branches: "main" })
        })

        it('gets non-empty branch string without double quotes', () => {
            process.env.INPUT_BRANCH = "main"

            expect(handleBranchesOption()).toEqual({ branches: "main" })
        })

        it('gets non-empty branch string', () => {
            process.env.INPUT_BRANCH = '"main"'

            expect(handleBranchesOption()).toEqual({ branches: "main" })
        })

        it('gets branches over branch', () => {
            process.env.INPUT_BRANCH = '"main"'
            process.env.INPUT_BRANCHES = '["main"]'

            expect(handleBranchesOption()).toEqual({ branches: ["main"] })
        })

        it('gets empty branches', () => {
            process.env.INPUT_BRANCH = ""
            process.env.INPUT_BRANCHES = ""

            expect(handleBranchesOption()).toEqual({})
        })
    })

    describe("repository_url", () => {
        afterEach(() => {
            delete process.env.INPUT_REPOSITORY_URL
        })

        it('gets non-empty repository_url', () => {
            process.env.INPUT_REPOSITORY_URL = "http://foo.bar"

            expect(handleRepositoryURLOption()).toEqual({ url: "http://foo.bar" })
        })

        it('gets empty repository_url', () => {
            process.env.INPUT_REPOSITORY_URL = ""

            expect(handleRepositoryURLOption()).toEqual({})
        })
    })

    describe("tag_format", () => {
        afterEach(() => {
            delete process.env.INPUT_TAG_FORMAT
        })

        it('gets tag format', () => {
            process.env.INPUT_TAG_FORMAT = "vFOO.BAR"

            expect(handleTagFormat()).toEqual({ tagFormat: "vFOO.BAR" })
        })

        it('gets tag_format empty', () => {
            process.env.INTPUT_TAG_FORMAT = ""

            expect(handleTagFormat()).toEqual({})
        })
    })

    describe("ci", () => {
        afterEach(() => {
            delete process.env.INPUT_CI
        })

        it('gets ci true', () => {
            process.env.INPUT_CI = "true"

            expect(handleCIOption()).toEqual({ ci: true, noCI: false })
        })

        it('gets ci false', () => {
            process.env.INPUT_CI = "false"

            expect(handleCIOption()).toEqual({ ci: false, noCI: true })
        })

        it('gets ci empty', () => {
            process.env.INPUT_CI = ""

            expect(handleCIOption()).toEqual({})
        })
    })

    describe("dry_run", () => {
        afterEach(() => {
            delete process.env.INPUT_DRY_RUN
        })

        it('gets dry_run true', () => {
            process.env.INPUT_DRY_RUN = "true"

            expect(handleDryRunOption()).toEqual({ dryRun: true })
        })

        it('gets dry_run false', () => {
            process.env.INPUT_DRY_RUN = "false"

            expect(handleDryRunOption()).toEqual({ dryRun: false })
        })

        it('gets dry_run empty', () => {
            process.env.INPUT_DRY_RUN = ""

            expect(handleDryRunOption()).toEqual({})
        })
    })
})
