import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LottieLoader from '../../components/LottieLoader';

const ProtectedRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <LottieLoader size={64} invert />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  return children;
};

export default ProtectedRoute;
