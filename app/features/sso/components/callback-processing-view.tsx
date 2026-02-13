interface CallbackProcessingViewProps {
  isProcessing: boolean;
}

export function CallbackProcessingView({
  isProcessing,
}: CallbackProcessingViewProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
        <div className="mb-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {isProcessing ? "Processing login..." : "Redirecting..."}
        </h2>
        <p className="text-gray-600">
          Please wait while we complete your authentication
        </p>
      </div>
    </div>
  );
}
