import { Link } from "react-router";
import type { CardProps } from "~/feature/during-intern/types";

function Card({ title, description, icon, to }: CardProps) {
  return (
    <Link
      to={to}
      className="flex-1 bg-white rounded-xl shadow-md p-8 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5 text-green-700 text-4xl">
        <i className={`fas ${icon}`}></i>
      </div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-3">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </Link>
  );
}

export default Card;
