import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Home,
  Activity,
  GitBranch,
  Clock
} from 'lucide-react';
import { AzureDevOpsSettings } from '@/components/settings/AzureDevOpsSettings';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const { user, signOut } = useAuth();

  const navigation = [
    { name: 'Overview', id: 'overview', icon: Home },
    { name: 'Pipelines', id: 'pipelines', icon: Activity },
    { name: 'Branches', id: 'branches', icon: GitBranch },
    { name: 'History', id: 'history', icon: Clock },
    { name: 'Settings', id: 'settings', icon: Settings },
  ];

  const renderContent = () => {
    if (activeView === 'settings') {
      return <AzureDevOpsSettings />;
    }
    return children;
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-background to-muted">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex w-full max-w-xs flex-1 flex-col bg-dashboard-sidebar">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent navigation={navigation} user={user} signOut={signOut} activeView={activeView} setActiveView={setActiveView} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-dashboard-sidebar shadow-xl">
          <SidebarContent navigation={navigation} user={user} signOut={signOut} activeView={activeView} setActiveView={setActiveView} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow-sm border-b">
          <button
            type="button"
            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-semibold text-gray-900">Azure DevOps Dashboard</h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarContent = ({ navigation, user, signOut, activeView, setActiveView }: any) => (
  <>
    <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
      <div className="flex flex-shrink-0 items-center px-4">
        <BarChart3 className="h-8 w-8 text-dashboard-sidebar-foreground" />
        <span className="ml-2 text-xl font-bold text-dashboard-sidebar-foreground">DevOps</span>
      </div>
      <nav className="mt-8 flex-1 space-y-1 px-2">
        {navigation.map((item: any) => (
          <button
            key={item.name}
            onClick={() => setActiveView(item.id)}
            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 w-full text-left ${
              activeView === item.id
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-dashboard-sidebar-foreground hover:bg-dashboard-sidebar-foreground/10 hover:text-white'
            }`}
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
            {item.name}
          </button>
        ))}
      </nav>
    </div>
    <div className="flex flex-shrink-0 border-t border-dashboard-sidebar-foreground/20 p-4">
      <div className="flex items-center">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary text-primary-foreground">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-dashboard-sidebar-foreground truncate">
            {user?.email}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="text-dashboard-sidebar-foreground/70 hover:text-dashboard-sidebar-foreground p-0 h-auto mt-1"
          >
            <LogOut className="mr-1 h-3 w-3" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  </>
);