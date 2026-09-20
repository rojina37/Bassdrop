// Minimal TF-IDF + cosine similarity, used by the recommendation engine to
// compare a user's taste (or a single song) against the catalog as sparse
// term vectors instead of a hand-tuned weighted sum.

export type SparseVector = Map<string, number>;

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "is", "it",
  "this", "that", "with", "as", "by", "at", "from", "be", "are", "was",
  "were", "i", "you", "your", "my", "we", "us", "our", "they", "he", "she",
  "them", "his", "her", "its", "but", "not", "so", "if", "up", "down", "out",
  "just", "all", "one", "no", "do", "did", "can", "will", "im",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

function termFrequencies(tokens: string[]): SparseVector {
  const tf: SparseVector = new Map();
  for (const token of tokens) tf.set(token, (tf.get(token) ?? 0) + 1);
  const total = tokens.length || 1;
  for (const [term, count] of tf) tf.set(term, count / total);
  return tf;
}

// Smoothed idf (as in scikit-learn's default TfidfVectorizer): idf(t) =
// ln(N / (1 + df(t))) + 1, so a term appearing in every document still gets
// a small positive weight instead of dropping to zero.
export function inverseDocumentFrequencies(documents: string[][]): Map<string, number> {
  const documentFrequency = new Map<string, number>();
  for (const tokens of documents) {
    for (const term of new Set(tokens)) {
      documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
    }
  }
  const n = documents.length;
  const idf = new Map<string, number>();
  for (const [term, count] of documentFrequency) idf.set(term, Math.log(n / (1 + count)) + 1);
  return idf;
}

export function tfidfVector(tokens: string[], idf: Map<string, number>): SparseVector {
  const tf = termFrequencies(tokens);
  const vector: SparseVector = new Map();
  for (const [term, freq] of tf) {
    const weight = idf.get(term);
    if (weight) vector.set(term, freq * weight);
  }
  return vector;
}

export function addWeighted(target: SparseVector, source: SparseVector, weight: number): void {
  for (const [term, value] of source) target.set(term, (target.get(term) ?? 0) + value * weight);
}

export function cosineSimilarity(a: SparseVector, b: SparseVector): number {
  const [smaller, larger] = a.size <= b.size ? [a, b] : [b, a];
  let dot = 0;
  for (const [term, value] of smaller) {
    const other = larger.get(term);
    if (other) dot += value * other;
  }
  if (dot === 0) return 0;

  let magnitudeA = 0;
  for (const value of a.values()) magnitudeA += value * value;
  let magnitudeB = 0;
  for (const value of b.values()) magnitudeB += value * value;

  return dot / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}
