import React from 'react';
import { X, Copy, Check } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  filterName: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  filterName
}) => {
  const [copied, setCopied] = React.useState(false);
  
  const shareUrl = `${window.location.origin}/shared/${Date.now()}`;
  const shareText = `Check out my AuraLens creation styled with ${filterName}! 🎨✨`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link');
    }
  };

  const shareToSocial = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      farcaster: `https://warpcast.com/~/compose?text=${encodedText}&embeds[]=${encodedUrl}`
    };
    
    window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Share Your Creation</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <img
            src={imageUrl}
            alt="Shared creation"
            className="w-full h-48 object-cover rounded-xl"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 bg-transparent text-sm text-gray-600"
            />
            <button
              onClick={handleCopyLink}
              className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => shareToSocial('twitter')}
              className="bg-blue-400 text-white py-3 rounded-xl font-medium hover:bg-blue-500 transition-colors"
            >
              Twitter
            </button>
            <button
              onClick={() => shareToSocial('facebook')}
              className="bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Facebook
            </button>
            <button
              onClick={() => shareToSocial('linkedin')}
              className="bg-blue-700 text-white py-3 rounded-xl font-medium hover:bg-blue-800 transition-colors"
            >
              LinkedIn
            </button>
            <button
              onClick={() => shareToSocial('farcaster')}
              className="bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              Farcaster
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};