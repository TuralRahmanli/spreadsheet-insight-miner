import jsPDF from 'jspdf';
import { Product } from '@/types';

export interface PDFOptions {
  title: string;
  date?: string;
  company?: string;
  footer?: string;
  orientation?: 'portrait' | 'landscape';
  fontSize?: {
    title?: number;
    heading?: number;
    body?: number;
    small?: number;
  };
}

export class PDFGenerator {
  private doc: jsPDF;
  private yPosition: number = 20;
  private options: PDFOptions;

  constructor(options: PDFOptions) {
    this.doc = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    this.options = {
      fontSize: {
        title: 20,
        heading: 14,
        body: 12,
        small: 10,
        ...options.fontSize
      },
      ...options
    };
    this.setupDocument();
  }

  private setupDocument() {
    // Set default font
    this.doc.setFont("helvetica");
    
    // Add title
    this.doc.setFontSize(this.options.fontSize?.title || 20);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(this.options.title, 20, this.yPosition);
    this.yPosition += 15;

    // Add company name if provided
    if (this.options.company) {
      this.doc.setFontSize(this.options.fontSize?.body || 12);
      this.doc.setFont("helvetica", "normal");
      this.doc.text(this.options.company, 20, this.yPosition);
      this.yPosition += 10;
    }

    // Add date
    const dateStr = this.options.date || new Date().toLocaleDateString('az-AZ');
    this.doc.setFontSize(this.options.fontSize?.small || 10);
    this.doc.text(`Tarix: ${dateStr}`, 20, this.yPosition);
    this.yPosition += 15;
  }

  addHeading(text: string, level: 1 | 2 | 3 = 1) {
    this.checkPageBreak(10);
    
    const fontSize = level === 1 ? (this.options.fontSize?.heading || 14) : 
                    level === 2 ? (this.options.fontSize?.body || 12) : 
                    (this.options.fontSize?.small || 10);
    
    this.doc.setFontSize(fontSize);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(text, 20, this.yPosition);
    this.yPosition += level === 1 ? 12 : level === 2 ? 10 : 8;
    this.doc.setFont("helvetica", "normal");
  }

  addText(text: string, indent: number = 0) {
    this.checkPageBreak(6);
    
    this.doc.setFontSize(this.options.fontSize?.body || 12);
    const lines = this.doc.splitTextToSize(text, 170 - indent);
    
    for (const line of lines) {
      this.checkPageBreak(6);
      this.doc.text(line, 20 + indent, this.yPosition);
      this.yPosition += 6;
    }
  }

  addTable(headers: string[], rows: string[][], options?: {
    columnWidths?: number[];
    headerBackground?: boolean;
  }) {
    const columnWidths = options?.columnWidths || 
      headers.map(() => 170 / headers.length);
    const rowHeight = 8;
    const headerHeight = 10;

    this.checkPageBreak(headerHeight + (rows.length * rowHeight));

    let xPosition = 20;

    // Draw headers
    if (options?.headerBackground) {
      this.doc.setFillColor(240, 240, 240);
      this.doc.rect(20, this.yPosition - 2, 170, headerHeight, 'F');
    }

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(this.options.fontSize?.body || 12);
    
    headers.forEach((header, index) => {
      this.doc.text(header, xPosition + 2, this.yPosition + 6);
      
      // Draw column borders
      this.doc.rect(xPosition, this.yPosition - 2, columnWidths[index], headerHeight);
      xPosition += columnWidths[index];
    });

    this.yPosition += headerHeight;

    // Draw rows
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(this.options.fontSize?.small || 10);

    rows.forEach(row => {
      this.checkPageBreak(rowHeight);
      xPosition = 20;

      row.forEach((cell, index) => {
        // Truncate long text
        const truncatedText = cell.length > 20 ? cell.substring(0, 17) + '...' : cell;
        this.doc.text(truncatedText, xPosition + 2, this.yPosition + 5);
        
        // Draw cell borders
        this.doc.rect(xPosition, this.yPosition - 2, columnWidths[index], rowHeight);
        xPosition += columnWidths[index];
      });

      this.yPosition += rowHeight;
    });

    this.yPosition += 5; // Space after table
  }

  addProductsTable(products: Product[]) {
    const headers = ['Artikul', 'Məhsul Adı', 'Kateqoriya', 'Stok', 'Vahid', 'Status'];
    const rows = products.map(product => [
      product.article,
      product.name.length > 25 ? product.name.substring(0, 22) + '...' : product.name,
      product.category,
      product.stock.toString(),
      product.unit,
      product.status === 'active' ? 'Aktiv' : 
      product.status === 'out_of_stock' ? 'Bitib' : 'Az qalıb'
    ]);

    this.addTable(headers, rows, {
      columnWidths: [25, 45, 25, 20, 20, 25],
      headerBackground: true
    });
  }

  addSummary(data: { label: string; value: string | number }[]) {
    this.addHeading('Xülasə', 2);
    
    data.forEach(item => {
      this.checkPageBreak(6);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(`${item.label}:`, 20, this.yPosition);
      this.doc.setFont("helvetica", "normal");
      this.doc.text(String(item.value), 80, this.yPosition);
      this.yPosition += 8;
    });
  }

  private checkPageBreak(requiredSpace: number) {
    if (this.yPosition + requiredSpace > 280) { // A4 height - margin
      this.doc.addPage();
      this.yPosition = 20;
    }
  }

  private addFooter() {
    const pageCount = this.doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(this.options.fontSize?.small || 10);
      this.doc.setFont("helvetica", "normal");
      
      // Page number
      this.doc.text(`Səhifə ${i} / ${pageCount}`, 20, 290);
      
      // Footer text
      if (this.options.footer) {
        this.doc.text(this.options.footer, 200 - this.doc.getTextWidth(this.options.footer), 290);
      }
      
      // Generation date
      const dateStr = new Date().toLocaleString('az-AZ');
      this.doc.text(`Yaradılma tarixi: ${dateStr}`, 105 - this.doc.getTextWidth(`Yaradılma tarixi: ${dateStr}`) / 2, 290);
    }
  }

  save(filename: string) {
    this.addFooter();
    this.doc.save(filename);
  }

  getBlob(): Blob {
    this.addFooter();
    return this.doc.output('blob');
  }

  getPDF(): jsPDF {
    this.addFooter();
    return this.doc;
  }

  print() {
    this.addFooter();
    const pdfBlob = this.doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    
    if (typeof window !== 'undefined') {
      const printWindow = window.open(url);
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
          URL.revokeObjectURL(url);
        };
      } else {
        URL.revokeObjectURL(url);
      }
    }
  }
}