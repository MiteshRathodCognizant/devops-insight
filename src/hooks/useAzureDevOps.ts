import { useState, useEffect } from 'react';
import { azureDevOpsService, type PipelineRun, type BuildDefinition } from '@/services/azureDevOps';
import { useToast } from '@/hooks/use-toast';

interface AzureDevOpsData {
  builds: PipelineRun[];
  definitions: BuildDefinition[];
  loading: boolean;
  error: string | null;
  successRate: number;
  avgDuration: string;
  activeBuilds: number;
}

export const useAzureDevOps = () => {
  const { toast } = useToast();
  const [data, setData] = useState<AzureDevOpsData>({
    builds: [],
    definitions: [],
    loading: false,
    error: null,
    successRate: 0,
    avgDuration: '0m 0s',
    activeBuilds: 0,
  });

  const initializeConnection = async (organizationUrl: string, projectName: string, personalAccessToken: string) => {
    try {
      azureDevOpsService.setConfig({
        organizationUrl,
        projectName,
        personalAccessToken,
      });

      // Test connection
      await azureDevOpsService.getProjectInfo();
      
      toast({
        title: "Connection established",
        description: "Successfully connected to Azure DevOps",
      });

      return true;
    } catch (error) {
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Failed to connect to Azure DevOps",
        variant: "destructive",
      });
      return false;
    }
  };

  const fetchData = async () => {
    setData(prev => ({ ...prev, loading: true, error: null }));

    try {
      const [builds, definitions] = await Promise.all([
        azureDevOpsService.getBuilds(100),
        azureDevOpsService.getBuildDefinitions(),
      ]);

      const successRate = azureDevOpsService.calculateSuccessRate(builds);
      const avgDuration = azureDevOpsService.calculateAverageDuration(builds);
      const activeBuilds = builds.filter(build => build.status === 'inProgress').length;

      setData({
        builds,
        definitions,
        loading: false,
        error: null,
        successRate,
        avgDuration,
        activeBuilds,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
      setData(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      toast({
        title: "Data fetch failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const refresh = () => {
    fetchData();
  };

  return {
    ...data,
    initializeConnection,
    refresh,
    fetchData,
  };
};