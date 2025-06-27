import React, { useCallback, useState } from "react";
import { Upload, Camera, X, Image as ImageIcon } from "lucide-react";
import { UploadState } from "../types";

interface ImageUploadProps {
  uploadState: UploadState;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  uploadState,
  onFileSelect,
  onClear,
}) => {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      const imageFile = files.find((file) => file.type.startsWith("image/"));

      if (imageFile) {
        onFileSelect(imageFile);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  if (uploadState.preview) {
    return (
      <div className="relative flex justify-center">
        <div className="relative bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
          <button
            onClick={onClear}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 transition-colors z-10"
          >
            <X size={16} />
          </button>
          <img
            src={uploadState.preview}
            alt="Uploaded preview"
            style={{ width: "180px", height: "auto" }}
            className="object-cover rounded-xl mx-auto"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
        dragOver
          ? "border-purple-400 bg-purple-50"
          : "border-gray-300 hover:border-purple-300 hover:bg-purple-25"
      }`}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
          <ImageIcon className="text-white" size={32} />
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Upload Your Photo
          </h3>
          <p className="text-gray-600 mb-4">
            Drop your image here or click to browse
          </p>
        </div>

        <div className="flex gap-4">
          <label className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl flex items-center space-x-2">
            <Upload size={20} />
            <span>Choose File</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>

          <label className="border-2 border-purple-200 text-purple-600 px-6 py-3 rounded-xl font-medium hover:bg-purple-50 transition-all duration-300 cursor-pointer flex items-center space-x-2">
            <Camera size={20} />
            <span>Take Photo</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Supports JPG, PNG, WebP up to 10MB
        </p>
      </div>
    </div>
  );
};
