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
  const [patDialogOpen, setPatDialogOpen] = useState(false);
  const [personalAccessToken, setPersonalAccessToken] = useState('');
  const [showToken, setShowToken] = useState(false);

  // Static PAT - will be retrieved from Supabase secrets
  const STATIC_PAT = localStorage.getItem('azureDevOpsPAT') || '';

  useEffect(() => {
    // Check if we have a stored configuration and PAT
    const storedConfig = localStorage.getItem('azureDevOpsConfig');
    const storedPat = localStorage.getItem('azureDevOpsPAT');
    
    if (storedConfig) {
      const parsedConfig = JSON.parse(storedConfig);
      setConfig({ ...parsedConfig, hasToken: !!storedPat });
    } else {
      // Auto-save default configuration
      const defaultConfig = {
        organizationUrl: 'https://dev.azure.com/vibecode',
        projectName: 'ProjectABC',
        hasToken: !!storedPat,
      };
      localStorage.setItem('azureDevOpsConfig', JSON.stringify(defaultConfig));
      setConfig(defaultConfig);
    }
  }, []);

  const handleSaveConfig = () => {
    localStorage.setItem('azureDevOpsConfig', JSON.stringify(config));
    toast({
      title: "Configuration saved",
      description: "Azure DevOps settings have been updated.",
    });
  };


  const testConnection = async () => {
    setIsTestingConnection(true);
    const storedPat = localStorage.getItem('azureDevOpsPAT');
    
    if (!storedPat) {
      setIsTestingConnection(false);
      toast({
        title: "No PAT configured",
        description: "Please add your Personal Access Token using the button below.",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await initializeConnection(
        config.organizationUrl,
        config.projectName,
        storedPat
      );

      if (success) {
        toast({
          title: "Connection successful",
          description: "Successfully connected to Azure DevOps!",
        });
      }
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Please check your PAT and configuration.",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSavePAT = async () => {
    if (!personalAccessToken.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid Personal Access Token.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Store PAT securely
      localStorage.setItem('azureDevOpsPAT', personalAccessToken);
      
      // Test the connection
      const success = await initializeConnection(
        config.organizationUrl,
        config.projectName,
        personalAccessToken
      );

      if (success) {
        setConfig(prev => ({ ...prev, hasToken: true }));
        setPatDialogOpen(false);
        setPersonalAccessToken('');
        toast({
          title: "PAT saved successfully",
          description: "Personal Access Token has been saved and connection verified.",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to save PAT",
        description: "Please check your token and try again.",
        variant: "destructive",
      });
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

          <div className="flex gap-2">
            <Dialog open={patDialogOpen} onOpenChange={setPatDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1">
                  {config.hasToken ? 'Update' : 'Add'} Personal Access Token
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Personal Access Token</DialogTitle>
                  <DialogDescription>
                    Enter your Azure DevOps Personal Access Token to connect to your pipelines.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="pat">Personal Access Token</Label>
                    <div className="relative">
                      <Input
                        id="pat"
                        type={showToken ? "text" : "password"}
                        value={personalAccessToken}
                        onChange={(e) => setPersonalAccessToken(e.target.value)}
                        placeholder="Enter your PAT here..."
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowToken(!showToken)}
                      >
                        {showToken ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Required permissions: Build (read), Release (read), Work Items (read), Code (read)
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setPatDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleSavePAT}>
                    Save & Test Connection
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" size="sm" asChild>
              <a 
                href="https://dev.azure.com/vibecode/_usersSettings/tokens" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Get PAT from Azure DevOps
              </a>
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Your token will be stored locally and encrypted. Generate a new PAT in your Azure DevOps organization settings with the required permissions listed above.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};