// Azure DevOps REST API service
// Documentation: https://docs.microsoft.com/en-us/rest/api/azure/devops/

export interface AzureDevOpsConfig {
  organizationUrl: string;
  projectName: string;
  personalAccessToken: string;
}

export interface PipelineRun {
  id: number;
  name: string;
  status: 'succeeded' | 'failed' | 'inProgress' | 'canceled';
  result?: string;
  state: string;
  createdDate: string;
  finishedDate?: string;
  sourceBranch: string;
  repository: {
    name: string;
  };
  pipeline: {
    name: string;
  };
}

export interface BuildDefinition {
  id: number;
  name: string;
  path: string;
  type: string;
  queueStatus: string;
}

class AzureDevOpsService {
  private config: AzureDevOpsConfig | null = null;

  setConfig(config: AzureDevOpsConfig) {
    this.config = config;
  }

  private getHeaders() {
    if (!this.config?.personalAccessToken) {
      throw new Error('Personal Access Token not configured');
    }

    return {
      'Authorization': `Basic ${btoa(`:${this.config.personalAccessToken}`)}`,
      'Content-Type': 'application/json',
    };
  }

  private getApiUrl(endpoint: string) {
    if (!this.config) {
      throw new Error('Azure DevOps configuration not set');
    }
    
    return `${this.config.organizationUrl}/${this.config.projectName}/_apis/${endpoint}`;
  }

  async getBuilds(top: number = 50): Promise<PipelineRun[]> {
    try {
      const url = this.getApiUrl(`build/builds?$top=${top}&api-version=7.0`);
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch builds: ${response.statusText}`);
      }

      const data = await response.json();
      return data.value.map((build: any) => ({
        id: build.id,
        name: build.definition.name,
        status: this.mapBuildStatus(build.status, build.result),
        result: build.result,
        state: build.status,
        createdDate: build.startTime || build.queueTime,
        finishedDate: build.finishTime,
        sourceBranch: build.sourceBranch?.replace('refs/heads/', '') || 'unknown',
        repository: {
          name: build.repository?.name || 'unknown',
        },
        pipeline: {
          name: build.definition.name,
        },
      }));
    } catch (error) {
      console.error('Error fetching builds:', error);
      throw error;
    }
  }

  async getBuildDefinitions(): Promise<BuildDefinition[]> {
    try {
      const url = this.getApiUrl('build/definitions?api-version=7.0');
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch build definitions: ${response.statusText}`);
      }

      const data = await response.json();
      return data.value;
    } catch (error) {
      console.error('Error fetching build definitions:', error);
      throw error;
    }
  }

  async getProjectInfo() {
    try {
      const url = `${this.config?.organizationUrl}/_apis/projects?api-version=7.0`;
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch project info: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching project info:', error);
      throw error;
    }
  }

  private mapBuildStatus(status: string, result?: string): 'succeeded' | 'failed' | 'inProgress' | 'canceled' {
    if (status === 'inProgress' || status === 'notStarted') {
      return 'inProgress';
    }
    
    if (status === 'completed') {
      switch (result) {
        case 'succeeded':
          return 'succeeded';
        case 'failed':
        case 'partiallySucceeded':
          return 'failed';
        case 'canceled':
          return 'canceled';
        default:
          return 'failed';
      }
    }

    return 'failed';
  }

  calculateSuccessRate(builds: PipelineRun[]): number {
    if (builds.length === 0) return 0;
    
    const completedBuilds = builds.filter(build => 
      build.status === 'succeeded' || build.status === 'failed'
    );
    
    if (completedBuilds.length === 0) return 0;
    
    const successfulBuilds = completedBuilds.filter(build => build.status === 'succeeded');
    return Math.round((successfulBuilds.length / completedBuilds.length) * 100);
  }

  calculateAverageDuration(builds: PipelineRun[]): string {
    const completedBuilds = builds.filter(build => 
      build.finishedDate && build.createdDate
    );
    
    if (completedBuilds.length === 0) return '0m 0s';
    
    const totalDuration = completedBuilds.reduce((acc, build) => {
      const start = new Date(build.createdDate);
      const end = new Date(build.finishedDate!);
      return acc + (end.getTime() - start.getTime());
    }, 0);
    
    const avgDurationMs = totalDuration / completedBuilds.length;
    const minutes = Math.floor(avgDurationMs / (1000 * 60));
    const seconds = Math.floor((avgDurationMs % (1000 * 60)) / 1000);
    
    return `${minutes}m ${seconds}s`;
  }
}

export const azureDevOpsService = new AzureDevOpsService();