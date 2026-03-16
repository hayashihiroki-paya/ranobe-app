// scripts/seedTags.ts

import { PrismaClient, TagCategory } from "@prisma/client";

const prisma = new PrismaClient();

const tags = [

  // ===============================
  // WORLD
  // ===============================
  { name: "ハイファンタジー", key: "world_high_fantasy", category: TagCategory.WORLD },
  { name: "ローファンタジー", key: "world_low_fantasy", category: TagCategory.WORLD },
  { name: "現代ファンタジー", key: "world_modern_fantasy", category: TagCategory.WORLD },
  { name: "ゲーム世界", key: "world_game_world", category: TagCategory.WORLD },
  { name: "VRMMO", key: "world_vrmmo", category: TagCategory.WORLD },
  { name: "未来SF", key: "world_future_sf", category: TagCategory.WORLD },
  { name: "宇宙", key: "world_space", category: TagCategory.WORLD },
  { name: "ディストピア", key: "world_dystopia", category: TagCategory.WORLD },
  { name: "ポストアポカリプス", key: "world_post_apocalypse", category: TagCategory.WORLD },
  { name: "異世界", key: "world_isekai", category: TagCategory.WORLD },
  { name: "学園世界", key: "world_academy", category: TagCategory.WORLD },

  // ===============================
  // GENRE
  // ===============================
  { name: "異世界転生", key: "genre_isekai_reincarnation", category: TagCategory.GENRE },
  { name: "異世界転移", key: "genre_isekai_transport", category: TagCategory.GENRE },
  { name: "現代バトル", key: "genre_modern_battle", category: TagCategory.GENRE },
  { name: "学園", key: "genre_school", category: TagCategory.GENRE },
  { name: "SF", key: "genre_sf", category: TagCategory.GENRE },
  { name: "ダンジョン", key: "genre_dungeon", category: TagCategory.GENRE },
  { name: "冒険譚", key: "genre_adventure", category: TagCategory.GENRE },
  { name: "国家運営", key: "genre_nation", category: TagCategory.GENRE },
  { name: "デスゲーム", key: "genre_death_game", category: TagCategory.GENRE },
  { name: "恋愛中心", key: "genre_romance", category: TagCategory.GENRE },
  { name: "ミステリー", key: "genre_mystery", category: TagCategory.GENRE },
  { name: "日常系", key: "genre_slice_of_life", category: TagCategory.GENRE },
  { name: "ラブコメ", key: "genre_romcom", category: TagCategory.GENRE },
  { name: "戦記", key: "genre_war_chronicle", category: TagCategory.GENRE },
  { name: "政治", key: "genre_politics", category: TagCategory.GENRE },
  { name: "経営", key: "genre_management", category: TagCategory.GENRE },
  { name: "職人", key: "genre_crafting", category: TagCategory.GENRE },
  { name: "旅", key: "genre_journey", category: TagCategory.GENRE },

  // ===============================
  // PROTAGONIST
  // ===============================
  { name: "最強無双", key: "protagonist_invincible", category: TagCategory.PROTAGONIST },
  { name: "成長型", key: "protagonist_growth", category: TagCategory.PROTAGONIST },
  { name: "努力型", key: "protagonist_hardwork", category: TagCategory.PROTAGONIST },
  { name: "ダークヒーロー", key: "protagonist_dark", category: TagCategory.PROTAGONIST },
  { name: "頭脳戦特化", key: "protagonist_strategy", category: TagCategory.PROTAGONIST },
  { name: "善人型", key: "protagonist_good", category: TagCategory.PROTAGONIST },
  { name: "冷酷型", key: "protagonist_cold", category: TagCategory.PROTAGONIST },
  { name: "ひねくれ系", key: "protagonist_twisted", category: TagCategory.PROTAGONIST },
  { name: "陰キャ系", key: "protagonist_introvert", category: TagCategory.PROTAGONIST },
  { name: "熱血型", key: "protagonist_hotblooded", category: TagCategory.PROTAGONIST },
  { name: "皮肉屋", key: "protagonist_sarcastic", category: TagCategory.PROTAGONIST },
  { name: "現実主義者", key: "protagonist_realist", category: TagCategory.PROTAGONIST },
  { name: "仲間重視", key: "protagonist_teamplayer", category: TagCategory.PROTAGONIST },
  { name: "自己中心型", key: "protagonist_selfish", category: TagCategory.PROTAGONIST },
  { name: "トラウマ持ち", key: "protagonist_trauma", category: TagCategory.PROTAGONIST },
  { name: "巻き込まれ型", key: "protagonist_involved", category: TagCategory.PROTAGONIST },
  { name: "元最強", key: "protagonist_former_strong", category: TagCategory.PROTAGONIST },
  { name: "天才型", key: "protagonist_genius", category: TagCategory.PROTAGONIST },
  { name: "常識人", key: "protagonist_common_sense", category: TagCategory.PROTAGONIST },
  { name: "勘違い系主人公", key: "protagonist_misunderstood", category: TagCategory.PROTAGONIST },

  // ===============================
  // SETTING
  // ===============================
  { name: "追放系", key: "setting_exiled", category: TagCategory.SETTING },
  { name: "悪役令嬢", key: "setting_villainess", category: TagCategory.SETTING },
  { name: "やり直し", key: "setting_retry", category: TagCategory.SETTING },
  { name: "ループ", key: "setting_loop", category: TagCategory.SETTING },
  { name: "転生知識チート", key: "setting_reincarnation_knowledge", category: TagCategory.SETTING },
  { name: "レベル制", key: "setting_level_system", category: TagCategory.SETTING },
  { name: "ステータス表示", key: "setting_status_screen", category: TagCategory.SETTING },
  { name: "スローライフ", key: "setting_slow_life", category: TagCategory.SETTING },
  { name: "勘違い系", key: "setting_misunderstanding", category: TagCategory.SETTING },
  { name: "配信系", key: "setting_streaming", category: TagCategory.SETTING },
  { name: "掲示板文化", key: "setting_forum_style", category: TagCategory.SETTING },

  // ===============================
  // RELATION
  // ===============================
  { name: "ハーレム", key: "relation_harem", category: TagCategory.RELATION },
  { name: "バディ", key: "relation_duo", category: TagCategory.RELATION },
  { name: "パーティー", key: "relation_party", category: TagCategory.RELATION },
  { name: "幼馴染", key: "relation_childhood_friend", category: TagCategory.RELATION },
  { name: "ライバル", key: "relation_rival", category: TagCategory.RELATION },
  { name: "師弟", key: "relation_master_student", category: TagCategory.RELATION },
  { name: "先輩後輩", key: "relation_senpai_kouhai", category: TagCategory.RELATION },

  // ===============================
  // CHARACTER
  // ===============================
  { name: "ツンデレ", key: "character_tsundere", category: TagCategory.CHARACTER },
  { name: "クーデレ", key: "character_kuudere", category: TagCategory.CHARACTER },
  { name: "ヤンデレ", key: "character_yandere", category: TagCategory.CHARACTER },
  { name: "妹キャラ", key: "character_imouto", category: TagCategory.CHARACTER },
  { name: "お姉さんキャラ", key: "character_oneesan", category: TagCategory.CHARACTER },
  { name: "ロリキャラ", key: "character_loli", category: TagCategory.CHARACTER },
  { name: "元気系", key: "character_genki", category: TagCategory.CHARACTER },
  { name: "内気キャラ", key: "character_shy", category: TagCategory.CHARACTER },
  { name: "お嬢様", key: "character_ojousama", category: TagCategory.CHARACTER },

  // ===============================
  // ABILITY
  // ===============================
  { name: "チート能力", key: "ability_cheat", category: TagCategory.ABILITY },
  { name: "スキル制", key: "ability_skill_system", category: TagCategory.ABILITY },
  { name: "魔法主体", key: "ability_magic", category: TagCategory.ABILITY },
  { name: "剣主体", key: "ability_sword", category: TagCategory.ABILITY },
  { name: "銃火器", key: "ability_guns", category: TagCategory.ABILITY },
  { name: "召喚系", key: "ability_summon", category: TagCategory.ABILITY },
  { name: "サポート特化", key: "ability_support", category: TagCategory.ABILITY },
  { name: "戦略戦", key: "ability_strategy", category: TagCategory.ABILITY },
  { name: "チーム戦", key: "ability_teamfight", category: TagCategory.ABILITY },
  { name: "タイマン中心", key: "ability_one_on_one", category: TagCategory.ABILITY },
  { name: "能力制限あり", key: "ability_limited", category: TagCategory.ABILITY },
  { name: "リソース管理重視", key: "ability_resource", category: TagCategory.ABILITY },
  { name: "錬金術", key: "ability_alchemy", category: TagCategory.ABILITY },
  { name: "クラフト", key: "ability_crafting", category: TagCategory.ABILITY },
  { name: "魔物使い", key: "ability_monster_tamer", category: TagCategory.ABILITY },

  // ===============================
  // TONE
  // ===============================
  { name: "コメディ", key: "tone_comedy", category: TagCategory.TONE },
  { name: "シリアス", key: "tone_serious", category: TagCategory.TONE },
  { name: "ダーク", key: "tone_dark", category: TagCategory.TONE },
  { name: "ほのぼの", key: "tone_wholesome", category: TagCategory.TONE },

  // ===============================
  // STYLE
  // ===============================
  { name: "テンポ良い", key: "style_fast_paced", category: TagCategory.STYLE },
  { name: "会話多め", key: "style_dialogue_heavy", category: TagCategory.STYLE },
  { name: "戦闘多め", key: "style_battle_heavy", category: TagCategory.STYLE },

  // ===============================
  // NARRATIVE
  // ===============================
  { name: "一人称", key: "narrative_first_person", category: TagCategory.NARRATIVE },
  { name: "三人称", key: "narrative_third_person", category: TagCategory.NARRATIVE },
  { name: "複数視点", key: "narrative_multiple_pov", category: TagCategory.NARRATIVE },

];

async function main() {
  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { key: tag.key },
      update: {},
      create: tag,
    });
  }

  console.log(`タグ ${tags.length} 件をseedしました`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());