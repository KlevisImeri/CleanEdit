import axios from 'axios';
import type { 
  ApiProject, 
  CreateProjectResponse, 
  DeleteProjectResponse,
  UploadVideoResponse 
} from '../shared/types';

const api = axios.create({
  baseURL: '',
});

export const projectApi = {
  getAll: () => api.get<ApiProject[]>('/api/project'),
  
  create: (name: string) => {
    const formData = new URLSearchParams();
    formData.append('name', name);
    return api.post<CreateProjectResponse>('/api/project/create', formData);
  },
  
  delete: (id: number) => 
    api.delete<DeleteProjectResponse>(`/api/project/${id}`),
};

export const videoApi = {
  upload: (file: File, durationFPS: number, projectId: number) => {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('durationFPS', durationFPS.toString());
    formData.append('projectId', projectId.toString());
    return api.post<UploadVideoResponse>('/api/video/uploadvideo', formData);
  },
  
  getUrl: (id: number) => `/api/video/${id}`,
};

export default api;
