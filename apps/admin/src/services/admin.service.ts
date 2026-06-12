import { apiRequest } from '../utils/api';

export interface CompanyData {
  name: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  rut: string;
  legalRepresentativeName: string;
  legalRepresentativeId: string;
  certificateOfExistenceNumber: string;
  certificateExpeditedDate: string;
  incorporationDate: string;
  statutesDescription: string;
}

export interface UserRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface DocumentRow {
  id: string;
  name: string;
  filename: string;
  url: string;
  mimetype: string;
  size: number;
  category: string;
  uploadedAt: string;
}

export const adminService = {
  async getCompany(): Promise<CompanyData> {
    return apiRequest<CompanyData>('/api/company');
  },

  async updateCompany(data: Partial<CompanyData>): Promise<CompanyData> {
    return apiRequest<CompanyData>('/api/company', { method: 'PATCH', json: data });
  },

  async getUsers(): Promise<UserRow[]> {
    return apiRequest<UserRow[]>('/api/users');
  },

  async createUser(payload: Partial<UserRow & { password?: string }>): Promise<UserRow> {
    return apiRequest<UserRow>('/api/users', { method: 'POST', json: payload });
  },

  async updateUser(id: string, payload: Partial<UserRow>): Promise<UserRow> {
    return apiRequest<UserRow>(`/api/users/${id}`, { method: 'PATCH', json: payload });
  },

  async deleteUser(id: string): Promise<void> {
    return apiRequest<void>(`/api/users/${id}`, { method: 'DELETE' });
  },

  async getDocuments(): Promise<DocumentRow[]> {
    return apiRequest<DocumentRow[]>('/api/documents');
  },

  async uploadDocument(file: File, name?: string, category?: string): Promise<DocumentRow> {
    const fd = new FormData();
    fd.append('file', file);
    if (name) fd.append('name', name);
    if (category) fd.append('category', category);
    return apiRequest<DocumentRow>('/api/documents/upload', { method: 'POST', body: fd });
  },

  async deleteDocument(id: string): Promise<void> {
    return apiRequest<void>(`/api/documents/${id}`, { method: 'DELETE' });
  }
};

export default adminService;
