import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUser } from '../auth.js';

export default function ProtectedRoute({ children, roles }) {
    if (!isAuthenticated()) return <Navigate to="/login" />;

    if (roles && roles.length > 0) {
        const user = getUser();
        if (!user || !roles.includes(user.rol)) {
            return (
                <div style={{ padding: 40, textAlign: 'center' }}>
                    <h2>Acceso restringido</h2>
                    <p>No tienes permiso para ver esta seccion.</p>
                </div>
            );
        }
    }

    return children;
}
