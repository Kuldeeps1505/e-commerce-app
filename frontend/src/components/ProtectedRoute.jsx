import { Navigate, useLocation } from "react-router-dom";

/**
 * Wraps routes that require login. Redirects to /login with return URL if no token.
 */
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
