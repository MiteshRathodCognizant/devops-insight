import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  GitBranch,
  Activity,
  RefreshCw,
  AlertTriangle,
  Calendar,
  BarChart3
} from 'lucide-react';
import { usePipelineMonitoring } from '@/hooks/usePipelineMonitoring';
import { formatDistanceToNow } from 'date-fns';

export const PipelineOverview = () => {
  const { insights, isConnected, loading, lastUpdated, refresh } = usePipelineMonitoring();

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-warning mb-4" />
            <h3 className="text-lg font-semibold mb-2">Azure DevOps Not Connected</h3>
            <p className="text-muted-foreground mb-4">
              Please configure your Personal Access Token in Settings to view pipeline data.
            </p>
            <Button onClick={() => window.location.hash = '#settings'}>
              Go to Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Pipeline Dashboard</h1>
          <p className="text-muted-foreground">
            {lastUpdated ? `Last updated ${formatDistanceToNow(lastUpdated)} ago` : 'Loading...'}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Runs (30 days)"
          value={insights.totalRuns.toString()}
          icon={Activity}
          trend={`${insights.trendsData.performanceMetrics.improvementRate >= 0 ? '+' : ''}${insights.trendsData.performanceMetrics.improvementRate.toFixed(1)}% from last week`}
          color={insights.trendsData.performanceMetrics.improvementRate >= 0 ? 'success' : 'warning'}
        />
        <StatCard
          title="Success Rate"
          value={`${insights.successRate}%`}
          icon={CheckCircle}
          trend={`${insights.trendsData.performanceMetrics.reliability >= 90 ? 'Excellent' : insights.trendsData.performanceMetrics.reliability >= 80 ? 'Good' : 'Needs attention'}`}
          color={insights.successRate >= 90 ? 'success' : insights.successRate >= 80 ? 'warning' : 'destructive'}
        />
        <StatCard
          title="Avg Duration"
          value={insights.avgDuration}
          icon={Clock}
          trend={`Performance ${insights.trendsData.performanceMetrics.avgDurationTrend}`}
          color="default"
        />
        <StatCard
          title="Active Builds"
          value={insights.activeBuilds.toString()}
          icon={TrendingUp}
          trend={insights.activeBuilds > 0 ? 'Running now' : 'No active builds'}
          color={insights.activeBuilds > 0 ? 'warning' : 'default'}
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
          {insights.recentActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent pipeline activity found
            </div>
          ) : (
            <div className="space-y-4">
              {insights.recentActivity.map((run) => (
                <div key={run.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <StatusIcon status={run.status} />
                    <div>
                      <h4 className="font-medium">{run.pipeline.name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <GitBranch className="h-3 w-3" />
                        <span>{run.sourceBranch}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(run.createdDate))} ago</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={run.status} />
                    <div className="text-sm text-muted-foreground mt-1">
                      {run.status === 'inProgress' ? 'Running...' : 
                       run.finishedDate ? 
                       `${Math.round((new Date(run.finishedDate).getTime() - new Date(run.createdDate).getTime()) / (1000 * 60))}m` : 
                       'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Success Rate Progress */}
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
                <span className="text-2xl font-bold text-success">{insights.successRate}%</span>
              </div>
              <Progress value={insights.successRate} className="h-3" />
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-semibold text-success">
                    {Math.round(insights.totalRuns * (insights.successRate / 100))}
                  </div>
                  <div className="text-muted-foreground">Succeeded</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-destructive">
                    {insights.totalRuns - Math.round(insights.totalRuns * (insights.successRate / 100)) - insights.activeBuilds}
                  </div>
                  <div className="text-muted-foreground">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-warning">{insights.activeBuilds}</div>
                  <div className="text-muted-foreground">In Progress</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Branch Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Branch Activity</CardTitle>
            <CardDescription>
              Pipeline runs by branch (last 30 days)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.branchActivity.slice(0, 5).map((branch, index) => (
                <div key={branch.branch} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <GitBranch className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{branch.branch}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{branch.runs} runs</span>
                    <Badge variant={branch.successRate >= 80 ? 'success' : branch.successRate >= 60 ? 'secondary' : 'destructive'}>
                      {branch.successRate}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Top Failing Pipelines */}
      {insights.topFailingPipelines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Top Failing Pipelines
            </CardTitle>
            <CardDescription>
              Pipelines that need attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.topFailingPipelines.map((pipeline, index) => (
                <div key={pipeline.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{pipeline.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Last failed: {pipeline.lastFailed === 'Never' ? 'Never' : formatDistanceToNow(new Date(pipeline.lastFailed))} ago
                    </div>
                  </div>
                  <Badge variant="destructive">
                    {pipeline.failureRate}% failure rate
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Daily Trends (Last 7 Days)
          </CardTitle>
          <CardDescription>
            Pipeline runs breakdown by day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.trendsData.dailyRuns.map((day, index) => (
              <div key={day.date} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{new Date(day.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">{day.successful}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm">{day.failed}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total: {day.total}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, trend, color = 'default' }: {
  title: string;
  value: string;
  icon: any;
  trend: string;
  color?: 'default' | 'success' | 'warning' | 'destructive';
}) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          <p className={`text-xs mt-1 ${
            color === 'success' ? 'text-success' : 
            color === 'warning' ? 'text-warning' : 
            color === 'destructive' ? 'text-destructive' :
            'text-muted-foreground'
          }`}>
            {trend}
          </p>
        </div>
        <div className={`p-3 rounded-full ${
          color === 'success' ? 'bg-success/10 text-success' :
          color === 'warning' ? 'bg-warning/10 text-warning' :
          color === 'destructive' ? 'bg-destructive/10 text-destructive' :
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
  const variants: Record<string, any> = {
    succeeded: 'success',
    failed: 'destructive', 
    inProgress: 'secondary',
    canceled: 'outline',
  };
  
  const labels: Record<string, string> = {
    succeeded: 'Success',
    failed: 'Failed',
    inProgress: 'In Progress',
    canceled: 'Canceled',
  };
  
  return (
    <Badge variant={variants[status] || 'outline'}>
      {labels[status] || status}
    </Badge>
  );
};