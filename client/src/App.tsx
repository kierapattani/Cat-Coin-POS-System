import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import POSRegister from './pages/POSRegister';
import Inventory from './pages/Inventory';
import Dashboard from './pages/Dashboard';
import CatPawAnimation from './components/CatPawAnimation';
import { ShoppingCart, Package, BarChart3 } from 'lucide-react';
import './App.css';

function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <div className="brand-logo">(=^・ω・^=)</div>
        <h1>Cat Coin Register</h1>
      </div>
      <div className="nav-links">
        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
          <ShoppingCart size={20} />
          <span>POS</span>
        </Link>
        <Link to="/inventory" className={`nav-link ${isActive('/inventory') ? 'active' : ''}`}>
          <Package size={20} />
          <span>Inventory</span>
        </Link>
        <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
          <BarChart3 size={20} />
          <span>Dashboard</span>
        </Link>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<POSRegister />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
        <CatPawAnimation />
        <div className="paw-prints">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="paw-print"
              style={{
                left: `${10 + i * 10}%`,
                top: `${20 + (i % 3) * 30}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.1, scale: 1 }}
              transition={{ delay: i * 0.2, duration: 0.5 }}
            >
              🐾
            </motion.div>
          ))}
        </div>
      </div>
    </Router>
  );
}

export default App;
