type TagUsage = {
  tagId: string
  _count: { tagId: number }
}

type TagScore = {
  tagId: string
  score: number
}

export function rankUserTags(tagUsage: TagUsage[], tagScores: TagScore[]) {
  const tagMap = new Map<string, number>()

  for (const usage of tagUsage) {
    tagMap.set(usage.tagId, usage._count.tagId)
  }

  for (const score of tagScores) {
    const current = tagMap.get(score.tagId) ?? 0
    tagMap.set(score.tagId, current + score.score)
  }

  return Array.from(tagMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
}

export function formatUserTagStats(
  rankedTags: [string, number][],
  tags: { id: string; name: string }[]
) {
  const tagNameMap = new Map(tags.map(({ id, name }) => [id, name]))

  return rankedTags.map(([tagId, score]) => ({
    name: tagNameMap.get(tagId) ?? "不明",
    count: score,
  }))
}

export function countDistinctUserTags(
  userTags: { tagId: string }[],
  scoreTags: { tagId: string }[]
) {
  return new Set([
    ...userTags.map(({ tagId }) => tagId),
    ...scoreTags.map(({ tagId }) => tagId),
  ]).size
}
