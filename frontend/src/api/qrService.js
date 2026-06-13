import api from './axios';

const qrService = {
  generateQR: async (entityId, entityType) => {
    const response = await api.post('/qr/generate/', { entityId, entityType });
    return response.data;
  },
  
  verifyQR: async (token) => {
    const response = await api.post('/qr/verify/', { token });
    return response.data;
  },

  revokeQR: async (qrId) => {
    const response = await api.patch(`/qr/${qrId}/revoke/`);
    return response.data;
  },

  regenerateQR: async (qrId) => {
    const response = await api.post(`/qr/${qrId}/regenerate/`);
    return response.data;
  }
};

export default qrService;
