/**
 * Conventional commits, plus the two prefixes this repo already uses a lot:
 * `feature:` (alias of feat) and `config:` (dependency/tooling setup).
 * Subject case is left free so Indonesian subjects don't get flagged.
 */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "feature",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "config",
        "revert",
        "i18n",
      ],
    ],
    "subject-case": [0],
    "body-max-line-length": [0],
  },
};
