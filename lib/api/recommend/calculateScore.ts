// lib/recommend/calculateScore.ts

type TagScore = {
  tagId: string;
  score: number;
};

type TagCount = {
  tagId: string;
  count: number;
};

export function calculateScore(
  userTags: TagScore[],
  bookTags: TagCount[]
) {
  let dot = 0;
  let userNorm = 0;
  let bookNorm = 0;
  let matchCount = 0;

  // user norm
  for (const u of userTags) {
    userNorm += u.score * u.score;
  }
  userNorm = Math.sqrt(userNorm);

  // book norm
  for (const b of bookTags) {
    bookNorm += b.count * b.count;
  }
  bookNorm = Math.sqrt(bookNorm);

  if (userNorm === 0 || bookNorm === 0) return null;

  // dot
  for (const u of userTags) {
    const b = bookTags.find(bt => bt.tagId === u.tagId);
    if (b) {
      matchCount++;
      dot += u.score * b.count;
    }
  }

  if (dot === 0) return null;

  let score = dot / (userNorm * bookNorm);

  // ボーナス
  score += matchCount * 0.03;

  const matchRate = matchCount / bookTags.length;
  score += matchRate * 0.1;

  score += Math.log(bookTags.length + 1) * 0.02;

  return {
    score,
    matchCount,
  };
}