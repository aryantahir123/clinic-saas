import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManageDoctors = lazy(() => import('./pages/admin/ManageDoctors'));
const ManageReceptionists = lazy(() => import('./pages/admin/ManageReceptionists'));
const SubscriptionPlans = lazy(() => import('./pages/admin/SubscriptionPlans'));
const AnalyticsDashboard = lazy(() => import('./pages/admin/AnalyticsDashboard'));

// Receptionist Pages
const ReceptionistDashboard = lazy(() => import('./pages/receptionist/ReceptionistDashboard'));
const RegisterPatient = lazy(() => import('./pages/receptionist/RegisterPatient'));
const BookAppointment = lazy(() => import('./pages/receptionist/BookAppointment'));
const DailySchedule = lazy(() => import('./pages/receptionist/DailySchedule'));

// Doctor Pages
const DoctorDashboard = lazy(() => import('./pages/doctor/DoctorDashboard'));
const MyAppointments = lazy(() => import('./pages/doctor/MyAppointments'));
const PatientDetail = lazy(() => import('./pages/doctor/PatientDetail'));
const AddDiagnosis = lazy(() => import('./pages/doctor/AddDiagnosis'));

// Patient Pages
const PatientDashboard = lazy(() => import('./pages/patient/PatientDashboard'));
const PatientAppointments = lazy(() => import('./pages/patient/MyAppointments'));
const PatientPrescriptions = lazy(() => import('./pages/patient/MyPrescriptions'));
const PatientProfile = lazy(() => import('./pages/patient/MyProfile'));
const PatientHistory = lazy(() => import('./pages/patient/MedicalHistory'));

// Protected Access Wrappers
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleRoute from './components/common/RoleRoute';

// Dashboard Placeholders
import DashboardPlaceholder from './pages/DashboardPlaceholder';
import { Loader2 } from 'lucide-react';

/**
 * Helper to dynamically redirect root requests (/) to role-appropriate dashboards
 */
const RootRedirect = () => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={`/${user.role}/dashboard`} replace />;
};

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // 1. Initialize user session state on application load
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // 2. Global full-screen session checking screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute w-80 h-80 rounded-full bg-indigo-500/10 blur-[120px] top-1/4 left-1/4" />
        <div className="absolute w-80 h-80 rounded-full bg-emerald-500/10 blur-[120px] bottom-1/4 right-1/4" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center shadow-2xl shadow-indigo-500/25 mb-6 animate-bounce">
            <span className="text-white font-extrabold text-3xl">C</span>
          </div>
          <div className="relative w-12 h-12">
            <div className="w-12 h-12 rounded-full border-[3px] border-slate-800" />
            <div className="absolute top-0 w-12 h-12 rounded-full border-[3px] border-t-indigo-500 border-r-indigo-400 border-b-transparent border-l-transparent animate-spin" />
          </div>
          <p className="text-indigo-400 text-sm font-extrabold tracking-widest uppercase mt-4 animate-pulse">
            Booting System
          </p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden animate-pulse">
        <div className="absolute w-80 h-80 rounded-full bg-indigo-500/10 blur-[120px] top-1/4 left-1/4" />
        <div className="absolute w-80 h-80 rounded-full bg-emerald-500/10 blur-[120px] bottom-1/4 right-1/4" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center shadow-2xl shadow-indigo-500/25 mb-6 animate-bounce">
            <span className="text-white font-extrabold text-3xl">C</span>
          </div>
          <div className="relative w-12 h-12">
            <div className="w-12 h-12 rounded-full border-[3px] border-slate-800" />
            <div className="absolute top-0 w-12 h-12 rounded-full border-[3px] border-t-indigo-500 border-r-indigo-400 border-b-transparent border-l-transparent animate-spin" />
          </div>
          <p className="text-indigo-400 text-sm font-extrabold tracking-widest uppercase mt-4">
            Loading Component
          </p>
        </div>
      </div>
    }>
      <Routes>
      {/* ================================================================= */}
      {/* PUBLIC AUTH ROUTES (AuthLayout wrapper)                           */}
      {/* ================================================================= */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <RootRedirect />
          ) : (
            <AuthLayout>
              <Login />
            </AuthLayout>
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <RootRedirect />
          ) : (
            <AuthLayout>
              <Register />
            </AuthLayout>
          )
        }
      />
      <Route
        path="/forgot-password"
        element={
          isAuthenticated ? (
            <RootRedirect />
          ) : (
            <AuthLayout>
              <ForgotPassword />
            </AuthLayout>
          )
        }
      />

      {/* ================================================================= */}
      {/* PROTECTED WORKSPACE ROUTES (DashboardLayout wrapper)              */}
      {/* ================================================================= */}
      
      {/* 1. ADMINISTRATOR PAGES (Guarded for 'admin') */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['admin']}>
              <DashboardLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="doctors" element={<ManageDoctors />} />
                  <Route path="receptionists" element={<ManageReceptionists />} />
                  <Route path="analytics" element={<AnalyticsDashboard />} />
                  <Route path="subscriptions" element={<SubscriptionPlans />} />
                  <Route path="profile" element={<DashboardPlaceholder title="Admin Profile Details" />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </DashboardLayout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* 2. DOCTOR / PHYSICIAN PAGES (Guarded for 'doctor') */}
      <Route
        path="/doctor/*"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['doctor']}>
              <DashboardLayout>
                <Routes>
                  <Route path="dashboard" element={<DoctorDashboard />} />
                  <Route path="appointments" element={<MyAppointments />} />
                  <Route path="patients/:patientId" element={<PatientDetail />} />
                  <Route path="patients" element={<Navigate to="appointments" replace />} />
                  <Route path="ai-diagnosis" element={<AddDiagnosis />} />
                  <Route path="profile" element={<DashboardPlaceholder title="Physician Profile Details" />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </DashboardLayout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* 3. RECEPTIONIST STAFF PAGES (Guarded for 'receptionist') */}
      <Route
        path="/receptionist/*"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['receptionist']}>
              <DashboardLayout>
                <Routes>
                  <Route path="dashboard" element={<ReceptionistDashboard />} />
                  <Route path="patients/register" element={<RegisterPatient />} />
                  <Route path="appointments/book" element={<BookAppointment />} />
                  <Route path="schedule" element={<DailySchedule />} />
                  <Route path="profile" element={<DashboardPlaceholder title="Receptionist Profile Details" />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </DashboardLayout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* 4. PATIENT PORTAL PAGES (Guarded for 'patient') */}
      <Route
        path="/patient/*"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['patient']}>
              <DashboardLayout>
                <Routes>
                  <Route path="dashboard" element={<PatientDashboard />} />
                  <Route path="appointments" element={<PatientAppointments />} />
                  <Route path="prescriptions" element={<PatientPrescriptions />} />
                  <Route path="profile" element={<PatientProfile />} />
                  <Route path="history" element={<PatientHistory />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </DashboardLayout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Root redirect endpoint */}
      <Route path="/" element={<RootRedirect />} />

      {/* Wildcard redirect to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
}

export default App;
