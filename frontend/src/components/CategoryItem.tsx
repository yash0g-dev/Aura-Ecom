import { Link } from "react-router-dom";
export const CategoryItem = ({
  category,
  idx,
}: {
  category: array;
  idx: number;
}) => {
  return (
    <Link to={category.href}>
      <div
        key={idx}
        className="group relative h-48 rounded-2xl overflow-hidden border border-gray-800 bg-gray-900/50 hover:border-gray-700 transition duration-300 cursor-pointer"
      >
        <img
          src={category.imageUrl}
          alt={category.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent z-10" />
        <div className="absolute bottom-6 left-6 z-20">
          <h3 className="text-xl font-bold tracking-tight mb-1">
            {category.name}
          </h3>
          <span className="text-xs text-purple-400 group-hover:underline flex items-center gap-1">
            Explore Collection &rarr;
          </span>
        </div>
      </div>{" "}
    </Link>
  );
};
