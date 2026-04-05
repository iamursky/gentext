# Changelog

## [1.2.0] - 2026-04-05

### Features

- `ngrams` — array of substrings; words containing each n-gram are preferentially included using decreasing weights (`N, N-1, …, 1`), so the first n-gram gets the most representation; empty slots are backfilled with unrestricted words

## [1.1.0] - 2026-04-05

### Features

- `excludeWords` — array of words to exclude from the generated text; replacements are drawn from the remaining dictionary so the requested `numberOfWords` count is still met

## [1.0.0] - 2026-03-28

Initial release.

### Features

- `gentext(options?)` — generates a space-separated string of random English words
- Word type selection: `"nouns"`, `"verbs"`, or `"nouns-and-verbs"` (default)
- `numberOfWords` — number of words to return (default: `25`)
- `frequencyThreshold` — restricts the pool to high-frequency words (`0`–`1`, default: `1`)
- `nounToVerbRatio` — controls the noun/verb mix in `"nouns-and-verbs"` mode (default: `0.5`)
- Built-in noun and verb dictionaries with exported `MAX_NOUNS`, `MAX_VERBS`, `MAX_WORDS` constants
- Full TypeScript support with exported `ITextGenerationOptions` and `TTextGenerationType`
- ESM-only package
