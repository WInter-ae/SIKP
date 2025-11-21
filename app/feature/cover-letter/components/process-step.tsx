import React from "react";
import { EyeIcon } from "~/components/icons/eyeicon";
import { DocIcon } from "~/components/icons/doc";
import { TimeCircleIcon } from "~/components/icons/time-circle";
import { RedoIcon } from "~/components/icons/redo";
import { CheckIcon } from "~/components/icons/check";
import type { ProcessStepProps } from "../types";

function ProcessStep({
  title,
  description,
  status,
  comment,
  onAction,
  actionText,
  showDocumentPreview = false,
}: ProcessStepProps) {
  const getStatusStyles = () => {
    switch (status) {
      case "submitted":
        return {
          bg: "bg-gray-300",
          border: "border-l-gray-500",
          iconBg: "bg-gray-500",
          iconComponent: <DocIcon className="size-6" />,
        };
      case "rejected":
        return {
          bg: "bg-red-300",
          border: "border-l-red-600",
          iconBg: "bg-red-500",
          iconComponent: <TimeCircleIcon className="size-7" />,
        };
      case "resubmitted":
        return {
          bg: "bg-gray-300",
          border: "border-l-gray-500",
          iconBg: "bg-gray-500",
          iconComponent: <RedoIcon className="size-7" />,
        };
      case "approved":
        return {
          bg: "bg-green-300",
          border: "border-l-green-600",
          iconBg: "bg-green-500",
          iconComponent: <CheckIcon className="size-7" />,
        };
      default:
        return {
          bg: "bg-gray-300",
          border: "border-l-gray-200",
          iconBg: "bg-gray-500",
          iconComponent: null,
        };
    }
  };

  const statusStyles = getStatusStyles();

  return (
    <div
      className={`${statusStyles.bg} ${statusStyles.border} border-l-4 rounded-lg p-5 mb-4`}
    >
      <div className="flex items-start">
        <div
          className={`${statusStyles.iconBg} w-12 h-12 rounded-full flex items-center justify-center text-white mr-4 flex-shrink-0`}
        >
          {statusStyles.iconComponent}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">{title}</h3>
          <p className="mb-3">{description}</p>

          {comment && (
            <div className="bg-gray-200 border-l-3 border-red-500 p-3 rounded mb-3">
              <div className="font-medium text-red-600 mb-1">Komentar:</div>
              <div className="text-gray-700">{comment}</div>
            </div>
          )}

          {showDocumentPreview && (
            <div className="bg-gray-100 p-3 rounded flex items-center cursor-pointer hover:bg-gray-200 transition">
              <div className="bg-green-600 w-10 h-10 rounded flex items-center justify-center text-white mr-3">
                <EyeIcon className="size-5" />
              </div>
              <div>
                <div className="font-medium">Surat Pengantar Kerja Praktik</div>
                <div className="text-sm text-gray-600">
                  Dibuat pada: 15 Juni 2023
                </div>
              </div>
            </div>
          )}

          {onAction && actionText && (
            <button
              onClick={onAction}
              className="mt-3 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded text-sm font-medium transition"
            >
              {actionText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProcessStep;
