import { useState, useEffect, useCallback } from 'react';
import { azureDevOpsService, type PipelineRun } from '@/services/azureDevOps';
import { useToast } from '@/hooks/use-toast';

interface PipelineInsights {
  totalRuns: number;
  successRate: number;
  avgDuration: string;
  activeBuilds: number;
  trendsData: {
    dailyRuns: Array<{ date: string; successful: number; failed: number; total: number }>;
    performanceMetrics: {
      improvementRate: number;
      avgDurationTrend: string;
      reliability: number;
    };
  };
  recentActivity: PipelineRun[];
  topFailingPipelines: Array<{ name: string; failureRate: number; lastFailed: string }>;
  branchActivity: Array<{ branch: string; runs: number; successRate: number }>;
}

export const usePipelineMonitoring = () => {
  const { toast } = useToast();
  const [insights, setInsights] = useState<PipelineInsights>({
    totalRuns: 0,
    successRate: 0,
    avgDuration: '0m 0s',
    activeBuilds: 0,
    trendsData: {
      dailyRuns: [],
      performanceMetrics: {
        improvementRate: 0,
        avgDurationTrend: 'stable',
        reliability: 0,
      },
    },
    recentActivity: [],
    topFailingPipelines: [],
    branchActivity: [],
  });
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const initializeMonitoring = useCallback(async () => {
    const storedConfig = localStorage.getItem('azureDevOpsConfig');
    const storedPat = localStorage.getItem('azureDevOpsPAT');

    if (!storedConfig || !storedPat) {
      return false;
    }

    try {
      const config = JSON.parse(storedConfig);
      azureDevOpsService.setConfig({
        organizationUrl: config.organizationUrl,
        projectName: config.projectName,
        personalAccessToken: storedPat,
      });

      setIsConnected(true);
      return true;
    } catch (error) {
      console.error('Failed to initialize monitoring:', error);
      return false;
    }
  }, []);

  const calculateInsights = useCallback((builds: PipelineRun[]): PipelineInsights => {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Recent builds (last 30 days)
    const recentBuilds = builds.filter(build => 
      new Date(build.createdDate) >= last30Days
    );

    // Basic metrics
    const totalRuns = recentBuilds.length;
    const successRate = azureDevOpsService.calculateSuccessRate(recentBuilds);
    const avgDuration = azureDevOpsService.calculateAverageDuration(recentBuilds);
    const activeBuilds = recentBuilds.filter(build => build.status === 'inProgress').length;

    // Daily trends (last 7 days)
    const dailyRuns = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayBuilds = recentBuilds.filter(build => {
        const buildDate = new Date(build.createdDate);
        return buildDate >= dayStart && buildDate <= dayEnd;
      });

      const successful = dayBuilds.filter(b => b.status === 'succeeded').length;
      const failed = dayBuilds.filter(b => b.status === 'failed').length;

      dailyRuns.push({
        date: date.toISOString().split('T')[0],
        successful,
        failed,
        total: dayBuilds.length,
      });
    }

    // Performance metrics
    const last7DaysBuilds = recentBuilds.filter(build => 
      new Date(build.createdDate) >= last7Days
    );
    const prev7DaysBuilds = recentBuilds.filter(build => {
      const buildDate = new Date(build.createdDate);
      return buildDate >= new Date(last7Days.getTime() - 7 * 24 * 60 * 60 * 1000) && 
             buildDate < last7Days;
    });

    const currentWeekSuccess = azureDevOpsService.calculateSuccessRate(last7DaysBuilds);
    const prevWeekSuccess = azureDevOpsService.calculateSuccessRate(prev7DaysBuilds);
    const improvementRate = currentWeekSuccess - prevWeekSuccess;

    // Top failing pipelines
    const pipelineStats = new Map();
    recentBuilds.forEach(build => {
      const key = build.pipeline.name;
      if (!pipelineStats.has(key)) {
        pipelineStats.set(key, { total: 0, failed: 0, lastFailed: null });
      }
      const stats = pipelineStats.get(key);
      stats.total++;
      if (build.status === 'failed') {
        stats.failed++;
        if (!stats.lastFailed || new Date(build.createdDate) > new Date(stats.lastFailed)) {
          stats.lastFailed = build.createdDate;
        }
      }
    });

    const topFailingPipelines = Array.from(pipelineStats.entries())
      .map(([name, stats]) => ({
        name,
        failureRate: stats.total > 0 ? Math.round((stats.failed / stats.total) * 100) : 0,
        lastFailed: stats.lastFailed || 'Never',
      }))
      .filter(p => p.failureRate > 0)
      .sort((a, b) => b.failureRate - a.failureRate)
      .slice(0, 5);

    // Branch activity
    const branchStats = new Map();
    recentBuilds.forEach(build => {
      const branch = build.sourceBranch;
      if (!branchStats.has(branch)) {
        branchStats.set(branch, { total: 0, successful: 0 });
      }
      const stats = branchStats.get(branch);
      stats.total++;
      if (build.status === 'succeeded') {
        stats.successful++;
      }
    });

    const branchActivity = Array.from(branchStats.entries())
      .map(([branch, stats]) => ({
        branch,
        runs: stats.total,
        successRate: stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0,
      }))
      .sort((a, b) => b.runs - a.runs)
      .slice(0, 10);

    return {
      totalRuns,
      successRate,
      avgDuration,
      activeBuilds,
      trendsData: {
        dailyRuns,
        performanceMetrics: {
          improvementRate,
          avgDurationTrend: 'stable', // Could be calculated based on duration trends
          reliability: successRate,
        },
      },
      recentActivity: recentBuilds.slice(0, 10),
      topFailingPipelines,
      branchActivity,
    };
  }, []);

  const fetchPipelineData = useCallback(async () => {
    if (!isConnected) return;

    setLoading(true);
    try {
      const builds = await azureDevOpsService.getBuilds(200); // Fetch more for better insights
      const calculatedInsights = calculateInsights(builds);
      setInsights(calculatedInsights);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch pipeline data:', error);
      toast({
        title: "Data fetch failed",
        description: "Unable to fetch pipeline data. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isConnected, calculateInsights, toast]);

  // Real-time polling
  useEffect(() => {
    if (!isConnected) return;

    // Initial fetch
    fetchPipelineData();

    // Set up polling every 30 seconds
    const interval = setInterval(fetchPipelineData, 30000);

    return () => clearInterval(interval);
  }, [isConnected, fetchPipelineData]);

  // Initialize monitoring on mount
  useEffect(() => {
    initializeMonitoring().then(setIsConnected);
  }, [initializeMonitoring]);

  const refresh = useCallback(() => {
    fetchPipelineData();
  }, [fetchPipelineData]);

  return {
    insights,
    isConnected,
    loading,
    lastUpdated,
    refresh,
    initializeMonitoring,
  };
};