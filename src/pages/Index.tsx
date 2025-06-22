
import React, { useState } from 'react';
import OnboardingFlow from '@/components/OnboardingFlow';
import CameraPermission from '@/components/CameraPermission';
import PhotoUpload from '@/components/PhotoUpload';
import FaceCapture from '@/components/FaceCapture';
import EnhancedResultsDisplay from '@/components/EnhancedResultsDisplay';
import ShareCard from '@/components/ShareCard';
import Header from '@/components/Header';

type AppState = 'onboarding' | 'camera-permission' | 'upload' | 'capture' | 'processing' | 'results' | 'share';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('onboarding');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);

  const handleOnboardingComplete = () => {
    setHasSeenOnboarding(true);
    setAppState('camera-permission');
  };

  const handleCameraAllow = () => {
    setAppState('capture');
  };

  const handleCameraDeny = () => {
    setAppState('upload');
  };

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    setAppState('processing');
    // Simulate processing delay
    setTimeout(() => {
      setAppState('results');
    }, 2000);
  };

  const handleFaceCapture = (imageUrl: string) => {
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
    setAppState(hasSeenOnboarding ? 'upload' : 'onboarding');
  };

  const handleShare = () => {
    setShowShareCard(true);
  };

  const handleShareClose = () => {
    setShowShareCard(false);
  };

  // Onboarding Flow
  if (appState === 'onboarding') {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  // Camera Permission
  if (appState === 'camera-permission') {
    return (
      <CameraPermission 
        onAllow={handleCameraAllow}
        onDeny={handleCameraDeny}
      />
    );
  }

  // Face Capture
  if (appState === 'capture') {
    return (
      <FaceCapture 
        onCapture={handleFaceCapture}
        onBack={() => setAppState('upload')}
      />
    );
  }

  // Processing State
  if (appState === 'processing') {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
          <div className="w-24 h-24 bg-gray-900 rounded-2xl flex items-center justify-center mb-8 shadow-sm">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

  // Default Upload State
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="px-6 pb-8 max-w-md mx-auto">
        <div>
          {/* Hero Section */}
          <div className="text-center pt-16 pb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-900 rounded-2xl mb-8 shadow-sm">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
            </div>
            
            <h1 className="text-3xl font-semibold text-gray-900 mb-4 leading-tight">
              Which Celebrity
              <br />
              Do You Look Like?
            </h1>
            
            <p className="text-lg text-gray-600 leading-relaxed mb-12">
              Discover your celebrity twin with AI-powered facial recognition
            </p>
          </div>

          {/* Upload Section */}
          <PhotoUpload onImageUpload={handleImageUpload} />
        </div>
      </div>
    </div>
  );
};

export default Index;
