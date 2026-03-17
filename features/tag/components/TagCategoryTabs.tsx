/*
==============================================
タグカテゴリ切替
==============================================
*/

const categories = [
  "GENRE",
  "PROTAGONIST",
  "ABILITY",
  "RELATION",
  "PLOT",
  "TONE",
  "STYLE",
  "NARRATIVE",
  "WORLD",
  "SETTING",
  "CHARACTER",
];

type Props = {
  category: string;
  setCategory: (c: string) => void;
};

export default function TagCategoryTabs({ category, setCategory }: Props) {

  return (

    <div className="flex gap-2 overflow-x-auto mb-4">

      {categories.map((c) => (

        <button
          key={c}
          onClick={() => setCategory(c)}
          className={`px-3 py-1 rounded border
          ${category === c ? "bg-black text-white" : ""}`}
        >
          {c}
        </button>

      ))}

    </div>
  );
}