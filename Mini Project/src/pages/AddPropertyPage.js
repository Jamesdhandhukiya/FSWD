import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBuilding, FaMapMarkerAlt, FaBed, FaBath, FaDollarSign, FaSave, FaTimes } from 'react-icons/fa';
import api from '../services/api';
import '../styles/RenteaseDashboard.css';

export default function AddPropertyPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    type: 'apartment',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    bedrooms: '',
    bathrooms: '',
    rentAmount: '',
    description: '',
    amenities: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const propertyTypes = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'Single Family House' },
    { value: 'condo', label: 'Condominium' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'commercial', label: 'Commercial' }
  ];


  const commonAmenities = [
    'Parking', 'Balcony', 'Garden', 'Pool', 'Gym', 'Laundry', 
    'Air Conditioning', 'Heating', 'Pet Friendly', 'Furnished'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value
        }
      });
    } else if (name === 'amenities') {
      const amenity = value;
      setFormData({
        ...formData,
        amenities: formData.amenities.includes(amenity)
          ? formData.amenities.filter(a => a !== amenity)
          : [...formData.amenities, amenity]
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

    if (!formData.name.trim()) {
      newErrors.name = 'Property name is required';
    }

    if (!formData.address.street.trim()) {
      newErrors['address.street'] = 'Street address is required';
    }

    if (!formData.address.city.trim()) {
      newErrors['address.city'] = 'City is required';
    }

    if (!formData.address.state.trim()) {
      newErrors['address.state'] = 'State is required';
    }

    if (!formData.address.zipCode.trim()) {
      newErrors['address.zipCode'] = 'ZIP code is required';
    }

    if (!formData.bedrooms || formData.bedrooms < 0) {
      newErrors.bedrooms = 'Number of bedrooms is required';
    }

    if (!formData.bathrooms || formData.bathrooms < 0) {
      newErrors.bathrooms = 'Number of bathrooms is required';
    }

    if (!formData.rentAmount || formData.rentAmount <= 0) {
      newErrors.rentAmount = 'Rent amount is required';
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
      const response = await api.createProperty(formData);
      if (response.success) {
        alert('Property added successfully!');
        navigate('/properties', { state: { refresh: true } });
      } else {
        alert(response.message || 'Failed to add property. Please try again.');
      }
    } catch (error) {
      alert(error.message || 'Failed to add property. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/properties');
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <button onClick={() => navigate('/properties')} className="back-btn">
          <FaArrowLeft /> Back to Properties
        </button>
        <h1 className="page-title">Add New Property</h1>
      </div>

      <div className="profile-form-container">
        <div className="profile-form-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <FaBuilding />
            </div>
            <div className="profile-info">
              <h2>New Property</h2>
              <p>Add a new property to your portfolio</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
              <h3 className="section-title">Basic Information</h3>
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  <FaBuilding className="label-icon" />
                  Property Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder="e.g., Sunset Apartments #12A"
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="type" className="form-label">Property Type</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="form-input"
                >
                  {propertyTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Address Information</h3>
              <div className="form-group">
                <label htmlFor="address.street" className="form-label">
                  <FaMapMarkerAlt className="label-icon" />
                  Street Address
                </label>
                <input
                  type="text"
                  id="address.street"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  className={`form-input ${errors['address.street'] ? 'error' : ''}`}
                  placeholder="123 Main Street"
                />
                {errors['address.street'] && <span className="error-text">{errors['address.street']}</span>}
              </div>

              <div className="form-row three-col">
                <div className="form-group">
                  <label htmlFor="address.city" className="form-label">City</label>
                  <input
                    type="text"
                    id="address.city"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    className={`form-input ${errors['address.city'] ? 'error' : ''}`}
                    placeholder="City"
                  />
                  {errors['address.city'] && <span className="error-text">{errors['address.city']}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="address.state" className="form-label">State</label>
                  <input
                    type="text"
                    id="address.state"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    className={`form-input ${errors['address.state'] ? 'error' : ''}`}
                    placeholder="State"
                  />
                  {errors['address.state'] && <span className="error-text">{errors['address.state']}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="address.zipCode" className="form-label">ZIP Code</label>
                  <input
                    type="text"
                    id="address.zipCode"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    className={`form-input ${errors['address.zipCode'] ? 'error' : ''}`}
                    placeholder="12345"
                  />
                  {errors['address.zipCode'] && <span className="error-text">{errors['address.zipCode']}</span>}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Property Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="bedrooms" className="form-label">
                    <FaBed className="label-icon" />
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    id="bedrooms"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    className={`form-input ${errors.bedrooms ? 'error' : ''}`}
                    min="0"
                    placeholder="2"
                  />
                  {errors.bedrooms && <span className="error-text">{errors.bedrooms}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="bathrooms" className="form-label">
                    <FaBath className="label-icon" />
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    id="bathrooms"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    className={`form-input ${errors.bathrooms ? 'error' : ''}`}
                    min="0"
                    step="0.5"
                    placeholder="1.5"
                  />
                  {errors.bathrooms && <span className="error-text">{errors.bathrooms}</span>}
                </div>
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
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-input"
                  rows="4"
                  placeholder="Describe the property features, location benefits, etc."
                />
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Amenities</h3>
              <div className="amenities-grid">
                {commonAmenities.map(amenity => (
                  <label key={amenity} className="amenity-checkbox">
                    <input
                      type="checkbox"
                      name="amenities"
                      value={amenity}
                      checked={formData.amenities.includes(amenity)}
                      onChange={handleChange}
                    />
                    <span className="amenity-label">{amenity}</span>
                  </label>
                ))}
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
                <FaSave /> {isLoading ? 'Adding Property...' : 'Add Property'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
