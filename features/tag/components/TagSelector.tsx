"use client";

// ---------------------------------------------
// TagSelector
//
// 本にタグを付与するUI
//
// 機能
// ・タグ取得
// ・カテゴリごと表示
// ・クリックでON/OFF
// ・選択タグを保持
// ・保存ボタン
// ---------------------------------------------

import { useEffect, useState } from "react";

// ---------------------------------------------
// Tag型
// APIから取得するタグ
// ---------------------------------------------
type Tag = {
  id: string;
  name: string;
  category: string;
};

// ---------------------------------------------
// props
//
// onSave
// 選択タグを親に渡す
// ---------------------------------------------
type Props = {
  onSave?: (tagIds: string[]) => void;
};

export default function TagSelector({ onSave }: Props) {

  // ---------------------------------------------
  // APIから取得したタグ
  // ---------------------------------------------
  const [tags, setTags] = useState<Tag[]>([]);

  // ---------------------------------------------
  // 選択中タグ
  // ---------------------------------------------
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // ---------------------------------------------
  // 初回ロード
  // タグ取得
  // ---------------------------------------------
  useEffect(() => {
    fetchTags();
  }, []);

  // ---------------------------------------------
  // タグ取得
  // ---------------------------------------------
  async function fetchTags() {
    try {
      const res = await fetch("/api/tags");
      const data = await res.json();

      setTags(data.tags);

    } catch (error) {
      console.error("タグ取得失敗", error);
    }
  }

  // ---------------------------------------------
  // タグクリック
  //
  // 選択ON/OFF
  // ---------------------------------------------
  function toggleTag(tagId: string) {

    setSelectedTags((prev) => {

      // すでに選択されている場合
      if (prev.includes(tagId)) {

        // 削除
        return prev.filter((id) => id !== tagId);
      }

      // 未選択なら追加
      return [...prev, tagId];
    });
  }

  // ---------------------------------------------
  // カテゴリごとにタグを整理
  //
  // { WORLD:[...], ABILITY:[...] }
  // ---------------------------------------------
  const tagsByCategory: Record<string, Tag[]> = {};

  tags.forEach((tag) => {

    if (!tagsByCategory[tag.category]) {
      tagsByCategory[tag.category] = [];
    }

    tagsByCategory[tag.category].push(tag);
  });

  // ---------------------------------------------
  // 保存ボタン
  // ---------------------------------------------
  function handleSave() {

    if (onSave) {
      onSave(selectedTags);
    }

    console.log("選択タグ", selectedTags);
  }

  // ---------------------------------------------
  // UI
  // ---------------------------------------------
  return (

    <div className="space-y-6">

      {/* -----------------------------
      タイトル
      ----------------------------- */}
      <h3 className="text-lg font-bold">
        ココ好きタグ
      </h3>


      {/* -----------------------------
      カテゴリごと表示
      ----------------------------- */}
      {Object.entries(tagsByCategory).map(
        ([category, categoryTags]) => (

          <div key={category}>

            {/* カテゴリタイトル */}
            <h4 className="font-semibold mb-2">
              {category}
            </h4>

            {/* タグ一覧 */}
            <div className="flex flex-wrap gap-2">

              {categoryTags.map((tag) => {

                const isSelected =
                  selectedTags.includes(tag.id);

                return (

                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}

                    className={`
                      px-3 py-1 rounded-full border text-sm
                      transition
                      
                      ${
                        isSelected
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-white text-gray-700 border-gray-300"
                      }
                    `}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>

          </div>
        )
      )}

      {/* -----------------------------
      保存ボタン
      ----------------------------- */}
      <button
        onClick={handleSave}
        className="bg-black text-white px-4 py-2 rounded"
      >
        保存
      </button>

    </div>
  );
}