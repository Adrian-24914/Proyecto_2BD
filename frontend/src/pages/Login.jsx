import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { setSession, isAuthenticated } from '../auth.js';
import Toast from '../components/Toast.jsx';

export default function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('admin123');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (isAuthenticated()) { navigate('/'); return null; }

    async function submit(e) {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const data = await api.post('/auth/login', { username, password });
            setSession(data.token, data.user);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ maxWidth: 360, margin: '60px auto' }}>
            <div className="card">
                <h2>Iniciar sesion</h2>
                <form onSubmit={submit}>
                    <div className="row">
                        <div>
                            <label>Usuario</label>
                            <input value={username} onChange={e => setUsername(e.target.value)} required />
                        </div>
                    </div>
                    <div className="row">
                        <div>
                            <label>Contrasena</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Ingresando...' : 'Entrar'}
                    </button>
                </form>
                <p style={{ fontSize: 12, color: '#6b7280', marginTop: 12 }}>
                    Usuario por defecto: <b>admin</b> / <b>admin123</b>
                </p>
            </div>
            <Toast message={error} type="error" onClose={() => setError('')} />
        </div>
    );
}
