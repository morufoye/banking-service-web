import { Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './domains/landing-page/LandingPage';
import RegisterPage from './domains/auth/RegisterPage';
import LoginPage from './domains/auth/LoginPage';
import AdminDashboard from './domains/dashboard/admin/AdminDashboard';
import VendorDashboard from './domains/dashboard/vendor/VendorDashboard';
import ServicesPage from './domains/dashboard/components/ServicesPage';
import ClientsPage from './domains/dashboard/admin/ClientsPage';
import UsersPage from './domains/dashboard/admin/UsersPage';
import RoleRequestsPage from './domains/dashboard/admin/RoleRequestsPage';
import AuditPage from './domains/dashboard/admin/AuditPage';
import SettingsPage from './domains/dashboard/admin/SettingsPage';
import ProtectedRoute from './domains/dashboard/components/ProtectedRoute';
import logo from './assets/skybank-logo.png';
import { useAuth } from './lib/useAuth';

function portalRole(roles: string[]): 'admin' | 'vendor' | null {
    if (roles.includes('ROLE_ADMIN')) return 'admin';
    if (roles.includes('ROLE_CLIENT') || roles.includes('ROLE_VENDOR')) {
        return 'vendor';
    }
    return null;
}

function RoleRedirect() {
    const { claims, isAuthenticated, logout } = useAuth();
    const roles = claims?.realm_access?.roles ?? [];
    const userRole = portalRole(roles);

    if (!isAuthenticated) {
        return <LandingPage />;
    }

    if (!userRole) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-gradient-to-br from-slate-50 via-purple-50/40 to-orange-50/30 p-6 text-center">
                <img src={logo} alt="Sky Bank Sierra Leone" className="h-20 w-auto" />
                <p className="text-gray-600">Your account does not have access to a Sky Bank portal.</p>
                <button
                    type="button"
                    onClick={logout}
                    className="rounded-full bg-gray-900 px-5 py-2.5 text-sm font-medium text-white"
                >
                    Sign out
                </button>
            </div>
        );
    }

    if (userRole === 'admin') {
        return <Navigate to="/admin-dashboard" replace />;
    }

    if (userRole === 'vendor') {
        return <Navigate to="/vendor-dashboard" replace />;
    }

    return <LandingPage />;
}

function App() {
    const { claims } = useAuth();
    const userRole = portalRole(claims?.realm_access?.roles ?? []);

    return (
        <Routes>
            <Route
                path="/"
                element={<RoleRedirect />}
            />

            <Route
                path="/register"
                element={<RegisterPage />}
            />
            <Route path="/login" element={<LoginPage />} />

            <Route
                path="/admin-dashboard"
                element={
                    <ProtectedRoute
                        requiredRole="admin"
                        userRole={userRole}
                    >
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />

<Route
                path="/vendor-dashboard"
                element={
                    <ProtectedRoute
                        requiredRole="vendor"
                        userRole={userRole}
                    >
                        <VendorDashboard />
                    </ProtectedRoute>
                }
            />
            <Route path="/services" element={<ServicesPage />} />

            {/* Settings is available to both portals and reads the role live from the token. */}
            <Route
                path="/settings"
                element={
                    <ProtectedRoute requiredRole={userRole ?? ''} userRole={userRole}>
                        <SettingsPage />
                    </ProtectedRoute>
                }
            />

            {/* Administration - every screen here is gated on ROLE_ADMIN. */}
            <Route
                path="/admin/clients"
                element={
                    <ProtectedRoute requiredRole="admin" userRole={userRole}>
                        <ClientsPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/role-requests"
                element={
                    <ProtectedRoute requiredRole="admin" userRole={userRole}>
                        <RoleRequestsPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/users"
                element={
                    <ProtectedRoute requiredRole="admin" userRole={userRole}>
                        <UsersPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/audit"
                element={
                    <ProtectedRoute requiredRole="admin" userRole={userRole}>
                        <AuditPage />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

export default App;