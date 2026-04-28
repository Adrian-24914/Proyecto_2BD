import { NavLink, useNavigate } from 'react-router-dom';
import { isAuthenticated, getUser, clearSession } from '../auth.js';

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

    return (
        <nav className="navbar">
            <strong>Tienda BD1</strong>
            <NavLink to="/"          className={link} end>Dashboard</NavLink>
            <NavLink to="/productos" className={link}>Productos</NavLink>
            <NavLink to="/clientes"  className={link}>Clientes</NavLink>
            <NavLink to="/ventas"    className={link}>Ventas</NavLink>
            <NavLink to="/consultas" className={link}>Consultas</NavLink>
            <NavLink to="/reportes"  className={link}>Reportes</NavLink>
            <span className="spacer" />
            {user && <span>{user.username}</span>}
            <button className="secondary" onClick={logout}>Salir</button>
        </nav>
    );
}
