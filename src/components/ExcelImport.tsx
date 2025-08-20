import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProductStore } from "@/lib/productStore";
import { sanitizeString, sanitizeNumber } from "@/lib/validation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import * as XLSX from 'xlsx';

interface ImportResult {
  successful: number;
  failed: number;
  errors: string[];
}

export function ExcelImport() {
  const { addProduct } = useProductStore();
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExcelImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setProgress(0);
    setIsDialogOpen(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error("Fayl oxuna bilmədi");
        }

        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        
        if (!firstSheetName) {
          throw new Error("Excel faylında sheet tapılmadı");
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          throw new Error("Excel faylında məlumat tapılmadı");
        }

        let importedCount = 0;
        let errorCount = 0;
        const errorMessages: string[] = [];

        // Process each row
        for (let index = 0; index < jsonData.length; index++) {
          const row = jsonData[index] as Record<string, unknown>;
          
          try {
            // Column mapping with flexible names
            const getColumnValue = (possibleNames: string[]): string | null => {
              const availableColumns = Object.keys(row);
              for (const name of possibleNames) {
                for (const col of availableColumns) {
                  if (col.toLowerCase().includes(name.toLowerCase()) || 
                      name.toLowerCase().includes(col.toLowerCase())) {
                    return row[col] ? String(row[col]).trim() : null;
                  }
                }
              }
              return null;
            };

            const article = getColumnValue(['artikul', 'article', 'kod', 'code']);
            const name = getColumnValue(['ad', 'name', 'məhsul', 'product']);
            const category = getColumnValue(['kateqoriya', 'category', 'tip', 'type']);
            const stockValue = getColumnValue(['stok', 'stock', 'miqdar', 'quantity']);
            const unit = getColumnValue(['vahid', 'unit', 'ölçü']);

            // Validation
            if (!article || !name) {
              errorMessages.push(`Sətir ${index + 1}: Artikul və ya məhsul adı boşdur`);
              errorCount++;
              continue;
            }

            // Create product object
            const product = {
              id: sanitizeString(article),
              article: sanitizeString(article),
              name: sanitizeString(name),
              category: sanitizeString(category || ""),
              status: "active" as const,
              stock: sanitizeNumber(stockValue || "0"),
              unit: sanitizeString(unit || ""),
              packaging: [],
              warehouses: [],
              description: ""
            };

            addProduct(product);
            importedCount++;

          } catch (error) {
            errorCount++;
            const errorMsg = error instanceof Error ? error.message : "Naməlum xəta";
            errorMessages.push(`Sətir ${index + 1}: ${errorMsg}`);
          }

          // Update progress
          setProgress(((index + 1) / jsonData.length) * 100);
        }

        setImportResult({
          successful: importedCount,
          failed: errorCount,
          errors: errorMessages.slice(0, 10) // Show only first 10 errors
        });

        if (importedCount > 0) {
          toast({
            title: "İdxal tamamlandı",
            description: `${importedCount} məhsul uğurla idxal edildi. ${errorCount} xəta.`,
          });
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Excel faylı oxunarkən xəta baş verdi";
        setImportResult({
          successful: 0,
          failed: 1,
          errors: [errorMessage]
        });
        
        toast({
          title: "İdxal xətası",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setIsImporting(false);
        // Reset file input
        event.target.value = '';
      }
    };

    reader.readAsBinaryString(file);
  };

  const resetDialog = () => {
    setImportResult(null);
    setProgress(0);
    setIsDialogOpen(false);
  };

  return (
    <>
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleExcelImport}
        className="hidden"
        id="excel-import"
      />
      
      <Button
        variant="outline" 
        size="sm"
        onClick={() => document.getElementById('excel-import')?.click()}
        className="flex items-center gap-2"
        disabled={isImporting}
      >
        <Upload className="h-4 w-4" />
        Excel İdxal
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Excel İdxal
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {isImporting ? (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Məhsullar idxal edilir...
                </div>
                <Progress value={progress} className="h-2" />
                <div className="text-center text-sm">
                  {Math.round(progress)}% tamamlandı
                </div>
              </div>
            ) : importResult ? (
              <div className="space-y-4">
                <div className="grid gap-3">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span className="text-sm">Uğurlu</span>
                        </div>
                        <Badge variant="secondary">{importResult.successful}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {importResult.failed > 0 && (
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            <span className="text-sm">Xəta</span>
                          </div>
                          <Badge variant="destructive">{importResult.failed}</Badge>
                        </div>
                        
                        {importResult.errors.length > 0 && (
                          <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                            {importResult.errors.map((error, index) => (
                              <div key={`error-${error.slice(0, 20)}-${index}`} className="text-xs text-muted-foreground bg-muted p-2 rounded">
                                {error}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={resetDialog}>
                    Bağla
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}