import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ExcelData {
  headers: string[];
  rows: (string | number)[][];
  fileName: string;
  uploadedAt: Date;
}

interface DataContextType {
  excelData: ExcelData | null;
  setExcelData: (data: ExcelData | null) => void;
  clearData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [excelData, setExcelData] = useState<ExcelData | null>(null);

  const clearData = () => {
    setExcelData(null);
  };

  return (
    <DataContext.Provider value={{ excelData, setExcelData, clearData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
