import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/RenteaseDashboard.css';
import { FaHome, FaBuilding, FaUser, FaMoneyBill, FaTools, FaFileContract, FaBars, FaSun, FaMoon, FaUserCircle, FaCog, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';

const RenteaseDashboard = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleTheme = () => setDarkMode(!darkMode);
  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);

  // Load user data on component mount and listen for changes
  useEffect(() => {
    const loadUserData = () => {
      const localUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (localUser.firstName) {
        setUser(localUser);
      }
    };
    
    // Load initial data
    loadUserData();
    
    // Listen for localStorage changes (when profile is updated)
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        loadUserData();
      }
    };
    
    // Listen for custom events (when profile is updated from same tab)
    const handleUserUpdate = () => {
      loadUserData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userUpdated', handleUserUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, []);

  const handleLogout = () => {
    // Clear any stored authentication data
    localStorage.removeItem('user');
    // Redirect to login page
    navigate('/login');
  };

  const handleEditProfile = () => {
    setUserMenuOpen(false);
    navigate('/edit-profile');
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  const navItems = [
    { name: 'Dashboard', icon: <FaHome />, path: '/dashboard' },
    { name: 'Properties', icon: <FaBuilding />, path: '/properties' },
    { name: 'Tenants', icon: <FaUser />, path: '/tenants' },
    { name: 'Rent Payments', icon: <FaMoneyBill />, path: '/rent-payments' },
    { name: 'Maintenance Requests', icon: <FaTools />, path: '/maintenance' },
  ];

  return (
    <div className={`dashboard ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="logo">
          <div className="logo-container">
            <div className="logo-icon">
              <FaBuilding />
            </div>
            {sidebarOpen && (
              <div className="logo-text">
                <span className="logo-main">RentEase</span>
                <span className="logo-sub">Property Management</span>
              </div>
            )}
          </div>
        </div>
        <nav className="nav">
          {navItems.map((item) => (
            <Link 
              key={item.name}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <div className="icon">{item.icon}</div>
              {sidebarOpen && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Layout */}
      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <button className="icon-btn sidebar-toggle" onClick={toggleSidebar}>
              <FaBars />
            </button>
          </div>
          <div className="topbar-right">
            <button className="icon-btn theme-toggle" onClick={toggleTheme}>
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
            
            {/* User Menu */}
            <div className="user-menu-container" ref={userMenuRef}>
              <button className="user-menu-trigger" onClick={toggleUserMenu}>
                <FaUserCircle className="user-avatar" />
                <span className="user-name">{user ? `${user.firstName} ${user.lastName}` : 'User'}</span>
                <FaChevronDown className={`user-chevron ${userMenuOpen ? 'open' : ''}`} />
              </button>
              
              {userMenuOpen && (
                <div className="user-menu-dropdown">
                  <div className="user-menu-header">
                    <FaUserCircle className="user-avatar-large" />
                    <div className="user-info">
                      <div className="user-name-large">{user ? `${user.firstName} ${user.lastName}` : 'User'}</div>
                      <div className="user-email">{user ? user.email : 'user@example.com'}</div>
                    </div>
                  </div>
                  <div className="user-menu-divider"></div>
                  <button className="user-menu-item" onClick={handleEditProfile}>
                    <FaCog className="menu-item-icon" />
                    <span>Edit Profile</span>
                  </button>
                  <button className="user-menu-item logout" onClick={handleLogout}>
                    <FaSignOutAlt className="menu-item-icon" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default RenteaseDashboard;
