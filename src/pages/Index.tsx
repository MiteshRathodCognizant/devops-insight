import { useAuth } from '@/components/auth/AuthProvider';
import { AuthPage } from './AuthPage';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PipelineOverview } from '@/components/dashboard/PipelineOverview';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <DashboardLayout>
      <PipelineOverview />
    </DashboardLayout>
  );
};

export default Index;
