import React, { useState, useCallback } from 'react';
import { useData, ExcelData } from '@/contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2,
  X,
  ArrowRight,
  Table,
  Sparkles,
  Cloud,
  Zap,
  FileUp
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import GlowingOrb from '@/components/ui/GlowingOrb';
import ProgressRing from '@/components/ui/ProgressRing';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.xls', '.xlsx'];

const UploadPage = () => {
  const { setExcelData, excelData } = useData();
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateFile = (file: File): string | null => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return 'Invalid file type. Only .xls and .xlsx files are allowed.';
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return 'File size exceeds 10MB limit.';
    }
    
    return null;
  };

  const processFile = async (file: File) => {
    setError('');
    setIsProcessing(true);
    setUploadSuccess(false);
    setUploadProgress(0);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setIsProcessing(false);
      return;
    }

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 100);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as (string | number)[][];

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (jsonData.length < 2) {
        setError('File must contain at least a header row and one data row.');
        setIsProcessing(false);
        return;
      }

      const headers = jsonData[0].map(h => String(h));
      const rows = jsonData.slice(1).filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''));

      const parsedData: ExcelData = {
        headers,
        rows,
        fileName: file.name,
        uploadedAt: new Date(),
      };

      setExcelData(parsedData);
      setUploadSuccess(true);
    } catch (err) {
      clearInterval(progressInterval);
      setError('Failed to parse Excel file. Please ensure it is a valid spreadsheet.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const clearData = () => {
    setExcelData(null);
    setUploadSuccess(false);
    setError('');
    setUploadProgress(0);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="animate-slide-in-left">
          <div className="flex items-center gap-2 mb-2">
            <Cloud className="w-5 h-5 text-cyan-500" />
            <span className="text-sm font-medium text-cyan-500">Secure Upload</span>
          </div>
          <h1 className="text-4xl font-serif font-bold text-foreground mb-3">
            Upload <span className="text-gradient-vibrant">Excel File</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Import your data files to generate interactive visualizations
          </p>
        </div>

        {/* Upload Area */}
        <div
          className={`
            relative bank-card-elevated p-12 border-2 border-dashed transition-all duration-500 cursor-pointer overflow-hidden
            ${isDragging ? 'border-cyan-500 bg-cyan-500/5 scale-[1.02]' : 'border-border hover:border-accent/50'}
            ${uploadSuccess ? 'border-teal-500 bg-teal-500/5' : ''}
            ${error ? 'border-destructive bg-destructive/5' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          {isDragging && (
            <>
              <GlowingOrb color="cyan" size="lg" className="top-0 left-0 -translate-x-1/2 -translate-y-1/2" />
              <GlowingOrb color="violet" size="md" className="bottom-0 right-0 translate-x-1/2 translate-y-1/2" />
            </>
          )}
          
          <input
            id="file-input"
            type="file"
            accept=".xls,.xlsx"
            onChange={handleFileInput}
            className="hidden"
          />

          <div className="text-center relative z-10">
            {isProcessing ? (
              <div className="space-y-6 animate-fade-in">
                <ProgressRing progress={uploadProgress} size={120}>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{uploadProgress}%</p>
                  </div>
                </ProgressRing>
                <p className="text-lg font-medium text-foreground">Processing file...</p>
                <p className="text-sm text-muted-foreground">Analyzing your spreadsheet data</p>
              </div>
            ) : uploadSuccess && excelData ? (
              <div className="space-y-6 animate-bounce-in">
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 rounded-full bg-teal-500/20 animate-ping" />
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground mb-2">Upload Complete!</p>
                  <p className="text-teal-500 font-medium">{excelData.fileName}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {excelData.rows.length} rows • {excelData.headers.length} columns
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className={`relative w-24 h-24 mx-auto transition-all duration-300 ${isDragging ? 'scale-110' : ''}`}>
                  <div className={`absolute inset-0 rounded-2xl ${isDragging ? 'gradient-ocean' : 'gradient-vibrant'} opacity-20 blur-xl`} />
                  <div className={`relative w-24 h-24 rounded-2xl ${isDragging ? 'gradient-ocean' : 'bg-muted'} flex items-center justify-center transition-all`}>
                    <FileUp className={`w-12 h-12 transition-colors ${isDragging ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground mb-2">
                    {isDragging ? 'Drop your file here!' : 'Drag & drop your Excel file'}
                  </p>
                  <p className="text-muted-foreground">or click anywhere to browse</p>
                </div>
                <div className="flex items-center justify-center gap-6 text-sm">
                  <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 text-cyan-500">
                    <FileSpreadsheet className="w-4 h-4" />
                    .xls, .xlsx
                  </span>
                  <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 text-violet-500">
                    <Zap className="w-4 h-4" />
                    Max 10MB
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 animate-scale-in">
            <div className="p-2 rounded-full bg-destructive/20">
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
            <p className="text-sm text-destructive flex-1">{error}</p>
            <Button variant="ghost" size="icon" onClick={() => setError('')} className="hover:bg-destructive/10">
              <X className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        )}

        {/* Data Preview */}
        {excelData && (
          <div className="bank-card-elevated overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl gradient-ocean">
                  <Table className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Data Preview</h3>
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="text-cyan-500 font-medium">{Math.min(10, excelData.rows.length)}</span> of {excelData.rows.length} rows
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={clearData} className="hover:border-destructive hover:text-destructive">
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
                <Button 
                  onClick={() => navigate('/graphs')}
                  className="gradient-aurora text-white border-0"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Graphs
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
            
            <div className="overflow-x-auto max-h-96">
              <UITable>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold w-12 text-center text-primary">#</TableHead>
                    {excelData.headers.map((header, index) => (
                      <TableHead key={index} className="font-semibold whitespace-nowrap">
                        <span className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${
                            index % 4 === 0 ? 'from-cyan-500 to-blue-500' :
                            index % 4 === 1 ? 'from-violet-500 to-purple-500' :
                            index % 4 === 2 ? 'from-pink-500 to-rose-500' :
                            'from-orange-500 to-amber-500'
                          }`} />
                          {header}
                        </span>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {excelData.rows.slice(0, 10).map((row, rowIndex) => (
                    <TableRow key={rowIndex} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="text-center text-muted-foreground font-mono text-sm font-medium">
                        {rowIndex + 1}
                      </TableCell>
                      {excelData.headers.map((_, colIndex) => (
                        <TableCell key={colIndex} className="whitespace-nowrap">
                          {row[colIndex] ?? <span className="text-muted-foreground/50">—</span>}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </UITable>
              {excelData.rows.length > 10 && (
                <div className="p-4 text-center text-sm text-muted-foreground bg-gradient-to-t from-muted/50 to-transparent">
                  <span className="px-4 py-2 rounded-full bg-muted">
                    + {excelData.rows.length - 10} more rows
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="bank-card p-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-xl text-foreground">File Requirements</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: 'Supported Formats', desc: 'Excel files (.xls, .xlsx)', color: 'from-cyan-500 to-blue-500' },
              { title: 'File Structure', desc: 'First row should contain headers', color: 'from-violet-500 to-purple-500' },
              { title: 'Maximum Size', desc: 'Up to 10MB per file', color: 'from-pink-500 to-rose-500' },
              { title: 'Data Types', desc: 'Numeric values recommended for charts', color: 'from-orange-500 to-amber-500' },
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}>
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UploadPage;