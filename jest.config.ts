import type { Config } from "jest";

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",
    transform: {
        '^.+\\.(ts|js)$': ['ts-jest', { isolatedModules: true }], // Simplified transform for TypeScript and JavaScript
    },
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
    },
    testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/.next/standalone/"], // Ignore .next and standalone directories
    transformIgnorePatterns: [
        "node_modules/(?!nanoid|jose)", // Transform `nanoid` and `jose` packages
    ],
    extensionsToTreatAsEsm: [".ts", ".tsx"], // Treat TypeScript files as ES modules
};

export default config;