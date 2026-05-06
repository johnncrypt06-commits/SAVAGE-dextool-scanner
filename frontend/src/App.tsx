import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Overview from './pages/Overview';
import LivePositions from './pages/LivePositions';
import TradeHistory from './pages/TradeHistory';
import Performance from './pages/Performance';
import Settings from './pages/Settings';
import Wallet from './pages/Wallet';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/overview" element={<Overview />} />
          <Route path="/positions" element={<LivePositions />} />
          <Route path="/trades" element={<TradeHistory />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/wallet" element={<Wallet />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/overview" replace />} />
    </Routes>
  );
}
