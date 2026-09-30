import BookCardSkeleton from "./BookCardSkeleton"

type Props = {
  count: number
  className: string
}

export default function BookCardSkeletonGrid({ count, className }: Props) {
  return (
    <div className={className}>
      {Array.from({ length: count }, (_, index) => (
        <BookCardSkeleton key={index} />
      ))}
    </div>
  )
}
