
import React from 'react';
import { Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 text-center bg-white shadow-sm border border-gray-100">
          <div className="w-24 h-24 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Users className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">
            Find Your Celebrity Twin
          </h1>
          
          <h2 className="text-lg text-gray-600 mb-4">
            Discover which celebrity you look like most
          </h2>
          
          <p className="text-gray-500 leading-relaxed mb-8">
            Our AI analyzes your facial features and matches you with thousands of celebrities
          </p>

          <Button 
            onClick={onComplete}
            className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl"
          >
            Get Started
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingFlow;
