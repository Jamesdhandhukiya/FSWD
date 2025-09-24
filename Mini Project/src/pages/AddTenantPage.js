import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaEnvelope, FaPhone, FaBuilding, FaCalendar, FaDollarSign, FaSave, FaTimes } from 'react-icons/fa';
import api from '../services/api';
import '../styles/RenteaseDashboard.css';

export default function AddTenantPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    property: '',
    rentAmount: '',
    leaseStartDate: '',
    leaseEndDate: '',
    status: 'active',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const response = await api.getProperties();
      if (response.success) {
        // Filter to show only available properties
        const availableProperties = (response.data || []).filter(property => property.status === 'available');
        setProperties(availableProperties);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        emergencyContact: {
          ...formData.emergencyContact,
          [field]: value
        }
      });
    } else if (name === 'property') {
      // When property is selected, auto-fill rent amount
      const selectedProperty = properties.find(prop => prop._id === value);
      setFormData({
        ...formData,
        [name]: value,
        rentAmount: selectedProperty ? selectedProperty.rentAmount : ''
      });
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

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.property) {
      newErrors.property = 'Property selection is required';
    }

    if (!formData.rentAmount || formData.rentAmount <= 0) {
      newErrors.rentAmount = 'Rent amount is required';
    }

    if (!formData.leaseStartDate) {
      newErrors.leaseStartDate = 'Lease start date is required';
    }

    if (!formData.leaseEndDate) {
      newErrors.leaseEndDate = 'Lease end date is required';
    }

    if (formData.leaseStartDate && formData.leaseEndDate) {
      const startDate = new Date(formData.leaseStartDate);
      const endDate = new Date(formData.leaseEndDate);
      if (endDate <= startDate) {
        newErrors.leaseEndDate = 'Lease end date must be after start date';
      }
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
      const response = await api.createTenant(formData);
      if (response.success) {
        alert('Tenant added successfully!');
        navigate('/tenants', { state: { refresh: true } });
      } else {
        alert(response.message || 'Failed to add tenant. Please try again.');
      }
    } catch (error) {
      alert(error.message || 'Failed to add tenant. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/tenants');
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <button onClick={() => navigate('/tenants')} className="back-btn">
          <FaArrowLeft /> Back to Tenants
        </button>
        <h1 className="page-title">Add New Tenant</h1>
      </div>

      <div className="profile-form-container">
        <div className="profile-form-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <FaUser />
            </div>
            <div className="profile-info">
              <h2>New Tenant</h2>
              <p>Add a new tenant to your property</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
              <h3 className="section-title">Personal Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label">
                    <FaUser className="label-icon" />
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`form-input ${errors.firstName ? 'error' : ''}`}
                    placeholder="John"
                  />
                  {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="lastName" className="form-label">
                    <FaUser className="label-icon" />
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`form-input ${errors.lastName ? 'error' : ''}`}
                    placeholder="Doe"
                  />
                  {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    <FaEnvelope className="label-icon" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="john.doe@email.com"
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    <FaPhone className="label-icon" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`form-input ${errors.phone ? 'error' : ''}`}
                    placeholder="(555) 123-4567"
                  />
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Lease Information</h3>
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
                  {properties.length === 0 ? (
                    <option value="" disabled>No available properties found</option>
                  ) : (
                    properties.map(property => (
                      <option key={property._id} value={property._id}>
                        {property.name} - {property.address.street}, {property.address.city}
                      </option>
                    ))
                  )}
                </select>
                {errors.property && <span className="error-text">{errors.property}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="rentAmount" className="form-label">
                    <FaDollarSign className="label-icon" />
                    Monthly Rent
                  </label>
                  <input
                    type="number"
                    id="rentAmount"
                    name="rentAmount"
                    value={formData.rentAmount}
                    onChange={handleChange}
                    className={`form-input ${errors.rentAmount ? 'error' : ''}`}
                    min="0"
                    step="0.01"
                    placeholder="2500"
                  />
                  {errors.rentAmount && <span className="error-text">{errors.rentAmount}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="status" className="form-label">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="leaseStartDate" className="form-label">
                    <FaCalendar className="label-icon" />
                    Lease Start Date
                  </label>
                  <input
                    type="date"
                    id="leaseStartDate"
                    name="leaseStartDate"
                    value={formData.leaseStartDate}
                    onChange={handleChange}
                    className={`form-input ${errors.leaseStartDate ? 'error' : ''}`}
                  />
                  {errors.leaseStartDate && <span className="error-text">{errors.leaseStartDate}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="leaseEndDate" className="form-label">
                    <FaCalendar className="label-icon" />
                    Lease End Date
                  </label>
                  <input
                    type="date"
                    id="leaseEndDate"
                    name="leaseEndDate"
                    value={formData.leaseEndDate}
                    onChange={handleChange}
                    className={`form-input ${errors.leaseEndDate ? 'error' : ''}`}
                  />
                  {errors.leaseEndDate && <span className="error-text">{errors.leaseEndDate}</span>}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Emergency Contact</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="emergencyContact.name" className="form-label">Contact Name</label>
                  <input
                    type="text"
                    id="emergencyContact.name"
                    name="emergencyContact.name"
                    value={formData.emergencyContact.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="emergencyContact.phone" className="form-label">Contact Phone</label>
                  <input
                    type="tel"
                    id="emergencyContact.phone"
                    name="emergencyContact.phone"
                    value={formData.emergencyContact.phone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="(555) 987-6543"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="emergencyContact.relationship" className="form-label">Relationship</label>
                  <input
                    type="text"
                    id="emergencyContact.relationship"
                    name="emergencyContact.relationship"
                    value={formData.emergencyContact.relationship}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Spouse, Parent, etc."
                  />
                </div>
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
                <FaSave /> {isLoading ? 'Adding Tenant...' : 'Add Tenant'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
