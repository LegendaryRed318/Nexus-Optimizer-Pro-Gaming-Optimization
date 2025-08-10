import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface UserSettings {
  darkMode: boolean;
  soundEffects: boolean;
  autoOptimization: boolean;
  performanceAlerts: boolean;
  colorTheme: string;
  fpsTargets: {
    fortnite: number;
    global: number;
  };
}

export default function Settings() {
  const { user, logout, token } = useAuth();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<UserSettings>({
    darkMode: true,
    soundEffects: true,
    autoOptimization: false,
    performanceAlerts: true,
    colorTheme: "green",
    fpsTargets: { fortnite: 144, global: 240 },
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load user settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!token) return;
      
      setIsLoading(true);
      try {
        const response = await fetch('/api/settings', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setSettings({
              darkMode: data.darkMode,
              soundEffects: data.soundEffects,
              autoOptimization: data.autoOptimization,
              performanceAlerts: data.performanceAlerts,
              colorTheme: data.colorTheme,
              fpsTargets: data.fpsTargets || { fortnite: 144, global: 240 },
            });
          }
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [token]);

  const saveSettings = async () => {
    if (!token) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast({
          title: "Settings Saved",
          description: "Your preferences have been updated successfully.",
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Could not save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const colorThemes = [
    { value: "green", label: "Neon Green", class: "bg-neon-green" },
    { value: "blue", label: "Cyber Blue", class: "bg-neon-blue" },
    { value: "purple", label: "Tech Purple", class: "bg-neon-purple" },
    { value: "yellow", label: "Energy Yellow", class: "bg-neon-yellow" },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <Card className="bg-dark-card border-dark-border">
          <CardContent className="p-6 text-center">
            <p className="text-white mb-4">Please log in to access settings.</p>
            <Button onClick={() => window.location.reload()}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white font-orbitron">System Settings</h1>
            <p className="text-gray-400 mt-2">Customize your Nexus Optimizer Pro experience</p>
          </div>
        </div>

        {/* User Account */}
        <Card className="bg-dark-card border-dark-border">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <i className="fas fa-user-circle text-neon-green mr-3" />
              Account Information
            </CardTitle>
            <CardDescription>Manage your account and authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-dark-bg rounded-lg border border-dark-border">
              <div>
                <p className="text-white font-medium">Logged in as</p>
                <p className="text-neon-green font-semibold text-lg">{user.username}</p>
                {user.email && <p className="text-gray-400 text-sm">{user.email}</p>}
              </div>
              <Button 
                onClick={handleLogout}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <i className="fas fa-sign-out-alt mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="bg-dark-card border-dark-border">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <i className="fas fa-palette text-neon-blue mr-3" />
              Appearance
            </CardTitle>
            <CardDescription>Customize the look and feel of the application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Dark Mode</p>
                <p className="text-gray-400 text-sm">Enable dark theme for better gaming experience</p>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => updateSetting('darkMode', checked)}
                className="data-[state=checked]:bg-neon-green"
              />
            </div>
            
            <Separator className="bg-dark-border" />
            
            <div className="space-y-3">
              <p className="text-white font-medium">Color Theme</p>
              <p className="text-gray-400 text-sm">Choose your preferred accent color</p>
              <Select value={settings.colorTheme} onValueChange={(value) => updateSetting('colorTheme', value)}>
                <SelectTrigger className="w-full bg-dark-bg border-dark-border text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-dark-bg border-dark-border">
                  {colorThemes.map((theme) => (
                    <SelectItem 
                      key={theme.value} 
                      value={theme.value}
                      className="text-white hover:bg-dark-card"
                    >
                      <div className="flex items-center">
                        <div className={cn("w-4 h-4 rounded-full mr-3", theme.class)} />
                        {theme.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* System Preferences */}
        <Card className="bg-dark-card border-dark-border">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <i className="fas fa-cog text-neon-purple mr-3" />
              System Preferences
            </CardTitle>
            <CardDescription>Configure system behavior and notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Sound Effects</p>
                <p className="text-gray-400 text-sm">Play audio feedback for interactions</p>
              </div>
              <Switch
                checked={settings.soundEffects}
                onCheckedChange={(checked) => updateSetting('soundEffects', checked)}
                className="data-[state=checked]:bg-neon-blue"
              />
            </div>
            
            <Separator className="bg-dark-border" />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Auto-Optimization</p>
                <p className="text-gray-400 text-sm">Automatically apply optimization suggestions</p>
              </div>
              <Switch
                checked={settings.autoOptimization}
                onCheckedChange={(checked) => updateSetting('autoOptimization', checked)}
                className="data-[state=checked]:bg-neon-purple"
              />
            </div>
            
            <Separator className="bg-dark-border" />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Performance Alerts</p>
                <p className="text-gray-400 text-sm">Get notified about system performance issues</p>
              </div>
              <Switch
                checked={settings.performanceAlerts}
                onCheckedChange={(checked) => updateSetting('performanceAlerts', checked)}
                className="data-[state=checked]:bg-neon-yellow"
              />
            </div>
          </CardContent>
        </Card>

        {/* FPS Targets */}
        <Card className="bg-dark-card border-dark-border">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <i className="fas fa-tachometer-alt text-neon-yellow mr-3" />
              FPS Targets
            </CardTitle>
            <CardDescription>Set default frame rate targets for games</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="text-white font-medium">Fortnite Target FPS</p>
                <Select 
                  value={settings.fpsTargets.fortnite.toString()} 
                  onValueChange={(value) => updateSetting('fpsTargets', { 
                    ...settings.fpsTargets, 
                    fortnite: parseInt(value) 
                  })}
                >
                  <SelectTrigger className="bg-dark-bg border-dark-border text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-bg border-dark-border">
                    <SelectItem value="240" className="text-white hover:bg-dark-card">240 FPS</SelectItem>
                    <SelectItem value="180" className="text-white hover:bg-dark-card">180 FPS</SelectItem>
                    <SelectItem value="144" className="text-white hover:bg-dark-card">144 FPS</SelectItem>
                    <SelectItem value="120" className="text-white hover:bg-dark-card">120 FPS</SelectItem>
                    <SelectItem value="60" className="text-white hover:bg-dark-card">60 FPS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <p className="text-white font-medium">Global Target FPS</p>
                <Select 
                  value={settings.fpsTargets.global.toString()} 
                  onValueChange={(value) => updateSetting('fpsTargets', { 
                    ...settings.fpsTargets, 
                    global: parseInt(value) 
                  })}
                >
                  <SelectTrigger className="bg-dark-bg border-dark-border text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-bg border-dark-border">
                    <SelectItem value="240" className="text-white hover:bg-dark-card">240 FPS</SelectItem>
                    <SelectItem value="180" className="text-white hover:bg-dark-card">180 FPS</SelectItem>
                    <SelectItem value="144" className="text-white hover:bg-dark-card">144 FPS</SelectItem>
                    <SelectItem value="120" className="text-white hover:bg-dark-card">120 FPS</SelectItem>
                    <SelectItem value="60" className="text-white hover:bg-dark-card">60 FPS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={saveSettings}
            disabled={isSaving || isLoading}
            className="bg-neon-green text-dark-bg hover:bg-neon-green/90 font-semibold px-8"
          >
            {isSaving ? (
              <>
                <i className="fas fa-spinner animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}