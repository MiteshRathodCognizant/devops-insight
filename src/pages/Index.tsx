import { useAuth } from '@/components/auth/AuthProvider';
import { AuthPage } from './AuthPage';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

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
      <div className="space-y-6">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-primary mb-4">Azure DevOps Dashboard</h1>
          <p className="text-muted-foreground">
            Pipeline status has been removed. Use the settings page to configure your Azure DevOps connection.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
