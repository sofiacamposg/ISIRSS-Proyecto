import { HttpError } from 'react-admin';
export async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, { credentials: 'same-origin', ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new HttpError(body.message || 'No fue posible completar la solicitud.', response.status, body);
  return body;
}
const list = (resource, params) => api(`/${resource}?${new URLSearchParams({ page: params.pagination?.page || 1, perPage: params.pagination?.perPage || 25, sort: params.sort?.field || 'id', order: params.sort?.order || 'ASC', filter: JSON.stringify(params.filter || {}) })}`);
const unsupported = () => Promise.reject(new Error('Operación no disponible en esta entrega.'));
export const dataProvider = {
  getList: list,
  getOne: (resource, { id }) => api(`/${resource}/${encodeURIComponent(id)}`),
  getMany: (resource, { ids }) => list(resource, { pagination: { page: 1, perPage: 100 }, filter: { ids: ids.map(String) } }),
  getManyReference: (resource, params) => list(resource, { ...params, filter: { ...params.filter, [params.target]: String(params.id) } }),
  create: (resource, { data }) => api(`/${resource}`, { method: 'POST', body: JSON.stringify(data) }),
  update: (resource, { id, data }) => api(`/${resource}/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: unsupported, deleteMany: unsupported, updateMany: unsupported,
};
export const authProvider = {
  login: credentials => api('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  logout: async () => { try { await api('/auth/logout', { method: 'POST' }); } catch (error) { if (error.status !== 401) throw error; } },
  checkAuth: () => api('/auth/me').then(() => {}),
  checkError: error => error.status === 401 ? Promise.reject() : Promise.resolve(),
  getIdentity: () => api('/auth/me'),
  getPermissions: () => api('/auth/me').then(user => user.role),
};
