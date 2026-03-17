/*
==============================================
タグUI
==============================================
*/

type Tag = {
  id: string;
  name: string;
};

type Props = {
  tag: Tag;
  selected: boolean;
  onClick: () => void;
};

export default function TagChip({ tag, selected, onClick }: Props) {

  return (

    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full border text-sm
      ${selected
        ? "bg-blue-500 text-white border-blue-500"
        : "bg-gray-100"
      }`}
    >
      {tag.name}
    </button>

  );
}