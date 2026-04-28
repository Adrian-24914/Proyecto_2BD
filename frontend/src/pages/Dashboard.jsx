import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Dashboard() {
    const [resumen, setResumen] = useState(null);
    const [topProductos, setTopProductos] = useState([]);
    const [ventasMes, setVentasMes] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        Promise.all([
            api.get('/reportes/resumen'),
            api.get('/consultas/cte/top-productos'),
            api.get('/consultas/agregacion/ventas-por-mes'),
        ])
        .then(([r, top, mes]) => { setResumen(r); setTopProductos(top); setVentasMes(mes); })
        .catch(e => setError(e.message));
    }, []);

    return (
        <div>
            <h1>Dashboard</h1>
            {error && <div className="error-msg">{error}</div>}

            {resumen && (
                <div className="row">
                    <div className="card">
                        <div>Total de ventas</div>
                        <div className="kpi">{resumen.total_ventas}</div>
                    </div>
                    <div className="card">
                        <div>Ingresos del mes</div>
                        <div className="kpi">Q {Number(resumen.ingresos_mes_actual).toFixed(2)}</div>
                    </div>
                    <div className="card">
                        <div>Producto mas vendido</div>
                        <div className="kpi" style={{ fontSize: 20 }}>
                            {resumen.producto_mas_vendido?.nombre || '—'}
                        </div>
                    </div>
                </div>
            )}

            <div className="card">
                <h3>Top 10 productos (CTE + RANK)</h3>
                <table>
                    <thead><tr><th>#</th><th>Producto</th><th>Unidades</th><th>Ingresos</th></tr></thead>
                    <tbody>
                        {topProductos.map(p => (
                            <tr key={p.posicion + p.nombre}>
                                <td>{p.posicion}</td>
                                <td>{p.nombre}</td>
                                <td>{p.unidades_vendidas}</td>
                                <td>Q {Number(p.ingresos_generados).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card">
                <h3>Ventas por mes (GROUP BY + HAVING)</h3>
                <table>
                    <thead><tr><th>Mes</th><th>Num. ventas</th><th>Ingresos</th><th>Ticket promedio</th></tr></thead>
                    <tbody>
                        {ventasMes.map(m => (
                            <tr key={m.mes}>
                                <td>{new Date(m.mes).toLocaleDateString()}</td>
                                <td>{m.num_ventas}</td>
                                <td>Q {Number(m.ingresos).toFixed(2)}</td>
                                <td>Q {Number(m.ticket_promedio).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
