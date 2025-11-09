import React from "react";
import type { ProcessStepsProps } from "../types";

function ProcessSteps({ steps }: ProcessStepsProps) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "submitted":
        return {
          bg: "bg-gray-100",
          border: "border-l-gray-500",
          icon: "bg-gray-500",
        };
      case "rejected":
        return {
          bg: "bg-red-50",
          border: "border-l-red-500",
          icon: "bg-red-500",
        };
      case "approved":
        return {
          bg: "bg-green-50",
          border: "border-l-green-500",
          icon: "bg-green-500",
        };
      default:
        return {
          bg: "bg-gray-100",
          border: "border-l-gray-500",
          icon: "bg-gray-500",
        };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      {steps.map(
        (step) =>
          step.visible && (
            <div
              key={step.id}
              className={`${getStatusStyles(step.status).bg} ${getStatusStyles(step.status).border} border-l-4 rounded-lg p-5 mb-4`}
            >
              <div className="flex items-start">
                <div
                  className={`${getStatusStyles(step.status).icon} w-12 h-12 rounded-full flex items-center justify-center text-white mr-4 flex-shrink-0`}
                >
                  <i className={`fas ${step.icon}`}></i>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            </div>
          ),
      )}

      <div className="bg-gray-100 border-l-4 border-gray-500 p-4 rounded">
        <p className="text-gray-700 flex items-center">
          <i className="fas fa-info-circle mr-2"></i>
          Status persetujuan atau penolakan akan ditentukan oleh admin. Silakan
          pantau status pengajuan Anda secara berkala.
        </p>
      </div>
    </div>
  );
}

export default ProcessSteps;
