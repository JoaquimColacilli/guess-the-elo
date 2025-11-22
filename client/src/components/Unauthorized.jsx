import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
    const { logout } = useAuth();

    return (
        <div className="flex h-screen flex-col items-center justify-center bg-gray-900 text-white">
            <h1 className="mb-4 text-5xl font-bold text-red-500">401</h1>
            <h2 className="mb-6 text-2xl font-semibold">Unauthorized Access</h2>
            <p className="mb-8 text-gray-400">You do not have permission to view this page.</p>

            <div className="flex gap-4">
                <Link to="/" className="rounded bg-gray-700 px-4 py-2 hover:bg-gray-600">
                    Go Home
                </Link>
                <button onClick={logout} className="rounded bg-red-600 px-4 py-2 hover:bg-red-500">
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Unauthorized;
