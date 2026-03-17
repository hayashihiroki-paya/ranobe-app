import TagChip from "./TagChip";

type Tag = {
  id: string;
  name: string;
};

type Props = {
  selectedTags: string[];
  tags: Tag[];
  toggleTag: (tagId: string) => void;
};

export default function SelectedTags({
  selectedTags,
  tags,
  toggleTag,
}: Props) {

  if (selectedTags.length === 0) return null;

  const selectedTagObjects = tags.filter((t) =>
    selectedTags.includes(t.id)
  );

  return (

    <div className="mb-4">

      <p className="text-sm mb-2 text-gray-600">
        選択済タグ
      </p>

      <div className="flex flex-wrap gap-2">

        {selectedTagObjects.map((tag) => (

          <TagChip
            key={tag.id}
            tag={tag}
            selected={true}
            onClick={() => toggleTag(tag.id)}
          />

        ))}

      </div>

    </div>
  );
}