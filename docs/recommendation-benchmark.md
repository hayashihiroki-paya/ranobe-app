# Recommendation scoring baseline

Run the reproducible synthetic benchmark with:

```sh
npm run benchmark:recommendation
```

The script loads the production `calculateScore.ts` function through the repository's TypeScript compiler. It builds deterministic in-memory candidate vectors, scores every candidate, sorts the results, and keeps the top 20. Dataset generation is outside the timed section.

## Conditions

- Node.js `v24.22.1`, V8 `13.6.233.17-node.58`
- 20 user tags, 10 tags per candidate book, and 100 possible tag IDs
- Candidate counts of 1,000, 10,000, 50,000, and 100,000
- One modeled candidate tag row per book/tag pair: 10,000 through 1,000,000 rows
- One 10,000-candidate warmup, followed by seven measured runs per size; report the median
- Scores and tag counts are deterministic; the benchmark does not access a database

## Baseline (2026-11-18)

| Candidate books | Modeled tag rows | Score and sort median | Vector heap after GC | Heap delta after run, before explicit GC |
| ---: | ---: | ---: | ---: | ---: |
| 1,000 | 10,000 | 1.16 ms | 0.76 MiB | 0.79 MiB |
| 10,000 | 100,000 | 10.75 ms | 7.01 MiB | 3.94 MiB |
| 50,000 | 500,000 | 45.64 ms | 30.61 MiB | 16.35 MiB |
| 100,000 | 1,000,000 | 86.94 ms | 38.37 MiB | 32.39 MiB |

The vector heap is measured after an explicit GC and reflects the retained synthetic `Map`, arrays, and tag objects in this Node runtime. The post-run heap delta is sampled after scoring and sorting, before the next explicit GC; it is not peak RSS and can include objects awaiting collection. Shared-runner CPU and garbage collection affect these figures, so compare runs on the same environment.

## Interpretation and limits

At 100,000 candidates and one million modeled tag rows, the in-memory score-and-sort path completes in about 87 ms in this run. That does not justify changing the score algorithm yet. The benchmark excludes Prisma `groupBy`, database transfer, and `Book.findMany`, so it cannot establish database query latency or total request time. If real request latency becomes a concern, capture those query timings and returned row counts against a staging dataset before considering SQL aggregation, caching, or precomputation.
