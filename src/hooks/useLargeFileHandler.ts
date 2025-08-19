import { useState, useCallback, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

interface FileProcessingOptions {
  chunkSize?: number;
  maxFileSize?: number;
  allowedTypes?: string[];
  onProgress?: (progress: number) => void;
  onChunkProcessed?: (chunk: any[], chunkIndex: number) => void;
}

interface ProcessingResult<T> {
  data: T[];
  totalRows: number;
  processedRows: number;
  errors: string[];
  duration: number;
}

const DEFAULT_OPTIONS: Required<FileProcessingOptions> = {
  chunkSize: 1000,
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedTypes: ['.xlsx', '.xls', '.csv', '.json'],
  onProgress: () => {},
  onChunkProcessed: () => {}
};

export function useLargeFileHandler<T = any>(options: FileProcessingOptions = {}) {
  const finalOptions = { ...DEFAULT_OPTIONS, ...options };
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [processingStats, setProcessingStats] = useState({
    totalSize: 0,
    processedSize: 0,
    estimatedTimeLeft: 0,
    speed: 0
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number>(0);

  // Validate file before processing
  const validateFile = useCallback((file: File): boolean => {
    // Check file size
    if (file.size > finalOptions.maxFileSize) {
      toast({
        title: "Fayl çox böyükdür",
        description: `Maksimum fayl ölçüsü: ${finalOptions.maxFileSize / (1024 * 1024)}MB`,
        variant: "destructive"
      });
      return false;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!finalOptions.allowedTypes.includes(fileExtension || '')) {
      toast({
        title: "Fayl formatı dəstəklənmir",
        description: `Dəstəklənən formatlar: ${finalOptions.allowedTypes.join(', ')}`,
        variant: "destructive"
      });
      return false;
    }

    return true;
  }, [finalOptions]);

  // Process Excel/CSV files in chunks
  const processSpreadsheetFile = useCallback(async (
    file: File,
    options: FileProcessingOptions = {}
  ): Promise<ProcessingResult<T>> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const errors: string[] = [];
      let allData: T[] = [];
      let totalRows = 0;

      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          if (!data) throw new Error('Fayl oxuna bilmədi');

          // Dynamic import to avoid loading heavy libraries upfront
          const XLSX = await import('xlsx');
          
          const workbook = XLSX.read(data, { 
            type: 'array',
            cellText: true,
            cellNF: false,
            cellHTML: false
          });

          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to JSON with header row
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            raw: false,
            defval: ''
          });

          if (jsonData.length === 0) {
            throw new Error('Fayl boşdur və ya oxuna bilmir');
          }

          totalRows = jsonData.length - 1; // Exclude header
          const headerRow = jsonData[0] as string[];
          
          // Process in chunks
          for (let i = 1; i < jsonData.length; i += finalOptions.chunkSize) {
            // Check if processing was aborted
            if (abortControllerRef.current?.signal.aborted) {
              throw new Error('Əməliyyat dayandırıldı');
            }

            const chunk = jsonData.slice(i, i + finalOptions.chunkSize) as any[][];
            const processedChunk: T[] = [];

            chunk.forEach((row, index) => {
              try {
                const obj: any = {};
                headerRow.forEach((header, colIndex) => {
                  obj[header] = row[colIndex] || '';
                });
                processedChunk.push(obj);
              } catch (error) {
                errors.push(`Sətir ${i + index}: ${error}`);
              }
            });

            allData.push(...processedChunk);
            
            const currentProgress = ((i + chunk.length - 1) / totalRows) * 100;
            setProgress(currentProgress);
            finalOptions.onProgress?.(currentProgress);
            finalOptions.onChunkProcessed?.(processedChunk, Math.floor(i / finalOptions.chunkSize));

            // Update processing stats
            const processedSize = ((i + chunk.length - 1) / totalRows) * file.size;
            const elapsed = Date.now() - startTimeRef.current;
            const speed = processedSize / elapsed * 1000; // bytes per second
            const estimatedTimeLeft = speed > 0 ? (file.size - processedSize) / speed : 0;

            setProcessingStats({
              totalSize: file.size,
              processedSize,
              estimatedTimeLeft,
              speed
            });

            // Allow UI to update
            await new Promise(resolve => setTimeout(resolve, 10));
          }

          const duration = Date.now() - startTimeRef.current;

          resolve({
            data: allData,
            totalRows,
            processedRows: allData.length,
            errors,
            duration
          });

        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Fayl oxunma xətası'));
      };

      reader.readAsArrayBuffer(file);
    });
  }, [finalOptions]);

  // Process JSON file
  const processJSONFile = useCallback(async (
    file: File
  ): Promise<ProcessingResult<T>> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const jsonText = e.target?.result as string;
          const data = JSON.parse(jsonText);
          
          const arrayData = Array.isArray(data) ? data : [data];
          const duration = Date.now() - startTimeRef.current;

          resolve({
            data: arrayData,
            totalRows: arrayData.length,
            processedRows: arrayData.length,
            errors: [],
            duration
          });
        } catch (error) {
          reject(new Error('JSON fayl formatı yanlışdır'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Fayl oxunma xətası'));
      };

      reader.readAsText(file);
    });
  }, []);

  // Main processing function
  const processFile = useCallback(async (
    file: File,
    options: FileProcessingOptions = {}
  ): Promise<ProcessingResult<T>> => {
    if (!validateFile(file)) {
      throw new Error('Fayl validasiyası uğursuz');
    }

    setIsProcessing(true);
    setCurrentFile(file);
    setProgress(0);
    startTimeRef.current = Date.now();
    abortControllerRef.current = new AbortController();

    const mergedOptions = { ...finalOptions, ...options };

    try {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      let result: ProcessingResult<T>;

      toast({
        title: "Fayl emal edilir",
        description: `${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)`,
      });

      switch (fileExtension) {
        case '.xlsx':
        case '.xls':
        case '.csv':
          result = await processSpreadsheetFile(file, mergedOptions);
          break;
        case '.json':
          result = await processJSONFile(file);
          break;
        default:
          throw new Error('Fayl formatı dəstəklənmir');
      }

      toast({
        title: "Fayl uğurla emal edildi",
        description: `${result.processedRows} sətir emal edildi (${(result.duration / 1000).toFixed(1)}s)`,
      });

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Naməlum xəta';
      
      toast({
        title: "Fayl emal xətası",
        description: errorMessage,
        variant: "destructive"
      });

      throw error;
    } finally {
      setIsProcessing(false);
      setCurrentFile(null);
      setProgress(0);
      setProcessingStats({
        totalSize: 0,
        processedSize: 0,
        estimatedTimeLeft: 0,
        speed: 0
      });
      abortControllerRef.current = null;
    }
  }, [validateFile, finalOptions, processSpreadsheetFile, processJSONFile]);

  // Abort current processing
  const abortProcessing = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      
      toast({
        title: "Əməliyyat dayandırıldı",
        description: "Fayl emalı istifadəçi tərəfindən dayandırıldı",
      });
    }
  }, []);

  // Export data to file
  const exportToFile = useCallback(async (
    data: T[],
    filename: string,
    format: 'xlsx' | 'csv' | 'json' = 'xlsx'
  ): Promise<void> => {
    try {
      let blob: Blob;
      let mimeType: string;
      let fileExtension: string;

      switch (format) {
        case 'xlsx': {
          const XLSX = await import('xlsx');
          const worksheet = XLSX.utils.json_to_sheet(data);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
          const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
          blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          fileExtension = '.xlsx';
          break;
        }
        case 'csv': {
          const XLSX = await import('xlsx');
          const worksheet = XLSX.utils.json_to_sheet(data);
          const csvData = XLSX.utils.sheet_to_csv(worksheet);
          blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
          mimeType = 'text/csv';
          fileExtension = '.csv';
          break;
        }
        case 'json': {
          const jsonData = JSON.stringify(data, null, 2);
          blob = new Blob([jsonData], { type: 'application/json' });
          mimeType = 'application/json';
          fileExtension = '.json';
          break;
        }
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename.includes('.') ? filename : `${filename}${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Fayl ixrac edildi",
        description: `${data.length} sətir ${format.toUpperCase()} formatında ixrac edildi`,
      });

    } catch (error) {
      toast({
        title: "İxrac xətası",
        description: "Fayl ixrac edilərkən xəta baş verdi",
        variant: "destructive"
      });
      throw error;
    }
  }, []);

  return {
    // State
    isProcessing,
    progress,
    currentFile,
    processingStats,
    
    // Actions
    processFile,
    abortProcessing,
    exportToFile,
    validateFile,
    
    // Options
    options: finalOptions
  };
}