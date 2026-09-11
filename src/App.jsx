import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import LoginPage from './components/auth/LoginPage';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import AddExpense from './pages/AddExpense';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sapphire-950 via-sapphire-900 to-sapphire-850 flex flex-col items-center justify-center p-6">
      <div className="w-20 h-20 rounded-2xl bg-sapphire-900 border-2 border-amber-400/50 p-2 shadow-2xl flex items-center justify-center mb-5 animate-pulse-subtle">
        <img src="/logo.png" alt="SE Trading" className="w-full h-full object-contain rounded-xl" />
      </div>
      <div className="w-6 h-6 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mb-3" />
      <p className="text-xs font-black tracking-widest text-white uppercase">SE TRADING</p>
      <p className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase">Service Is Our Priority</p>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/add-expense" element={<AddExpense />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/reports" element={<Reports />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '16px',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '13px',
              fontWeight: '600',
              boxShadow: '0 10px 25px -5px rgba(15, 43, 92, 0.2)',
              border: '1px solid rgba(224, 236, 249, 0.8)',
              padding: '12px 16px',
            },
            success: {
              style: {
                background: '#152d5b',
                color: '#fef3c7',
                border: '1px solid rgba(245, 158, 11, 0.4)',
              },
              iconTheme: {
                primary: '#f59e0b',
                secondary: '#152d5b',
              },
            },
            error: {
              style: {
                background: '#fff1f2',
                color: '#9f1239',
                border: '1px solid #fecdd3',
              },
              iconTheme: {
                primary: '#e11d48',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
