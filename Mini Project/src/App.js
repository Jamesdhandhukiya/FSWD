import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import RenteaseDashboard from './pages/RenteaseDashboard';
import PropertiesPage from './pages/PropertiesPage';
import TenantsPage from './pages/TenantsPage';
import RentPaymentsPage from './pages/RentPaymentsPage';
import MaintenancePage from './pages/MaintenancePage';
import EditProfilePage from './pages/EditProfilePage';
import AddPropertyPage from './pages/AddPropertyPage';
import AddTenantPage from './pages/AddTenantPage';
import AddRentPaymentPage from './pages/AddRentPaymentPage';
import AddMaintenanceRequestPage from './pages/AddMaintenanceRequestPage';
import './styles/RenteaseDashboard.css';
import './styles/AuthPages.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Default redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={
          <RenteaseDashboard>
            <Dashboard />
          </RenteaseDashboard>
        } />
        <Route path="/properties" element={
          <RenteaseDashboard>
            <PropertiesPage />
          </RenteaseDashboard>
        } />
        <Route path="/tenants" element={
          <RenteaseDashboard>
            <TenantsPage />
          </RenteaseDashboard>
        } />
        <Route path="/rent-payments" element={
          <RenteaseDashboard>
            <RentPaymentsPage />
          </RenteaseDashboard>
        } />
        <Route path="/maintenance" element={
          <RenteaseDashboard>
            <MaintenancePage />
          </RenteaseDashboard>
        } />
        <Route path="/edit-profile" element={
          <RenteaseDashboard>
            <EditProfilePage />
          </RenteaseDashboard>
        } />
        
        {/* Add Pages */}
        <Route path="/add-property" element={
          <RenteaseDashboard>
            <AddPropertyPage />
          </RenteaseDashboard>
        } />
        <Route path="/add-tenant" element={
          <RenteaseDashboard>
            <AddTenantPage />
          </RenteaseDashboard>
        } />
        <Route path="/add-rent-payment" element={
          <RenteaseDashboard>
            <AddRentPaymentPage />
          </RenteaseDashboard>
        } />
        <Route path="/add-maintenance-request" element={
          <RenteaseDashboard>
            <AddMaintenanceRequestPage />
          </RenteaseDashboard>
        } />
      </Routes>
    </Router>
  );
}

export default App;
