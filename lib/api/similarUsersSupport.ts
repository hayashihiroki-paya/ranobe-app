export type UserTagUsage = { userId: string; tagId: string }
export type UserTagScore = { userId: string; tagId: string; score: number }

export type SimilarUserCandidate = {
  id: string
  name: string
  score: number
  commonCount: number
  topTagIds: string[]
}

type UserTagMaps = {
  usage: Record<string, { tagId: string }[]>
  scores: Record<string, { tagId: string; score: number }[]>
}

export function groupUserTags(
  usage: UserTagUsage[],
  scores: UserTagScore[]
): UserTagMaps {
  const userTagMap: UserTagMaps["usage"] = {}
  const userScoreMap: UserTagMaps["scores"] = {}

  for (const tag of usage) {
    if (!userTagMap[tag.userId]) userTagMap[tag.userId] = []
    userTagMap[tag.userId].push({ tagId: tag.tagId })
  }

  for (const score of scores) {
    if (!userScoreMap[score.userId]) userScoreMap[score.userId] = []
    userScoreMap[score.userId].push({
      tagId: score.tagId,
      score: score.score,
    })
  }

  return { usage: userTagMap, scores: userScoreMap }
}

export function rankSimilarUsers(
  userId: string,
  users: { id: string; name: string | null }[],
  userTags: UserTagMaps
): SimilarUserCandidate[] {
  const myMap = mergeTagMap(
    userTags.usage[userId] || [],
    userTags.scores[userId] || []
  )

  const result: SimilarUserCandidate[] = []

  for (const user of users) {
    const map = mergeTagMap(
      userTags.usage[user.id] || [],
      userTags.scores[user.id] || []
    )
    const { score, commonCount } = calcSimilarity(myMap, map)

    if (score < 0.1) continue

    const topTagIds = Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tagId]) => tagId)

    result.push({
      id: user.id,
      name: user.name ?? "ユーザー",
      score,
      commonCount,
      topTagIds,
    })
  }

  return result
}

export function formatSimilarUsers(
  candidates: SimilarUserCandidate[],
  tags: { id: string; name: string }[]
) {
  const tagNameMap: Record<string, string> = {}
  for (const tag of tags) {
    tagNameMap[tag.id] = tag.name
  }

  return candidates
    .map((candidate) => ({
      id: candidate.id,
      name: candidate.name,
      score: Math.round(candidate.score * 100),
      tags: candidate.topTagIds.map((id) => tagNameMap[id] || ""),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
}

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
