const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('crm_token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  if (res.status === 401) {
    // Session expired or invalid
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    window.dispatchEvent(new Event('crm_auth_change'));
  }
  
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Server request failed.');
  }
  return data;
};

export const api = {
  // Authentication services
  auth: {
    login: async (username, password) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ username, password })
      });
      const data = await handleResponse(res);
      localStorage.setItem('crm_token', data.token);
      localStorage.setItem('crm_user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('crm_auth_change'));
      return data;
    },
    logout: () => {
      localStorage.removeItem('crm_token');
      localStorage.removeItem('crm_user');
      window.dispatchEvent(new Event('crm_auth_change'));
    },
    getCurrentUser: async () => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  },

  // Lead services
  leads: {
    list: async () => {
      const res = await fetch(`${API_BASE}/leads`, { headers: getHeaders() });
      return handleResponse(res);
    },
    get: async (id) => {
      const res = await fetch(`${API_BASE}/leads/${id}`, { headers: getHeaders() });
      return handleResponse(res);
    },
    create: async (leadData) => {
      const res = await fetch(`${API_BASE}/leads`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(leadData)
      });
      return handleResponse(res);
    },
    update: async (id, leadData) => {
      const res = await fetch(`${API_BASE}/leads/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(leadData)
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE}/leads/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    rescore: async (id) => {
      const res = await fetch(`${API_BASE}/leads/${id}/rescore`, {
        method: 'POST',
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  },

  // Customer services
  customers: {
    list: async () => {
      const res = await fetch(`${API_BASE}/customers`, { headers: getHeaders() });
      return handleResponse(res);
    },
    get: async (id) => {
      const res = await fetch(`${API_BASE}/customers/${id}`, { headers: getHeaders() });
      return handleResponse(res);
    },
    create: async (customerData) => {
      const res = await fetch(`${API_BASE}/customers`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(customerData)
      });
      return handleResponse(res);
    },
    update: async (id, customerData) => {
      const res = await fetch(`${API_BASE}/customers/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(customerData)
      });
      return handleResponse(res);
    },
    addInteraction: async (customerId, interactionData) => {
      const res = await fetch(`${API_BASE}/customers/${customerId}/interactions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(interactionData)
      });
      return handleResponse(res);
    },
    generateEmail: async (customerId, context) => {
      const res = await fetch(`${API_BASE}/customers/${customerId}/generate-email`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ context })
      });
      return handleResponse(res);
    }
  },

  // Deals services
  deals: {
    list: async () => {
      const res = await fetch(`${API_BASE}/deals`, { headers: getHeaders() });
      return handleResponse(res);
    },
    get: async (id) => {
      const res = await fetch(`${API_BASE}/deals/${id}`, { headers: getHeaders() });
      return handleResponse(res);
    },
    create: async (dealData) => {
      const res = await fetch(`${API_BASE}/deals`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(dealData)
      });
      return handleResponse(res);
    },
    update: async (id, dealData) => {
      const res = await fetch(`${API_BASE}/deals/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(dealData)
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE}/deals/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  },

  // Dashboard API calls
  dashboard: {
    getStats: async () => {
      const res = await fetch(`${API_BASE}/dashboard/stats`, { headers: getHeaders() });
      return handleResponse(res);
    },
    retrainModel: async (modelName) => {
      const res = await fetch(`${API_BASE}/dashboard/retrain`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ modelName })
      });
      return handleResponse(res);
    }
  }
};
