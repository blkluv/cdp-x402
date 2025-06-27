import React from 'react';
import { Wand2, Loader2, CreditCard } from 'lucide-react';
import { StyleFilter, PaymentStatus } from '../types';
import { formatPrice } from '../utils/payment';

interface RenderButtonProps {
  selectedFilter: StyleFilter | null;
  hasImage: boolean;
  paymentStatus: PaymentStatus;
  renderProgress: number;
  onRender: () => void;
}

export const RenderButton: React.FC<RenderButtonProps> = ({
  selectedFilter,
  hasImage,
  paymentStatus,
  renderProgress,
  onRender
}) => {
  const isDisabled = !hasImage || !selectedFilter || 
    paymentStatus.status === 'processing' || renderProgress > 0;
  
  const getButtonContent = () => {
    if (paymentStatus.status === 'processing') {
      return (
        <>
          <Loader2 className="animate-spin" size={20} />
          <span>Processing Payment...</span>
        </>
      );
    }
    
    if (renderProgress > 0 && renderProgress < 100) {
      return (
        <>
          <Loader2 className="animate-spin" size={20} />
          <span>Rendering... {renderProgress}%</span>
        </>
      );
    }
    
    return (
      <>
        <CreditCard size={20} />
        <span>
          {selectedFilter ? `Render for ${formatPrice(selectedFilter.price)}` : 'Select a Filter'}
        </span>
        <Wand2 size={20} />
      </>
    );
  };

  return (
    <div className="text-center space-y-4">
      <button
        onClick={onRender}
        disabled={isDisabled}
        className={`w-full max-w-md mx-auto flex items-center justify-center space-x-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
          isDisabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-105'
        }`}
      >
        {getButtonContent()}
      </button>
      
      {renderProgress > 0 && renderProgress < 100 && (
        <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${renderProgress}%` }}
          />
        </div>
      )}

      {paymentStatus.status === 'error' && (
        <p className="text-red-500 text-sm">
          Payment failed: {paymentStatus.error}
        </p>
      )}
      
      <p className="text-gray-500 text-sm">
        Secure payment via x402 • Affiliate splits via CDP Wallet
      </p>
    </div>
  );
};