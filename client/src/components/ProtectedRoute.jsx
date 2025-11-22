import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useAuth();

    if (loading) return <div className="flex h-screen items-center justify-center text-white">Loading...</div>;

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
        // Allow 'broadcaster' to access 'moderator' routes
        if (requiredRole === 'moderator' && user.role === 'broadcaster') {
            return children;
        }
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute;
