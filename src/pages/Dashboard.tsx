import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  BarChart3, 
  FileSpreadsheet, 
  TrendingUp,
  Shield,
  Clock,
  Sparkles,
  Zap,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import GlowingOrb from '@/components/ui/GlowingOrb';
import ProgressRing from '@/components/ui/ProgressRing';
import ParticleBackground from '@/components/ui/ParticleBackground';

const Dashboard = () => {
  const { user } = useAuth();
  const { excelData } = useData();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const features = [
    {
      icon: Upload,
      title: 'Upload Excel Files',
      description: 'Import your .xls or .xlsx files securely for analysis',
      link: '/upload',
      gradient: 'gradient-ocean',
      iconBg: 'bg-cyan-500/20',
      iconColor: 'text-cyan-500',
    },
    {
      icon: BarChart3,
      title: 'Generate Graphs',
      description: 'Create interactive charts from your uploaded data',
      link: '/graphs',
      gradient: 'gradient-sunset',
      iconBg: 'bg-pink-500/20',
      iconColor: 'text-pink-500',
    },
  ];

  const stats = [
    {
      icon: FileSpreadsheet,
      label: 'Files Uploaded',
      value: excelData ? 1 : 0,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
      progress: excelData ? 100 : 0,
    },
    {
      icon: TrendingUp,
      label: 'Charts Available',
      value: 7,
      color: 'text-violet-500',
      bgColor: 'bg-violet-500/10',
      progress: 100,
    },
    {
      icon: Shield,
      label: 'Security Score',
      value: 100,
      suffix: '%',
      color: 'text-teal-500',
      bgColor: 'bg-teal-500/10',
      progress: 100,
    },
    {
      icon: Clock,
      label: 'Uptime',
      value: 99.9,
      suffix: '%',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      progress: 99.9,
    },
  ];

  const quickActions = [
    { label: 'Upload File', icon: Upload, link: '/upload', color: 'bg-cyan-500' },
    { label: 'View Graphs', icon: BarChart3, link: '/graphs', color: 'bg-violet-500' },
    { label: 'Analytics', icon: TrendingUp, link: '/graphs', color: 'bg-pink-500' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Welcome Section */}
        <div className="relative bank-card-elevated p-8 overflow-hidden">
          <ParticleBackground particleCount={15} />
          <GlowingOrb color="accent" size="xl" className="top-0 right-0 translate-x-1/2 -translate-y-1/2" />
          <GlowingOrb color="violet" size="lg" className="bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="animate-slide-in-left">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                <span className="text-sm font-medium text-accent">{greeting}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3">
                Welcome back,{' '}
                <span className="text-gradient-vibrant">{user?.name}!</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl">
                Your secure data analytics dashboard is ready. Upload Excel files and generate insightful visualizations.
              </p>
            </div>
            
            <div className="animate-slide-in-right flex items-center gap-4">
              <ProgressRing progress={excelData ? 100 : 50} size={100}>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {excelData ? '100%' : '50%'}
                  </p>
                  <p className="text-xs text-muted-foreground">Ready</p>
                </div>
              </ProgressRing>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="relative z-10 mt-8 flex flex-wrap gap-3 animate-fade-in stagger-3">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.link}>
                <Button 
                  variant="outline" 
                  className="group hover:border-accent transition-all duration-300"
                >
                  <div className={`w-2 h-2 rounded-full ${action.color} mr-2`} />
                  <action.icon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  {action.label}
                  <ChevronRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="bank-card stat-card p-6 animate-slide-up floating-card group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">
                <AnimatedCounter 
                  end={stat.value} 
                  suffix={stat.suffix || ''} 
                  duration={1500} 
                />
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              
              {/* Mini progress bar */}
              <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${stat.color.replace('text-', 'bg-')}`}
                  style={{ width: `${stat.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bank-card-elevated overflow-hidden group animate-slide-up floating-card"
              style={{ animationDelay: `${(index + 4) * 100}ms` }}
            >
              <div className={`h-2 ${feature.gradient}`} />
              <div className="p-8">
                <div className={`p-4 rounded-2xl ${feature.iconBg} w-fit mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                </div>
                <h3 className="text-2xl font-serif font-bold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <Link to={feature.link}>
                  <Button 
                    className={`${feature.gradient} text-white border-0 group-hover:shadow-lg transition-all duration-300`}
                  >
                    Get Started
                    <Zap className="w-4 h-4 ml-2 group-hover:animate-pulse" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Current Data Status */}
        {excelData && (
          <div className="bank-card-elevated p-6 animate-bounce-in relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 gradient-aurora" />
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="p-4 rounded-2xl bg-teal-500/10">
                    <FileSpreadsheet className="w-8 h-8 text-teal-500" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-teal-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-foreground">Data Loaded Successfully!</p>
                  <p className="text-muted-foreground">
                    <span className="text-teal-500 font-medium">{excelData.fileName}</span> • {excelData.rows.length} rows • {excelData.headers.length} columns
                  </p>
                </div>
              </div>
              <Link to="/graphs">
                <Button className="gradient-aurora text-white border-0 shadow-lg hover:shadow-xl transition-all">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Generate Graphs
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Quick Tips with Colorful Cards */}
        <div className="bank-card p-6 animate-fade-in stagger-5">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-accent" />
            <h3 className="font-serif font-bold text-xl text-foreground">Pro Tips</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { text: 'Upload Excel files (.xls or .xlsx) up to 10MB in size', color: 'border-l-cyan-500' },
              { text: 'Choose from 7 different chart types for your visualizations', color: 'border-l-violet-500' },
              { text: 'Export your charts as PNG or PDF for presentations', color: 'border-l-pink-500' },
              { text: 'Use filters to focus on specific data ranges', color: 'border-l-orange-500' },
            ].map((tip, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg bg-muted/50 border-l-4 ${tip.color} hover:bg-muted transition-colors`}
              >
                <p className="text-sm text-muted-foreground">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;