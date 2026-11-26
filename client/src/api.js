const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.message || `Error de solicitud (${response.status})`);
  }
  if (response.status === 204) return null;
  return response.json();
}

export const usersApi = {
  list: (params) => request(`/users?${new URLSearchParams(params)}`),
  stats: () => request('/users/stats'),
  create: (data) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) =>
    request(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id) => request(`/users/${id}`, { method: 'DELETE' })
};
