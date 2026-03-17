import TagChip from "./TagChip";


type Tag = {
  id: string;
  name: string;
};

type Props = {
  tags: Tag[];
  selectedTags: string[];
  toggleTag: (tagId: string) => void;
};

export default function TagList({ tags, selectedTags, toggleTag }: Props) {

  return (

    <div className="flex flex-wrap gap-2">

      {tags.map((tag) => (

        <TagChip
          key={tag.id}
          tag={tag}
          selected={selectedTags.includes(tag.id)}
          onClick={() => toggleTag(tag.id)}
        />

      ))}

    </div>
  );
}