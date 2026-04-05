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
   * - `1` — only the top {@link numberOfWords} most frequent words are eligible.
   * - `0` — the entire built-in dictionary is eligible.
   *
   * @defaultValue 1
   */
  frequencyThreshold?: number;

  /**
   * A value between `0` and `1` that controls the noun-to-verb ratio in the
   * output. Higher values produce more nouns; lower values produce more verbs.
   *
   * Only meaningful when {@link type} is `"nouns-and-verbs"`.
   *
   * @defaultValue 0.5
   */
  nounToVerbRatio?: number;

  /**
   * Words to exclude from the generated text. When skipped words are removed
   * from the pool, replacements are drawn from the remaining dictionary so
   * that {@link numberOfWords} words are still returned.
   *
   * @defaultValue []
   */
  excludeWords?: string[];

  /**
   * An array of n-grams (substrings). Words that contain each n-gram are
   * preferentially included in the output, with the count of words containing
   * the first n-gram exceeding the count of words containing the last n-gram.
   *
   * Words are distributed across n-grams using decreasing weights
   * (`N, N-1, …, 1`). If the pool contains no words for a given n-gram, that
   * slot is left empty and remaining slots are filled with unrestricted words.
   *
   * @defaultValue []
   */
  ngrams?: string[];
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
 * gentext({ numberOfWords: 10, type: "nouns", frequencyThreshold: 0 });
 *
 * // 40 words, 80 % nouns
 * gentext({ numberOfWords: 40, nounToVerbRatio: 0.8 });
 *
 * // 25 words, skipping specific words
 * gentext({ excludeWords: ["the", "run", "make"] });
 * ```
 *
 * @param options - Configuration for text generation.
 * @returns A space-separated string of random words.
 */ export default function gentext({
  type = "nouns-and-verbs",
  numberOfWords = 25,
  frequencyThreshold = 1,
  nounToVerbRatio = 0.5,
  excludeWords = [],
  ngrams = [],
}: ITextGenerationOptions = {}): string {
  const totalAvailable = nouns.length + verbs.length;
  const skipSet = new Set(excludeWords);
  const pool: string[] = [];

  const poolSize = Math.max(
    numberOfWords,
    Math.ceil(numberOfWords + (totalAvailable - numberOfWords) * (1 - frequencyThreshold)),
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

  const filtered = pool.filter((w) => !skipSet.has(w));

  // If skip reduced the pool below numberOfWords, backfill from the rest of
  // the dictionary (words not already in the pool and not in skipSet).
  if (filtered.length < numberOfWords) {
    const poolSet = new Set(pool);
    const backfill: string[] = [];

    if (type === "nouns-and-verbs" || type === "nouns") {
      for (const w of nouns) {
        if (!poolSet.has(w) && !skipSet.has(w)) backfill.push(w);
      }
    }
    if (type === "nouns-and-verbs" || type === "verbs") {
      for (const w of verbs) {
        if (!poolSet.has(w) && !skipSet.has(w)) backfill.push(w);
      }
    }

    filtered.push(...backfill.slice(0, numberOfWords - filtered.length));
  }

  const actualCount = Math.min(numberOfWords, filtered.length);

  if (ngrams.length === 0) {
    return shuffle(filtered).slice(0, actualCount).join(" ");
  }

  // Distribute words across ngrams with weights N, N-1, …, 1 so that the
  // count for the first ngram exceeds the count for the last.
  const N = ngrams.length;
  const totalWeight = (N * (N + 1)) / 2;
  const shuffledPool = shuffle([...filtered]);
  const selected: string[] = [];
  const usedSet = new Set<string>();

  for (let i = 0; i < N; i++) {
    const ngram = ngrams[i]!;
    const weight = N - i;
    const targetCount = Math.max(1, Math.floor(actualCount * weight / totalWeight));
    const matching = shuffledPool.filter((w) => w.includes(ngram) && !usedSet.has(w));
    const picked = matching.slice(0, targetCount);
    picked.forEach((w) => usedSet.add(w));
    selected.push(...picked);
  }

  // Fill remaining slots with words not already selected.
  if (selected.length < actualCount) {
    const rest = shuffledPool.filter((w) => !usedSet.has(w));
    selected.push(...rest.slice(0, actualCount - selected.length));
  }

  return shuffle(selected).slice(0, actualCount).join(" ");
}
