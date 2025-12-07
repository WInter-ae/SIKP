import { Link } from "react-router";

import {
  Card as ShadcnCard,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";

import type { CardProps } from "~/feature/during-intern/types";

function Card({ title, description, icon, to }: CardProps) {
  return (
    <ShadcnCard className="flex-1 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <Link to={to} className="block h-full">
        <CardHeader className="text-center pb-2">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <i className={`fas ${icon} text-4xl text-primary`}></i>
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <CardDescription>{description}</CardDescription>
        </CardContent>
      </Link>
    </ShadcnCard>
  );
}

export default Card;
