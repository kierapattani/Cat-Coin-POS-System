import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../utils/api';
import { DailyStat } from '../utils/indexedDB';
import KawaiiCard from '../components/KawaiiCard';
import KawaiiButton from '../components/KawaiiButton';
import CatCharacter from '../components/CatCharacter';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, DollarSign, ShoppingBag, Cookie } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const { todayStats, setTodayStats, setCatMood } = useStore();
  const [weekStats, setWeekStats] = useState<DailyStat[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadStats();
    setCatMood('idle');
  }, []);

  const loadStats = async () => {
    try {
      const today = await api.getTodayStats();
      setTodayStats(today);

      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const stats = await api.getStatsRange(startDate, endDate);
      setWeekStats(stats.reverse());
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      await api.exportSalesCSV();
    } catch (error) {
      console.error('Export failed:', error);
    }
    setIsExporting(false);
  };

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      await api.exportSalesJSON();
    } catch (error) {
      console.error('Export failed:', error);
    }
    setIsExporting(false);
  };

  const chartData = weekStats.map(stat => ({
    date: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: stat.total_sales,
    orders: stat.order_count,
    treats: stat.treats_eaten,
  }));

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Sales Dashboard</h1>
          <p className="subtitle">Track your cat cafe success!</p>
        </div>
        <div className="header-cat">
          <CatCharacter />
        </div>
      </div>

      <div className="stats-grid">
        <KawaiiCard className="stat-card revenue">
          <div className="stat-icon">
            <DollarSign size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Today's Revenue</div>
            <div className="stat-value">${(todayStats?.total_sales || 0).toFixed(2)}</div>
          </div>
        </KawaiiCard>

        <KawaiiCard className="stat-card orders">
          <div className="stat-icon">
            <ShoppingBag size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Orders Today</div>
            <div className="stat-value">{todayStats?.order_count || 0}</div>
          </div>
        </KawaiiCard>

        <KawaiiCard className="stat-card treats">
          <div className="stat-icon">
            <Cookie size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Treats Eaten</div>
            <div className="stat-value">{todayStats?.treats_eaten || 0}</div>
          </div>
        </KawaiiCard>
      </div>

      <div className="charts-section">
        <KawaiiCard className="chart-card">
          <h2>Revenue Trend (Last 7 Days)</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFD6E8" />
                <XAxis dataKey="date" stroke="#8A7A9A" />
                <YAxis stroke="#8A7A9A" />
                <Tooltip
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '2px solid #FFD6E8',
                    borderRadius: '15px',
                    fontFamily: 'Quicksand',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#FFB5D6"
                  strokeWidth={3}
                  dot={{ fill: '#FF9CC5', r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </KawaiiCard>

        <KawaiiCard className="chart-card">
          <h2>Orders & Treats (Last 7 Days)</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFD6E8" />
                <XAxis dataKey="date" stroke="#8A7A9A" />
                <YAxis stroke="#8A7A9A" />
                <Tooltip
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '2px solid #FFD6E8',
                    borderRadius: '15px',
                    fontFamily: 'Quicksand',
                  }}
                />
                <Bar dataKey="orders" fill="#B5D6FF" radius={[10, 10, 0, 0]} />
                <Bar dataKey="treats" fill="#D6FFE8" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-color orders-color"></div>
              <span>Orders</span>
            </div>
            <div className="legend-item">
              <div className="legend-color treats-color"></div>
              <span>Treats</span>
            </div>
          </div>
        </KawaiiCard>
      </div>

      <KawaiiCard className="export-section">
        <h2>Export Sales Data</h2>
        <p>Download your sales history in CSV or JSON format</p>
        <div className="export-buttons">
          <KawaiiButton
            variant="primary"
            icon={<Download size={20} />}
            onClick={handleExportCSV}
            disabled={isExporting}
          >
            Export as CSV
          </KawaiiButton>
          <KawaiiButton
            variant="secondary"
            icon={<Download size={20} />}
            onClick={handleExportJSON}
            disabled={isExporting}
          >
            Export as JSON
          </KawaiiButton>
        </div>
      </KawaiiCard>

      <div className="end-of-day-cat">
        <div className="sleeping-cat">
          (=˘ω˘=)..zzZ
        </div>
        <p>Cat is resting on the coins...</p>
      </div>
    </div>
  );
}
