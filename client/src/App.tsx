import { useState, useCallback } from 'react';
import { Sparkles, Palette, Link } from 'lucide-react';
import { ImageUpload } from './components/ImageUpload';
import { FilterSelector } from './components/FilterSelector';
import { RenderButton } from './components/RenderButton';
import { ResultDisplay } from './components/ResultDisplay';
import { ShareModal } from './components/ShareModal';
import { styleFilters } from './data/filters';
import { processPayment, splitAffiliateRevenue } from './utils/payment';
import { renderImage } from './utils/ai';
import { StyleFilter, UploadState, PaymentStatus, RenderResult } from './types';
import axios from 'axios';  
import { withPaymentInterceptor } from 'x402-axios';  
import { useAccount, useWalletClient, WagmiProvider, useSignMessage } from 'wagmi';  
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';  
import { createConfig, http } from 'wagmi';  
import { baseSepolia } from 'wagmi/chains';  
import { injected } from 'wagmi/connectors';  
import { useConnectors } from 'wagmi';
  
// Wagmi configuration  
const config = createConfig({  
  chains: [baseSepolia],  
  connectors: [injected()],  
  transports: {  
    [baseSepolia.id]: http(),  
  },  
});  

const queryClient = new QueryClient();  

function PaymentApp() {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    preview: null,
    isUploading: false
  });
  
  const [selectedFilter, setSelectedFilter] = useState<StyleFilter | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({ status: 'idle' });
  const [renderProgress, setRenderProgress] = useState(0);
  const [result, setResult] = useState<RenderResult | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [error, setError] = useState('');
  const [affiliateLink, setAffiliateLink] = useState('');
  const [showAffiliateLink, setShowAffiliateLink] = useState(false);
  // @ts-ignore
  const { address, isConnected } = useAccount();  
  const { data: walletClient } = useWalletClient();  
  const connectors = useConnectors();
  const { signMessage } = useSignMessage(); 


    const apiClient = walletClient   
    ? withPaymentInterceptor(  
        axios.create({ baseURL: 'https://cdp-x402.vercel.app/' }),  
        // @ts-ignore
        walletClient  
      )  
    : axios.create({ baseURL: 'https://cdp-x402.vercel.app/' });  

  const handleFileSelect = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadState({
        file,
        preview: e.target?.result as string,
        isUploading: false
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleClearImage = useCallback(() => {
    setUploadState({ file: null, preview: null, isUploading: false });
    setSelectedFilter(null);
    setResult(null);
    setRenderProgress(0);
  }, []);

  const handleRender = async () => {
    if (!uploadState.file || !selectedFilter) return;
    if (!isConnected || !walletClient) {  
      setError('Please connect your wallet first');  
      return;  
    }  

    try {
      // Process payment
      setPaymentStatus({ status: 'processing' });
      const transactionId = await processPayment(selectedFilter.price, selectedFilter.id);
      
      // Handle affiliate split (mock affiliate ID from URL params)
      const urlParams = new URLSearchParams(window.location.search);
      const affiliateId = urlParams.get('ref');
      if (affiliateId) {
        await splitAffiliateRevenue(transactionId, affiliateId);
      }
      
      setPaymentStatus({ status: 'success', transactionId });
      
      // Render image with AI
      try {
        const styledImageUrl = await renderImage(
          uploadState.file,
          selectedFilter,
          apiClient,
          setRenderProgress
        );
        
        const renderResult: RenderResult = {
          id: transactionId,
          originalImage: uploadState.preview!,
          styledImage: styledImageUrl,
          filter: selectedFilter,
          timestamp: new Date()
        };
        
        setResult(renderResult);
        setRenderProgress(0);
        
      } catch (renderError) {
        // Handle rendering errors specifically
        setPaymentStatus({ 
          status: 'error', 
          error: renderError instanceof Error ? renderError.message : 'Image rendering failed',
          transactionId 
        });
        setRenderProgress(0);
      }
      
    } catch (paymentError) {
      // Handle payment errors specifically
      setPaymentStatus({ 
        status: 'error', 
        error: paymentError instanceof Error ? paymentError.message : 'Payment failed' 
      });
      setRenderProgress(0);
    }
  };

  const handleStartOver = () => {
    setResult(null);
    setPaymentStatus({ status: 'idle' });
    setRenderProgress(0);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const generateAffiliateLink = () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    const timestamp = Date.now();
    const message = `AuraLens Affiliate Link - Address: ${address} - Timestamp: ${timestamp}`;
    
    // Sign the message
    signMessage(
      { message },
      {
        onSuccess: (signedMessage) => {
          // Use first 16 characters of signature as affiliate code
          const affiliateCode = signedMessage.slice(2, 18); // Remove 0x prefix and take first 16 chars
          const link = `http://localhost:5173?ref=${affiliateCode}&addr=${address}&ts=${timestamp}`;
          setAffiliateLink(link);
          setShowAffiliateLink(true);
        },
        onError: (error) => {
          console.error('Failed to generate affiliate link:', error);
          setError('Failed to generate affiliate link. Please try again.');
        }
      }
    );
  };

  const copyAffiliateLink = async () => {
    try {
      await navigator.clipboard.writeText(affiliateLink);
      // You could add a toast notification here if desired
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
        <div className="container px-4 py-8 mx-auto">
          <header className="relative mb-12 text-center">
            {/* Affiliate Link Button - Top Right */}
            <div className="absolute top-0 right-0">
              <button
                onClick={generateAffiliateLink}
                className="flex items-center px-4 py-2 space-x-2 text-sm font-medium text-white transition-all duration-300 rounded-lg shadow-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:shadow-xl"
              >
                <Link size={16} />
                <span>Generate Affiliate Link</span>
              </button>
            </div>

            <div className="flex items-center justify-center mb-4 space-x-3">
              <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl">
                <Palette className="text-white" size={24} />
              </div>
              <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text">
                AuraLens
              </h1>
            </div>
            <p className="text-lg text-gray-600">
              Capture your essence. Render your vibe.
            </p>
          </header>

          <ResultDisplay
            result={result}
            onStartOver={handleStartOver}
            onShare={handleShare}
          />
        </div>

        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          imageUrl={result.styledImage}
          filterName={result.filter.name}
        />

        {/* Affiliate Link Display Modal */}
        {showAffiliateLink && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 bg-white shadow-2xl rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-800">Your Affiliate Link</h3>
              <div className="p-3 mb-4 text-sm break-all rounded-lg bg-gray-50">
                {affiliateLink}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={copyAffiliateLink}
                  className="flex-1 px-4 py-2 font-medium text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  Copy Link
                </button>
                <button
                  onClick={() => setShowAffiliateLink(false)}
                  className="flex-1 px-4 py-2 font-medium text-gray-700 transition-all duration-300 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <div className="container px-4 py-8 mx-auto">
        <header className="relative mb-12 text-center">
          {/* Affiliate Link Button - Top Right */}
          <div className="absolute top-0 right-0">
            <button
              onClick={generateAffiliateLink}
              className="flex items-center px-4 py-2 space-x-2 text-sm font-medium text-white transition-all duration-300 rounded-lg shadow-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:shadow-xl"
            >
              <Link size={16} />
              <span>Generate Affiliate Link</span>
            </button>
          </div>

          <div className="flex items-center justify-center mb-4 space-x-3">
            <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl">
              <Palette className="text-white" size={24} />
            </div>
            <h1 className="text-4xl font-bold text-transparent md:text-5xl bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text">
              AuraLens
            </h1>
          </div>
          <p className="mb-2 text-lg text-gray-600 md:text-xl">
            Capture your essence. Render your vibe.
          </p>
          <div className="flex items-center justify-center space-x-2 text-purple-600">
            <Sparkles size={16} />
            <span className="text-sm font-medium">AI-Powered Image Stylization</span>
            <Sparkles size={16} />
          </div>
        </header>

        {/* Affiliate Link Display Modal */}
        {showAffiliateLink && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 bg-white shadow-2xl rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-800">Your Affiliate Link</h3>
              <div className="p-3 mb-4 text-sm break-all rounded-lg bg-gray-50">
                {affiliateLink}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={copyAffiliateLink}
                  className="flex-1 px-4 py-2 font-medium text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  Copy Link
                </button>
                <button
                  onClick={() => setShowAffiliateLink(false)}
                  className="flex-1 px-4 py-2 font-medium text-gray-700 transition-all duration-300 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto space-y-12">
          <section>
            <ImageUpload
              uploadState={uploadState}
              onFileSelect={handleFileSelect}
              onClear={handleClearImage}
            />
          </section>

          {uploadState.preview && (
            <section>
              <FilterSelector
                filters={styleFilters}
                selectedFilter={selectedFilter}
                onFilterSelect={setSelectedFilter}
                disabled={paymentStatus.status === 'processing' || renderProgress > 0}
              />
            </section>
          )}

          {uploadState.preview && (
            <section>
              {isConnected ? (
                <RenderButton
                  selectedFilter={selectedFilter}
                  hasImage={!!uploadState.preview}
                  paymentStatus={paymentStatus}
                  renderProgress={renderProgress}
                  onRender={handleRender}
                />
              ) : (
                <div className="space-y-4 text-center">
                  <p className="mb-4 text-gray-600">Connect your wallet to continue</p>
                  <div className="flex flex-row justify-center max-w-md mx-auto space-x-3">
                    {connectors.map((connector) => (
                      <button 
                        key={connector.id} 
                        onClick={() => connector.connect()}
                        className="flex items-center justify-center px-6 py-3 space-x-3 font-semibold text-white transition-all duration-300 shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-700 hover:shadow-xl hover:scale-105"
                      >
                        <img src={connector.icon} alt={connector.name} className="w-6 h-6" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
        {error && (
          <div className="mb-4 text-center text-red-500">
            {error}
          </div>
        )}

        <footer className="mt-16 text-sm text-center text-gray-500">
          <div className="flex items-center justify-center mb-4 space-x-4">
            <span>Powered by Stable Diffusion + LoRA</span>
            <span>•</span>
            <span>Secure payments via x402</span>
            <span>•</span>
            <span>CDP Wallet integration</span>
          </div>
          <p>© 2025 AuraLens. Transform your photos with AI magic. ✨</p>
        </footer>
      </div>
    </div>
  );
}

function App() {  
  return (  
    <WagmiProvider config={config}>  
      <QueryClientProvider client={queryClient}>  
        <PaymentApp />  
      </QueryClientProvider>  
    </WagmiProvider>  
  );  
}  
  

export default App;