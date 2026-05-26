import { useEffect, useState } from 'react';
import { api } from '../api.js';
import Toast from '../components/Toast.jsx';
import { hasRole } from '../auth.js';

const empty = { nombre: '', apellido: '', email: '', telefono: '' };

export default function Clientes() {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState(empty);
    const [editing, setEditing] = useState(null);
    const [toast, setToast] = useState({ msg: '', type: 'error' });

    async function load() {
        try { setItems(await api.get('/clientes')); }
        catch (e) { setToast({ msg: e.message, type: 'error' }); }
    }
    useEffect(() => { load(); }, []);

    function update(f, v) { setForm({ ...form, [f]: v }); }
    function startEdit(c) { setEditing(c.id_cliente); setForm({ nombre: c.nombre, apellido: c.apellido, email: c.email || '', telefono: c.telefono || '' }); }
    function cancelEdit() { setEditing(null); setForm(empty); }

    async function submit(e) {
        e.preventDefault();
        if (!form.nombre || !form.apellido) {
            setToast({ msg: 'Nombre y apellido son obligatorios', type: 'error' }); return;
        }
        try {
            if (editing) await api.put(`/clientes/${editing}`, form);
            else         await api.post('/clientes', form);
            setToast({ msg: 'Guardado', type: 'success' });
            cancelEdit(); load();
        } catch (e) { setToast({ msg: e.message, type: 'error' }); }
    }

    async function remove(id) {
        if (!confirm('Eliminar este cliente?')) return;
        try {
            await api.del(`/clientes/${id}`);
            setToast({ msg: 'Cliente eliminado', type: 'success' });
            load();
        } catch (e) { setToast({ msg: e.message, type: 'error' }); }
    }

    const canEdit = hasRole('administrador', 'gerente', 'cajero');
    const canDelete = hasRole('administrador', 'gerente');

    return (
        <div>
            <h1>Clientes</h1>

            {canEdit && (
                <div className="card">
                    <h3>{editing ? 'Editar cliente' : 'Nuevo cliente'}</h3>
                    <form onSubmit={submit}>
                        <div className="row">
                            <div><label>Nombre</label>
                                <input value={form.nombre} onChange={e=>update('nombre', e.target.value)} /></div>
                            <div><label>Apellido</label>
                                <input value={form.apellido} onChange={e=>update('apellido', e.target.value)} /></div>
                            <div><label>Email</label>
                                <input type="email" value={form.email} onChange={e=>update('email', e.target.value)} /></div>
                            <div><label>Telefono</label>
                                <input value={form.telefono} onChange={e=>update('telefono', e.target.value)} /></div>
                        </div>
                        <button type="submit">{editing ? 'Guardar' : 'Crear'}</button>
                        {editing && <button type="button" className="secondary" onClick={cancelEdit} style={{ marginLeft: 8 }}>Cancelar</button>}
                    </form>
                </div>
            )}

            <div className="card">
                <table>
                    <thead><tr><th>ID</th><th>Nombre</th><th>Apellido</th><th>Email</th><th>Telefono</th><th></th></tr></thead>
                    <tbody>
                        {items.map(c => (
                            <tr key={c.id_cliente}>
                                <td>{c.id_cliente}</td>
                                <td>{c.nombre}</td>
                                <td>{c.apellido}</td>
                                <td>{c.email}</td>
                                <td>{c.telefono}</td>
                                <td>
                                    {canEdit && <button className="secondary" onClick={()=>startEdit(c)}>Editar</button>}
                                    {canEdit && canDelete && ' '}
                                    {canDelete && <button className="danger" onClick={()=>remove(c.id_cliente)}>Eliminar</button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Toast message={toast.msg} type={toast.type} onClose={()=>setToast({ msg: '', type: 'error' })} />
        </div>
    );
}
