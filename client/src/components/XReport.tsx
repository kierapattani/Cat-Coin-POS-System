import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import './XReport.css';

interface XReportProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ReportData {
  currentDate: string;
  currentTime: string;
  totalTransactions: number;
  cashTransactions: number;
  cardTransactions: number;
  totalSales: number;
  cashSales: number;
  cardSales: number;
  taxCollected: number;
}

export default function XReport({ isOpen, onClose }: XReportProps) {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      generateReport();
    }
  }, [isOpen]);

  const generateReport = async () => {
    setLoading(true);
    try {
      const sales = await api.getSales();
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      const todaySales = sales.filter(sale =>
        sale.created_at?.startsWith(todayStr)
      );

      const cashSales = todaySales.filter(s => s.payment_method === 'cash');
      const cardSales = todaySales.filter(s => s.payment_method === 'card');

      const reportData: ReportData = {
        currentDate: today.toLocaleDateString(),
        currentTime: today.toLocaleTimeString(),
        totalTransactions: todaySales.length,
        cashTransactions: cashSales.length,
        cardTransactions: cardSales.length,
        totalSales: todaySales.reduce((sum, s) => sum + s.total, 0),
        cashSales: cashSales.reduce((sum, s) => sum + s.total, 0),
        cardSales: cardSales.reduce((sum, s) => sum + s.total, 0),
        taxCollected: todaySales.reduce((sum, s) => sum + s.tax, 0),
      };

      setReportData(reportData);
    } catch (error) {
      console.error('Failed to generate X-Report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="xreport-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="xreport-container"
            initial={{ scale: 0.8, y: -100 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: -100 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="xreport-header">
              <h2 className="xreport-title">📊 X-Report</h2>
              <button className="xreport-close" onClick={onClose}>
                <X size={24} />
              </button>
            </div>

            {loading ? (
              <div className="xreport-loading">
                <div className="loading-spinner">█▓▒░</div>
                <p>GENERATING REPORT...</p>
              </div>
            ) : reportData ? (
              <div className="xreport-content">
                <div className="receipt-paper">
                  <div className="receipt-header">
                    <div className="ascii-cat">(=^・ω・^=)</div>
                    <div className="receipt-title">
                      ♡ Cat Coin POS ♡<br />
                      X-REPORT
                    </div>
                  </div>

                  <div className="receipt-divider"></div>

                  <div className="receipt-line">
                    <span className="label">DATE:</span>
                    <span className="value">{reportData.currentDate}</span>
                  </div>
                  <div className="receipt-line">
                    <span className="label">TIME:</span>
                    <span className="value">{reportData.currentTime}</span>
                  </div>

                  <div className="receipt-divider"></div>
                  <div className="receipt-section-title">💳 Transactions</div>

                  <div className="receipt-line">
                    <span className="label">TOTAL TXN:</span>
                    <span className="value">{reportData.totalTransactions}</span>
                  </div>
                  <div className="receipt-line indent">
                    <span className="label">└─ CASH:</span>
                    <span className="value">{reportData.cashTransactions}</span>
                  </div>
                  <div className="receipt-line indent">
                    <span className="label">└─ CARD:</span>
                    <span className="value">{reportData.cardTransactions}</span>
                  </div>

                  <div className="receipt-divider"></div>
                  <div className="receipt-section-title">💰 Sales Totals</div>

                  <div className="receipt-line highlight">
                    <span className="label">TOTAL SALES:</span>
                    <span className="value">${reportData.totalSales.toFixed(2)}</span>
                  </div>
                  <div className="receipt-line indent">
                    <span className="label">└─ CASH:</span>
                    <span className="value">${reportData.cashSales.toFixed(2)}</span>
                  </div>
                  <div className="receipt-line indent">
                    <span className="label">└─ CARD:</span>
                    <span className="value">${reportData.cardSales.toFixed(2)}</span>
                  </div>

                  <div className="receipt-divider"></div>

                  <div className="receipt-line">
                    <span className="label">Tax Collected:</span>
                    <span className="value">${reportData.taxCollected.toFixed(2)}</span>
                  </div>

                  <div className="receipt-divider"></div>
                  <div className="receipt-footer">
                    <p>✨ End of X-Report ✨</p>
                    <p className="note">Register not cleared</p>
                    <p className="note">Run Z-Report at end of day</p>
                  </div>

                  <div className="receipt-barcode">
                    ▓▓░░▓▓░░▓▓░░▓▓
                  </div>
                </div>

                <button className="print-button" onClick={handlePrint}>
                  <Printer size={20} />
                  <span>PRINT REPORT</span>
                </button>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
