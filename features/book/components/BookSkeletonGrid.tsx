export default function BookSkeletonGrid() {

  const skeletons = Array.from({ length: 10 })

  return (
    <div className="
      grid
      grid-cols-2
      sm:grid-cols-3
      md:grid-cols-4
      lg:grid-cols-5
      gap-6
      mt-6
    ">
      {skeletons.map((_, i) => (

        <div
          key={i}
          className="
            animate-pulse
            bg-gray-200
            rounded
            h-[260px]
          "
        />

      ))}
    </div>
  )
}