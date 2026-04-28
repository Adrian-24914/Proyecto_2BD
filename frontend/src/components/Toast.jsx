import { useEffect } from 'react';

export default function Toast({ message, type = 'error', onClose }) {
    useEffect(() => {
        if (!message) return;
        const t = setTimeout(onClose, 4000);
        return () => clearTimeout(t);
    }, [message, onClose]);

    if (!message) return null;
    return <div className={`toast ${type}`}>{message}</div>;
}
