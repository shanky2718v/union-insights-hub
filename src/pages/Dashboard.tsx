import React from 'react';
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
  Clock
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const Dashboard = () => {
  const { user } = useAuth();
  const { excelData } = useData();

  const features = [
    {
      icon: Upload,
      title: 'Upload Excel Files',
      description: 'Import your .xls or .xlsx files securely for analysis',
      link: '/upload',
      color: 'bg-primary/10 text-primary',
    },
    {
      icon: BarChart3,
      title: 'Generate Graphs',
      description: 'Create interactive charts from your uploaded data',
      link: '/graphs',
      color: 'bg-accent/10 text-accent',
    },
  ];

  const stats = [
    {
      icon: FileSpreadsheet,
      label: 'Files Uploaded',
      value: excelData ? '1' : '0',
    },
    {
      icon: TrendingUp,
      label: 'Charts Available',
      value: '7',
    },
    {
      icon: Shield,
      label: 'Security Level',
      value: 'Bank-Grade',
    },
    {
      icon: Clock,
      label: 'Session Status',
      value: 'Active',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="bank-card-elevated p-8 gradient-primary text-primary-foreground">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-serif font-bold mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-primary-foreground/80 text-lg">
              Your secure data analytics dashboard is ready. Upload Excel files and generate insightful visualizations.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="bank-card p-6 flex items-center gap-4 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="p-3 rounded-xl bg-primary/10">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bank-card-elevated p-8 hover:shadow-bank-elevated transition-all duration-300 group animate-slide-up"
              style={{ animationDelay: `${(index + 4) * 100}ms` }}
            >
              <div className={`p-4 rounded-xl ${feature.color} w-fit mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif font-bold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground mb-6">
                {feature.description}
              </p>
              <Link to={feature.link}>
                <Button variant="bankOutline" className="group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  Get Started
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Current Data Status */}
        {excelData && (
          <div className="bank-card p-6 animate-scale-in">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success/10">
                  <FileSpreadsheet className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Data Loaded</p>
                  <p className="text-sm text-muted-foreground">
                    {excelData.fileName} • {excelData.rows.length} rows • {excelData.headers.length} columns
                  </p>
                </div>
              </div>
              <Link to="/graphs">
                <Button variant="gold">Generate Graphs</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Quick Tips */}
        <div className="bank-card p-6">
          <h3 className="font-serif font-bold text-lg text-foreground mb-4">Quick Tips</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              Upload Excel files (.xls or .xlsx) up to 10MB in size
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              Choose from 7 different chart types for your visualizations
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              Export your charts as PNG or PDF for presentations
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              Use filters to focus on specific data ranges
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
