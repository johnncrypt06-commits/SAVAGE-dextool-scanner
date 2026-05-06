import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useMe } from '../api/hooks';
import Spinner from './ui/Spinner';

export default function ProtectedRoute() {
  const { user, setUser, logout } = useAuthStore();
  const { isLoading, isError } = useMe();

  if (!user && isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <Spinner size={32} />
      </div>
    );
  }

  if (!user && isError) {
    return <Navigate to="/login" replace />;
  }

  if (isError) {
    logout();
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
