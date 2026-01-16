import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Lock, User, AlertCircle, Building2, Sparkles, Zap, CheckCircle2 } from 'lucide-react';
import GlowingOrb from '@/components/ui/GlowingOrb';
import ParticleBackground from '@/components/ui/ParticleBackground';

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

  const features = [
    { icon: Shield, text: 'Bank-Grade Security' },
    { icon: Lock, text: 'End-to-End Encryption' },
    { icon: Zap, text: 'Real-time Analytics' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden">
        <ParticleBackground particleCount={25} />
        <GlowingOrb color="accent" size="xl" className="top-20 left-20" />
        <GlowingOrb color="violet" size="lg" className="bottom-40 right-20" />
        <GlowingOrb color="pink" size="md" className="top-1/2 left-1/3" />
        
        <div className="relative z-10 flex flex-col justify-center px-16 text-primary-foreground">
          <div className="flex items-center gap-3 mb-8 animate-slide-in-left">
            <div className="p-3 rounded-xl bg-accent/20 backdrop-blur-sm animate-float">
              <Building2 className="w-10 h-10 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold">Union Bank</h1>
              <p className="text-primary-foreground/70 text-sm">Data Analytics Portal</p>
            </div>
          </div>
          
          <h2 className="text-5xl font-serif font-bold mb-6 leading-tight animate-slide-in-left stagger-1">
            Transform Your Data<br />
            <span className="text-gradient-gold">Into Insights</span>
          </h2>
          
          <p className="text-xl text-primary-foreground/80 mb-10 max-w-md animate-slide-in-left stagger-2">
            Upload Excel files, generate interactive charts, and make data-driven decisions with our secure analytics platform.
          </p>
          
          <div className="space-y-4 animate-slide-in-left stagger-3">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="p-2 rounded-lg bg-accent/20">
                  <feature.icon className="w-5 h-5 text-accent" />
                </div>
                <span className="font-medium">{feature.text}</span>
                <CheckCircle2 className="w-4 h-4 text-accent ml-auto" />
              </div>
            ))}
          </div>

          {/* Animated Stats */}
          <div className="mt-12 flex gap-8 animate-fade-in stagger-4">
            <div>
              <p className="text-4xl font-bold text-accent">7+</p>
              <p className="text-sm text-primary-foreground/60">Chart Types</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-accent">100%</p>
              <p className="text-sm text-primary-foreground/60">Secure</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-accent">10MB</p>
              <p className="text-sm text-primary-foreground/60">Max Upload</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background relative overflow-hidden">
        <GlowingOrb color="cyan" size="lg" className="top-0 right-0 translate-x-1/2 -translate-y-1/2 opacity-50" />
        <GlowingOrb color="violet" size="md" className="bottom-0 left-0 -translate-x-1/2 translate-y-1/2 opacity-50" />
        
        <div className="w-full max-w-md animate-fade-in relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center animate-bounce-in">
            <div className="p-3 rounded-xl gradient-vibrant">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">Union Bank</h1>
              <p className="text-muted-foreground text-sm">Data Analytics Portal</p>
            </div>
          </div>

          <div className="bank-card-elevated p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 gradient-vibrant" />
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                Welcome Back
              </div>
              <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Sign In</h2>
              <p className="text-muted-foreground">Access your analytics dashboard</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 animate-scale-in">
                <div className="p-1 rounded-full bg-destructive/20">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                </div>
                <p className="text-sm text-destructive flex-1">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground font-medium">Username</Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-12 h-14 bg-secondary/50 border-border focus:border-accent focus:ring-accent rounded-xl text-base"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 h-14 bg-secondary/50 border-border focus:border-accent focus:ring-accent rounded-xl text-base"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 text-lg font-semibold gradient-vibrant text-white border-0 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  <>
                    Sign In
                    <Zap className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-center text-sm text-muted-foreground mb-4 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                Demo Credentials
              </p>
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => { setUsername('admin'); setPassword('admin123'); }}
                  className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-500/20 hover:border-cyan-500/40 transition-colors group"
                >
                  <span className="text-sm text-muted-foreground">Admin Access</span>
                  <code className="font-mono text-foreground text-sm group-hover:text-cyan-500 transition-colors">admin / admin123</code>
                </button>
                <button 
                  onClick={() => { setUsername('user'); setPassword('user123'); }}
                  className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-pink-500/10 to-orange-500/10 border border-pink-500/20 hover:border-pink-500/40 transition-colors group"
                >
                  <span className="text-sm text-muted-foreground">User Access</span>
                  <code className="font-mono text-foreground text-sm group-hover:text-pink-500 transition-colors">user / user123</code>
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6 flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-teal-500" />
            Protected by bank-grade encryption and security protocols
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;