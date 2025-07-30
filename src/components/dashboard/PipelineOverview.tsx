import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  GitBranch,
  Activity
} from 'lucide-react';

// Mock data - will be replaced with real Azure DevOps data
const mockPipelineData = {
  totalRuns: 247,
  successRate: 87,
  avgDuration: '12m 34s',
  activeBuilds: 3,
  recentRuns: [
    {
      id: '1',
      name: 'Build and Test',
      status: 'succeeded',
      branch: 'main',
      duration: '8m 23s',
      timestamp: '2 hours ago',
    },
    {
      id: '2', 
      name: 'Deploy to Staging',
      status: 'failed',
      branch: 'develop',
      duration: '15m 12s',
      timestamp: '4 hours ago',
    },
    {
      id: '3',
      name: 'Deploy to Production',
      status: 'inProgress',
      branch: 'main',
      duration: 'Running...',
      timestamp: 'Started 5m ago',
    },
  ],
};

export const PipelineOverview = () => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Runs"
          value={mockPipelineData.totalRuns.toString()}
          icon={Activity}
          trend="+12% from last week"
        />
        <StatCard
          title="Success Rate"
          value={`${mockPipelineData.successRate}%`}
          icon={CheckCircle}
          trend="+5% from last week"
          color="success"
        />
        <StatCard
          title="Avg Duration"
          value={mockPipelineData.avgDuration}
          icon={Clock}
          trend="-2m from last week"
          color="warning"
        />
        <StatCard
          title="Active Builds"
          value={mockPipelineData.activeBuilds.toString()}
          icon={TrendingUp}
          trend="2 in queue"
        />
      </div>

      {/* Recent Pipeline Runs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Pipeline Runs</CardTitle>
          <CardDescription>
            Latest activity from your Azure DevOps pipelines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockPipelineData.recentRuns.map((run) => (
              <div key={run.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <StatusIcon status={run.status} />
                  <div>
                    <h4 className="font-medium">{run.name}</h4>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <GitBranch className="h-3 w-3" />
                      <span>{run.branch}</span>
                      <span>•</span>
                      <span>{run.timestamp}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={run.status} />
                  <div className="text-sm text-muted-foreground mt-1">
                    {run.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Success Rate Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Success Rate</CardTitle>
          <CardDescription>
            Success rate over the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Success Rate</span>
              <span className="text-2xl font-bold text-success">{mockPipelineData.successRate}%</span>
            </div>
            <Progress value={mockPipelineData.successRate} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-semibold text-success">215</div>
                <div className="text-muted-foreground">Succeeded</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-destructive">32</div>
                <div className="text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-warning">3</div>
                <div className="text-muted-foreground">In Progress</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, trend, color = 'default' }: any) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          <p className={`text-xs mt-1 ${
            color === 'success' ? 'text-success' : 
            color === 'warning' ? 'text-warning' : 
            'text-muted-foreground'
          }`}>
            {trend}
          </p>
        </div>
        <div className={`p-3 rounded-full ${
          color === 'success' ? 'bg-success/10 text-success' :
          color === 'warning' ? 'bg-warning/10 text-warning' :
          'bg-primary/10 text-primary'
        }`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const StatusIcon = ({ status }: { status: string }) => {
  const icons = {
    succeeded: <CheckCircle className="h-5 w-5 text-success" />,
    failed: <XCircle className="h-5 w-5 text-destructive" />,
    inProgress: <Clock className="h-5 w-5 text-warning animate-pulse" />,
  };
  
  return icons[status as keyof typeof icons] || <Clock className="h-5 w-5 text-muted-foreground" />;
};

const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    succeeded: 'success',
    failed: 'destructive', 
    inProgress: 'secondary',
  };
  
  return (
    <Badge variant={variants[status as keyof typeof variants] as any}>
      {status === 'inProgress' ? 'In Progress' : status}
    </Badge>
  );
};