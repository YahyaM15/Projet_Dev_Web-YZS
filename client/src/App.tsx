import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { ToastContainer } from './components/Toast';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Counters } from './pages/Counters';
import { CounterDetail } from './pages/CounterDetail';
import { Alerts } from './pages/Alerts';
import { Security } from './pages/Security';
import { MapPage } from './pages/MapPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/counters" element={<Counters />} />
            <Route path="/counters/:id" element={<CounterDetail />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/security" element={<Security />} />
            <Route path="/map" element={<MapPage />} />
          </Route>
        </Routes>
        <ToastContainer />
      </AuthProvider>
    </BrowserRouter>
  );
}
