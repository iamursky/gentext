import shuffle from "knuth-shuffle-seeded";

import nouns from "./data/nouns.json" with { type: "json" };
import verbs from "./data/verbs.json" with { type: "json" };

export type TTextGenerationType = "nouns" | "verbs" | "nouns-and-verbs";

/** Total number of nouns in the built-in dictionary. */
export const MAX_NOUNS = nouns.length;

/** Total number of verbs in the built-in dictionary. */
export const MAX_VERBS = verbs.length;

/** Total number of words (nouns + verbs) in the built-in dictionary. */
export const MAX_WORDS = MAX_NOUNS + MAX_VERBS;

/**
 * Options for {@link gentext}.
 */
export interface ITextGenerationOptions {
  /**
   * Which word types to include in the generated text.
   *
   * @defaultValue "nouns-and-verbs"
   */
  type?: TTextGenerationType;

  /**
   * Number of words to return.
   *
   * Capped at the size of the available pool: {@link MAX_NOUNS} for `"nouns"`,
   * {@link MAX_VERBS} for `"verbs"`, or {@link MAX_WORDS} for
   * `"nouns-and-verbs"`.
   *
   * @defaultValue 25
   */
  numberOfWords?: number;

  /**
   * A value between `0` and `1` that controls how much the word pool is
   * restricted to high-frequency words.
   *
   * - `1` — only the top {@link numberOfWords} most popular words are eligible.
   * - `0` — the entire built-in dictionary is eligible.
   *
   * @defaultValue 1
   */
  popularityThreshold?: number;

  /**
   * A value between `0` and `1` that controls the noun-to-verb ratio in the
   * output. Higher values produce more nouns; lower values produce more verbs.
   *
   * Only meaningful when {@link type} is `"nouns-and-verbs"`.
   *
   * @defaultValue 0.5
   */
  nounToVerbRatio?: number;
}

/**
 * Generate a string of random English words suitable for typing practice.
 *
 * Words are drawn from built-in noun and verb dictionaries, shuffled, and
 * joined with spaces.
 *
 * @example
 * ```ts
 * // 25 random words with default settings
 * gentext();
 *
 * // 10 nouns only, drawn from the full dictionary
 * gentext({ numberOfWords: 10, type: "nouns", popularityThreshold: 0 });
 *
 * // 40 words, 80 % nouns
 * gentext({ numberOfWords: 40, nounToVerbRatio: 0.8 });
 * ```
 *
 * @param options - Configuration for text generation.
 * @returns A space-separated string of random words.
 */ export default function gentext({
  type = "nouns-and-verbs",
  numberOfWords = 25,
  popularityThreshold = 1,
  nounToVerbRatio = 0.5,
}: ITextGenerationOptions = {}): string {
  const totalAvailable = nouns.length + verbs.length;
  const pool: string[] = [];

  const poolSize = Math.max(
    numberOfWords,
    Math.ceil(numberOfWords + (totalAvailable - numberOfWords) * (1 - popularityThreshold)),
  );

  if (type === "nouns-and-verbs") {
    const nounCount = Math.min(Math.max(1, Math.round(poolSize * nounToVerbRatio)), nouns.length);
    const verbCount = Math.min(Math.max(1, poolSize - nounCount), verbs.length);
    pool.push(...nouns.slice(0, nounCount));
    pool.push(...verbs.slice(0, verbCount));
  } else if (type === "nouns") {
    pool.push(...nouns.slice(0, Math.min(poolSize, nouns.length)));
  } else if (type === "verbs") {
    pool.push(...verbs.slice(0, Math.min(poolSize, verbs.length)));
  }

  const actualCount = Math.min(numberOfWords, pool.length);

  return shuffle(pool).slice(0, actualCount).join(" ");
}
