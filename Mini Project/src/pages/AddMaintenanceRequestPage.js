import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaWrench, FaExclamationCircle, FaBuilding, FaUser, FaSave, FaTimes } from 'react-icons/fa';
import api from '../services/api';
import '../styles/RenteaseDashboard.css';

export default function AddMaintenanceRequestPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property: '',
    tenant: '',
    priority: 'medium',
    status: 'open',
    category: 'other',
    estimatedCost: '',
    notes: ''
  });
  const [tenants, setTenants] = useState([]);
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tenantsRes, propertiesRes] = await Promise.all([
        api.getTenants(),
        api.getProperties()
      ]);

      if (tenantsRes.success) {
        const tenantsData = tenantsRes.data || [];
        console.log('Tenants data:', tenantsData);
        setTenants(tenantsData);
      }

      if (propertiesRes.success) {
        const propertiesData = propertiesRes.data || [];
        console.log('Properties data:', propertiesData);
        setProperties(propertiesData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If property changes, reset tenant selection
    if (name === 'property') {
      setFormData({
        ...formData,
        [name]: value,
        tenant: '' // Reset tenant when property changes
      });
      console.log('Property changed to:', value);
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };


  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.property) {
      newErrors.property = 'Property selection is required';
    }


    if (formData.estimatedCost && formData.estimatedCost < 0) {
      newErrors.estimatedCost = 'Estimated cost cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.createMaintenanceRequest(formData);
      if (response.success) {
        alert('Maintenance request added successfully!');
        navigate('/maintenance', { state: { refresh: true } });
      } else {
        alert(response.message || 'Failed to add maintenance request. Please try again.');
      }
    } catch (error) {
      alert(error.message || 'Failed to add maintenance request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/maintenance');
  };

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'green' },
    { value: 'medium', label: 'Medium', color: 'yellow' },
    { value: 'high', label: 'High', color: 'red' }
  ];

  const categoryOptions = [
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'hvac', label: 'HVAC' },
    { value: 'appliance', label: 'Appliance' },
    { value: 'structural', label: 'Structural' },
    { value: 'other', label: 'Other' }
  ];

  const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' }
  ];

  // Filter tenants based on selected property
  const filteredTenants = formData.property 
    ? tenants.filter(tenant => tenant.property && tenant.property._id === formData.property)
    : tenants;
  
  console.log('Selected property:', formData.property);
  console.log('All tenants:', tenants);
  console.log('Filtered tenants:', filteredTenants);
  console.log('Tenants length:', tenants.length);
  console.log('Filtered tenants length:', filteredTenants.length);

  return (
    <div className="page-content">
      <div className="page-header">
        <button onClick={() => navigate('/maintenance')} className="back-btn">
          <FaArrowLeft /> Back to Maintenance
        </button>
        <h1 className="page-title">Add Maintenance Request</h1>
      </div>

      <div className="profile-form-container">
        <div className="profile-form-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <FaWrench />
            </div>
            <div className="profile-info">
              <h2>New Maintenance Request</h2>
              <p>Report a maintenance issue</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
              <h3 className="section-title">Request Details</h3>
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  <FaExclamationCircle className="label-icon" />
                  Issue Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`form-input ${errors.title ? 'error' : ''}`}
                  placeholder="e.g., Leaky faucet in kitchen"
                />
                {errors.title && <span className="error-text">{errors.title}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`form-input ${errors.description ? 'error' : ''}`}
                  rows="4"
                  placeholder="Describe the issue in detail..."
                />
                {errors.description && <span className="error-text">{errors.description}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category" className="form-label">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="form-input"
                  >
                    {categoryOptions.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="priority" className="form-label">Priority</label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="form-input"
                  >
                    {priorityOptions.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Location & Assignment</h3>
              <div className="form-group">
                <label htmlFor="property" className="form-label">
                  <FaBuilding className="label-icon" />
                  Property
                </label>
                <select
                  id="property"
                  name="property"
                  value={formData.property}
                  onChange={handleChange}
                  className={`form-input ${errors.property ? 'error' : ''}`}
                >
                  <option value="">Select a property</option>
                  {properties.map(property => (
                    <option key={property._id} value={property._id}>
                      {property.name} - {property.address.street}, {property.address.city}
                    </option>
                  ))}
                </select>
                {errors.property && <span className="error-text">{errors.property}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="tenant" className="form-label">
                  <FaUser className="label-icon" />
                  Tenant (Optional)
                </label>
                <select
                  id="tenant"
                  name="tenant"
                  value={formData.tenant}
                  onChange={handleChange}
                  className={`form-input ${errors.tenant ? 'error' : ''}`}
                >
                  <option value="">Select a tenant</option>
                  {filteredTenants.length === 0 ? (
                    <option value="" disabled>No tenants available</option>
                  ) : (
                    filteredTenants.map(tenant => (
                      <option key={tenant._id} value={tenant._id}>
                        {tenant.firstName} {tenant.lastName}
                      </option>
                    ))
                  )}
                </select>
                {errors.tenant && <span className="error-text">{errors.tenant}</span>}
                {!formData.property && (
                  <span className="form-hint">Please select a property first</span>
                )}
                {/* Debug info - remove in production */}
                <div style={{fontSize: '12px', color: '#666', marginTop: '5px'}}>
                  Debug: {tenants.length} total tenants, {filteredTenants.length} filtered
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="status" className="form-label">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="form-input"
                  >
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="estimatedCost" className="form-label">Estimated Cost (₹)</label>
                  <input
                    type="number"
                    id="estimatedCost"
                    name="estimatedCost"
                    value={formData.estimatedCost}
                    onChange={handleChange}
                    className={`form-input ${errors.estimatedCost ? 'error' : ''}`}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                  {errors.estimatedCost && <span className="error-text">{errors.estimatedCost}</span>}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Additional Information</h3>
              <div className="form-group">
                <label htmlFor="notes" className="form-label">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="form-input"
                  rows="4"
                  placeholder="Any additional notes or special instructions..."
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                <FaTimes /> Cancel
              </button>
              <button
                type="submit"
                className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                <FaSave /> {isLoading ? 'Adding Request...' : 'Add Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
