import { readFile } from "node:fs/promises"
import { createRequire } from "node:module"
import { performance } from "node:perf_hooks"

const require = createRequire(import.meta.url)
const ts = require("typescript")
const source = await readFile(
  new URL("../lib/api/recommend/calculateScore.ts", import.meta.url),
  "utf8",
)
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022 },
})
const sourceUrl = `data:text/javascript;base64,${Buffer.from(compiled.outputText).toString("base64")}`
const { calculateScore } = await import(sourceUrl)

const tagsPerBook = 10
const userTagCount = 20
const tagUniverseSize = 100
const candidateCounts = [1_000, 10_000, 50_000, 100_000]
const sampleCount = 7
const toMiB = (bytes) => Number((bytes / 1024 / 1024).toFixed(2))
const collectGarbage = () => globalThis.gc?.()

function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

function createDataset(bookCount) {
  const userTags = Array.from({ length: userTagCount }, (_, index) => ({
    tagId: `tag-${index}`,
    score: 1 + (index % 5),
  }))
  const bookVectors = new Map()

  for (let bookId = 0; bookId < bookCount; bookId += 1) {
    const tags = Array.from({ length: tagsPerBook }, (_, tagIndex) => {
      const id = (bookId * 17 + tagIndex * 13) % tagUniverseSize
      return {
        tagId: `tag-${id}`,
        count: 1 + ((bookId + tagIndex) % 5),
      }
    })
    bookVectors.set(bookId, tags)
  }

  return { userTags, bookVectors }
}

function rankCandidates(userTags, bookVectors) {
  const results = []

  for (const [bookId, bookTags] of bookVectors) {
    const result = calculateScore(userTags, bookTags)
    if (result) results.push({ bookId, score: result.score })
  }

  results.sort((a, b) => b.score - a.score)
  return { topBooks: results.slice(0, 20), scoredBooks: results.length }
}

// Warm the function before timing to reduce first-call compilation noise.
{
  const warmup = createDataset(10_000)
  rankCandidates(warmup.userTags, warmup.bookVectors)
}
collectGarbage()

console.log(`Node ${process.version}; V8 ${process.versions.v8}`)
console.log(`GC exposed: ${Boolean(globalThis.gc)}`)

for (const bookCount of candidateCounts) {
  collectGarbage()
  const heapBeforeDataset = process.memoryUsage().heapUsed
  const { userTags, bookVectors } = createDataset(bookCount)
  collectGarbage()
  const datasetHeap = process.memoryUsage().heapUsed - heapBeforeDataset

  const times = []
  const scoreHeapDeltas = []
  let scoredBooks = 0
  let returnedBooks = 0

  for (let sample = 0; sample < sampleCount; sample += 1) {
    collectGarbage()
    const heapBeforeScoring = process.memoryUsage().heapUsed
    const startedAt = performance.now()
    const result = rankCandidates(userTags, bookVectors)
    times.push(performance.now() - startedAt)
    scoreHeapDeltas.push(process.memoryUsage().heapUsed - heapBeforeScoring)
    scoredBooks = result.scoredBooks
    returnedBooks = result.topBooks.length
  }

  console.log(JSON.stringify({
    candidateBooks: bookCount,
    userTags: userTags.length,
    tagsPerBook,
    candidateTagRows: bookCount * tagsPerBook,
    scoredBooks,
    returnedBooks,
    samples: sampleCount,
    scoringAndSortMedianMs: Number(median(times).toFixed(2)),
    datasetHeapMiB: toMiB(datasetHeap),
    heapDeltaBeforeGcMedianMiB: toMiB(median(scoreHeapDeltas)),
  }))
}
