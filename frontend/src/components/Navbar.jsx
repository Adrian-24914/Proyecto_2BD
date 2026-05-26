import { NavLink, useNavigate } from 'react-router-dom';
import { isAuthenticated, getUser, clearSession, hasRole } from '../auth.js';

export default function Navbar() {
    const navigate = useNavigate();
    const auth = isAuthenticated();
    const user = getUser();

    function logout() {
        clearSession();
        navigate('/login');
    }

    if (!auth) return null;

    const link = ({ isActive }) => isActive ? 'active' : '';
    const canSeeClientes = hasRole('administrador', 'gerente', 'cajero');
    const canSeeVentas = hasRole('administrador', 'gerente', 'cajero');
    const canSeeConsultas = hasRole('administrador', 'gerente');
    const canSeeReportes = hasRole('administrador', 'gerente', 'cajero');

    return (
        <nav className="navbar">
            <strong>Tienda BD1</strong>
            <NavLink to="/"          className={link} end>Dashboard</NavLink>
            <NavLink to="/productos" className={link}>Productos</NavLink>
            {canSeeClientes && <NavLink to="/clientes"  className={link}>Clientes</NavLink>}
            {canSeeVentas && <NavLink to="/ventas" className={link}>Ventas</NavLink>}
            {canSeeConsultas && <NavLink to="/consultas" className={link}>Consultas</NavLink>}
            {canSeeReportes && <NavLink to="/reportes" className={link}>Reportes</NavLink>}
            <span className="spacer" />
            {user && <span style={{ fontSize: 13, color: '#9ca3af' }}>{user.username} <em>({user.rol})</em></span>}
            <button className="secondary" onClick={logout}>Salir</button>
        </nav>
    );
}
