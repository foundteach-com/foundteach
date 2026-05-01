const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  author: string;
  status: 'DRAFT' | 'PUBLISHED';
  coverImage?: string;
  metaDescription?: string;
  tags: string[];
  publishedAt?: string;
}

export const blogService = {
  async getAll(): Promise<BlogPost[]> {
    const res = await fetch(`${API_URL}/api/blog`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
    });
    if (!res.ok) throw new Error('Error al obtener artículos');
    return res.json();
  },

  async create(data: Partial<BlogPost>): Promise<BlogPost> {
    const res = await fetch(`${API_URL}/api/blog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al crear artículo');
    return res.json();
  },

  async update(id: string, data: Partial<BlogPost>): Promise<BlogPost> {
    const res = await fetch(`${API_URL}/api/blog/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al actualizar artículo');
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/blog/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
    });
    if (!res.ok) throw new Error('Error al eliminar artículo');
  },

  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_URL}/api/blog/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` },
      body: formData
    });
    if (!res.ok) throw new Error('Error al subir imagen');
    return res.json();
  }
};
