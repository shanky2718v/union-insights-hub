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
  Table
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

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.xls', '.xlsx'];

const UploadPage = () => {
  const { setExcelData, excelData } = useData();
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

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

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setIsProcessing(false);
      return;
    }

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as (string | number)[][];

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
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            Upload Excel File
          </h1>
          <p className="text-muted-foreground">
            Import your data files to generate interactive visualizations
          </p>
        </div>

        {/* Upload Area */}
        <div
          className={`
            bank-card-elevated p-12 border-2 border-dashed transition-all duration-300 cursor-pointer
            ${isDragging ? 'border-accent bg-accent/5 scale-[1.02]' : 'border-border hover:border-primary/50'}
            ${uploadSuccess ? 'border-success bg-success/5' : ''}
            ${error ? 'border-destructive bg-destructive/5' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".xls,.xlsx"
            onChange={handleFileInput}
            className="hidden"
          />

          <div className="text-center">
            {isProcessing ? (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-lg font-medium text-foreground">Processing file...</p>
              </div>
            ) : uploadSuccess && excelData ? (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-success" />
                </div>
                <div>
                  <p className="text-lg font-medium text-foreground">File uploaded successfully!</p>
                  <p className="text-muted-foreground">{excelData.fileName}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center transition-colors ${isDragging ? 'bg-accent/20' : 'bg-primary/10'}`}>
                  <Upload className={`w-10 h-10 transition-colors ${isDragging ? 'text-accent' : 'text-primary'}`} />
                </div>
                <div>
                  <p className="text-lg font-medium text-foreground">
                    {isDragging ? 'Drop your file here' : 'Drag & drop your Excel file'}
                  </p>
                  <p className="text-muted-foreground">or click to browse</p>
                </div>
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileSpreadsheet className="w-4 h-4" />
                    .xls, .xlsx
                  </span>
                  <span>Max 10MB</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3 animate-scale-in">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive flex-1">{error}</p>
            <Button variant="ghost" size="icon" onClick={() => setError('')}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Data Preview */}
        {excelData && (
          <div className="bank-card-elevated overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Table className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Data Preview</h3>
                  <p className="text-sm text-muted-foreground">
                    {excelData.rows.length} rows • {excelData.headers.length} columns
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={clearData}>
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
                <Button variant="gold" size="sm" onClick={() => navigate('/graphs')}>
                  Generate Graphs
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
            
            <div className="overflow-x-auto max-h-96">
              <UITable>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold w-12 text-center">#</TableHead>
                    {excelData.headers.map((header, index) => (
                      <TableHead key={index} className="font-semibold whitespace-nowrap">
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {excelData.rows.slice(0, 10).map((row, rowIndex) => (
                    <TableRow key={rowIndex} className="hover:bg-muted/30">
                      <TableCell className="text-center text-muted-foreground font-mono text-sm">
                        {rowIndex + 1}
                      </TableCell>
                      {excelData.headers.map((_, colIndex) => (
                        <TableCell key={colIndex} className="whitespace-nowrap">
                          {row[colIndex] ?? '-'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </UITable>
              {excelData.rows.length > 10 && (
                <div className="p-4 text-center text-sm text-muted-foreground bg-muted/30">
                  Showing first 10 of {excelData.rows.length} rows
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="bank-card p-6">
          <h3 className="font-semibold text-foreground mb-4">File Requirements</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Supported Formats</p>
                <p className="text-muted-foreground">Excel files (.xls, .xlsx)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
              <div>
                <p className="font-medium text-foreground">File Structure</p>
                <p className="text-muted-foreground">First row should contain headers</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Maximum Size</p>
                <p className="text-muted-foreground">Up to 10MB per file</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Data Types</p>
                <p className="text-muted-foreground">Numeric values recommended for charts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UploadPage;
