import { useEffect, useState } from 'react';
import { api } from '../api.js';
import Toast from '../components/Toast.jsx';
import { hasRole } from '../auth.js';

const empty = {
    nombre: '', descripcion: '', precio_unitario: '',
    stock: '', id_categoria: '', id_proveedor: '',
};

export default function Productos() {
    const [items, setItems] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [form, setForm] = useState(empty);
    const [editing, setEditing] = useState(null);
    const [toast, setToast] = useState({ msg: '', type: 'error' });

    async function load() {
        try {
            const [p, c, pr] = await Promise.all([
                api.get('/productos'),
                api.get('/categorias'),
                api.get('/proveedores'),
            ]);
            setItems(p); setCategorias(c); setProveedores(pr);
        } catch (e) { setToast({ msg: e.message, type: 'error' }); }
    }
    useEffect(() => { load(); }, []);

    function update(field, val) { setForm({ ...form, [field]: val }); }

    function startEdit(p) {
        setEditing(p.id_producto);
        setForm({
            nombre: p.nombre, descripcion: p.descripcion || '',
            precio_unitario: p.precio_unitario, stock: p.stock,
            id_categoria: p.id_categoria, id_proveedor: p.id_proveedor,
        });
    }
    function cancelEdit() { setEditing(null); setForm(empty); }

    async function submit(e) {
        e.preventDefault();
        if (!form.nombre || form.precio_unitario === '' || form.stock === ''
            || !form.id_categoria || !form.id_proveedor) {
            setToast({ msg: 'Completa todos los campos requeridos', type: 'error' });
            return;
        }
        if (Number(form.precio_unitario) < 0 || Number(form.stock) < 0) {
            setToast({ msg: 'Precio y stock no pueden ser negativos', type: 'error' });
            return;
        }
        try {
            if (editing) {
                await api.put(`/productos/${editing}`, form);
                setToast({ msg: 'Producto actualizado', type: 'success' });
            } else {
                await api.post('/productos', form);
                setToast({ msg: 'Producto creado', type: 'success' });
            }
            cancelEdit(); load();
        } catch (e) { setToast({ msg: e.message, type: 'error' }); }
    }

    async function remove(id) {
        if (!confirm('Eliminar este producto?')) return;
        try {
            await api.del(`/productos/${id}`);
            setToast({ msg: 'Producto eliminado', type: 'success' });
            load();
        } catch (e) { setToast({ msg: e.message, type: 'error' }); }
    }

    const canEdit = hasRole('administrador', 'gerente', 'bodeguero');
    const canDelete = hasRole('administrador');

    return (
        <div>
            <h1>Productos</h1>

            {canEdit && (
                <div className="card">
                    <h3>{editing ? 'Editar producto' : 'Nuevo producto'}</h3>
                    <form onSubmit={submit}>
                        <div className="row">
                            <div><label>Nombre</label>
                                <input value={form.nombre} onChange={e=>update('nombre', e.target.value)} /></div>
                            <div><label>Precio unitario</label>
                                <input type="number" step="0.01" value={form.precio_unitario}
                                       onChange={e=>update('precio_unitario', e.target.value)} /></div>
                            <div><label>Stock</label>
                                <input type="number" value={form.stock}
                                       onChange={e=>update('stock', e.target.value)} /></div>
                        </div>
                        <div className="row">
                            <div><label>Categoria</label>
                                <select value={form.id_categoria} onChange={e=>update('id_categoria', e.target.value)}>
                                    <option value="">-- selecciona --</option>
                                    {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
                                </select></div>
                            <div><label>Proveedor</label>
                                <select value={form.id_proveedor} onChange={e=>update('id_proveedor', e.target.value)}>
                                    <option value="">-- selecciona --</option>
                                    {proveedores.map(p => <option key={p.id_proveedor} value={p.id_proveedor}>{p.nombre}</option>)}
                                </select></div>
                            <div><label>Descripcion</label>
                                <input value={form.descripcion} onChange={e=>update('descripcion', e.target.value)} /></div>
                        </div>
                        <button type="submit">{editing ? 'Guardar' : 'Crear'}</button>
                        {editing && <button type="button" className="secondary" onClick={cancelEdit} style={{ marginLeft: 8 }}>Cancelar</button>}
                    </form>
                </div>
            )}

            <div className="card">
                <table>
                    <thead><tr>
                        <th>ID</th><th>Nombre</th><th>Precio</th><th>Stock</th>
                        <th>Categoria</th><th>Proveedor</th><th></th>
                    </tr></thead>
                    <tbody>
                        {items.map(p => (
                            <tr key={p.id_producto}>
                                <td>{p.id_producto}</td>
                                <td>{p.nombre}</td>
                                <td>Q {Number(p.precio_unitario).toFixed(2)}</td>
                                <td>{p.stock}</td>
                                <td>{p.categoria}</td>
                                <td>{p.proveedor}</td>
                                <td>
                                    {canEdit && <button className="secondary" onClick={()=>startEdit(p)}>Editar</button>}
                                    {canEdit && canDelete && ' '}
                                    {canDelete && <button className="danger" onClick={()=>remove(p.id_producto)}>Eliminar</button>}
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
