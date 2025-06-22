
import React, { useState } from 'react';
import PhotoUpload from '@/components/PhotoUpload';
import EnhancedResultsDisplay from '@/components/EnhancedResultsDisplay';
import ShareCard from '@/components/ShareCard';
import Header from '@/components/Header';
import FAQ from '@/components/FAQ';

type AppState = 'landing' | 'processing' | 'results';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('landing');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showShareCard, setShowShareCard] = useState(false);

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    setAppState('processing');
    // Simulate processing delay
    setTimeout(() => {
      setAppState('results');
    }, 2000);
  };

  const resetApp = () => {
    setUploadedImage(null);
    setShowShareCard(false);
    setAppState('landing');
  };

  const handleShare = () => {
    setShowShareCard(true);
  };

  const handleShareClose = () => {
    setShowShareCard(false);
  };

  // Processing State
  if (appState === 'processing') {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
          <div className="w-24 h-24 rounded-2xl overflow-hidden mb-8 shadow-sm">
            <img 
              src="/lovable-uploads/d24d594a-33ec-4302-b4c9-8235382d96ff.png" 
              alt="CelebLook Logo" 
              className="w-full h-full object-cover"
            />
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Analyzing Your Photo</h2>
          <p className="text-gray-600 text-center leading-relaxed mb-8 max-w-sm">
            Our AI is comparing your features with thousands of celebrities...
          </p>
          <div className="w-full max-w-xs bg-gray-100 rounded-full h-2 mb-4">
            <div className="bg-gray-900 h-2 rounded-full transition-all duration-1000" style={{width: '85%'}}></div>
          </div>
          <p className="text-sm text-gray-500">Almost done...</p>
        </div>
      </div>
    );
  }

  // Results State
  if (appState === 'results' && uploadedImage) {
    return (
      <>
        <EnhancedResultsDisplay 
          uploadedImage={uploadedImage} 
          onReset={resetApp}
          onShare={handleShare}
        />
        {showShareCard && (
          <ShareCard 
            userImage={uploadedImage}
            celebrityName="Ryan Gosling"
            celebrityImage="https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=400&q=80"
            percentage={89}
            onClose={handleShareClose}
          />
        )}
      </>
    );
  }

  // Main Landing Page
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-md mx-auto">
        {/* Hero Section */}
        <div className="text-center pt-16 pb-12 px-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-8 shadow-sm overflow-hidden">
            <img 
              src="/lovable-uploads/d24d594a-33ec-4302-b4c9-8235382d96ff.png" 
              alt="CelebLook Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <h1 className="text-3xl font-semibold text-gray-900 mb-4 leading-tight">
            Which Celebrity
            <br />
            Do You Look Like?
          </h1>
          
          <p className="text-lg text-gray-600 leading-relaxed mb-12">
            Discover your celebrity twin with AI-powered facial recognition
          </p>

          {/* Photo Upload Section */}
          <PhotoUpload onImageUpload={handleImageUpload} />
        </div>
      </div>

      {/* FAQ Section */}
      <FAQ />
    </div>
  );
};

export default Index;
