import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { LanguageProvider } from './contexts/LanguageContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import ScrollToTop from './components/common/ScrollToTop';
import FloatingScrollButton from './components/common/FloatingScrollButton';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ModulesPage from './pages/modules/ModulesPage';
import ModuleDetailPage from './pages/modules/ModuleDetailPage';
import QuizPage from './pages/modules/QuizPage';
import DrillsPage from './pages/drills/DrillsPage';
import EnhancedDrillsPage from './pages/drills/EnhancedDrillsPage';
import DrillDetailPage from './pages/drills/DrillDetailPage';
import LeaderboardPage from './pages/gamification/LeaderboardPage';
import BadgesPage from './pages/gamification/BadgesPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import HazardAlertsPage from './pages/HazardAlertsPage';
import EmergencyContactsPage from './pages/EmergencyContactsPage';
import NotFoundPage from './pages/NotFoundPage';
import HelpCenterPage from './pages/support/HelpCenterPage';
import ContactPage from './pages/support/ContactPage';
import ReportIssuePage from './pages/support/ReportIssuePage';
import EvacuationVisualizationPage from './pages/drills/EvacuationVisualizationPage';
import FamilyDashboard from './pages/family/FamilyDashboard';
// import AuthDebug from './components/debug/AuthDebug'; // Removed for production

// Styles
import './App.css';

function App() {
  return (
    <div className="App min-h-screen flex flex-col bg-gray-50">
      <LanguageProvider>
        <AuthProvider>
          <SocketProvider>
            <Router>
              <ScrollToTop />
              <div className="flex-1 flex flex-col">
                <Navbar />
              
              <main className="flex-1">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/modules" element={<ModulesPage />} />
                  <Route path="/modules/:id" element={<ModuleDetailPage />} />
                  <Route path="/leaderboard" element={<LeaderboardPage />} />
                  <Route path="/badges" element={<BadgesPage />} />
                  <Route path="/hazard-alerts" element={<HazardAlertsPage />} />
                  <Route path="/emergency-contacts" element={<EmergencyContactsPage />} />
                  <Route path="/help" element={<HelpCenterPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/report-issue" element={<ReportIssuePage />} />

                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/modules/:id/quiz" element={
                    <ProtectedRoute>
                      <QuizPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/drills" element={
                    <ProtectedRoute>
                      <EnhancedDrillsPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/drills/basic" element={
                    <ProtectedRoute>
                      <DrillsPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/drills/:sessionId" element={
                    <ProtectedRoute>
                      <DrillDetailPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/drills/visualization" element={
                    <ProtectedRoute>
                      <EvacuationVisualizationPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/family" element={
                    <ProtectedRoute>
                      <FamilyDashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } />

                  {/* Admin Routes */}
                  <Route path="/admin/*" element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />

                  {/* 404 Route */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              
              <Footer />
            </div>
            {/* Floating scroll to top button */}
            <FloatingScrollButton />
            {/* <AuthDebug /> */}
            </Router>
          </SocketProvider>
        </AuthProvider>
      </LanguageProvider>
    </div>
  );
}

export default App;
