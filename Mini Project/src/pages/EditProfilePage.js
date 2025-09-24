import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSave, FaTimes } from 'react-icons/fa';
import api from '../services/api';
import '../styles/RenteaseDashboard.css';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    company: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    // Load user data from localStorage first
    const localUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (localUser.firstName) {
      setUser(localUser);
      setFormData({
        firstName: localUser.firstName || '',
        lastName: localUser.lastName || '',
        email: localUser.email || '',
        phone: localUser.phone || '',
        address: localUser.address || {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        },
        company: localUser.company || ''
      });
    }

    // Try to load fresh data from API
    try {
      const response = await api.getProfile();
      if (response.success) {
        setUser(response.user);
        setFormData({
          firstName: response.user.firstName || '',
          lastName: response.user.lastName || '',
          email: response.user.email || '',
          phone: response.user.phone || '',
          address: response.user.address || {
            street: '',
            city: '',
            state: '',
            zipCode: ''
          },
          company: response.user.company || ''
        });
        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(response.user));
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('userUpdated'));
      }
    } catch (error) {
      console.error('Error loading user data from API:', error);
      // Keep using localStorage data if API fails
    }
  };

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
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await api.updateProfile(formData);
      if (response.success) {
        // Update localStorage with new user data
        localStorage.setItem('user', JSON.stringify(response.user));
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('userUpdated'));
        alert('Profile updated successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      alert(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <button 
          className="back-btn"
          onClick={() => navigate('/dashboard')}
        >
          <FaArrowLeft />
          Back to Dashboard
        </button>
        <h1 className="page-title">Edit Profile</h1>
      </div>

      <div className="profile-form-container">
        <div className="profile-form-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <FaUser />
            </div>
            <div className="profile-info">
              <h2>{user ? `${user.firstName} ${user.lastName}` : 'Loading...'}</h2>
              <p>{user?.company || 'Property Manager'}</p>
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
                    className="form-input"
                    required
                  />
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
                    className="form-input"
                    required
                  />
                </div>
              </div>

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
                  className="form-input"
                  required
                />
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
                  className="form-input"
                />
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
                      className="form-input"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="address.city" className="form-label">City</label>
                      <input
                        type="text"
                        id="address.city"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="address.state" className="form-label">State</label>
                      <input
                        type="text"
                        id="address.state"
                        name="address.state"
                        value={formData.address.state}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="address.zipCode" className="form-label">ZIP Code</label>
                      <input
                        type="text"
                        id="address.zipCode"
                        name="address.zipCode"
                        value={formData.address.zipCode}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                  </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Professional Information</h3>
              <div className="form-group">
                <label htmlFor="company" className="form-label">Company</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
              >
                <FaTimes />
                Cancel
              </button>
              <button
                type="submit"
                className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                <FaSave />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
