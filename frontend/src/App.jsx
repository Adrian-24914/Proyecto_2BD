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

const ALL_AUTHENTICATED = ['administrador', 'gerente', 'cajero', 'bodeguero', 'cliente_web'];
const CAN_SEE_CLIENTES = ['administrador', 'gerente', 'cajero'];
const CAN_SEE_VENTAS = ['administrador', 'gerente', 'cajero'];
const CAN_SEE_REPORTES = ['administrador', 'gerente', 'cajero'];
const CAN_SEE_CONSULTAS = ['administrador', 'gerente'];

export default function App() {
    return (
        <>
            <Navbar />
            <main className="container">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={
                        <ProtectedRoute roles={ALL_AUTHENTICATED}><Dashboard /></ProtectedRoute>
                    } />
                    <Route path="/productos" element={
                        <ProtectedRoute roles={ALL_AUTHENTICATED}><Productos /></ProtectedRoute>
                    } />
                    <Route path="/clientes" element={
                        <ProtectedRoute roles={CAN_SEE_CLIENTES}><Clientes /></ProtectedRoute>
                    } />
                    <Route path="/ventas" element={
                        <ProtectedRoute roles={CAN_SEE_VENTAS}><Ventas /></ProtectedRoute>
                    } />
                    <Route path="/consultas" element={
                        <ProtectedRoute roles={CAN_SEE_CONSULTAS}><Consultas /></ProtectedRoute>
                    } />
                    <Route path="/reportes" element={
                        <ProtectedRoute roles={CAN_SEE_REPORTES}><Reportes /></ProtectedRoute>
                    } />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </main>
        </>
    );
}
