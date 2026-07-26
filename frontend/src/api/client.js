import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getSignals = async (params = {}) => {
  const response = await api.get('/signals', { params });
  return response.data;
};

export const getSignalTrace = async (signalId) => {
  const response = await api.get(`/signals/${signalId}/trace`);
  return response.data;
};

export const getThreads = async () => {
  const response = await api.get('/threads');
  return response.data;
};

export const getInflections = async () => {
  const response = await api.get('/inflections');
  return response.data;
};

export const getBattleCards = async () => {
  const response = await api.get('/battle-cards');
  return response.data;
};

export const getValidationReport = async () => {
  const response = await api.get('/validation-report');
  return response.data;
};

export const getRoutingQueue = async (owner = 'ALL') => {
  const response = await api.get('/routing-queue', { params: { owner } });
  return response.data;
};

export const getFranchiseMap = async () => {
  const response = await api.get('/franchise-map');
  return response.data;
};

export const getSystemStatus = async () => {
  const response = await api.get('/status');
  return response.data;
};

export const updateApiKey = async (openaiKey) => {
  const response = await api.post('/config/api-key', { openai_api_key: openaiKey });
  return response.data;
};

export const triggerIngestion = async (source = 'all') => {
  const response = await api.post(`/ingest/trigger?source=${source}`);
  return response.data;
};

export default api;


