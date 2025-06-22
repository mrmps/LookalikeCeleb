
import React, { useState } from 'react';
import { Users, Camera, Share, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Users,
      title: "Find Your Celebrity Twin",
      subtitle: "Discover which celebrity you look like most",
      description: "Our AI analyzes your facial features and matches you with thousands of celebrities",
      color: "bg-gray-900"
    },
    {
      icon: Camera,
      title: "Quick & Easy Process",
      subtitle: "Just take a selfie",
      description: "Snap a photo or upload from your gallery - results in seconds",
      color: "bg-gray-800"
    },
    {
      icon: Share,
      title: "Share Your Results",
      subtitle: "Show off your celebrity match",
      description: "Create shareable cards and see how you rank on the global leaderboard",
      color: "bg-gray-700"
    }
  ];

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const skip = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress Bar */}
      <div className="w-full bg-white p-4 border-b border-gray-100">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <span className="text-sm text-gray-500">Step {currentStep + 1} of {steps.length}</span>
          <Button variant="ghost" onClick={skip} className="text-sm text-gray-500 hover:text-gray-700">
            Skip
          </Button>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1 mt-3 max-w-md mx-auto">
          <div 
            className="bg-gray-900 h-1 rounded-full transition-all duration-500"
            style={{width: `${((currentStep + 1) / steps.length) * 100}%`}}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 text-center bg-white shadow-sm border border-gray-100">
          <div className={`w-24 h-24 ${currentStepData.color} rounded-2xl flex items-center justify-center mx-auto mb-8`}>
            <IconComponent className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">
            {currentStepData.title}
          </h1>
          
          <h2 className="text-lg text-gray-600 mb-4">
            {currentStepData.subtitle}
          </h2>
          
          <p className="text-gray-500 leading-relaxed mb-8">
            {currentStepData.description}
          </p>

          <Button 
            onClick={nextStep}
            className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl"
          >
            {currentStep === steps.length - 1 ? "Get Started" : "Continue"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center space-x-2 pb-8">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentStep ? 'bg-gray-900 w-6' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default OnboardingFlow;
