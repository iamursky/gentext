# gentext

Generates a string of random English words with fine-tuned parameters. Useful for typing practice, placeholder content, and testing.

## Install

```sh
npm install gentext
```

## Usage

```ts
import gentext from "gentext";

// 25 random words with default settings
gentext();

// 10 nouns only, drawn from the full dictionary
gentext({
  numberOfWords: 10,
  type: "nouns",
  popularityThreshold: 0,
});

// 40 words, 80% nouns
gentext({
  numberOfWords: 40,
  nounToVerbRatio: 0.8,
});
```

## Options

| Option                | Type                                          | Default             | Description                                                                                                                            |
| --------------------- | --------------------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `type`                | `"nouns"` \| `"verbs"` \| `"nouns-and-verbs"` | `"nouns-and-verbs"` | Which word types to include.                                                                                                           |
| `numberOfWords`       | `number`                                      | `25`                | Number of words to return (capped at the pool size — see below).                                                                       |
| `popularityThreshold` | `number` (0–1)                                | `1`                 | Controls how much the word pool is restricted to high-frequency words. `1` = only the most popular words; `0` = the entire dictionary. |
| `nounToVerbRatio`     | `number` (0–1)                                | `0.5`               | Noun-to-verb ratio when `type` is `"nouns-and-verbs"`. Higher values produce more nouns.                                               |

## Word limits

The built-in dictionaries contain a finite number of words:

| Constant    | Value | Available when `type` is |
| ----------- | ----- | ------------------------ |
| `MAX_NOUNS` | 2 886 | `"nouns"`                |
| `MAX_VERBS` | 609   | `"verbs"`                |
| `MAX_WORDS` | 3 495 | `"nouns-and-verbs"`      |

If `numberOfWords` exceeds the available pool, the output is silently capped at the pool size. You can import the constants to check or enforce limits in your own code:

```ts
import gentext, { MAX_NOUNS, MAX_VERBS, MAX_WORDS } from "gentext";
```

## License

[MIT](license)
