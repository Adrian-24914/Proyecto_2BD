import { useEffect, useState } from 'react';
import { api } from '../api.js';

const QUERIES = [
    { id: 'q1', label: 'JOIN 1: Detalle de ventas',           path: '/consultas/joins/detalle-ventas' },
    { id: 'q2', label: 'JOIN 2: Productos + categoria',       path: '/consultas/joins/productos-detalle' },
    { id: 'q3', label: 'JOIN 3: Historial por cliente',       path: '/consultas/joins/historial-clientes' },
    { id: 'q4', label: 'SUBQUERY: No vendidos (NOT EXISTS)',  path: '/consultas/subqueries/no-vendidos' },
    { id: 'q5', label: 'SUBQUERY: Sobre el promedio',         path: '/consultas/subqueries/clientes-sobre-promedio' },
    { id: 'q6', label: 'GROUP BY + HAVING: Ventas por mes',   path: '/consultas/agregacion/ventas-por-mes' },
    { id: 'q7', label: 'CTE: Top productos (RANK)',           path: '/consultas/cte/top-productos' },
    { id: 'q8', label: 'VIEW: Stock bajo',                    path: '/consultas/vistas/stock-bajo' },
];

export default function Consultas() {
    const [active, setActive] = useState(QUERIES[0].id);
    const [rows, setRows] = useState([]);
    const [error, setError] = useState('');

    const current = QUERIES.find(q => q.id === active);

    useEffect(() => {
        setError('');
        api.get(current.path).then(setRows).catch(e => setError(e.message));
    }, [active]);

    const cols = rows[0] ? Object.keys(rows[0]) : [];

    return (
        <div>
            <h1>Consultas SQL avanzadas</h1>
            <div className="tab-row">
                {QUERIES.map(q => (
                    <button key={q.id}
                            className={active === q.id ? 'active' : 'secondary'}
                            onClick={() => setActive(q.id)}>
                        {q.label}
                    </button>
                ))}
            </div>

            {error && <div className="error-msg">{error}</div>}

            <div className="card">
                <h3>{current.label}</h3>
                <p style={{ fontSize: 13, color: '#6b7280' }}>{rows.length} resultado(s)</p>
                {rows.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead><tr>{cols.map(c => <th key={c}>{c}</th>)}</tr></thead>
                            <tbody>
                                {rows.map((r, i) => (
                                    <tr key={i}>{cols.map(c => <td key={c}>{String(r[c] ?? '')}</td>)}</tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p>Sin datos.</p>}
            </div>
        </div>
    );
}
