import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import FeaturesPage from './pages/FeaturesPage';
import ContactPage from './pages/ContactPage';
import SignupPage from './pages/SignupPage';
import OTPVerificationPage from './pages/OTPVerificationPage';
import LoginPage from './pages/LoginPage';
import ClientDashboard from './pages/ClientDashboard';
import FreelancerDashboard from './pages/FreelancerDashboard';
import ProfilePage from './pages/ProfilePage';
import CreateProjectPage from './pages/CreateProjectPage';
import ProjectListingPage from './pages/ProjectListingPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import QuizPage from './pages/QuizPage';
import BiddingLobbyPage from './pages/BiddingLobbyPage';
import LiveBiddingPage from './pages/LiveBiddingPage';
import BidResultsPage from './pages/BidResultsPage';
import MessagingPage from './pages/MessagingPage';
import MilestonePage from './pages/MilestonePage';
import PaymentPage from './pages/PaymentPage';
import SubscriptionPage from './pages/SubscriptionPage';
import ClosedCommunityPage from './pages/ClosedCommunityPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import FreelancerListingPage from './pages/FreelancerListingPage';

const DashboardRedirect = () => {
  const { user: authUser } = useAuth();
  const storedUser = JSON.parse(localStorage.getItem('lancera_user') || 'null');
  const user = authUser || storedUser;
  
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'client' ? <ClientDashboard /> : <FreelancerDashboard />;
};

const noFooterRoutes = ['/projects/', '/bid', '/lobby', '/quiz'];

import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-dark">
        <Navbar />
        <div className="pt-16">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify-otp" element={<OTPVerificationPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/projects" element={<ProjectListingPage />} />
            <Route path="/freelancers" element={<ProtectedRoute role="client"><FreelancerListingPage /></ProtectedRoute>} />
            <Route path="/projects/create" element={<ProtectedRoute role="client"><CreateProjectPage /></ProtectedRoute>} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/projects/:id/quiz" element={<ProtectedRoute role="freelancer"><QuizPage /></ProtectedRoute>} />
            <Route path="/projects/:id/lobby" element={<ProtectedRoute><BiddingLobbyPage /></ProtectedRoute>} />
            <Route path="/projects/:id/bid" element={<ProtectedRoute><LiveBiddingPage /></ProtectedRoute>} />
            <Route path="/projects/:id/results" element={<BidResultsPage />} />
            <Route path="/messages/direct/:userId" element={<ProtectedRoute aria-label="Direct Message"><MessagingPage /></ProtectedRoute>} />
            <Route path="/projects/:id/messages" element={<ProtectedRoute><MessagingPage /></ProtectedRoute>} />
            <Route path="/projects/:id/phases" element={<ProtectedRoute><MilestonePage /></ProtectedRoute>} />
            <Route path="/projects/:id/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
            <Route path="/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
            <Route path="/community/:id" element={<ProtectedRoute><ClosedCommunityPage /></ProtectedRoute>} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
