import { useEffect, useState } from 'react';
import { api } from '../api.js';
import Toast from '../components/Toast.jsx';

export default function Ventas() {
    const [ventas, setVentas]         = useState([]);
    const [clientes, setClientes]     = useState([]);
    const [empleados, setEmpleados]   = useState([]);
    const [productos, setProductos]   = useState([]);
    const [idCliente, setIdCliente]   = useState('');
    const [idEmpleado, setIdEmpleado] = useState('');
    const [items, setItems]           = useState([]);
    const [toast, setToast] = useState({ msg: '', type: 'error' });

    async function load() {
        try {
            const [v, c, e, p] = await Promise.all([
                api.get('/ventas'),
                api.get('/clientes'),
                api.get('/empleados'),
                api.get('/productos'),
            ]);
            setVentas(v); setClientes(c); setEmpleados(e); setProductos(p);
        } catch (err) { setToast({ msg: err.message, type: 'error' }); }
    }
    useEffect(() => { load(); }, []);

    function addItem() { setItems([...items, { id_producto: '', cantidad: 1 }]); }
    function updateItem(i, field, val) {
        const copy = [...items]; copy[i][field] = val; setItems(copy);
    }
    function removeItem(i) { setItems(items.filter((_, idx) => idx !== i)); }

    async function submit(e) {
        e.preventDefault();
        if (!idCliente || !idEmpleado) {
            setToast({ msg: 'Selecciona cliente y empleado', type: 'error' }); return;
        }
        if (items.length === 0) {
            setToast({ msg: 'Agrega al menos un producto', type: 'error' }); return;
        }
        for (const it of items) {
            if (!it.id_producto || !it.cantidad || it.cantidad <= 0) {
                setToast({ msg: 'Cada producto debe tener cantidad > 0', type: 'error' }); return;
            }
        }
        try {
            const r = await api.post('/ventas', {
                id_cliente: idCliente, id_empleado: idEmpleado, items,
            });
            setToast({ msg: `Venta ${r.id_venta} registrada (Q ${Number(r.total).toFixed(2)})`, type: 'success' });
            setIdCliente(''); setIdEmpleado(''); setItems([]);
            load();
        } catch (err) {
            setToast({ msg: err.message, type: 'error' });
        }
    }

    return (
        <div>
            <h1>Ventas</h1>

            <div className="card">
                <h3>Registrar nueva venta (transaccion con ROLLBACK)</h3>
                <form onSubmit={submit}>
                    <div className="row">
                        <div><label>Cliente</label>
                            <select value={idCliente} onChange={e=>setIdCliente(e.target.value)}>
                                <option value="">-- selecciona --</option>
                                {clientes.map(c => <option key={c.id_cliente} value={c.id_cliente}>
                                    {c.nombre} {c.apellido}
                                </option>)}
                            </select></div>
                        <div><label>Empleado</label>
                            <select value={idEmpleado} onChange={e=>setIdEmpleado(e.target.value)}>
                                <option value="">-- selecciona --</option>
                                {empleados.map(e => <option key={e.id_empleado} value={e.id_empleado}>
                                    {e.nombre} {e.apellido} ({e.cargo})
                                </option>)}
                            </select></div>
                    </div>

                    <h4>Productos</h4>
                    {items.map((it, i) => (
                        <div className="row" key={i}>
                            <div><label>Producto</label>
                                <select value={it.id_producto} onChange={e=>updateItem(i,'id_producto', e.target.value)}>
                                    <option value="">-- selecciona --</option>
                                    {productos.map(p => <option key={p.id_producto} value={p.id_producto}>
                                        {p.nombre} (stock: {p.stock})
                                    </option>)}
                                </select></div>
                            <div><label>Cantidad</label>
                                <input type="number" min="1" value={it.cantidad}
                                       onChange={e=>updateItem(i,'cantidad', Number(e.target.value))} /></div>
                            <div style={{ alignSelf: 'end' }}>
                                <button type="button" className="danger" onClick={()=>removeItem(i)}>Quitar</button>
                            </div>
                        </div>
                    ))}
                    <button type="button" className="secondary" onClick={addItem}>+ Agregar producto</button>{' '}
                    <button type="submit">Registrar venta</button>
                </form>
            </div>

            <div className="card">
                <h3>Listado de ventas (VIEW vista_resumen_ventas)</h3>
                <table>
                    <thead><tr><th>ID</th><th>Fecha</th><th>Cliente</th><th>Empleado</th><th># Productos</th><th>Total</th></tr></thead>
                    <tbody>
                        {ventas.map(v => (
                            <tr key={v.id_venta}>
                                <td>{v.id_venta}</td>
                                <td>{new Date(v.fecha).toLocaleString()}</td>
                                <td>{v.cliente}</td>
                                <td>{v.empleado}</td>
                                <td>{v.num_productos}</td>
                                <td>Q {Number(v.total).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Toast message={toast.msg} type={toast.type} onClose={()=>setToast({ msg: '', type: 'error' })} />
        </div>
    );
}
