import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { hasRole } from '../auth.js';

export default function Reportes() {
    const [resumen, setResumen]     = useState(null);
    const [ventasMes, setVentasMes] = useState([]);
    const [topProd, setTopProd]     = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        Promise.all([
            api.get('/reportes/resumen'),
            api.get('/consultas/agregacion/ventas-por-mes'),
            api.get('/consultas/cte/top-productos'),
        ])
        .then(([r, v, t]) => { setResumen(r); setVentasMes(v); setTopProd(t); })
        .catch(e => setError(e.message));
    }, []);

    function descargarCSV() {
        const token = localStorage.getItem('token');
        fetch(api.csvUrl('/reportes/ventas/csv'), {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then(r => r.blob())
        .then(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'reporte_ventas.csv';
            a.click(); URL.revokeObjectURL(url);
        })
        .catch(e => setError(e.message));
    }

    const canDownloadCsv = hasRole('administrador', 'gerente');

    return (
        <div>
            <h1>Reportes</h1>
            {error && <div className="error-msg">{error}</div>}

            {canDownloadCsv && (
                <div className="card">
                    <button onClick={descargarCSV}>Exportar ventas a CSV</button>
                </div>
            )}

            {resumen && (
                <div className="row">
                    <div className="card"><div>Total ventas</div><div className="kpi">{resumen.total_ventas}</div></div>
                    <div className="card"><div>Ingresos del mes</div><div className="kpi">Q {Number(resumen.ingresos_mes_actual).toFixed(2)}</div></div>
                    <div className="card"><div>Producto top</div><div className="kpi" style={{ fontSize: 20 }}>{resumen.producto_mas_vendido?.nombre || '—'}</div></div>
                </div>
            )}

            <div className="card">
                <h3>Ventas por mes</h3>
                <table>
                    <thead><tr><th>Mes</th><th>Num. ventas</th><th>Ingresos</th><th>Promedio</th><th>Maxima</th></tr></thead>
                    <tbody>
                        {ventasMes.map(m => (
                            <tr key={m.mes}>
                                <td>{new Date(m.mes).toLocaleDateString()}</td>
                                <td>{m.num_ventas}</td>
                                <td>Q {Number(m.ingresos).toFixed(2)}</td>
                                <td>Q {Number(m.ticket_promedio).toFixed(2)}</td>
                                <td>Q {Number(m.venta_maxima).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card">
                <h3>Top productos vendidos</h3>
                <table>
                    <thead><tr><th>#</th><th>Producto</th><th>Unidades</th><th>Ingresos</th></tr></thead>
                    <tbody>
                        {topProd.map(p => (
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
        </div>
    );
}
