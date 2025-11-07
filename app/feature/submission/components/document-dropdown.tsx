import React, { useState } from "react";

interface Member {
  id: number;
  name: string;
  role: string;
}

interface Document {
  id: number;
  title: string;
}

interface DocumentDropdownProps {
  document: Document;
  members: Member[];
}

const DocumentDropdown: React.FC<DocumentDropdownProps> = ({
  document,
  members,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<{
    [key: number]: boolean;
  }>({});

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleUpload = (memberId: number) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [memberId]: !prev[memberId],
    }));
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
      <div
        className="bg-gray-100 p-4 font-medium text-gray-800 flex justify-between items-center cursor-pointer"
        onClick={toggleDropdown}
      >
        <span>{document.title}</span>
        <i
          className={`fa ${isOpen ? "fa-chevron-up" : "fa-chevron-down"} text-gray-600`}
        ></i>
      </div>

      {isOpen && (
        <div className="p-4 bg-white">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-gray-700">
                {member.name} {member.role}
              </div>
              <button
                onClick={() => handleUpload(member.id)}
                className={`px-3 py-1 rounded text-sm font-medium transition ${
                  uploadedFiles[member.id]
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {uploadedFiles[member.id] ? "Terupload" : "Upload"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentDropdown;
