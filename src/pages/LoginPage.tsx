import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Lock, User, AlertCircle, Building2 } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Input validation
    if (!username.trim()) {
      setError('Please enter your username');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(username, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-accent/30 blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-40 right-20 w-96 h-96 rounded-full bg-accent/20 blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 text-primary-foreground">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-accent/20 backdrop-blur-sm">
              <Building2 className="w-10 h-10 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold">Union Bank</h1>
              <p className="text-primary-foreground/70 text-sm">Data Analytics Portal</p>
            </div>
          </div>
          
          <h2 className="text-4xl font-serif font-bold mb-6 leading-tight">
            Transform Your Data<br />
            <span className="text-gradient-gold">Into Insights</span>
          </h2>
          
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-md">
            Upload Excel files, generate interactive charts, and make data-driven decisions with our secure analytics platform.
          </p>
          
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent" />
              <span className="text-sm">Bank-Grade Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-accent" />
              <span className="text-sm">Encrypted Data</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="p-3 rounded-xl bg-primary">
              <Building2 className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">Union Bank</h1>
              <p className="text-muted-foreground text-sm">Data Analytics Portal</p>
            </div>
          </div>

          <div className="bank-card-elevated p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-serif font-bold text-foreground mb-2">Welcome Back</h2>
              <p className="text-muted-foreground">Sign in to access your analytics dashboard</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3 animate-scale-in">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground font-medium">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 h-12 bg-secondary/50 border-border focus:border-primary focus:ring-primary"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 bg-secondary/50 border-border focus:border-primary focus:ring-primary"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="bank"
                size="xl"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-center text-sm text-muted-foreground mb-4">Demo Credentials</p>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground">Admin:</span>
                  <code className="font-mono text-foreground">admin / admin123</code>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground">User:</span>
                  <code className="font-mono text-foreground">user / user123</code>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Protected by bank-grade encryption and security protocols
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
