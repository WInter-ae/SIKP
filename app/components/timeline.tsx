import { useTimeline } from "~/contexts/timeline-context";

function Timeline() {
  const { timelineItems } = useTimeline();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between relative">
        {/* Progress line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 z-0"></div>

        {timelineItems.map((item) => (
          <div
            key={item.id}
            className="relative z-10 flex flex-col items-center w-1/6"
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                item.active
                  ? "bg-green-700 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              <i className="fa fa-lock"></i>
            </div>
            <div
              className={`text-sm font-medium text-center ${
                item.active ? "text-green-700" : "text-gray-500"
              }`}
            >
              {item.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Timeline;
