import { describe, expect, it } from "vitest";

import nouns from "./data/nouns.json" with { type: "json" };
import verbs from "./data/verbs.json" with { type: "json" };
import gentext, { MAX_NOUNS, MAX_VERBS, MAX_WORDS } from "./index.js";

const nounSet = new Set<string>(nouns);
const verbSet = new Set<string>(verbs);
const allWords = new Set<string>([...nouns, ...verbs]);

describe("exports", () => {
  it("exports MAX_NOUNS as a positive integer", () => {
    expect(Number.isInteger(MAX_NOUNS)).toBe(true);
    expect(MAX_NOUNS).toBeGreaterThan(0);
  });

  it("exports MAX_VERBS as a positive integer", () => {
    expect(Number.isInteger(MAX_VERBS)).toBe(true);
    expect(MAX_VERBS).toBeGreaterThan(0);
  });

  it("MAX_WORDS equals MAX_NOUNS + MAX_VERBS", () => {
    expect(MAX_WORDS).toBe(MAX_NOUNS + MAX_VERBS);
  });
});

describe("output format", () => {
  it("returns a string", () => {
    expect(typeof gentext()).toBe("string");
  });

  it("words are space-separated with no empty tokens", () => {
    const words = gentext().split(" ");
    expect(words.every((w: string) => w.length > 0)).toBe(true);
  });
});

describe("word count", () => {
  it("returns 25 words by default", () => {
    expect(gentext().split(" ")).toHaveLength(25);
  });

  it("returns the requested number of words", () => {
    expect(gentext({ numberOfWords: 10 }).split(" ")).toHaveLength(10);
  });

  it("returns 1 word when numberOfWords is 1", () => {
    expect(gentext({ numberOfWords: 1 }).split(" ")).toHaveLength(1);
  });

  it("caps output at pool size for nouns type", () => {
    const words = gentext({ type: "nouns", numberOfWords: MAX_NOUNS + 9999 }).split(" ");
    expect(words.length).toBeLessThanOrEqual(MAX_NOUNS);
  });

  it("caps output at pool size for verbs type", () => {
    const words = gentext({ type: "verbs", numberOfWords: MAX_VERBS + 9999 }).split(" ");
    expect(words.length).toBeLessThanOrEqual(MAX_VERBS);
  });

  it("caps output at pool size for nouns-and-verbs type", () => {
    const words = gentext({ type: "nouns-and-verbs", numberOfWords: MAX_WORDS + 9999 }).split(" ");
    expect(words.length).toBeLessThanOrEqual(MAX_WORDS);
  });
});

describe("word type filtering", () => {
  it("type nouns returns only nouns from the dictionary", () => {
    const words = gentext({ type: "nouns", numberOfWords: 50, frequencyThreshold: 0 }).split(" ");
    expect(words.every((w: string) => nounSet.has(w))).toBe(true);
  });

  it("type verbs returns only verbs from the dictionary", () => {
    const words = gentext({ type: "verbs", numberOfWords: 50, frequencyThreshold: 0 }).split(" ");
    expect(words.every((w: string) => verbSet.has(w))).toBe(true);
  });

  it("type nouns-and-verbs returns words from the combined dictionary", () => {
    const words = gentext({ type: "nouns-and-verbs", numberOfWords: 50 }).split(" ");
    expect(words.every((w: string) => allWords.has(w))).toBe(true);
  });
});

describe("frequency threshold", () => {
  it("frequencyThreshold 1 still returns the correct number of words", () => {
    expect(gentext({ frequencyThreshold: 1, numberOfWords: 20 }).split(" ")).toHaveLength(20);
  });

  it("frequencyThreshold 0 still returns the correct number of words", () => {
    expect(gentext({ frequencyThreshold: 0, numberOfWords: 20 }).split(" ")).toHaveLength(20);
  });

  it("frequencyThreshold 0.5 still returns the correct number of words", () => {
    expect(gentext({ frequencyThreshold: 0.5, numberOfWords: 20 }).split(" ")).toHaveLength(20);
  });
});

describe("word exclusion", () => {
  it("excluded words do not appear in the output", () => {
    const exclude = ["man", "case", "money"];
    const words = gentext({ excludeWords: exclude, numberOfWords: 25 }).split(" ");
    expect(words.some((w: string) => exclude.includes(w))).toBe(false);
  });

  it("still returns numberOfWords words after exclusions", () => {
    const exclude = ["man", "case", "money", "home", "do", "could", "work", "call"];
    const words = gentext({ excludeWords: exclude, numberOfWords: 25 }).split(" ");
    expect(words).toHaveLength(25);
  });

  it("empty excludeWords has no effect", () => {
    expect(gentext({ excludeWords: [] }).split(" ")).toHaveLength(25);
  });
});

describe("noun-to-verb ratio", () => {
  it("accepts ratio 0 without crashing", () => {
    expect(gentext({ nounToVerbRatio: 0, numberOfWords: 10 }).split(" ")).toHaveLength(10);
  });

  it("accepts ratio 1 without crashing", () => {
    expect(gentext({ nounToVerbRatio: 1, numberOfWords: 10 }).split(" ")).toHaveLength(10);
  });
});

describe("ngram weighting", () => {
  it("returns the correct number of words when ngrams are specified", () => {
    expect(gentext({ ngrams: ["an"], numberOfWords: 20 }).split(" ")).toHaveLength(20);
  });

  it("preferentially includes words containing the ngram", () => {
    const words = gentext({ ngrams: ["an"], numberOfWords: 25, frequencyThreshold: 0 }).split(" ");
    const matchCount = words.filter((w: string) => w.includes("an")).length;
    expect(matchCount).toBeGreaterThan(0);
  });

  it("handles multiple ngrams without crashing", () => {
    expect(gentext({ ngrams: ["an", "in"], numberOfWords: 20 }).split(" ")).toHaveLength(20);
  });

  it("handles an ngram that matches no words", () => {
    expect(gentext({ ngrams: ["zzzzz"], numberOfWords: 20 }).split(" ")).toHaveLength(20);
  });
});

describe("randomness", () => {
  it("two consecutive calls produce different results", () => {
    const a = gentext({ numberOfWords: 25 });
    const b = gentext({ numberOfWords: 25 });
    expect(a).not.toBe(b);
  });

  it("output has no duplicate words", () => {
    const words = gentext({ numberOfWords: 25 }).split(" ");
    expect(new Set(words).size).toBe(25);
  });
});
