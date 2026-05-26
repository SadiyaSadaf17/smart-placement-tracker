import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { hasPermission } from '../../utils/rbac';

export default function PermissionGuard({ permission, children, fallback = null }) {
  const { user } = useSelector((state) => state.auth);

  if (!permission || hasPermission(user?.role, permission)) {
    return children;
  }

  return fallback || <Navigate to="/404" replace />;
}
