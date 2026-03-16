export default function Loading() {

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">

      <div className="h-8 w-40 bg-gray-200 rounded mb-6 animate-pulse" />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">

        {Array.from({ length: 10 }).map((_, i) => (

          <div
            key={i}
            className="rounded-xl border border-gray-200 p-3 flex flex-col gap-2 animate-pulse"
          >

            <div className="aspect-[3/4] bg-gray-200 rounded" />

            <div className="h-4 bg-gray-200 rounded w-3/4" />

            <div className="h-3 bg-gray-200 rounded w-1/2" />

            <div className="h-3 bg-gray-200 rounded w-full" />

          </div>

        ))}

      </div>

    </div>
  )
}