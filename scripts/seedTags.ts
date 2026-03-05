import { PrismaClient, TagCategory } from "@prisma/client";

const prisma = new PrismaClient();

const tags = [
  // ========== ジャンル (12) ==========
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

  // ========== 主人公タイプ (15) ==========
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

  // ========== 能力・戦闘傾向 (12) ==========
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

  // ========== 関係性 (12) ==========
  { name: "ハーレム", key: "relation_harem", category: TagCategory.RELATION },
  { name: "一途恋愛", key: "relation_love", category: TagCategory.RELATION },
  { name: "幼馴染", key: "relation_childhood_friend", category: TagCategory.RELATION },
  { name: "ライバル", key: "relation_rival", category: TagCategory.RELATION },
  { name: "師弟関係", key: "relation_mentor", category: TagCategory.RELATION },
  { name: "バディもの", key: "relation_buddy", category: TagCategory.RELATION },
  { name: "パーティー制", key: "relation_party", category: TagCategory.RELATION },
  { name: "主従関係", key: "relation_master_servant", category: TagCategory.RELATION },
  { name: "家族愛", key: "relation_family", category: TagCategory.RELATION },
  { name: "裏切りあり", key: "relation_betrayal", category: TagCategory.RELATION },
  { name: "恋愛三角関係", key: "relation_triangle", category: TagCategory.RELATION },

  // ========== ストーリー展開 (12) ==========
  { name: "追放からの逆転", key: "plot_exile_reversal", category: TagCategory.PLOT },
  { name: "復讐", key: "plot_revenge", category: TagCategory.PLOT },
  { name: "ループ", key: "plot_loop", category: TagCategory.PLOT },
  { name: "成り上がり", key: "plot_rise", category: TagCategory.PLOT },
  { name: "群像劇", key: "plot_ensemble", category: TagCategory.PLOT },
  { name: "国家戦争", key: "plot_war", category: TagCategory.PLOT },
  { name: "ダンジョン攻略", key: "plot_dungeon", category: TagCategory.PLOT },
  { name: "スローライフ", key: "plot_slow_life", category: TagCategory.PLOT },
  { name: "伏線重視", key: "plot_foreshadowing", category: TagCategory.PLOT },
  { name: "どんでん返し", key: "plot_twist", category: TagCategory.PLOT },
  { name: "長編大河", key: "plot_long_story", category: TagCategory.PLOT },

  // ========== 雰囲気・作風 (7) ==========
  { name: "シリアス", key: "tone_serious", category: TagCategory.TONE },
  { name: "ダーク", key: "tone_dark", category: TagCategory.TONE },
  { name: "コメディ寄り", key: "tone_comedy", category: TagCategory.TONE },
  { name: "重厚", key: "tone_heavy", category: TagCategory.TONE },
  { name: "ライト寄り", key: "tone_light", category: TagCategory.TONE },
  { name: "青春感強め", key: "tone_youth", category: TagCategory.TONE },
  { name: "心理描写重視", key: "tone_psychology", category: TagCategory.TONE },

  // ========== 文体・語り (5) ==========
  { name: "一人称視点", key: "style_first_person", category: TagCategory.STYLE },
  { name: "三人称視点", key: "style_third_person", category: TagCategory.STYLE },
  { name: "複数視点切替", key: "style_multi_pov", category: TagCategory.STYLE },
  { name: "地の文多め", key: "style_narration_heavy", category: TagCategory.STYLE },
  { name: "会話中心", key: "style_dialogue", category: TagCategory.STYLE },

  // ========== 描写傾向 (5) ==========
  { name: "内面描写濃い", key: "narrative_inner", category: TagCategory.NARRATIVE },
  { name: "世界観説明多い", key: "narrative_worldbuilding", category: TagCategory.NARRATIVE },
  { name: "バトル描写詳細", key: "narrative_battle", category: TagCategory.NARRATIVE },
  { name: "テンポ速い", key: "narrative_fast", category: TagCategory.NARRATIVE },
  { name: "文章難度高め", key: "narrative_complexity", category: TagCategory.NARRATIVE },
];

async function main() {
  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { key: tag.key },
      update: {},
      create: tag,
    });
  }
  console.log("80タグのseed完了");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());