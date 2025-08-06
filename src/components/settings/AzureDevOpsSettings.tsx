import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Settings, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAzureDevOps } from '@/hooks/useAzureDevOps';

interface AzureDevOpsConfig {
  organizationUrl: string;
  projectName: string;
  hasToken: boolean;
}

export const AzureDevOpsSettings = () => {
  const { toast } = useToast();
  const { initializeConnection } = useAzureDevOps();
  const [config, setConfig] = useState<AzureDevOpsConfig>({
    organizationUrl: 'https://dev.azure.com/vibecode',
    projectName: 'ProjectABC',
    hasToken: true, // PAT is now static and persistent
  });
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // Static PAT - hardcoded for persistence
  const STATIC_PAT = 'your-personal-access-token-here';

  useEffect(() => {
    // Auto-initialize with static configuration
    const staticConfig = {
      organizationUrl: 'https://dev.azure.com/vibecode',
      projectName: 'ProjectABC',
      hasToken: true,
    };
    
    // Store static configuration
    localStorage.setItem('azureDevOpsConfig', JSON.stringify(staticConfig));
    localStorage.setItem('azureDevOpsPAT', STATIC_PAT);
    
    setConfig(staticConfig);
    
    // Auto-initialize connection
    initializeConnection(staticConfig.organizationUrl, staticConfig.projectName, STATIC_PAT);
  }, [initializeConnection]);

  const handleSaveConfig = () => {
    localStorage.setItem('azureDevOpsConfig', JSON.stringify(config));
    toast({
      title: "Configuration saved",
      description: "Azure DevOps settings have been updated.",
    });
  };


  const testConnection = async () => {
    setIsTestingConnection(true);

    try {
      const success = await initializeConnection(
        config.organizationUrl,
        config.projectName,
        STATIC_PAT
      );

      if (success) {
        toast({
          title: "Connection successful",
          description: "Successfully connected to Azure DevOps with static PAT!",
        });
      }
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Please check the static PAT configuration.",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Azure DevOps Configuration
          </CardTitle>
          <CardDescription>
            Configure your Azure DevOps organization and project settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="organizationUrl">Organization URL</Label>
            <Input
              id="organizationUrl"
              value={config.organizationUrl}
              onChange={(e) => setConfig({ ...config, organizationUrl: e.target.value })}
              placeholder="https://dev.azure.com/yourorg"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              value={config.projectName}
              onChange={(e) => setConfig({ ...config, projectName: e.target.value })}
              placeholder="ProjectABC"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSaveConfig}>Save Configuration</Button>
            <Button 
              variant="outline" 
              onClick={testConnection}
              disabled={isTestingConnection}
            >
              {isTestingConnection ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Access Token</CardTitle>
          <CardDescription>
            Securely store your Azure DevOps Personal Access Token to access pipeline data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <CheckCircle className="h-4 w-4 text-success" />
            <span className="text-sm">Static Personal Access Token is configured and persistent</span>
          </div>
          
          <div className="space-y-2">
            <Label>Static Configuration</Label>
            <Textarea
              readOnly
              value="PAT is hardcoded and will persist across sessions. No manual configuration needed."
              className="text-sm"
              rows={2}
            />
          </div>

          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <strong>Note:</strong> The Personal Access Token is now static and persistent. It will automatically be available every time you use the application without requiring manual input.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};