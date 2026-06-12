const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';

export async function apiRequest<T = any>(path: string, opts?: RequestInit & { json?: any }): Promise<T> {
  const url = `${API_URL}${path}`;
  const baseHeaders: Record<string, string> = {};
  const token = localStorage.getItem('admin_token');
  if (token) baseHeaders['Authorization'] = `Bearer ${token}`;

  const headers = { ...(opts && (opts.headers as Record<string, string>)) || {}, ...baseHeaders };

  let body = opts && opts.body;
  if (opts && (opts as any).json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify((opts as any).json);
  }

  const res = await fetch(url, { ...opts, headers, body });

  if (res.status === 401) {
    const errText = await res.text();
    let errMsg = 'No autorizado';
    try {
      const errData = errText ? JSON.parse(errText) : {};
      errMsg = errData.message || errMsg;
    } catch { /* use default */ }
    throw new Error(errMsg);
  }

  const text = await res.text();
  let data: any;
  try { data = text ? JSON.parse(text) : undefined; } catch { data = text; }

  if (!res.ok) {
    const msg = data?.message || res.statusText || 'Error en la petición';
    throw new Error(msg);
  }

  return data as T;
}

export default apiRequest;
