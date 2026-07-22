import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { JournalProvider } from '@/contexts/JournalContext';
import { ProtectedRoute } from '@/components/ui/ProtectedRoute';
import { LoginPage } from '@/components/auth/LoginPage';
import { JournalsPage } from '@/pages/JournalsPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { TradesPage } from '@/pages/TradesPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { AnalysisPage } from '@/pages/AnalysisPage';
import { ReportPage } from '@/pages/ReportPage';
import { SettingsPage } from '@/pages/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <JournalProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/journals"
                element={
                  <ProtectedRoute>
                    <JournalsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/journals/:id"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/journals/:id/trades"
                element={
                  <ProtectedRoute>
                    <TradesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/journals/:id/calendar"
                element={
                  <ProtectedRoute>
                    <CalendarPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/journals/:id/analysis"
                element={
                  <ProtectedRoute>
                    <AnalysisPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/journals/:id/report"
                element={
                  <ProtectedRoute>
                    <ReportPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/journals/:id/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/journals" replace />} />
            </Routes>
          </JournalProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
