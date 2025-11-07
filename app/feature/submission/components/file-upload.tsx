import React, { useState } from "react";

interface FileUploadProps {
  label: string;
  onFileChange?: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ label, onFileChange }) => {
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileName(file.name);
      if (onFileChange) {
        onFileChange(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      if (onFileChange) {
        onFileChange(file);
      }
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
          isDragging
            ? "border-green-500 bg-green-50"
            : "border-gray-300 hover:border-green-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="hidden"
          id="file-upload"
          onChange={handleFileChange}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
          <p className="text-gray-600">
            {fileName ? fileName : "Klik untuk upload atau drag and drop file"}
          </p>
        </label>
      </div>
    </div>
  );
};

export default FileUpload;
