import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaBuilding, FaEdit, FaTrash, FaPlus, FaTimes, FaCheck } from 'react-icons/fa';
import api from '../services/api';

export default function PropertiesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    occupied: 0,
    vacant: 0,
    maintenance: 0
  });
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadProperties();
  }, []);

  // Reload data when returning from add page
  useEffect(() => {
    if (location.state?.refresh) {
      loadProperties();
    }
  }, [location.state]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const [propertiesRes, statsRes] = await Promise.all([
        api.getProperties(),
        api.getPropertyStats()
      ]);

      if (propertiesRes.success) {
        setProperties(propertiesRes.data || []);
      }

      if (statsRes.success) {
        setStats({
          total: statsRes.data?.total || 0,
          occupied: statsRes.data?.occupied || 0,
          vacant: statsRes.data?.available || 0,
          maintenance: statsRes.data?.maintenance || 0
        });
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProperty = () => {
    navigate('/add-property');
  };

  const handleEditProperty = (property) => {
    setSelectedProperty(property);
    setEditFormData({
      name: property.name,
      address: {
        street: property.address.street,
        city: property.address.city,
        state: property.address.state,
        zipCode: property.address.zipCode
      },
      type: property.type,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      squareFeet: property.squareFeet || '',
      rentAmount: property.rentAmount,
      description: property.description || ''
    });
    setEditErrors({});
    setShowEditModal(true);
  };

  const handleDeleteProperty = (property) => {
    setSelectedProperty(property);
    setShowDeleteModal(true);
  };

  const confirmDeleteProperty = async () => {
    if (!selectedProperty) return;
    
    try {
      setIsSubmitting(true);
      const response = await api.deleteProperty(selectedProperty._id);
      if (response.success) {
        setShowDeleteModal(false);
        setShowSuccessModal(true);
        loadProperties(); // Reload the list
      }
    } catch (error) {
      console.error('Error deleting property:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setEditErrors({});

    try {
      console.log('Updating property with data:', {
        propertyId: selectedProperty._id,
        formData: editFormData
      });
      
      const response = await api.updateProperty(selectedProperty._id, editFormData);
      console.log('Update response:', response);
      
      if (response.success) {
        setShowEditModal(false);
        setShowSuccessModal(true);
        loadProperties(); // Reload the list
      } else {
        console.error('Update failed:', response.message);
        alert('Failed to update property: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating property:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.data?.errors) {
        const errors = {};
        error.response.data.errors.forEach(err => {
          errors[err.path] = err.msg;
        });
        setEditErrors(errors);
      } else {
        alert('Error updating property: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setEditFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
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
        <p>Loading properties...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Add Property Button */}
      <div className="page-header">
        <div>
          <h1 className="main-title">Properties</h1>
          <p className="subtitle">Manage your property portfolio</p>
        </div>
        <button className="add-property-btn" onClick={handleAddProperty}>
          <FaPlus />
          Add Property
        </button>
      </div>

      {/* Summary Cards */}
      <div className="cards">
        <div className="card">
          <h2>Total Properties</h2>
          <p>{stats.total}</p>
          <div className="card-icon blue"><FaBuilding /></div>
        </div>
        <div className="card">
          <h2>Occupied</h2>
          <p>{stats.occupied}</p>
          <div className="card-icon green">
            <div className="status-indicator occupied"></div>
          </div>
        </div>
        <div className="card">
          <h2>Available</h2>
          <p>{stats.vacant}</p>
          <div className="card-icon gray">
            <div className="status-indicator vacant"></div>
          </div>
        </div>
        <div className="card">
          <h2>Maintenance</h2>
          <p>{stats.maintenance}</p>
          <div className="card-icon orange">
            <div className="status-indicator maintenance"></div>
          </div>
        </div>
      </div>

      {/* Properties Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Property</th>
              <th>Type</th>
              <th>Rent</th>
              <th>Status</th>
              <th>Tenant</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">
                  <div className="empty-message">
                    <FaBuilding className="empty-icon" />
                    <p>No properties found</p>
                    <p className="empty-subtitle">Add your first property to get started</p>
                  </div>
                </td>
              </tr>
            ) : (
              properties.map((property) => (
                <tr key={property._id}>
                  <td>
                    <div className="property-info">
                      <div className="property-name">{property.name}</div>
                      <div className="property-address">{property.fullAddress || `${property.address.street}, ${property.address.city}, ${property.address.state} ${property.address.zipCode}`}</div>
                      <div className="property-details">{property.bedrooms} bed • {property.bathrooms} bath</div>
                    </div>
                  </td>
                  <td className="property-type">{property.type}</td>
                  <td className="rent-amount">₹{property.rentAmount?.toLocaleString()}/mo</td>
                  <td>
                    <span className={`badge ${property.status.toLowerCase()}`}>
                      {property.status}
                    </span>
                  </td>
                  <td>
                    {property.tenant ? (
                      <div className="tenant-info">
                        <div className="tenant-name">{property.tenant.firstName} {property.tenant.lastName}</div>
                        {property.tenant.email && (
                          <div className="tenant-email">{property.tenant.email}</div>
                        )}
                        {property.tenant.phone && (
                          <div className="tenant-phone">{property.tenant.phone}</div>
                        )}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    <div className="action-buttons" style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="action-btn edit-btn" 
                        title="Edit Property"
                        onClick={() => handleEditProperty(property)}
                        style={{ 
                          padding: '8px', 
                          border: '1px solid #ddd', 
                          background: '#f8f9fa', 
                          cursor: 'pointer',
                          borderRadius: '4px'
                        }}
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="action-btn delete-btn" 
                        title="Delete Property"
                        onClick={() => handleDeleteProperty(property)}
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

      {/* Edit Property Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Property</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowEditModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Property Name</label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name || ''}
                  onChange={handleInputChange}
                  className={`form-input ${editErrors.name ? 'error' : ''}`}
                  required
                />
                {editErrors.name && <span className="error-text">{editErrors.name}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Street Address</label>
                  <input
                    type="text"
                    name="address.street"
                    value={editFormData.address?.street || ''}
                    onChange={handleInputChange}
                    className={`form-input ${editErrors['address.street'] ? 'error' : ''}`}
                    required
                  />
                  {editErrors['address.street'] && <span className="error-text">{editErrors['address.street']}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    name="address.city"
                    value={editFormData.address?.city || ''}
                    onChange={handleInputChange}
                    className={`form-input ${editErrors['address.city'] ? 'error' : ''}`}
                    required
                  />
                  {editErrors['address.city'] && <span className="error-text">{editErrors['address.city']}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    name="address.state"
                    value={editFormData.address?.state || ''}
                    onChange={handleInputChange}
                    className={`form-input ${editErrors['address.state'] ? 'error' : ''}`}
                    required
                  />
                  {editErrors['address.state'] && <span className="error-text">{editErrors['address.state']}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">ZIP Code</label>
                  <input
                    type="text"
                    name="address.zipCode"
                    value={editFormData.address?.zipCode || ''}
                    onChange={handleInputChange}
                    className={`form-input ${editErrors['address.zipCode'] ? 'error' : ''}`}
                    required
                  />
                  {editErrors['address.zipCode'] && <span className="error-text">{editErrors['address.zipCode']}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Property Type</label>
                  <select
                    name="type"
                    value={editFormData.type || ''}
                    onChange={handleInputChange}
                    className={`form-input ${editErrors.type ? 'error' : ''}`}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="commercial">Commercial</option>
                  </select>
                  {editErrors.type && <span className="error-text">{editErrors.type}</span>}
                </div>
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
                  <label className="form-label">Bedrooms</label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={editFormData.bedrooms || ''}
                    onChange={handleInputChange}
                    className={`form-input ${editErrors.bedrooms ? 'error' : ''}`}
                    min="0"
                    required
                  />
                  {editErrors.bedrooms && <span className="error-text">{editErrors.bedrooms}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Bathrooms</label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={editFormData.bathrooms || ''}
                    onChange={handleInputChange}
                    className={`form-input ${editErrors.bathrooms ? 'error' : ''}`}
                    min="0"
                    step="0.5"
                    required
                  />
                  {editErrors.bathrooms && <span className="error-text">{editErrors.bathrooms}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Square Feet (Optional)</label>
                <input
                  type="number"
                  name="squareFeet"
                  value={editFormData.squareFeet || ''}
                  onChange={handleInputChange}
                  className={`form-input ${editErrors.squareFeet ? 'error' : ''}`}
                  min="0"
                />
                {editErrors.squareFeet && <span className="error-text">{editErrors.squareFeet}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea
                  name="description"
                  value={editFormData.description || ''}
                  onChange={handleInputChange}
                  className={`form-input ${editErrors.description ? 'error' : ''}`}
                  rows="3"
                  maxLength="500"
                />
                {editErrors.description && <span className="error-text">{editErrors.description}</span>}
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
                  {isSubmitting ? 'Updating...' : 'Update Property'}
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
              <h2>Delete Property</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowDeleteModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to delete <strong>{selectedProperty?.name}</strong>?</p>
              <p className="warning-text">This action cannot be undone.</p>
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
                onClick={confirmDeleteProperty}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Delete Property'}
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
              <p>Property has been updated successfully.</p>
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
