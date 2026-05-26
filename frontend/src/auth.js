export function isAuthenticated() {
    return !!localStorage.getItem('token');
}

export function getUser() {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
}

export function setSession(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
}

export function clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

export function hasRole(...roles) {
    const user = getUser();
    return user ? roles.includes(user.rol) : false;
}

export const ROLES = {
    ADMIN: 'administrador',
    GERENTE: 'gerente',
    CAJERO: 'cajero',
    BODEGUERO: 'bodeguero',
    CLIENTE_WEB: 'cliente_web',
};
