import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaDollarSign, FaCalendar, FaBuilding, FaUser, FaSave, FaTimes } from 'react-icons/fa';
import api from '../services/api';
import '../styles/RenteaseDashboard.css';

export default function AddRentPaymentPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tenant: '',
    property: '',
    amount: '',
    dueDate: '',
    status: 'pending',
    paymentMethod: 'cash',
    paidDate: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
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
        setTenants(tenantsRes.data || []);
      }

      if (propertiesRes.success) {
        setProperties(propertiesRes.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleTenantChange = (e) => {
    const tenantId = e.target.value;
    const selectedTenant = tenants.find(t => t._id === tenantId);
    
    setFormData({
      ...formData,
      tenant: tenantId,
      property: selectedTenant?.property || '',
      amount: selectedTenant?.rentAmount || ''
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.tenant) {
      newErrors.tenant = 'Tenant selection is required';
    }

    if (!formData.property) {
      newErrors.property = 'Property selection is required';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Payment amount is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (formData.status === 'paid' && !formData.paidDate) {
      newErrors.paidDate = 'Paid date is required for paid payments';
    }

    if (formData.paidDate && formData.dueDate) {
      const paidDate = new Date(formData.paidDate);
      const dueDate = new Date(formData.dueDate);
      if (paidDate > dueDate) {
        newErrors.paidDate = 'Paid date cannot be after due date';
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
      const response = await api.createRentPayment(formData);
      if (response.success) {
        alert('Rent payment added successfully!');
        navigate('/rent-payments', { state: { refresh: true } });
      } else {
        alert(response.message || 'Failed to add rent payment. Please try again.');
      }
    } catch (error) {
      alert(error.message || 'Failed to add rent payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/rent-payments');
  };

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'check', label: 'Check' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'online', label: 'Online Payment' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <button onClick={() => navigate('/rent-payments')} className="back-btn">
          <FaArrowLeft /> Back to Rent Payments
        </button>
        <h1 className="page-title">Add Rent Payment</h1>
      </div>

      <div className="profile-form-container">
        <div className="profile-form-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <FaDollarSign />
            </div>
            <div className="profile-info">
              <h2>New Rent Payment</h2>
              <p>Record a new rent payment</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
              <h3 className="section-title">Payment Information</h3>
              <div className="form-group">
                <label htmlFor="tenant" className="form-label">
                  <FaUser className="label-icon" />
                  Tenant
                </label>
                <select
                  id="tenant"
                  name="tenant"
                  value={formData.tenant}
                  onChange={handleTenantChange}
                  className={`form-input ${errors.tenant ? 'error' : ''}`}
                >
                  <option value="">Select a tenant</option>
                  {tenants.map(tenant => (
                    <option key={tenant._id} value={tenant._id}>
                      {tenant.firstName} {tenant.lastName}
                    </option>
                  ))}
                </select>
                {errors.tenant && <span className="error-text">{errors.tenant}</span>}
              </div>

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

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="amount" className="form-label">
                    <FaDollarSign className="label-icon" />
                    Payment Amount
                  </label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className={`form-input ${errors.amount ? 'error' : ''}`}
                    min="0"
                    step="0.01"
                    placeholder="2500.00"
                  />
                  {errors.amount && <span className="error-text">{errors.amount}</span>}
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
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="late">Late</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dueDate" className="form-label">
                    <FaCalendar className="label-icon" />
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className={`form-input ${errors.dueDate ? 'error' : ''}`}
                  />
                  {errors.dueDate && <span className="error-text">{errors.dueDate}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="paymentMethod" className="form-label">Payment Method</label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="form-input"
                  >
                    {paymentMethods.map(method => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="month" className="form-label">Month</label>
                  <select
                    id="month"
                    name="month"
                    value={formData.month}
                    onChange={handleChange}
                    className="form-input"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="year" className="form-label">Year</label>
                  <input
                    type="number"
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="form-input"
                    min="2020"
                    max="2030"
                  />
                </div>
              </div>

              {formData.status === 'paid' && (
                <div className="form-group">
                  <label htmlFor="paidDate" className="form-label">
                    <FaCalendar className="label-icon" />
                    Paid Date
                  </label>
                  <input
                    type="date"
                    id="paidDate"
                    name="paidDate"
                    value={formData.paidDate}
                    onChange={handleChange}
                    className={`form-input ${errors.paidDate ? 'error' : ''}`}
                  />
                  {errors.paidDate && <span className="error-text">{errors.paidDate}</span>}
                </div>
              )}
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
                  placeholder="Any additional notes about this payment..."
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
                <FaSave /> {isLoading ? 'Adding Payment...' : 'Add Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
