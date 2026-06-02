import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

/**
 * Access gatekeeper for specific user roles.
 * Redirects unauthorized users to their respective dashboards to prevent crossover route requests.
 */
const RoleRoute = ({ children, allowedRoles }) => {
  const { user } = useAuthStore();

  // 1. Defensively check user session exists
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Redirect to user's landing role-specific dashboard if not in list of allowedRoles
  if (!allowedRoles.includes(user.role)) {
    console.warn(`⚠️ Role mismatch: '${user.role}' tried to access routes restricted to: [${allowedRoles.join(', ')}]. Redirecting...`);
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  // 3. Render allowed components
  return children;
};

export default RoleRoute;
