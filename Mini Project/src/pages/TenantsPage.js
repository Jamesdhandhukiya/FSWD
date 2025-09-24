import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUsers, FaEnvelope, FaPhone, FaEdit, FaTrash, FaPlus, FaTimes, FaCheck } from 'react-icons/fa';
import api from '../services/api';

export default function TenantsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tenants, setTenants] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    loadTenants();
  }, []);

  // Reload data when returning from add page
  useEffect(() => {
    if (location.state?.refresh) {
      loadTenants();
    }
  }, [location.state]);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const [tenantsRes, propertiesRes] = await Promise.all([
        api.getTenants(),
        api.getProperties()
      ]);
      
      if (tenantsRes.success) {
        const tenantsData = tenantsRes.data || [];
        setTenants(tenantsData);
        
        // Calculate stats based on display status (considering lease period)
        const calculatedStats = calculateStats(tenantsData);
        setStats(calculatedStats);
        
        console.log('Tenant statistics:', {
          total: calculatedStats.total,
          active: calculatedStats.active,
          inactive: calculatedStats.inactive,
          details: tenantsData.map(t => ({
            name: `${t.firstName} ${t.lastName}`,
            dbStatus: t.status,
            displayStatus: getDisplayStatus(t),
            leaseEndDate: t.leaseEndDate
          }))
        });
      }

      if (propertiesRes.success) {
        // Filter to show only available properties for editing
        const availableProperties = (propertiesRes.data || []).filter(property => property.status === 'available');
        setProperties(availableProperties);
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTenant = () => {
    navigate('/add-tenant');
  };

  const handleEditTenant = (tenant) => {
    // Check if property still exists
    if (!tenant.property) {
      alert('Cannot edit tenant: The associated property has been deleted. Please delete this tenant and create a new one.');
      return;
    }
    
    setSelectedTenant(tenant);
    setEditFormData({
      firstName: tenant.firstName,
      lastName: tenant.lastName,
      email: tenant.email,
      phone: tenant.phone,
      property: tenant.property._id,
      rentAmount: tenant.rentAmount,
      leaseStartDate: tenant.leaseStartDate ? new Date(tenant.leaseStartDate).toISOString().split('T')[0] : '',
      leaseEndDate: tenant.leaseEndDate ? new Date(tenant.leaseEndDate).toISOString().split('T')[0] : ''
    });
    setEditErrors({});
    setShowEditModal(true);
  };

  const handleDeleteTenant = (tenant) => {
    setSelectedTenant(tenant);
    setShowDeleteModal(true);
  };

  const confirmDeleteTenant = async () => {
    if (!selectedTenant) return;
    
    try {
      setIsSubmitting(true);
      const response = await api.deleteTenant(selectedTenant._id);
      if (response.success) {
        setShowDeleteModal(false);
        setShowSuccessModal(true);
        loadTenants(); // Reload the list
      }
    } catch (error) {
      console.error('Error deleting tenant:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkLeaseComplete = async (tenant) => {
    try {
      const response = await api.markLeaseComplete(tenant._id);
      if (response.success) {
        setShowSuccessModal(true);
        loadTenants(); // Reload the list
      } else {
        alert('Failed to mark lease as complete: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error marking lease as complete:', error);
      alert('Error marking lease as complete. Please try again.');
    }
  };

  // Function to get display status based on lease period
  const getDisplayStatus = (tenant) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const leaseEndDate = new Date(tenant.leaseEndDate);
    leaseEndDate.setHours(0, 0, 0, 0);
    
    // If lease period is not over, show as active
    if (leaseEndDate >= today) {
      return 'active';
    }
    
    // If lease period is over, show actual status
    return tenant.status;
  };

  // Function to calculate statistics based on display status
  const calculateStats = (tenantsData) => {
    const total = tenantsData.length;
    const active = tenantsData.filter(t => getDisplayStatus(t) === 'active').length;
    const inactive = tenantsData.filter(t => getDisplayStatus(t) === 'inactive').length;
    
    return { total, active, inactive };
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setEditErrors({});

    try {
      const response = await api.updateTenant(selectedTenant._id, editFormData);
      if (response.success) {
        setShowEditModal(false);
        setShowSuccessModal(true);
        loadTenants(); // Reload the list
      }
    } catch (error) {
      console.error('Error updating tenant:', error);
      if (error.response?.data?.errors) {
        const errors = {};
        error.response.data.errors.forEach(err => {
          errors[err.path] = err.msg;
        });
        setEditErrors(errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'property') {
      // When property is selected, auto-fill rent amount
      const selectedProperty = properties.find(prop => prop._id === value);
      setEditFormData(prev => ({
        ...prev,
        [name]: value,
        rentAmount: selectedProperty ? selectedProperty.rentAmount : prev.rentAmount
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading tenants...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Add Tenant Button */}
      <div className="page-header">
        <div>
          <h1 className="main-title">Tenants</h1>
          <p className="subtitle">Manage your tenant information</p>
        </div>
        <button className="add-tenant-btn" onClick={handleAddTenant}>
          <FaPlus />
          Add Tenant
        </button>
      </div>

      {/* Summary Cards */}
      <div className="cards">
        <div className="card">
          <h2>Total Tenants</h2>
          <p>{stats.total}</p>
          <div className="card-icon blue"><FaUsers /></div>
        </div>
        <div className="card">
          <h2>Active</h2>
          <p>{stats.active}</p>
          <div className="card-icon green">
            <div className="status-indicator active"></div>
          </div>
        </div>
        <div className="card">
          <h2>Inactive</h2>
          <p>{stats.inactive}</p>
          <div className="card-icon gray">
            <div className="status-indicator inactive"></div>
          </div>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tenant</th>
              <th>Contact</th>
              <th>Property</th>
              <th>Lease Period</th>
              <th>Rent</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenants.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  <div className="empty-message">
                    <FaUsers className="empty-icon" />
                    <p>No tenants found</p>
                    <p className="empty-subtitle">Add your first tenant to get started</p>
                  </div>
                </td>
              </tr>
            ) : (
              tenants.map((tenant) => (
                <tr key={tenant._id}>
                  <td>
                    <div className="tenant-info">
                      <div className="tenant-name">{tenant.firstName} {tenant.lastName}</div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      <div className="contact-item">
                        <FaEnvelope className="contact-icon" />
                        <span>{tenant.email}</span>
                      </div>
                      <div className="contact-item">
                        <FaPhone className="contact-icon" />
                        <span>{tenant.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="property-name">
                      {tenant.property?.name || '-'}
                    </div>
                  </td>
                  <td>
                    <div className="lease-period">
                      <div>{new Date(tenant.leaseStartDate).toLocaleDateString()}</div>
                      <div>to {new Date(tenant.leaseEndDate).toLocaleDateString()}</div>
                    </div>
                  </td>
                  <td className="rent-amount">₹{tenant.rentAmount?.toLocaleString()}/mo</td>
                  <td>
                    <div className="status-container">
                      <span className={`badge ${getDisplayStatus(tenant).toLowerCase()}`}>
                        {getDisplayStatus(tenant)}
                      </span>
                      {(() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const leaseEndDate = new Date(tenant.leaseEndDate);
                        leaseEndDate.setHours(0, 0, 0, 0);
                        
                        // If lease period is over and not marked complete, show mark complete button
                        if (leaseEndDate < today && !tenant.leaseComplete) {
                          return (
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => handleMarkLeaseComplete(tenant)}
                              style={{ 
                                marginLeft: '8px',
                                padding: '4px 8px',
                                fontSize: '12px',
                                background: '#2563eb',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              Mark Complete
                            </button>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn edit-btn" 
                        title={tenant.property ? "Edit Tenant" : "Cannot edit: Property deleted"}
                        onClick={() => handleEditTenant(tenant)}
                        disabled={!tenant.property}
                        style={{ 
                          padding: '8px', 
                          border: '1px solid #ddd', 
                          background: tenant.property ? '#f8f9fa' : '#f5f5f5', 
                          cursor: tenant.property ? 'pointer' : 'not-allowed',
                          borderRadius: '4px',
                          opacity: tenant.property ? 1 : 0.6
                        }}
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="action-btn delete-btn" 
                        title="Delete Tenant"
                        onClick={() => handleDeleteTenant(tenant)}
                        style={{ 
                          padding: '8px', 
                          border: '1px solid #ddd', 
                          background: '#f8f9fa', 
                          cursor: 'pointer',
                          borderRadius: '4px'
                        }}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Tenant Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Tenant</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowEditModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={editFormData.firstName || ''}
                    onChange={handleInputChange}
                    className={`form-input ${editErrors.firstName ? 'error' : ''}`}
                    required
                  />
                  {editErrors.firstName && <span className="error-text">{editErrors.firstName}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={editFormData.lastName || ''}
                    onChange={handleInputChange}
                    className={`form-input ${editErrors.lastName ? 'error' : ''}`}
                    required
                  />
                  {editErrors.lastName && <span className="error-text">{editErrors.lastName}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email || ''}
                    onChange={handleInputChange}
                    className={`form-input ${editErrors.email ? 'error' : ''}`}
                    required
                  />
                  {editErrors.email && <span className="error-text">{editErrors.email}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editFormData.phone || ''}
                    onChange={handleInputChange}
                    className={`form-input ${editErrors.phone ? 'error' : ''}`}
                    required
                  />
                  {editErrors.phone && <span className="error-text">{editErrors.phone}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Property</label>
                <select
                  name="property"
                  value={editFormData.property || ''}
                  onChange={handleInputChange}
                  className={`form-input ${editErrors.property ? 'error' : ''}`}
                  required
                >
                  <option value="">Select Property</option>
                  {properties.length === 0 ? (
                    <option value="" disabled>No available properties found</option>
                  ) : (
                    properties.map(property => (
                      <option key={property._id} value={property._id}>
                        {property.name}
                      </option>
                    ))
                  )}
                </select>
                {editErrors.property && <span className="error-text">{editErrors.property}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Rent Amount (₹)</label>
                  <input
                    type="number"
                    name="rentAmount"
                    value={editFormData.rentAmount || ''}
                    onChange={handleInputChange}
                    className={`form-input ${editErrors.rentAmount ? 'error' : ''}`}
                    min="0"
                    step="0.01"
                    required
                  />
                  {editErrors.rentAmount && <span className="error-text">{editErrors.rentAmount}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Lease Start Date</label>
                  <input
                    type="date"
                    name="leaseStartDate"
                    value={editFormData.leaseStartDate || ''}
                    onChange={handleInputChange}
                    className={`form-input ${editErrors.leaseStartDate ? 'error' : ''}`}
                    required
                  />
                  {editErrors.leaseStartDate && <span className="error-text">{editErrors.leaseStartDate}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Lease End Date</label>
                  <input
                    type="date"
                    name="leaseEndDate"
                    value={editFormData.leaseEndDate || ''}
                    onChange={handleInputChange}
                    className={`form-input ${editErrors.leaseEndDate ? 'error' : ''}`}
                    required
                  />
                  {editErrors.leaseEndDate && <span className="error-text">{editErrors.leaseEndDate}</span>}
                </div>
              </div>


              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Updating...' : 'Update Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Delete Tenant</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowDeleteModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to delete <strong>{selectedTenant?.firstName} {selectedTenant?.lastName}</strong>?</p>
              <p className="warning-text">This action cannot be undone and will also update the property status to available.</p>
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className={`btn btn-danger ${isSubmitting ? 'loading' : ''}`}
                onClick={confirmDeleteTenant}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Delete Tenant'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal success-modal">
            <div className="modal-content">
              <div className="success-icon">
                <FaCheck />
              </div>
              <h2>Success!</h2>
              <p>Tenant has been updated successfully.</p>
              <button 
                className="btn btn-primary" 
                onClick={() => setShowSuccessModal(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}