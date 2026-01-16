import React, { useState, useRef, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  Upload, 
  Download,
  LineChart as LineIcon,
  BarChart3,
  PieChart,
  Activity,
  Circle,
  TrendingUp,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FileImage,
  FileText,
  Palette
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

type ChartType = 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter' | 'histogram';

const CHART_TYPES: { value: ChartType; label: string; icon: React.ElementType }[] = [
  { value: 'line', label: 'Line Chart', icon: LineIcon },
  { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { value: 'pie', label: 'Pie Chart', icon: PieChart },
  { value: 'doughnut', label: 'Doughnut Chart', icon: Circle },
  { value: 'area', label: 'Area Chart', icon: Activity },
  { value: 'scatter', label: 'Scatter Plot', icon: TrendingUp },
  { value: 'histogram', label: 'Histogram', icon: BarChart3 },
];

const COLOR_PRESETS = [
  { name: 'Navy', value: 'hsl(213, 56%, 20%)' },
  { name: 'Gold', value: 'hsl(43, 74%, 47%)' },
  { name: 'Emerald', value: 'hsl(142, 76%, 36%)' },
  { name: 'Amber', value: 'hsl(38, 92%, 50%)' },
  { name: 'Rose', value: 'hsl(0, 84%, 60%)' },
  { name: 'Purple', value: 'hsl(262, 83%, 58%)' },
  { name: 'Cyan', value: 'hsl(190, 90%, 50%)' },
  { name: 'Pink', value: 'hsl(340, 82%, 52%)' },
  { name: 'Teal', value: 'hsl(172, 66%, 50%)' },
  { name: 'Indigo', value: 'hsl(234, 89%, 74%)' },
  { name: 'Orange', value: 'hsl(25, 95%, 53%)' },
  { name: 'Lime', value: 'hsl(84, 81%, 44%)' },
];

const DEFAULT_CHART_COLORS = COLOR_PRESETS.map(c => c.value);

const GraphsPage = () => {
  const { excelData } = useData();
  const chartRef = useRef<HTMLDivElement>(null);
  
  const [selectedChart, setSelectedChart] = useState<ChartType>('bar');
  const [xAxis, setXAxis] = useState<string>('');
  const [yAxis, setYAxis] = useState<string>('');
  const [zoom, setZoom] = useState([100]);
  const [filterMin, setFilterMin] = useState<number | null>(null);
  const [filterMax, setFilterMax] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>(COLOR_PRESETS[0].value);
  const [pieColors, setPieColors] = useState<string[]>(DEFAULT_CHART_COLORS.slice(0, 8));

  // Get the active colors for charts
  const CHART_COLORS = useMemo(() => {
    return [selectedColor, ...DEFAULT_CHART_COLORS.filter(c => c !== selectedColor)];
  }, [selectedColor]);

  // Get numeric columns for Y-axis
  const numericColumns = useMemo(() => {
    if (!excelData) return [];
    return excelData.headers.filter((_, index) => {
      return excelData.rows.some(row => typeof row[index] === 'number' || !isNaN(Number(row[index])));
    });
  }, [excelData]);

  // Process data for charts
  const chartData = useMemo(() => {
    if (!excelData || !xAxis || !yAxis) return [];

    const xIndex = excelData.headers.indexOf(xAxis);
    const yIndex = excelData.headers.indexOf(yAxis);

    if (xIndex === -1 || yIndex === -1) return [];

    let data = excelData.rows.map(row => ({
      name: String(row[xIndex] ?? ''),
      value: Number(row[yIndex]) || 0,
    })).filter(item => item.name !== '' && !isNaN(item.value));

    // Apply filters
    if (filterMin !== null) {
      data = data.filter(item => item.value >= filterMin);
    }
    if (filterMax !== null) {
      data = data.filter(item => item.value <= filterMax);
    }

    // For histograms, aggregate data into bins
    if (selectedChart === 'histogram' && data.length > 0) {
      const values = data.map(d => d.value);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const binCount = Math.min(10, Math.ceil(Math.sqrt(values.length)));
      const binSize = (max - min) / binCount || 1;

      const bins: { name: string; value: number }[] = [];
      for (let i = 0; i < binCount; i++) {
        const binStart = min + i * binSize;
        const binEnd = binStart + binSize;
        const count = values.filter(v => v >= binStart && (i === binCount - 1 ? v <= binEnd : v < binEnd)).length;
        bins.push({
          name: `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`,
          value: count,
        });
      }
      return bins;
    }

    return data;
  }, [excelData, xAxis, yAxis, selectedChart, filterMin, filterMax]);

  // Calculate min/max for filter slider
  const dataRange = useMemo(() => {
    if (!excelData || !yAxis) return { min: 0, max: 100 };
    const yIndex = excelData.headers.indexOf(yAxis);
    if (yIndex === -1) return { min: 0, max: 100 };
    
    const values = excelData.rows
      .map(row => Number(row[yIndex]))
      .filter(v => !isNaN(v));
    
    return {
      min: Math.floor(Math.min(...values)),
      max: Math.ceil(Math.max(...values)),
    };
  }, [excelData, yAxis]);

  const exportToPNG = async () => {
    if (!chartRef.current) return;
    
    const canvas = await html2canvas(chartRef.current, {
      backgroundColor: '#ffffff',
      scale: 2,
    });
    
    const link = document.createElement('a');
    link.download = `union-bank-chart-${selectedChart}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const exportToPDF = async () => {
    if (!chartRef.current) return;
    
    const canvas = await html2canvas(chartRef.current, {
      backgroundColor: '#ffffff',
      scale: 2,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape');
    const imgWidth = 280;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    pdf.save(`union-bank-chart-${selectedChart}.pdf`);
  };

  const resetZoom = () => {
    setZoom([100]);
  };

  const renderChart = () => {
    if (!chartData.length) return null;

    const scaleFactor = zoom[0] / 100;
    const chartHeight = 400 * scaleFactor;

    const commonProps = {
      data: chartData,
    };

    switch (selectedChart) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }} 
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={CHART_COLORS[0]} 
                strokeWidth={2}
                dot={{ fill: CHART_COLORS[0], strokeWidth: 2 }}
                activeDot={{ r: 8, fill: CHART_COLORS[1] }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }} 
              />
              <Legend />
              <Bar dataKey="value" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'histogram':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} angle={-45} textAnchor="end" height={60} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }} 
              />
              <Bar dataKey="value" fill={CHART_COLORS[2]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <RechartsPie>
              <Pie
                data={chartData.slice(0, 8)}
                cx="50%"
                cy="50%"
                outerRadius={chartHeight / 3}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.slice(0, 8).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }} 
              />
              <Legend />
            </RechartsPie>
          </ResponsiveContainer>
        );

      case 'doughnut':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <RechartsPie>
              <Pie
                data={chartData.slice(0, 8)}
                cx="50%"
                cy="50%"
                innerRadius={chartHeight / 6}
                outerRadius={chartHeight / 3}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.slice(0, 8).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }} 
              />
              <Legend />
            </RechartsPie>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }} 
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={CHART_COLORS[0]} 
                fill={CHART_COLORS[0]}
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                type="category" 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                name={xAxis}
              />
              <YAxis 
                type="number" 
                dataKey="value" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                name={yAxis}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }} 
              />
              <Legend />
              <Scatter name={yAxis} data={chartData} fill={CHART_COLORS[1]} />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  if (!excelData) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto text-center py-20 animate-fade-in">
          <div className="w-24 h-24 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-6">
            <Upload className="w-12 h-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-foreground mb-4">
            No Data Available
          </h1>
          <p className="text-muted-foreground mb-8">
            Please upload an Excel file first to generate graphs.
          </p>
          <Link to="/upload">
            <Button variant="bank" size="lg">
              <Upload className="w-5 h-5 mr-2" />
              Upload Excel File
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
              Generate Graphs
            </h1>
            <p className="text-muted-foreground">
              Create interactive visualizations from your data
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportToPNG}>
              <FileImage className="w-4 h-4 mr-1" />
              PNG
            </Button>
            <Button variant="outline" size="sm" onClick={exportToPDF}>
              <FileText className="w-4 h-4 mr-1" />
              PDF
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Chart Type Selection */}
            <div className="bank-card p-6">
              <Label className="text-sm font-semibold text-foreground mb-4 block">
                Select Chart Type
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {CHART_TYPES.map((chart) => (
                  <button
                    key={chart.value}
                    onClick={() => setSelectedChart(chart.value)}
                    className={`
                      p-3 rounded-lg border-2 transition-all text-left
                      ${selectedChart === chart.value 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                      }
                    `}
                  >
                    <chart.icon className={`w-5 h-5 mb-1 ${selectedChart === chart.value ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className={`text-xs font-medium ${selectedChart === chart.value ? 'text-primary' : 'text-muted-foreground'}`}>
                      {chart.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Axis Selection */}
            <div className="bank-card p-6 space-y-4">
              <div>
                <Label className="text-sm font-semibold text-foreground mb-2 block">
                  X-Axis (Category)
                </Label>
                <Select value={xAxis} onValueChange={setXAxis}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {excelData.headers.map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold text-foreground mb-2 block">
                  Y-Axis (Values)
                </Label>
                <Select value={yAxis} onValueChange={setYAxis}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {numericColumns.map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Color Customization */}
            <div className="bank-card p-6">
              <Label className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Chart Color
              </Label>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.value)}
                    title={color.name}
                    className={`
                      w-full aspect-square rounded-lg transition-all duration-200 hover:scale-110
                      ${selectedColor === color.value 
                        ? 'ring-2 ring-offset-2 ring-primary scale-110' 
                        : 'hover:ring-2 hover:ring-offset-1 hover:ring-muted-foreground/50'
                      }
                    `}
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Selected: {COLOR_PRESETS.find(c => c.value === selectedColor)?.name || 'Custom'}
              </p>
              
              {/* For Pie/Doughnut charts - multi-color selection */}
              {(selectedChart === 'pie' || selectedChart === 'doughnut') && (
                <div className="mt-4 pt-4 border-t border-border">
                  <Label className="text-xs font-medium text-muted-foreground mb-3 block">
                    Segment Colors (click to cycle)
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {pieColors.slice(0, Math.min(chartData.length, 8)).map((color, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          const currentIdx = DEFAULT_CHART_COLORS.indexOf(color);
                          const nextIdx = (currentIdx + 1) % DEFAULT_CHART_COLORS.length;
                          const newColors = [...pieColors];
                          newColors[index] = DEFAULT_CHART_COLORS[nextIdx];
                          setPieColors(newColors);
                        }}
                        title={`Segment ${index + 1} - Click to change`}
                        className="w-8 h-8 rounded-full transition-all duration-200 hover:scale-110 ring-1 ring-white/50 shadow-md"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Zoom Control */}
            <div className="bank-card p-6">
              <Label className="text-sm font-semibold text-foreground mb-4 block">
                Zoom: {zoom[0]}%
              </Label>
              <div className="flex items-center gap-3">
                <ZoomOut className="w-4 h-4 text-muted-foreground" />
                <Slider
                  value={zoom}
                  onValueChange={setZoom}
                  min={50}
                  max={150}
                  step={10}
                  className="flex-1"
                />
                <ZoomIn className="w-4 h-4 text-muted-foreground" />
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetZoom}
                className="w-full mt-3"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            </div>

            {/* Data Filter */}
            {yAxis && (
              <div className="bank-card p-6">
                <Label className="text-sm font-semibold text-foreground mb-4 block">
                  Filter Data Range
                </Label>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Minimum Value</Label>
                    <input
                      type="number"
                      placeholder={String(dataRange.min)}
                      value={filterMin ?? ''}
                      onChange={(e) => setFilterMin(e.target.value ? Number(e.target.value) : null)}
                      className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Maximum Value</Label>
                    <input
                      type="number"
                      placeholder={String(dataRange.max)}
                      value={filterMax ?? ''}
                      onChange={(e) => setFilterMax(e.target.value ? Number(e.target.value) : null)}
                      className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-sm"
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { setFilterMin(null); setFilterMax(null); }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Chart Display */}
          <div className="lg:col-span-3">
            <div className="bank-card-elevated p-6" ref={chartRef}>
              {!xAxis || !yAxis ? (
                <div className="h-96 flex items-center justify-center">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium text-foreground mb-2">
                      Select Axes to Generate Chart
                    </p>
                    <p className="text-muted-foreground">
                      Choose X-axis and Y-axis columns from the controls panel
                    </p>
                  </div>
                </div>
              ) : chartData.length === 0 ? (
                <div className="h-96 flex items-center justify-center">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-warning mx-auto mb-4" />
                    <p className="text-lg font-medium text-foreground mb-2">
                      No Data to Display
                    </p>
                    <p className="text-muted-foreground">
                      The selected columns don't have valid data for visualization
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-foreground">
                        {CHART_TYPES.find(c => c.value === selectedChart)?.label}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {xAxis} vs {yAxis} • {chartData.length} data points
                      </p>
                    </div>
                  </div>
                  {renderChart()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GraphsPage;
