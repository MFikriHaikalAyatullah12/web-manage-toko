'use client';

import { formatCurrency } from '@/lib/utils';
import { Transaction } from '@/types';

interface ReceiptProps {
  transaction: Transaction;
}

export function ReceiptPrint({ transaction }: ReceiptProps) {
  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    const content = generateReceiptHTML(transaction);
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <button
      onClick={handlePrint}
      className="px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 rounded-lg transition-all border border-green-200"
      title="Cetak Nota"
    >
      🖨️ Cetak
    </button>
  );
}

function generateReceiptHTML(transaction: Transaction): string {
  const date = new Date(transaction.date);
  const formattedDate = date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = date.toLocaleTimeString('id-ID');

  // Print version with proper print styles
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nota #${transaction.id}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Courier New', monospace;
      padding: 20px;
      max-width: 80mm;
      margin: 0 auto;
    }
    .receipt {
      border: 1px dashed #000;
      padding: 10px;
    }
    .header {
      text-align: center;
      margin-bottom: 10px;
      border-bottom: 1px dashed #000;
      padding-bottom: 10px;
    }
    .store-name {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .store-info {
      font-size: 11px;
    }
    .transaction-info {
      font-size: 11px;
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px dashed #000;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 3px;
    }
    .items {
      margin-bottom: 10px;
      border-bottom: 1px dashed #000;
      padding-bottom: 10px;
    }
    .item {
      margin-bottom: 8px;
      font-size: 11px;
    }
    .item-name {
      font-weight: bold;
    }
    .item-detail {
      display: flex;
      justify-content: space-between;
      margin-top: 2px;
    }
    .totals {
      font-size: 11px;
      margin-bottom: 10px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
    }
    .grand-total {
      font-size: 14px;
      font-weight: bold;
      margin-top: 5px;
      padding-top: 5px;
      border-top: 1px solid #000;
    }
    .footer {
      text-align: center;
      margin-top: 10px;
      font-size: 11px;
      border-top: 1px dashed #000;
      padding-top: 10px;
    }
    @media print {
      body {
        padding: 0;
      }
      .receipt {
        border: none;
      }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <div class="store-name">MANAGE TOKO</div>
      <div class="store-info">Sistem Manajemen Toko</div>
    </div>
    
    <div class="transaction-info">
      <div class="info-row">
        <span>No. Transaksi:</span>
        <strong>#${transaction.id}</strong>
      </div>
      <div class="info-row">
        <span>Tanggal:</span>
        <span>${formattedDate}</span>
      </div>
      <div class="info-row">
        <span>Waktu:</span>
        <span>${formattedTime}</span>
      </div>
      <div class="info-row">
        <span>Kasir:</span>
        <span>${transaction.cashierName}</span>
      </div>
      <div class="info-row">
        <span>Pembayaran:</span>
        <span>${transaction.paymentMethod === 'cash' ? 'Tunai' : transaction.paymentMethod === 'card' ? 'Kartu' : 'Transfer'}</span>
      </div>
    </div>
    
    <div class="items">
      ${(transaction.items || []).map(item => `
        <div class="item">
          <div class="item-name">${item.productName}</div>
          <div class="item-detail">
            <span>${item.quantity} x ${formatCurrency(item.price)}</span>
            <strong>${formatCurrency(item.total)}</strong>
          </div>
        </div>
      `).join('')}
    </div>
    
    <div class="totals">
      <div class="total-row">
        <span>Subtotal:</span>
        <span>${formatCurrency(transaction.subtotal)}</span>
      </div>
      ${transaction.tax ? `
      <div class="total-row">
        <span>Pajak:</span>
        <span>${formatCurrency(transaction.tax)}</span>
      </div>
      ` : ''}
      ${transaction.discount ? `
      <div class="total-row">
        <span>Diskon:</span>
        <span>-${formatCurrency(transaction.discount)}</span>
      </div>
      ` : ''}
      <div class="total-row grand-total">
        <span>TOTAL:</span>
        <strong>${formatCurrency(transaction.total)}</strong>
      </div>
    </div>
    
    <div class="footer">
      <div>Terima kasih atas kunjungan Anda!</div>
      <div>Barang yang sudah dibeli tidak dapat dikembalikan</div>
    </div>
  </div>
</body>
</html>
  `;
}
