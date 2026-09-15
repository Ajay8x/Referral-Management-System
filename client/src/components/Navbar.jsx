import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Activity } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <div className="brand-logo-icon" style={{ width: '40px', height: '40px', fontSize: '18px' }}>
          R
        </div>
        <div className="brand-text">
          <h1 style={{ fontSize: '1.15rem' }}>Shree RBSK</h1>
          <p style={{ fontSize: '0.75rem' }}>Referral Management System</p>
        </div>
      </div>

      <div className="topbar-user">
        {user && (
          <div className="user-badge">
            <UserIcon size={14} />
            <span>{user.name || user.mobile}</span>
          </div>
        )}

        <button onClick={logout} className="btn btn-light btn-sm" title="Logout">
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
