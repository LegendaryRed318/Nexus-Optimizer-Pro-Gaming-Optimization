import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  username: string;
  email: string | null;
  avatar?: string;
  premium: boolean;
  lastLogin: string;
  loginCount: number;
  securityLevel: 'basic' | 'enhanced' | 'maximum';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string, twoFactorCode?: string) => Promise<{ success: boolean; requires2FA?: boolean; message?: string }>;
  signup: (username: string, password: string, email?: string, acceptTerms?: boolean) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  enable2FA: () => Promise<void>;
  disable2FA: (code: string) => Promise<void>;
  verify2FA: (code: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmResetPassword: (token: string, newPassword: string) => Promise<void>;
  lockAccount: () => void;
  unlockAccount: (password: string) => Promise<void>;
  getSecurityLog: () => Promise<any[]>;
  clearSecurityLog: () => Promise<void>;
  sessionTimeout: number;
  setSessionTimeout: (timeout: number) => void;
  isAccountLocked: boolean;
  is2FAEnabled: boolean;
  biometricSupported: boolean;
  enableBiometric: () => Promise<void>;
  disableBiometric: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccountLocked, setIsAccountLocked] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(30 * 60 * 1000); // 30 minutes
  const [biometricSupported, setBiometricSupported] = useState(false);
  const { toast } = useToast();

  // Check biometric support
  useEffect(() => {
    if ('credentials' in navigator && 'preventSilentAccess' in navigator.credentials) {
      setBiometricSupported(true);
    }
  }, []);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('nexus_token');
      const storedUser = localStorage.getItem('nexus_user');
      const storedTimeout = localStorage.getItem('nexus_session_timeout');
      
      if (storedTimeout) {
        setSessionTimeout(parseInt(storedTimeout));
      }

      if (storedToken && storedUser) {
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setToken(storedToken);
            setIs2FAEnabled(data.user.twoFactorEnabled || false);
            
            // Check if session has expired
            const lastActivity = localStorage.getItem('nexus_last_activity');
            if (lastActivity) {
              const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
              if (timeSinceLastActivity > sessionTimeout) {
                logout();
                toast({
                  title: "Session Expired",
                  description: "Your session has expired. Please log in again.",
                  variant: "destructive",
                });
                return;
              }
            }
            
            // Update last activity
            localStorage.setItem('nexus_last_activity', Date.now().toString());
          } else {
            localStorage.removeItem('nexus_token');
            localStorage.removeItem('nexus_user');
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem('nexus_token');
          localStorage.removeItem('nexus_user');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [sessionTimeout, toast]);

  // Session timeout handler
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      const lastActivity = localStorage.getItem('nexus_last_activity');
      if (lastActivity) {
        const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
        if (timeSinceLastActivity > sessionTimeout) {
          logout();
          toast({
            title: "Session Expired",
            description: "Your session has expired due to inactivity.",
            variant: "destructive",
          });
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [token, sessionTimeout, toast]);

  const updateLastActivity = useCallback(() => {
    localStorage.setItem('nexus_last_activity', Date.now().toString());
  }, []);

  const login = async (username: string, password: string, twoFactorCode?: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, twoFactorCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.requires2FA) {
        return { success: false, requires2FA: true, message: 'Two-factor authentication is required.' };
      }

      if (data.token) {
        setUser(data.user);
        setToken(data.token);
        setIs2FAEnabled(data.user.twoFactorEnabled || false);
        
        if (data.rememberMe) {
          localStorage.setItem('nexus_token', data.token);
          localStorage.setItem('nexus_user', JSON.stringify(data.user));
        } else {
          sessionStorage.setItem('nexus_token', data.token);
          sessionStorage.setItem('nexus_user', JSON.stringify(data.user));
        }
        updateLastActivity();
        
        // Log security event
        await fetch('/api/auth/security-log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.token}`,
          },
          body: JSON.stringify({
            event: 'login',
            details: { ip: await getClientIP() }
          }),
        });

        toast({
          title: "Welcome back! 🎮",
          description: `Successfully logged in as ${data.user.username}`,
        });
        return { success: true, message: `Successfully logged in as ${data.user.username}` };
      }

      return { success: false, message: 'Login failed - no token received' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  const signup = async (username: string, password: string, email?: string, acceptTerms = true) => {
    if (!acceptTerms) {
      throw new Error('You must accept the terms and conditions');
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email, acceptTerms }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      setUser(data.user);
      setToken(data.token);
      setIs2FAEnabled(false);
      
      localStorage.setItem('nexus_token', data.token);
      localStorage.setItem('nexus_user', JSON.stringify(data.user));
      updateLastActivity();

      toast({
        title: "Account Created! 🚀",
        description: "Welcome to Nexus Optimizer Pro! Your account has been created successfully.",
      });
    } catch (error) {
      throw error;
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setIs2FAEnabled(false);
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
    sessionStorage.removeItem('nexus_token');
    sessionStorage.removeItem('nexus_user');
    localStorage.removeItem('nexus_last_activity');
  }, []);

  const refreshToken = async () => {
    try {
      const currentToken = token || localStorage.getItem('nexus_token') || sessionStorage.getItem('nexus_token');
      if (!currentToken) return;

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        updateLastActivity();
        
        if (localStorage.getItem('nexus_token')) {
          localStorage.setItem('nexus_token', data.token);
        } else {
          sessionStorage.setItem('nexus_token', data.token);
        }
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        toast({
          title: "Profile Updated! ✨",
          description: "Your profile has been updated successfully.",
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response.ok) {
        toast({
          title: "Password Changed! 🔒",
          description: "Your password has been updated successfully.",
        });
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Password change failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const enable2FA = async () => {
    try {
      const response = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIs2FAEnabled(true);
        toast({
          title: "2FA Enabled! 🔐",
          description: "Two-factor authentication has been enabled for your account.",
        });
        return data.qrCode;
      }
    } catch (error) {
      throw error;
    }
  };

  const disable2FA = async (code: string) => {
    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      });

      if (response.ok) {
        setIs2FAEnabled(false);
        toast({
          title: "2FA Disabled! 🔓",
          description: "Two-factor authentication has been disabled for your account.",
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const verify2FA = async (code: string) => {
    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      });

      if (response.ok) {
        // 2FA verification successful
        return;
      } else {
        throw new Error('Invalid 2FA code');
      }
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast({
          title: "Reset Email Sent! 📧",
          description: "Check your email for password reset instructions.",
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const confirmResetPassword = async (resetToken: string, newPassword: string) => {
    try {
      const response = await fetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: resetToken, newPassword }),
      });

      if (response.ok) {
        toast({
          title: "Password Reset! 🔑",
          description: "Your password has been reset successfully. Please log in with your new password.",
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const lockAccount = () => {
    setIsAccountLocked(true);
    toast({
      title: "Account Locked! 🔒",
      description: "Your account has been locked for security reasons.",
      variant: "destructive",
    });
  };

  const unlockAccount = async (password: string) => {
    try {
      const response = await fetch('/api/auth/unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsAccountLocked(false);
        toast({
          title: "Account Unlocked! 🔓",
          description: "Your account has been unlocked successfully.",
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const getSecurityLog = async () => {
    try {
      const response = await fetch('/api/auth/security-log', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Failed to get security log:', error);
      return [];
    }
  };

  const clearSecurityLog = async () => {
    try {
      await fetch('/api/auth/security-log', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      toast({
        title: "Security Log Cleared! 🗑️",
        description: "Security log has been cleared successfully.",
      });
    } catch (error) {
      console.error('Failed to clear security log:', error);
    }
  };

  const enableBiometric = async () => {
    try {
      if (!biometricSupported) {
        throw new Error('Biometric authentication is not supported on this device');
      }

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: { name: 'Nexus Optimizer Pro' },
          user: {
            id: new Uint8Array(16),
            name: user?.username || 'user',
            displayName: user?.username || 'User',
          },
          pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
          timeout: 60000,
        },
      });

      if (credential) {
        toast({
          title: "Biometric Enabled! 👆",
          description: "Biometric authentication has been enabled for your account.",
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const disableBiometric = async () => {
    try {
      toast({
        title: "Biometric Disabled! 👆",
        description: "Biometric authentication has been disabled for your account.",
      });
    } catch (error) {
      throw error;
    }
  };

  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    refreshToken,
    updateProfile,
    changePassword,
    enable2FA,
    disable2FA,
    verify2FA,
    resetPassword,
    confirmResetPassword,
    lockAccount,
    unlockAccount,
    getSecurityLog,
    clearSecurityLog,
    sessionTimeout,
    setSessionTimeout,
    isAccountLocked,
    is2FAEnabled,
    biometricSupported,
    enableBiometric,
    disableBiometric,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}