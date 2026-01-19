// External dependencies
import { Link } from "react-router";
import { CheckCircle, AlertCircle, Info, Clock, ChevronRight } from "lucide-react";

// Components
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

// Types
import type { Notification } from "../types";

interface NotificationCardProps {
  notification: Notification;
}

function getIcon(type: string) {
  switch (type) {
    case "success":
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case "warning":
      return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    case "error":
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    default:
      return <Info className="h-5 w-5 text-blue-600" />;
  }
}

function getBgColor(type: string) {
  switch (type) {
    case "success":
      return "bg-green-50 border-green-200";
    case "warning":
      return "bg-yellow-50 border-yellow-200";
    case "error":
      return "bg-red-50 border-red-200";
    default:
      return "bg-blue-50 border-blue-200";
  }
}

function NotificationCard({ notification }: NotificationCardProps) {
  const cardContent = (
    <CardHeader className="pb-3">
      <div className="flex items-start gap-3">
        <div className="mt-1">{getIcon(notification.type)}</div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <CardTitle className="text-base">
              {notification.title}
            </CardTitle>
            {!notification.isRead && (
              <span className="px-2 py-1 text-xs rounded-full bg-primary text-primary-foreground">
                Baru
              </span>
            )}
          </div>
          <CardDescription className="mt-1">
            {notification.message}
          </CardDescription>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{notification.timestamp}</span>
            </div>
            {notification.link && (
              <div className="flex items-center gap-1 text-xs text-primary">
                <span>Lihat Detail</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            )}
          </div>
        </div>
      </div>
    </CardHeader>
  );

  if (notification.link) {
    return (
      <Link to={notification.link} className="block">
        <Card
          className={`${getBgColor(notification.type)} ${!notification.isRead ? "border-l-4" : ""} hover:shadow-md transition-shadow cursor-pointer`}
        >
          {cardContent}
        </Card>
      </Link>
    );
  }

  return (
    <Card
      className={`${getBgColor(notification.type)} ${!notification.isRead ? "border-l-4" : ""}`}
    >
      {cardContent}
    </Card>
  );
}

export default NotificationCard;
