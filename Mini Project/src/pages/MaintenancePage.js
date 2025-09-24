import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaWrench, FaExclamationCircle, FaClock, FaCheck, FaPlus, FaEdit, FaTrash, FaChevronDown, FaTimes } from 'react-icons/fa';
import api from '../services/api';

export default function MaintenancePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    completed: 0,
    urgent: 0
  });
  const [statusDropdowns, setStatusDropdowns] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tenants, setTenants] = useState([]);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    loadMaintenanceRequests();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.status-dropdown-container')) {
        setStatusDropdowns({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reload data when returning from add page
  useEffect(() => {
    if (location.state?.refresh) {
      loadMaintenanceRequests();
    }
  }, [location.state]);

  const loadMaintenanceRequests = async () => {
    try {
      setLoading(true);
      const [requestsRes, tenantsRes, propertiesRes] = await Promise.all([
        api.getMaintenanceRequests(),
        api.getTenants(),
        api.getProperties()
      ]);
      
      if (requestsRes.success) {
        const requestsData = requestsRes.data || [];
        console.log('Maintenance requests data:', requestsData);
        setRequests(requestsData);
        
        setStats({
          total: requestsData.length,
          open: requestsData.filter(r => r.status === 'open').length,
          inProgress: requestsData.filter(r => r.status === 'in_progress').length,
          completed: requestsData.filter(r => r.status === 'resolved').length,
          urgent: requestsData.filter(r => r.priority === 'high').length
        });
      }

      if (tenantsRes.success) {
        setTenants(tenantsRes.data || []);
      }

      if (propertiesRes.success) {
        setProperties(propertiesRes.data || []);
      }
    } catch (error) {
      console.error('Error loading maintenance requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatusDropdown = (id, event) => {
    console.log('Toggling dropdown for request:', id);
    event.stopPropagation();
    setStatusDropdowns(prev => {
      const newState = {
        ...prev,
        [id]: !prev[id]
      };
      console.log('New dropdown state:', newState);
      return newState;
    });
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      console.log('Updating status for request:', id, 'to status:', newStatus);
      const response = await api.updateMaintenanceRequestStatus(id, newStatus);
      console.log('Status update response:', response);
      if (response.success) {
        loadMaintenanceRequests(); // Reload the list
      } else {
        alert('Failed to update status: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status. Please try again.');
    }
    
    setStatusDropdowns(prev => ({
      ...prev,
      [id]: false
    }));
  };

  const handleAddRequest = () => {
    navigate('/add-maintenance-request');
  };

  const handleEditRequest = (request) => {
    setSelectedRequest(request);
    setEditFormData({
      title: request.title,
      description: request.description,
      property: request.property?._id || '',
      tenant: request.tenant?._id || '',
      priority: request.priority,
      estimatedCost: request.estimatedCost || '',
      status: request.status
    });
    setEditErrors({});
    setShowEditModal(true);
  };

  const handleDeleteRequest = (request) => {
    setSelectedRequest(request);
    setShowDeleteModal(true);
  };

  const confirmDeleteRequest = async () => {
    if (!selectedRequest) return;
    
    try {
      setIsSubmitting(true);
      const response = await api.deleteMaintenanceRequest(selectedRequest._id);
      if (response.success) {
        setShowDeleteModal(false);
        setShowSuccessModal(true);
        loadMaintenanceRequests(); // Reload the list
      }
    } catch (error) {
      console.error('Error deleting maintenance request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });

    // Clear error when user starts typing
    if (editErrors[name]) {
      setEditErrors({
        ...editErrors,
        [name]: ''
      });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setEditErrors({});

    try {
      const response = await api.updateMaintenanceRequest(selectedRequest._id, editFormData);
      if (response.success) {
        setShowEditModal(false);
        setShowSuccessModal(true);
        loadMaintenanceRequests(); // Reload the list
      }
    } catch (error) {
      console.error('Error updating maintenance request:', error);
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


  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'urgent';
      case 'medium':
        return 'medium';
      case 'low':
        return 'low';
      default:
        return '';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'open';
      case 'in_progress':
        return 'inprogress';
      case 'resolved':
        return 'resolved';
      case 'cancelled':
        return 'cancelled';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading maintenance requests...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Add Request Button */}
      <div className="page-header">
        <div>
          <h1 className="main-title">Maintenance Requests</h1>
          <p className="subtitle">Track and manage property maintenance</p>
        </div>
        <button className="add-request-btn" onClick={handleAddRequest}>
          <FaPlus />
          Add Request
        </button>
      </div>

      {/* Summary Cards */}
      <div className="cards">
        <div className="card">
          <h2>Total Requests</h2>
          <p>{stats.total}</p>
          <div className="card-icon blue"><FaWrench /></div>
        </div>
        <div className="card">
          <h2>Open</h2>
          <p>{stats.open}</p>
          <div className="card-icon red">
            <div className="status-indicator open"></div>
          </div>
        </div>
        <div className="card">
          <h2>In Progress</h2>
          <p>{stats.inProgress}</p>
          <div className="card-icon orange">
            <div className="status-indicator inprogress"></div>
          </div>
        </div>
        <div className="card">
          <h2>Completed</h2>
          <p>{stats.completed}</p>
          <div className="card-icon green">
            <div className="status-indicator resolved"></div>
          </div>
        </div>
        <div className="card">
          <h2>Urgent</h2>
          <p>{stats.urgent}</p>
          <div className="card-icon red">
            <FaExclamationCircle />
          </div>
        </div>
      </div>

      {/* Maintenance Requests Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Property</th>
              <th>Issue</th>
              <th>Tenant</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  <div className="empty-message">
                    <FaWrench className="empty-icon" />
                    <p>No maintenance requests found</p>
                    <p className="empty-subtitle">Add your first maintenance request to get started</p>
                  </div>
                </td>
              </tr>
            ) : (
              requests.map((request) => {
                console.log('Rendering request:', request);
                return (
                <tr key={request._id}>
                  <td>
                    <div className="property-info">
                      <div className="property-name">{request.property?.name || 'No property assigned'}</div>
                    </div>
                  </td>
                  <td>
                    <div className="issue-info">
                      <div className="issue-title">{request.title}</div>
                      <div className="issue-description">{request.description}</div>
                    </div>
                  </td>
                  <td>
                    <div className="tenant-info">
                      <div className="tenant-name">
                        {request.tenant ? 
                          `${request.tenant.firstName} ${request.tenant.lastName}` : 
                          'No tenant assigned'
                        }
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`priority-badge ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </td>
                  <td>
                    <div className="status-dropdown-container">
                      <button 
                        className={`status-dropdown ${getStatusColor(request.status)}`}
                        onClick={(e) => toggleStatusDropdown(request._id, e)}
                      >
                        <span className={`badge ${getStatusColor(request.status)}`}>
                          {request.status === 'resolved' ? 'Completed' : request.status.replace('_', ' ')}
                        </span>
                        <FaChevronDown className="dropdown-arrow" />
                      </button>
                      {statusDropdowns[request._id] && (
                        <div className="status-dropdown-menu">
                          <button onClick={() => handleStatusChange(request._id, 'open')}>
                            Open
                          </button>
                          <button onClick={() => handleStatusChange(request._id, 'in_progress')}>
                            In Progress
                          </button>
                          <button onClick={() => handleStatusChange(request._id, 'resolved')}>
                            Completed
                          </button>
                          <button onClick={() => handleStatusChange(request._id, 'cancelled')}>
                            Cancelled
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="date-info">
                      <div>{new Date(request.createdAt).toLocaleDateString()}</div>
                      {request.completedAt && (
                        <div className="completed-date">
                          Completed: {new Date(request.completedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button 
                        className="action-btn edit-btn" 
                        title="Edit Request"
                        onClick={() => {
                          console.log('Edit button clicked for request:', request);
                          handleEditRequest(request);
                        }}
                        style={{ 
                          padding: '8px', 
                          border: '1px solid #ddd', 
                          background: '#f8f9fa', 
                          cursor: 'pointer',
                          borderRadius: '4px',
                          color: '#2563eb',
                          fontSize: '14px',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: '32px',
                          height: '32px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#e3f2fd';
                          e.target.style.borderColor = '#2563eb';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#f8f9fa';
                          e.target.style.borderColor = '#ddd';
                        }}
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="action-btn delete-btn" 
                        title="Delete Request"
                        onClick={() => {
                          console.log('Delete button clicked for request:', request);
                          handleDeleteRequest(request);
                        }}
                        style={{ 
                          padding: '8px', 
                          border: '1px solid #ddd', 
                          background: '#f8f9fa', 
                          cursor: 'pointer',
                          borderRadius: '4px',
                          color: '#dc2626',
                          fontSize: '14px',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: '32px',
                          height: '32px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#ffebee';
                          e.target.style.borderColor = '#dc2626';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#f8f9fa';
                          e.target.style.borderColor = '#ddd';
                        }}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Maintenance Request Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Maintenance Request</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowEditModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-content">
              <form onSubmit={handleEditSubmit} className="modal-form">
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={editFormData.title || ''}
                    onChange={handleInputChange}
                    className={`form-input ${editErrors.title ? 'error' : ''}`}
                    placeholder="Enter request title"
                  />
                  {editErrors.title && <span className="error-text">{editErrors.title}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    value={editFormData.description || ''}
                    onChange={handleInputChange}
                    className={`form-input ${editErrors.description ? 'error' : ''}`}
                    rows="4"
                    placeholder="Enter description"
                  />
                  {editErrors.description && <span className="error-text">{editErrors.description}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Property</label>
                    <select
                      name="property"
                      value={editFormData.property || ''}
                      onChange={handleInputChange}
                      className={`form-input ${editErrors.property ? 'error' : ''}`}
                    >
                      <option value="">Select Property</option>
                      {properties.map(property => (
                        <option key={property._id} value={property._id}>
                          {property.name}
                        </option>
                      ))}
                    </select>
                    {editErrors.property && <span className="error-text">{editErrors.property}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tenant</label>
                    <select
                      name="tenant"
                      value={editFormData.tenant || ''}
                      onChange={handleInputChange}
                      className={`form-input ${editErrors.tenant ? 'error' : ''}`}
                    >
                      <option value="">Select Tenant</option>
                      {tenants
                        .filter(tenant => tenant.property === editFormData.property)
                        .map(tenant => (
                          <option key={tenant._id} value={tenant._id}>
                            {tenant.firstName} {tenant.lastName}
                          </option>
                        ))}
                    </select>
                    {editErrors.tenant && <span className="error-text">{editErrors.tenant}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      name="priority"
                      value={editFormData.priority || ''}
                      onChange={handleInputChange}
                      className={`form-input ${editErrors.priority ? 'error' : ''}`}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                    {editErrors.priority && <span className="error-text">{editErrors.priority}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      name="status"
                      value={editFormData.status || ''}
                      onChange={handleInputChange}
                      className={`form-input ${editErrors.status ? 'error' : ''}`}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    {editErrors.status && <span className="error-text">{editErrors.status}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    name="category"
                    value={editFormData.category || ''}
                    onChange={handleInputChange}
                    className={`form-input ${editErrors.category ? 'error' : ''}`}
                  >
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="hvac">HVAC</option>
                    <option value="appliance">Appliance</option>
                    <option value="structural">Structural</option>
                    <option value="other">Other</option>
                  </select>
                  {editErrors.category && <span className="error-text">{editErrors.category}</span>}
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
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Updating...' : 'Update Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Delete Maintenance Request</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowDeleteModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-content">
              <div className="warning-text">
                <p>Are you sure you want to delete this maintenance request?</p>
                <p><strong>Title:</strong> {selectedRequest?.title}</p>
                <p><strong>Property:</strong> {selectedRequest?.property?.name}</p>
                <p>This action cannot be undone.</p>
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={confirmDeleteRequest}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Deleting...' : 'Delete Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal success-modal">
            <div className="modal-header">
              <h2>Success!</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowSuccessModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-content">
              <div className="success-icon">
                <FaCheck />
              </div>
              <p>Maintenance request has been updated successfully!</p>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => setShowSuccessModal(false)}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}