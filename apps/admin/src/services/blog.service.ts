import { apiRequest } from '../utils/api';

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
    return apiRequest<BlogPost[]>('/api/blog');
  },

  async create(data: Partial<BlogPost>): Promise<BlogPost> {
    return apiRequest<BlogPost>('/api/blog', { method: 'POST', json: data });
  },

  async update(id: string, data: Partial<BlogPost>): Promise<BlogPost> {
    return apiRequest<BlogPost>(`/api/blog/${id}`, { method: 'PATCH', json: data });
  },

  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/api/blog/${id}`, { method: 'DELETE' });
  },

  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest<{ url: string }>('/api/blog/upload', { method: 'POST', body: formData });
  }
};
