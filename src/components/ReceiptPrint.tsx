'use client';

import { formatCurrency } from '@/lib/utils';
import { Transaction } from '@/types';
import { jsPDF } from 'jspdf';

interface ReceiptProps {
  transaction: Transaction;
}

export function ReceiptPrint({ transaction }: ReceiptProps) {
  const handleDownload = () => {
    const date = new Date(transaction.date);
    const formattedDate = date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const formattedTime = date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });

    let yPos = 5;
    const leftMargin = 3;
    const pageWidth = 58;
    
    // First pass: Calculate required height
    let calculatedHeight = yPos;
    
    // Header space
    calculatedHeight += 4 + 4 + 3; // title + subtitle + line
    
    // Transaction info
    calculatedHeight += 3 * 5 + 3; // 5 lines of info + line
    
    // Items
    (transaction.items || []).forEach(() => {
      calculatedHeight += 3 + 4; // product name + detail line
    });
    calculatedHeight += 3; // dashed line
    
    // Totals
    calculatedHeight += 3; // subtotal
    if (transaction.tax) calculatedHeight += 3;
    if (transaction.discount) calculatedHeight += 3;
    calculatedHeight += 1 + 2 + 5; // grand total spacing
    
    // Footer
    calculatedHeight += 3 + 3 + 3 + 2.5 + 5; // lines + padding
    
    // Create PDF document with calculated height
    const doc = new jsPDF({
      unit: 'mm',
      format: [58, calculatedHeight]
    });
    
    // Reset yPos for actual rendering
    yPos = 5;
    
    // Helper function to add centered text
    const addCenteredText = (text: string, y: number, fontSize: number = 8) => {
      doc.setFontSize(fontSize);
      const textWidth = doc.getTextWidth(text);
      const x = (pageWidth - textWidth) / 2;
      doc.text(text, x, y);
    };

    // Helper function to add dashed line
    const addDashedLine = (y: number) => {
      // Draw dashed line using small segments
      const dashWidth = 1;
      const gapWidth = 1;
      let x = leftMargin;
      while (x < pageWidth - leftMargin) {
        doc.line(x, y, Math.min(x + dashWidth, pageWidth - leftMargin), y);
        x += dashWidth + gapWidth;
      }
    };

    // Header
    doc.setFont('helvetica', 'bold');
    addCenteredText('MANAGE TOKO', yPos, 10);
    yPos += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    addCenteredText('Sistem Manajemen Toko', yPos);
    yPos += 4;
    addDashedLine(yPos);
    yPos += 3;

    // Transaction Info
    doc.setFontSize(7);
    doc.text(`No: #${transaction.id}`, leftMargin, yPos);
    yPos += 3;
    doc.text(`Tanggal: ${formattedDate}`, leftMargin, yPos);
    yPos += 3;
    doc.text(`Waktu: ${formattedTime}`, leftMargin, yPos);
    yPos += 3;
    doc.text(`Kasir: ${transaction.cashierName}`, leftMargin, yPos);
    yPos += 3;
    const paymentMethod = transaction.paymentMethod === 'cash' ? 'Tunai' : 
                         transaction.paymentMethod === 'card' ? 'Kartu' : 'Transfer';
    doc.text(`Bayar: ${paymentMethod}`, leftMargin, yPos);
    yPos += 3;
    addDashedLine(yPos);
    yPos += 3;

    // Items
    doc.setFontSize(7);
    (transaction.items || []).forEach(item => {
      // Product name (wrapped if too long)
      doc.setFont('helvetica', 'bold');
      const productNameLines = doc.splitTextToSize(item.productName, pageWidth - 6);
      doc.text(productNameLines, leftMargin, yPos);
      yPos += productNameLines.length * 3;
      
      // Quantity x Price = Total
      doc.setFont('helvetica', 'normal');
      const itemDetail = `${item.quantity} x ${formatCurrency(item.price)}`;
      const itemTotal = formatCurrency(item.total);
      doc.text(itemDetail, leftMargin, yPos);
      
      const totalWidth = doc.getTextWidth(itemTotal);
      doc.text(itemTotal, pageWidth - leftMargin - totalWidth, yPos);
      yPos += 4;
    });

    addDashedLine(yPos);
    yPos += 3;

    // Totals
    doc.setFontSize(7);
    const subtotalLabel = 'Subtotal:';
    const subtotalValue = formatCurrency(transaction.subtotal);
    doc.text(subtotalLabel, leftMargin, yPos);
    doc.text(subtotalValue, pageWidth - leftMargin - doc.getTextWidth(subtotalValue), yPos);
    yPos += 3;

    if (transaction.tax) {
      const taxLabel = 'Pajak:';
      const taxValue = formatCurrency(transaction.tax);
      doc.text(taxLabel, leftMargin, yPos);
      doc.text(taxValue, pageWidth - leftMargin - doc.getTextWidth(taxValue), yPos);
      yPos += 3;
    }

    if (transaction.discount) {
      const discountLabel = 'Diskon:';
      const discountValue = `-${formatCurrency(transaction.discount)}`;
      doc.text(discountLabel, leftMargin, yPos);
      doc.text(discountValue, pageWidth - leftMargin - doc.getTextWidth(discountValue), yPos);
      yPos += 3;
    }

    // Grand Total
    yPos += 1;
    doc.setLineWidth(0.3);
    doc.line(leftMargin, yPos - 1, pageWidth - leftMargin, yPos - 1);
    yPos += 2;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    const totalLabel = 'TOTAL:';
    const totalValue = formatCurrency(transaction.total);
    doc.text(totalLabel, leftMargin, yPos);
    doc.text(totalValue, pageWidth - leftMargin - doc.getTextWidth(totalValue), yPos);
    yPos += 5;

    // Footer
    addDashedLine(yPos);
    yPos += 3;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    addCenteredText('Terima kasih atas kunjungan Anda!', yPos);
    yPos += 3;
    addCenteredText('Barang yang sudah dibeli', yPos);
    yPos += 2.5;
    addCenteredText('tidak dapat dikembalikan', yPos);

    // Save PDF
    const fileName = `Kwitansi_#${transaction.id}_${formattedDate.replace(/\//g, '-')}.pdf`;
    doc.save(fileName);
  };

  return (
    <button
      onClick={handleDownload}
      className="px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 rounded-lg transition-all border border-green-200"
      title="Download Kwitansi PDF"
    >
      📥 PDF
    </button>
  );
}
