const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getToken() {
    return localStorage.getItem('token');
  }

  // Set auth token in localStorage
  setToken(token) {
    localStorage.setItem('token', token);
  }

  // Remove auth token from localStorage
  removeToken() {
    localStorage.removeItem('token');
  }

  // Get headers with auth token
  getHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async getProfile() {
    return this.request('/auth/me');
  }

  async updateProfile(userData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }

  // Properties methods
  async getProperties() {
    return this.request('/properties');
  }

  async getProperty(id) {
    return this.request(`/properties/${id}`);
  }

  async createProperty(propertyData) {
    return this.request('/properties', {
      method: 'POST',
      body: JSON.stringify(propertyData)
    });
  }

  async updateProperty(id, propertyData) {
    return this.request(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(propertyData)
    });
  }

  async deleteProperty(id) {
    return this.request(`/properties/${id}`, {
      method: 'DELETE'
    });
  }

  async getPropertyStats() {
    return this.request('/properties/stats');
  }

  // Tenants methods
  async getTenants() {
    return this.request('/tenants');
  }

  async getTenant(id) {
    return this.request(`/tenants/${id}`);
  }

  async createTenant(tenantData) {
    return this.request('/tenants', {
      method: 'POST',
      body: JSON.stringify(tenantData)
    });
  }

  async updateTenant(id, tenantData) {
    return this.request(`/tenants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tenantData)
    });
  }

  async deleteTenant(id) {
    return this.request(`/tenants/${id}`, {
      method: 'DELETE'
    });
  }

  async markLeaseComplete(id) {
    return this.request(`/tenants/${id}/lease-complete`, {
      method: 'PATCH'
    });
  }

  // Rent Payments methods
  async getRentPayments() {
    return this.request('/rent-payments');
  }

  async getRentPayment(id) {
    return this.request(`/rent-payments/${id}`);
  }

  async createRentPayment(paymentData) {
    return this.request('/rent-payments', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  async updateRentPayment(id, paymentData) {
    return this.request(`/rent-payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(paymentData)
    });
  }


  async deleteRentPayment(id) {
    return this.request(`/rent-payments/${id}`, {
      method: 'DELETE'
    });
  }

  // Maintenance methods
  async getMaintenanceRequests() {
    return this.request('/maintenance');
  }

  async getMaintenanceRequest(id) {
    return this.request(`/maintenance/${id}`);
  }

  async createMaintenanceRequest(requestData) {
    return this.request('/maintenance', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  async updateMaintenanceRequest(id, requestData) {
    return this.request(`/maintenance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(requestData)
    });
  }

  async deleteMaintenanceRequest(id) {
    return this.request(`/maintenance/${id}`, {
      method: 'DELETE'
    });
  }

  async getMaintenanceStats() {
    return this.request('/maintenance/stats');
  }

  async updateMaintenanceRequestStatus(id, status) {
    return this.request(`/maintenance/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  async markRentPaymentPaid(id) {
    return this.request(`/rent-payments/${id}/mark-paid`, {
      method: 'PUT'
    });
  }

  async getPropertyStats() {
    return this.request('/properties/stats');
  }

  async getTenantStats() {
    return this.request('/tenants/stats');
  }

  async getRentPaymentStats() {
    return this.request('/rent-payments/stats');
  }
}

export default new ApiService();
