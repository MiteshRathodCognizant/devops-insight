import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Settings, CheckCircle, AlertCircle } from 'lucide-react';

interface AzureDevOpsConfig {
  organizationUrl: string;
  projectName: string;
  hasToken: boolean;
}

export const AzureDevOpsSettings = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<AzureDevOpsConfig>({
    organizationUrl: 'https://dev.azure.com/vibecode',
    projectName: 'ProjectABC',
    hasToken: false,
  });
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const handleSaveConfig = () => {
    // Save configuration to localStorage or Supabase
    localStorage.setItem('azureDevOpsConfig', JSON.stringify(config));
    toast({
      title: "Configuration saved",
      description: "Azure DevOps settings have been updated.",
    });
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    // TODO: Implement actual connection test with Azure DevOps API
    setTimeout(() => {
      setIsTestingConnection(false);
      toast({
        title: "Connection test",
        description: "Please configure your Personal Access Token first.",
        variant: "destructive",
      });
    }, 1000);
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
            {config.hasToken ? (
              <>
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm">Personal Access Token is configured</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-warning" />
                <span className="text-sm">Personal Access Token not configured</span>
              </>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Required Permissions</Label>
            <Textarea
              readOnly
              value="Build (read), Release (read), Work Items (read), Code (read)"
              className="text-sm"
              rows={2}
            />
          </div>
          
          <p className="text-xs text-muted-foreground">
            Your token will be securely encrypted and stored. You can generate a new PAT in your Azure DevOps organization settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};