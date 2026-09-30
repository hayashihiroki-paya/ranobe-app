export type UserTagUsage = { userId: string; tagId: string }
export type UserTagScore = { userId: string; tagId: string; score: number }

export function mergeTagMap(
  usage: { tagId: string }[],
  scores: { tagId: string; score: number }[]
) {
  const map: Record<string, number> = {}

  for (const tag of usage) {
    map[tag.tagId] = (map[tag.tagId] || 0) + 1
  }

  for (const score of scores) {
    map[score.tagId] = (map[score.tagId] || 0) + score.score
  }

  return map
}

export function calcSimilarity(
  a: Record<string, number>,
  b: Record<string, number>
) {
  let dot = 0
  let normA = 0
  let normB = 0
  let commonCount = 0
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)])

  for (const key of allKeys) {
    const av = a[key] || 0
    const bv = b[key] || 0

    if (av > 0 && bv > 0) {
      commonCount++
      dot += av * bv
    }

    normA += av * av
    normB += bv * bv
  }

  if (normA === 0 || normB === 0 || commonCount < 2) {
    return { score: 0, commonCount }
  }

  const commonRatio = commonCount / Math.min(Object.keys(a).length, Object.keys(b).length)
  const score = Math.min(
    dot / (Math.sqrt(normA) * Math.sqrt(normB)) + commonRatio * 0.2,
    1
  )

  return { score, commonCount }
}
