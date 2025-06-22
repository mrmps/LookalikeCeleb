
import React, { useState } from 'react';
import { Sparkles, Camera, Users, Zap, ArrowRight } from 'lucide-react';
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
      color: "bg-purple-500"
    },
    {
      icon: Camera,
      title: "Quick & Easy Process",
      subtitle: "Just take a selfie",
      description: "Snap a photo or upload from your gallery - results in seconds",
      color: "bg-blue-500"
    },
    {
      icon: Zap,
      title: "Share Your Results",
      subtitle: "Show off your celebrity match",
      description: "Create shareable cards and see how you rank on the global leaderboard",
      color: "bg-green-500"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Progress Bar */}
      <div className="w-full bg-white p-4">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <span className="text-sm text-gray-500">Step {currentStep + 1} of {steps.length}</span>
          <Button variant="ghost" onClick={skip} className="text-sm text-gray-500">
            Skip
          </Button>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2 max-w-md mx-auto">
          <div 
            className="bg-black h-2 rounded-full transition-all duration-500"
            style={{width: `${((currentStep + 1) / steps.length) * 100}%`}}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 text-center bg-white shadow-xl">
          <div className={`w-24 h-24 ${currentStepData.color} rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg`}>
            <IconComponent className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
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
            className="w-full h-14 bg-black hover:bg-gray-800 text-white font-semibold rounded-2xl transition-all duration-200"
          >
            {currentStep === steps.length - 1 ? "Get Started" : "Continue"}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Card>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center space-x-2 pb-8">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentStep ? 'bg-black w-6' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default OnboardingFlow;
