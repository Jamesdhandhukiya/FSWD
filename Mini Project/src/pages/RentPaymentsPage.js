import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCheck, FaClock, FaCircle, FaPlus, FaEdit, FaTrash, FaTimes, FaMoneyBillWave } from 'react-icons/fa';
import api from '../services/api';

export default function RentPaymentsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    late: 0,
    totalAmount: 0
  });
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tenants, setTenants] = useState([]);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    loadPayments();
  }, []);

  // Reload data when returning from add page
  useEffect(() => {
    if (location.state?.refresh) {
      loadPayments();
    }
  }, [location.state]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const [paymentsRes, tenantsRes, propertiesRes] = await Promise.all([
        api.getRentPayments(),
        api.getTenants(),
        api.getProperties()
      ]);
      
      if (paymentsRes.success) {
        const paymentsData = paymentsRes.data || [];
        setPayments(paymentsData);
        
        const totalAmount = paymentsData.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        
        setStats({
          total: paymentsData.length,
          paid: paymentsData.filter(p => p.status === 'paid').length,
          pending: paymentsData.filter(p => p.status === 'pending').length,
          late: paymentsData.filter(p => p.status === 'late').length,
          totalAmount: totalAmount
        });
      }

      if (tenantsRes.success) {
        setTenants(tenantsRes.data || []);
      }

      if (propertiesRes.success) {
        setProperties(propertiesRes.data || []);
      }
    } catch (error) {
      console.error('Error loading rent payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = () => {
    navigate('/add-rent-payment');
  };

  const handleEditPayment = (payment) => {
    setSelectedPayment(payment);
    setEditFormData({
      tenant: payment.tenant?._id || '',
      property: payment.property?._id || '',
      amount: payment.amount || '',
      dueDate: payment.dueDate ? new Date(payment.dueDate).toISOString().split('T')[0] : '',
      paidDate: payment.paidDate ? new Date(payment.paidDate).toISOString().split('T')[0] : '',
      status: payment.status || 'pending'
    });
    setEditErrors({});
    setShowEditModal(true);
  };

  const handleDeletePayment = (payment) => {
    setSelectedPayment(payment);
    setShowDeleteModal(true);
  };

  const confirmDeletePayment = async () => {
    if (!selectedPayment) return;
    
    try {
      setIsSubmitting(true);
      const response = await api.deleteRentPayment(selectedPayment._id);
      if (response.success) {
        setSuccessMessage('Payment deleted successfully!');
        setShowDeleteModal(false);
        setShowSuccessModal(true);
        loadPayments(); // Reload the list
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setEditErrors({});

    try {
      const response = await api.updateRentPayment(selectedPayment._id, editFormData);
      if (response.success) {
        setSuccessMessage('Payment updated successfully!');
        setShowEditModal(false);
        setShowSuccessModal(true);
        loadPayments(); // Reload the list
      }
    } catch (error) {
      console.error('Error updating payment:', error);
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
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMarkPaid = async (id) => {
    try {
      const response = await api.markRentPaymentPaid(id);
      if (response.success) {
        setSuccessMessage('Payment marked as paid successfully!');
        setShowSuccessModal(true);
        loadPayments(); // Reload the list
      } else {
        console.error('Failed to mark payment as paid:', response.message);
        alert('Failed to mark payment as paid. Please try again.');
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Error updating payment. Please try again.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <FaCheck className="status-icon paid" />;
      case 'pending':
        return <FaClock className="status-icon pending" />;
      case 'late':
        return <FaCircle className="status-icon late" />;
      default:
        return <FaCircle className="status-icon" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'paid';
      case 'pending':
        return 'pending';
      case 'late':
        return 'late';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading rent payments...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Add Payment Button */}
      <div className="page-header">
        <div>
          <h1 className="main-title">Rent Payments</h1>
          <p className="subtitle">Track and manage rent payments</p>
        </div>
        <button className="add-payment-btn" onClick={handleAddPayment}>
          <FaPlus />
          Add Payment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="cards">
        <div className="card">
          <h2>Total Payments</h2>
          <p>{stats.total}</p>
          <div className="card-icon blue"><span className="rupee-symbol">₹</span></div>
        </div>
        <div className="card">
          <h2>Paid</h2>
          <p>{stats.paid}</p>
          <div className="card-icon green">
            <div className="status-indicator paid"></div>
          </div>
        </div>
        <div className="card">
          <h2>Pending</h2>
          <p>{stats.pending}</p>
          <div className="card-icon orange">
            <div className="status-indicator pending"></div>
          </div>
        </div>
        <div className="card">
          <h2>Late</h2>
          <p>{stats.late}</p>
          <div className="card-icon red">
            <div className="status-indicator late"></div>
          </div>
        </div>
        <div className="card">
          <h2>Total Amount</h2>
          <p>₹{stats.totalAmount.toLocaleString()}</p>
          <div className="card-icon purple">
            <FaMoneyBillWave />
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tenant</th>
              <th>Property</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Paid Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  <div className="empty-message">
                    <FaMoneyBillWave className="empty-icon" />
                    <p>No rent payments found</p>
                    <p className="empty-subtitle">Add your first payment record to get started</p>
                  </div>
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment._id}>
                  <td>
                    <div className="tenant-info">
                      <div className="tenant-name">
                        {payment.tenant?.firstName} {payment.tenant?.lastName}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="property-name">
                      {payment.property?.name || 'No property assigned'}
                    </div>
                  </td>
                  <td className="amount">₹{payment.amount?.toLocaleString()}</td>
                  <td>{new Date(payment.dueDate).toLocaleDateString()}</td>
                  <td>
                    <div className="status-cell">
                      {getStatusIcon(payment.status)}
                      <span className={`badge ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                  </td>
                  <td>
                    {payment.paidDate ? (
                      <div className="paid-info">
                        <div>{new Date(payment.paidDate).toLocaleDateString()}</div>
                        <div className="payment-method">{payment.paymentMethod}</div>
                      </div>
                    ) : (
                      <span className="not-paid">Not paid</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons" style={{ display: 'flex', gap: '8px' }}>
                      {payment.status !== 'paid' && (
                        <button 
                          className="action-btn mark-paid-btn" 
                          title="Mark as Paid"
                          onClick={() => handleMarkPaid(payment._id)}
                          style={{ 
                            padding: '8px', 
                            border: 'none', 
                            background: '#10b981', 
                            color: 'white',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '32px',
                            height: '32px'
                          }}
                        >
                          <FaCheck style={{ fontSize: '14px' }} />
                        </button>
                      )}
                      <button 
                        className="action-btn edit-btn" 
                        title="Edit Payment"
                        onClick={() => handleEditPayment(payment)}
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
                        title="Delete Payment"
                        onClick={() => handleDeletePayment(payment)}
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

      {/* Edit Payment Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Payment</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowEditModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Tenant</label>
                <select
                  name="tenant"
                  value={editFormData.tenant || ''}
                  onChange={handleInputChange}
                  className={`form-input ${editErrors.tenant ? 'error' : ''}`}
                  required
                >
                  <option value="">Select Tenant</option>
                  {tenants.map(tenant => (
                    <option key={tenant._id} value={tenant._id}>
                      {tenant.firstName} {tenant.lastName}
                    </option>
                  ))}
                </select>
                {editErrors.tenant && <span className="error-text">{editErrors.tenant}</span>}
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
                  {properties.map(property => (
                    <option key={property._id} value={property._id}>
                      {property.name}
                    </option>
                  ))}
                </select>
                {editErrors.property && <span className="error-text">{editErrors.property}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Amount (₹)</label>
                  <input
                    type="number"
                    name="amount"
                    value={editFormData.amount || ''}
                    onChange={handleInputChange}
                    className={`form-input ${editErrors.amount ? 'error' : ''}`}
                    min="0"
                    step="0.01"
                    required
                  />
                  {editErrors.amount && <span className="error-text">{editErrors.amount}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    value={editFormData.status || ''}
                    onChange={handleInputChange}
                    className={`form-input ${editErrors.status ? 'error' : ''}`}
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="late">Late</option>
                  </select>
                  {editErrors.status && <span className="error-text">{editErrors.status}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={editFormData.dueDate || ''}
                    onChange={handleInputChange}
                    className={`form-input ${editErrors.dueDate ? 'error' : ''}`}
                    required
                  />
                  {editErrors.dueDate && <span className="error-text">{editErrors.dueDate}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Paid Date (Optional)</label>
                  <input
                    type="date"
                    name="paidDate"
                    value={editFormData.paidDate || ''}
                    onChange={handleInputChange}
                    className={`form-input ${editErrors.paidDate ? 'error' : ''}`}
                  />
                  {editErrors.paidDate && <span className="error-text">{editErrors.paidDate}</span>}
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
                  {isSubmitting ? 'Updating...' : 'Update Payment'}
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
              <h2>Delete Payment</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowDeleteModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to delete this payment record?</p>
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
                onClick={confirmDeletePayment}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Delete Payment'}
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
              <p>{successMessage}</p>
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