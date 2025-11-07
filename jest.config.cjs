module.exports = {
    testEnvironment: "node",
    testTimeout: 10000,
    collectCoverage: true,
    collectCoverageFrom: ["./src/**/*.ts"],
    coverageThreshold: {
        global: {
            branches: 1,
            functions: 1,
            lines: 1,
            statements: 1,
        },
    },
    modulePathIgnorePatterns: ["dist"],
    preset: "ts-jest",
    clearMocks: true,
    globalSetup: "./jest.setup.cjs",
};
