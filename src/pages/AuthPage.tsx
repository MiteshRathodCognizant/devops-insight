import { useState } from 'react';
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { BarChart3, Shield, Zap, GitBranch } from 'lucide-react';

export const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding and features */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-12 bg-gradient-to-br from-dashboard-sidebar to-primary">
        <div className="max-w-md mx-auto text-white">
          <div className="flex items-center mb-8">
            <BarChart3 className="h-12 w-12" />
            <span className="ml-3 text-3xl font-bold">Azure DevOps Dashboard</span>
          </div>
          
          <h1 className="text-4xl font-bold mb-6">
            Monitor Your Pipelines with Real-Time Insights
          </h1>
          
          <p className="text-xl text-white/90 mb-8">
            Get comprehensive visibility into your Azure DevOps pipelines, track success rates, 
            and optimize your development workflow.
          </p>
          
          <div className="space-y-6">
            <Feature
              icon={<Shield className="h-6 w-6" />}
              title="Secure Authentication"
              description="Enterprise-grade security with encrypted token management"
            />
            <Feature
              icon={<Zap className="h-6 w-6" />}
              title="Real-Time Updates"
              description="Live pipeline status and instant notifications"
            />
            <Feature
              icon={<GitBranch className="h-6 w-6" />}
              title="Multi-Project Support"
              description="Monitor multiple repositories and branches simultaneously"
            />
          </div>
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <BarChart3 className="h-8 w-8 text-primary" />
              <span className="ml-2 text-2xl font-bold text-foreground">Azure DevOps Dashboard</span>
            </div>
          </div>
          
          {isSignUp ? (
            <SignUpForm onToggleMode={() => setIsSignUp(false)} />
          ) : (
            <SignInForm onToggleMode={() => setIsSignUp(true)} />
          )}
        </div>
      </div>
    </div>
  );
};

const Feature = ({ icon, title, description }: any) => (
  <div className="flex items-start space-x-3">
    <div className="flex-shrink-0 bg-white/20 p-2 rounded-lg">
      {icon}
    </div>
    <div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-white/80 text-sm">{description}</p>
    </div>
  </div>
);