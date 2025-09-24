import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaBuilding, FaUser, FaMoneyBill, FaTools } from 'react-icons/fa';
import api from '../services/api';
import '../styles/RenteaseDashboard.css';

export default function DashboardPage() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeTenants: 0,
    pendingPayments: 0,
    openMaintenance: 0
  });
  const [recentMaintenance, setRecentMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to get display status based on lease period (same as TenantsPage)
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

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Reload data when returning from any add page
  useEffect(() => {
    if (location.state?.refresh) {
      loadDashboardData();
    }
  }, [location.state]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load user from localStorage
      const localUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (localUser.firstName) {
        setUser(localUser);
      }

      // Load dashboard statistics
      const [propertiesRes, tenantsRes, paymentsRes, maintenanceRes] = await Promise.all([
        api.getProperties(),
        api.getTenants(),
        api.getRentPayments(),
        api.getMaintenanceRequests()
      ]);

      // Calculate statistics
      const properties = propertiesRes.success ? propertiesRes.data || [] : [];
      const tenants = tenantsRes.success ? tenantsRes.data || [] : [];
      const payments = paymentsRes.success ? paymentsRes.data || [] : [];
      const maintenance = maintenanceRes.success ? maintenanceRes.data || [] : [];

      // Calculate active tenants based on display status (considering lease period)
      const activeTenantsCount = tenants.filter(t => getDisplayStatus(t) === 'active').length;
      
      setStats({
        totalProperties: properties.length,
        activeTenants: activeTenantsCount,
        pendingPayments: payments.filter(p => p.status === 'pending').length,
        openMaintenance: maintenance.filter(m => m.status === 'open').length
      });

      // Debug logging for tenant statistics
      console.log('Dashboard tenant statistics:', {
        total: tenants.length,
        active: activeTenantsCount,
        details: tenants.map(t => ({
          name: `${t.firstName} ${t.lastName}`,
          dbStatus: t.status,
          displayStatus: getDisplayStatus(t),
          leaseEndDate: t.leaseEndDate
        }))
      });

      // Get recent maintenance requests (last 5)
      const recentMaintenanceData = maintenance
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      
      setRecentMaintenance(recentMaintenanceData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="main-title">
        Welcome back, {user ? `${user.firstName} ${user.lastName}` : 'User'}!
      </h1>
      <p className="subtitle">Here's what's happening with your properties today.</p>

      {/* Summary Cards */}
      <div className="cards">
        <div className="card">
          <h2>Total Properties</h2>
          <p>{stats.totalProperties}</p>
          <div className="card-icon blue"><FaBuilding /></div>
        </div>
        <div className="card">
          <h2>Active Tenants</h2>
          <p>{stats.activeTenants}</p>
          <div className="card-icon green"><FaUser /></div>
        </div>
        <div className="card">
          <h2>Pending Rent Payments</h2>
          <p>{stats.pendingPayments}</p>
          <div className="card-icon orange"><FaMoneyBill /></div>
        </div>
        <div className="card">
          <h2>Open Maintenance</h2>
          <p>{stats.openMaintenance}</p>
          <div className="card-icon red"><FaTools /></div>
        </div>
      </div>

      {/* Recent Maintenance Requests Table */}
      <div className="table-container">
        <h2 className="table-title">Recent Maintenance Requests</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Property Name</th>
              <th>Issue</th>
              <th>Tenant</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentMaintenance.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state">
                  <div className="empty-message">
                    <FaTools className="empty-icon" />
                    <p>No maintenance requests found</p>
                    <p className="empty-subtitle">Maintenance requests will appear here</p>
                  </div>
                </td>
              </tr>
            ) : (
              recentMaintenance.map((request) => (
                <tr key={request._id}>
                  <td>
                    <div className="property-info">
                      <div className="property-name">
                        {request.property?.name || 'No property assigned'}
                      </div>
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
                        {request.tenant?.firstName} {request.tenant?.lastName}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${request.status.toLowerCase().replace('_', '')}`}>
                      {request.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
