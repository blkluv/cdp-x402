import React from 'react';
import { Download, Share2, RotateCcw, Heart } from 'lucide-react';
import { RenderResult } from '../types';
import { downloadImageAsJPEG } from '../utils/imageUtils';

interface ResultDisplayProps {
  result: RenderResult;
  onStartOver: () => void;
  onShare: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  result,
  onStartOver,
  onShare
}) => {
  const handleDownload = () => {
    const filename = `auralens-${result.filter.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    downloadImageAsJPEG(result.styledImage, filename, 0.95);
  };

  const handleDownloadOriginal = () => {
    const filename = `auralens-original-${Date.now()}`;
    downloadImageAsJPEG(result.originalImage, filename, 0.95);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Your AuraLens Creation
        </h2>
        <p className="text-gray-600">
          Styled with {result.filter.name}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative group">
          <img
            src={result.originalImage}
            alt="Original"
            style={{ width: "180px", height: "auto" }}
            className="object-cover rounded-xl mx-auto"
          />
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              Original
            </div>
            <button
              onClick={handleDownloadOriginal}
              className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              title="Download Original"
            >
              <Download size={16} />
            </button>
          </div>
          
          <div className="relative group">
            <img
              src={result.styledImage}
              alt="Styled result"
              style={{ width: "180px", height: "auto" }}
              className="object-cover rounded-xl mx-auto"
            />
            <div className={`absolute bottom-4 left-4 bg-gradient-to-r ${result.filter.gradient} text-white px-3 py-1 rounded-full text-sm`}>
              {result.filter.name}
            </div>
            <button
              onClick={handleDownload}
              className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              title="Download Styled Image"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={handleDownload}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <Download size={20} />
          <span>Download JPEG</span>
        </button>
        
        <button
          onClick={onShare}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <Share2 size={20} />
          <span>Share</span>
        </button>
        
        <button className="flex items-center space-x-2 border-2 border-red-200 text-red-600 px-6 py-3 rounded-xl font-medium hover:bg-red-50 transition-all duration-300">
          <Heart size={20} />
          <span>Save</span>
        </button>
        
        <button
          onClick={onStartOver}
          className="flex items-center space-x-2 border-2 border-purple-200 text-purple-600 px-6 py-3 rounded-xl font-medium hover:bg-purple-50 transition-all duration-300"
        >
          <RotateCcw size={20} />
          <span>Start Over</span>
        </button>
      </div>
    </div>
  );
};