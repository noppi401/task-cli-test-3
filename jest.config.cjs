module.exports = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  testMatch: ["**/src/**?test.ts"],
  moduleNameMapper: {"^(\\.{1,2}/.*)\\.js$": "$1"},
  globals: {"ts-jest": {useESM: true, tsconfig: "tsconfig.json"}}
};
