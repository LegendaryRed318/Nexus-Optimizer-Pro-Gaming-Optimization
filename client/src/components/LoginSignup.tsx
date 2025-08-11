import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Eye, EyeOff, Shield, User, Mail, Lock, Key } from 'lucide-react';

interface LoginForm {
  username: string;
  password: string;
  twoFactorCode?: string;
}

interface SignupForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface PasswordResetForm {
  email: string;
}

export default function LoginSignup() {
  const { login, signup, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [loginForm, setLoginForm] = useState<LoginForm>({
    username: '',
    password: '',
    twoFactorCode: '',
  });

  const [signupForm, setSignupForm] = useState<SignupForm>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [passwordResetForm, setPasswordResetForm] = useState<PasswordResetForm>({
    email: '',
  });

  // Reset forms when switching tabs
  useEffect(() => {
    setError(null);
    setSuccess(null);
    setRequires2FA(false);
    setIsSubmitting(false);
  }, [activeTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await login(loginForm.username, loginForm.password, loginForm.twoFactorCode);
      
      if (result.requires2FA) {
        setRequires2FA(true);
        setSuccess('Please enter your 2FA code');
      } else if (result.success) {
        setSuccess('Login successful! Redirecting...');
        // Redirect will be handled by AuthContext
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await signup(signupForm.username, signupForm.email, signupForm.password);
      setSuccess('Account created successfully! You can now log in.');
      setActiveTab('login');
      setSignupForm({ username: '', email: '', password: '', confirmPassword: '' });
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/password-reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordResetForm),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess(data.message);
        setPasswordResetForm({ email: '' });
      } else {
        setError(data.error || 'Failed to send reset email');
      }
    } catch (err: any) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (form: string, field: string, value: string) => {
    switch (form) {
      case 'login':
        setLoginForm(prev => ({ ...prev, [field]: value }));
        break;
      case 'signup':
        setSignupForm(prev => ({ ...prev, [field]: value }));
        break;
      case 'passwordReset':
        setPasswordResetForm(prev => ({ ...prev, [field]: value }));
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // User is already logged in
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <Card className="w-full max-w-md bg-gray-800/50 border-gray-700 text-white">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-green-500 mr-3" />
            <div>
              <CardTitle className="text-2xl text-white">Nexus Optimizer Pro</CardTitle>
              <CardDescription className="text-gray-300">
                Ultimate Gaming Performance
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-700">
              <TabsTrigger value="login" className="data-[state=active]:bg-green-600">
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-green-600">
                Sign Up
              </TabsTrigger>
              <TabsTrigger value="reset" className="data-[state=active]:bg-green-600">
                Reset
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="space-y-4 mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username" className="text-gray-300">
                    <User className="inline h-4 w-4 mr-2" />
                    Username
                  </Label>
                  <Input
                    id="login-username"
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => handleInputChange('login', 'username', e.target.value)}
                    placeholder="Enter your username"
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-gray-300">
                    <Lock className="inline h-4 w-4 mr-2" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={loginForm.password}
                      onChange={(e) => handleInputChange('login', 'password', e.target.value)}
                      placeholder="Enter your password"
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {requires2FA && (
                  <div className="space-y-2">
                    <Label htmlFor="login-2fa" className="text-gray-300">
                      <Key className="inline h-4 w-4 mr-2" />
                      2FA Code
                    </Label>
                    <Input
                      id="login-2fa"
                      type="text"
                      value={loginForm.twoFactorCode || ''}
                      onChange={(e) => handleInputChange('login', 'twoFactorCode', e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                      maxLength={6}
                      required
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Shield className="h-4 w-4 mr-2" />
                  )}
                  {requires2FA ? 'Verify & Login' : 'Login'}
                </Button>
              </form>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup" className="space-y-4 mt-6">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username" className="text-gray-300">
                    <User className="inline h-4 w-4 mr-2" />
                    Username
                  </Label>
                  <Input
                    id="signup-username"
                    type="text"
                    value={signupForm.username}
                    onChange={(e) => handleInputChange('signup', 'username', e.target.value)}
                    placeholder="Choose a username"
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-gray-300">
                    <Mail className="inline h-4 w-4 mr-2" />
                    Email (Optional)
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupForm.email}
                    onChange={(e) => handleInputChange('signup', 'email', e.target.value)}
                    placeholder="your@email.com"
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-gray-300">
                    <Lock className="inline h-4 w-4 mr-2" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      value={signupForm.password}
                      onChange={(e) => handleInputChange('signup', 'password', e.target.value)}
                      placeholder="Create a strong password"
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400">
                    Must contain at least 8 characters, one uppercase, one lowercase, and one number
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password" className="text-gray-300">
                    <Lock className="inline h-4 w-4 mr-2" />
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={signupForm.confirmPassword}
                      onChange={(e) => handleInputChange('signup', 'confirmPassword', e.target.value)}
                      placeholder="Confirm your password"
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <User className="h-4 w-4 mr-2" />
                  )}
                  Create Account
                </Button>
              </form>
            </TabsContent>

            {/* Password Reset Tab */}
            <TabsContent value="reset" className="space-y-4 mt-6">
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-gray-300">
                    <Mail className="inline h-4 w-4 mr-2" />
                    Email Address
                  </Label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={passwordResetForm.email}
                    onChange={(e) => handleInputChange('passwordReset', 'email', e.target.value)}
                    placeholder="Enter your email address"
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Key className="h-4 w-4 mr-2" />
                  )}
                  Send Reset Link
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Error and Success Messages */}
          {error && (
            <Alert className="mt-4 border-red-500 bg-red-500/10">
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mt-4 border-green-500 bg-green-500/10">
              <AlertDescription className="text-green-400">{success}</AlertDescription>
            </Alert>
          )}

          {/* Security Features Info */}
          <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">🔒 Security Features</h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Two-factor authentication (2FA)</li>
              <li>• Account lockout protection</li>
              <li>• Secure password requirements</li>
              <li>• Rate limiting protection</li>
              <li>• Security event logging</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}