import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// ===============================
// 仮データ（ここに60冊分入る）
// ===============================
const bookTagCandidates = [
  { bookId: 1, tags: ["異世界転生", "ファンタジー", "成り上がり", "最強無双", "スキル制"], },
  { bookId: 2, tags: ["ミステリー", "日常系", "頭脳戦特化", "職人", "女性主人公"], },
  { bookId: 3, tags: ["学園", "現代ファンタジー", "現代バトル", "巻き込まれ型", "能力バトル"], },
  { bookId: 4, tags: ["VRMMO", "デスゲーム", "冒険譚", "最強無双", "ソロプレイ"], },
  { bookId: 5, tags: ["学園", "現代ファンタジー", "最強無双", "クール系", "兄妹"], },
  { bookId: 6, tags: ["ダンジョン", "ファンタジー", "冒険譚", "成長型", "仲間重視"], },
  { bookId: 7, tags: ["学園", "現代ファンタジー", "日常系", "コメディ", "複数視点"], },
  { bookId: 8, tags: ["異世界転生", "ファンタジー", "やり直し", "成長型", "魔法主体"], },
  { bookId: 9, tags: ["ゲーム世界", "異世界転移", "ダーク", "最強無双", "支配"], },
  { bookId: 10, tags: ["異世界転移", "ファンタジー", "成り上がり", "復讐", "ダークヒーロー"], },
  { bookId: 11, tags: ["異世界転移", "ファンタジー", "ループ", "ダーク", "巻き込まれ型"], },
  { bookId: 12, tags: ["学園", "SF", "ラブコメ", "バディ", "戦闘多め"], },
  { bookId: 13, tags: ["異世界転生", "ファンタジー", "経営", "成り上がり", "知識チート"], },
  { bookId: 14, tags: ["学園", "現代", "頭脳戦特化", "心理戦", "複数視点"], },
  { bookId: 15, tags: ["ファンタジー", "ダーク", "戦闘多め", "冷酷型", "パーティー"], },
  { bookId: 16, tags: ["異世界転生", "ファンタジー", "コメディ", "巻き込まれ型", "バディ"], },
  { bookId: 17, tags: ["異世界転生", "戦記", "ダーク", "戦争", "冷酷型"], },
  { bookId: 18, tags: ["学園", "現代バトル", "ラブコメ", "バディ", "ツンデレ"], },
  { bookId: 19, tags: ["現代ファンタジー", "学園", "ダーク", "バディ", "戦闘多め"], },
  { bookId: 20, tags: ["旅", "ファンタジー", "日常系", "哲学", "短編連作"], },
  { bookId: 21, tags: ["異世界転移", "ファンタジー", "冒険譚", "チート能力", "スローライフ"], },
  { bookId: 22, tags: ["異世界転移", "ファンタジー", "最強無双", "勘違い系主人公", "スキル制"], },
  { bookId: 23, tags: ["学園", "現代ファンタジー", "ハーレム", "ラブコメ", "悪魔"], },
  { bookId: 24, tags: ["異世界転生", "学園", "最強無双", "チート能力", "コメディ"], },
  { bookId: 25, tags: ["学園", "コメディ", "チーム戦", "ラブコメ", "召喚系"], },
  { bookId: 26, tags: ["ファンタジー", "成り上がり", "元最強", "師弟", "剣主体"], },
  { bookId: 27, tags: ["異世界転生", "学園", "最強無双", "魔法主体", "やり直し"], },
  { bookId: 28, tags: ["異世界転移", "ファンタジー", "スローライフ", "チート能力", "旅"], },
  { bookId: 29, tags: ["学園", "ラブコメ", "ハーレム", "陰キャ系", "コメディ"], },
  { bookId: 30, tags: ["異世界転生", "悪役令嬢", "ラブコメ", "ハーレム", "コメディ"], },
  { bookId: 31, tags: ["異世界", "異世界転移", "頭脳戦特化", "バディ", "戦略戦"] },
  { bookId: 32, tags: ["現代ファンタジー", "現代バトル", "恋愛中心", "巻き込まれ型", "戦闘多め"] },
  { bookId: 33, tags: ["異世界", "ダンジョン", "ハーレム", "スキル制", "最強無双"] },
  { bookId: 34, tags: ["現代ファンタジー", "群像劇", "ミステリー", "複数視点", "ダーク"] },
  { bookId: 35, tags: ["学園", "ラブコメ", "お嬢様", "先輩後輩", "ほのぼの"] },
  { bookId: 36, tags: ["現代", "ラブコメ", "妹キャラ", "日常系", "コメディ"] },
  { bookId: 37, tags: ["学園", "ラブコメ", "クーデレ", "恋愛中心", "会話多め"] },
  { bookId: 38, tags: ["異世界転生", "ファンタジー", "最強無双", "天才型", "魔法主体"] },
  { bookId: 39, tags: ["異世界転生", "悪役令嬢", "恋愛中心", "逆転劇", "お嬢様"] },
  { bookId: 40, tags: ["異世界転生", "ファンタジー", "勘違い系主人公", "最強無双", "ダーク"] },
  { bookId: 41, tags: ["異世界転移", "ダンジョン", "成り上がり", "最強無双", "バディ"] },
  { bookId: 42, tags: ["ファンタジー", "旅", "経営", "バディ", "頭脳戦特化"] },
  { bookId: 43, tags: ["異世界転生", "スローライフ", "魔物使い", "ほのぼの", "仲間重視"] },
  { bookId: 44, tags: ["異世界転移", "スローライフ", "経営", "仲間重視", "ほのぼの"] },
  { bookId: 45, tags: ["異世界転移", "政治", "恋愛中心", "現実主義者", "国家運営"] },
  { bookId: 46, tags: ["異世界転生", "学園世界", "成り上がり", "皮肉屋", "戦略戦"] },
  { bookId: 47, tags: ["ファンタジー", "恋愛中心", "お嬢様", "コメディ", "日常系"] },
  { bookId: 48, tags: ["学園", "ファンタジー", "魔法主体", "コメディ", "師弟"] },
  { bookId: 49, tags: ["異世界転生", "ダンジョン", "成長型", "モンスター", "サバイバル"] },
  { bookId: 50, tags: ["異世界転移", "成長型", "コメディ", "戦闘多め", "巻き込まれ型"] },
  { bookId: 51, tags: ["ファンタジー", "追放系", "成り上がり", "成長型", "剣主体"] },
  { bookId: 52, tags: ["異世界転移", "最強無双", "魔法主体", "冒険譚", "バディ"] },
  { bookId: 53, tags: ["異世界転移", "冒険譚", "成長型", "仲間重視", "コメディ"] },
  { bookId: 54, tags: ["異世界", "現代ファンタジー", "最強無双", "レベル制", "逆転劇"] },
  { bookId: 55, tags: ["異世界転生", "冒険譚", "バディ", "成長型", "剣主体"] },
  { bookId: 56, tags: ["異世界転生", "冒険譚", "成長型", "チート能力", "ハーレム"] },
  { bookId: 57, tags: ["現代ファンタジー", "コメディ", "日常系", "バディ", "ラブコメ"] },
  { bookId: 58, tags: ["異世界転生", "職人", "スローライフ", "経営", "ほのぼの"] },
  { bookId: 59, tags: ["異世界転生", "成長型", "チート能力", "ダーク", "魔法主体"] },
  { bookId: 60, tags: ["異世界", "冒険譚", "元最強", "仲間重視", "バトル"] }
]

// ===============================
// ユーティリティ
// ===============================

// ランダム選択
function pickRandom<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, n)
}

// 重み付きランダム選択
function weightedPick<T>(
  items: T[],
  weights: number[],
  n: number
): T[] {
  const result: T[] = []

  const pool = items.map((item, i) => ({
    item,
    weight: weights[i],
  }))

  for (let i = 0; i < n; i++) {
    const total = pool.reduce((sum, p) => sum + p.weight, 0)
    let r = Math.random() * total

    for (let j = 0; j < pool.length; j++) {
      r -= pool[j].weight
      if (r <= 0) {
        result.push(pool[j].item)
        pool.splice(j, 1)
        break
      }
    }
  }

  return result
}

// ===============================
// メイン
// ===============================
async function main() {
  // ---------------------------
  // Tagを取得してMap化
  // ---------------------------
  const tags = await prisma.tag.findMany()

  const tagMap = new Map<string, string>()
  tags.forEach((tag) => {
    tagMap.set(tag.name, tag.id)
  })

  // ---------------------------
  // ユーザー作成
  // ---------------------------
  const users = await Promise.all(
    Array.from({ length: 30 }).map((_, i) =>
      prisma.user.create({
        data: {
          name: `user_${i + 1}`,
          email: `user_${i + 1}@test.com`,
        },
      })
    )
  )

  // ---------------------------
  // 全タグ一覧（嗜好生成用）
  // ---------------------------
  const allTagNames = tags.map((t) => t.name)

  // ---------------------------
  // 各ユーザー処理
  // ---------------------------
  for (const user of users) {
    // -----------------------
    // 嗜好ベクトル生成
    // -----------------------
    const preference: Record<string, number> = {}

    allTagNames.forEach((tag) => {
      preference[tag] = Math.random() // 0〜1
    })

    // -----------------------
    // 本スコア計算
    // -----------------------
    const scoredBooks = bookTagCandidates.map((b) => {
      const score = b.tags.reduce(
        (sum, tag) => sum + (preference[tag] || 0),
        0
      )
      return { ...b, score }
    })

    // スコア高い順で20冊
    const selectedBooks = scoredBooks
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)

    // -----------------------
    // UserBookTag作成
    // -----------------------
    const inserts = []

    for (const book of selectedBooks) {
      const weights = book.tags.map(
        (tag) => preference[tag] || 0.1
      )

      let selectedTags = weightedPick(book.tags, weights, 3)

      // ノイズ（20%で1つランダム置換）
      if (Math.random() < 0.2) {
        const randomTag =
          book.tags[Math.floor(Math.random() * book.tags.length)]
        selectedTags[0] = randomTag
      }

      for (const tagName of selectedTags) {
        const tagId = tagMap.get(tagName)

        if (!tagId) continue

        inserts.push({
          userId: user.id,
          bookId: book.bookId,
          tagId,
          score: 1,
        })
      }
    }


    // likeに保存
    await prisma.like.createMany({
      data: selectedBooks.map((book) => ({
        userId: user.id,
        bookId: book.bookId,
      })),
      skipDuplicates: true,
    })

    // tag登録
    await prisma.userBookTag.createMany({
      data: inserts,
      skipDuplicates: true,
    })
  }

  console.log("✅ Seed complete")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())