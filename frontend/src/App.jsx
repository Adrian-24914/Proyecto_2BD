import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Productos from './pages/Productos.jsx';
import Clientes from './pages/Clientes.jsx';
import Ventas from './pages/Ventas.jsx';
import Consultas from './pages/Consultas.jsx';
import Reportes from './pages/Reportes.jsx';

export default function App() {
    return (
        <>
            <Navbar />
            <main className="container">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/productos" element={<ProtectedRoute><Productos /></ProtectedRoute>} />
                    <Route path="/clientes" element={<ProtectedRoute><Clientes /></ProtectedRoute>} />
                    <Route path="/ventas" element={<ProtectedRoute><Ventas /></ProtectedRoute>} />
                    <Route path="/consultas" element={<ProtectedRoute><Consultas /></ProtectedRoute>} />
                    <Route path="/reportes" element={<ProtectedRoute><Reportes /></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </main>
        </>
    );
}
