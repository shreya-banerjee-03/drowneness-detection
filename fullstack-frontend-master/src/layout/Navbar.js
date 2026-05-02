import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Drowsiness Detection
        </Link>
        
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {user && (
              <li className="nav-item">
                <Link className="nav-link" to="/users">
                  Users
                </Link>
              </li>
            )}
          </ul>
          
          <div className="d-flex">
            {user ? (
              <div className="d-flex align-items-center">
                <span className="text-light me-3">
                  {user.email}
                </span>
                <button 
                  className="btn btn-outline-light btn-sm" 
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link className="btn btn-outline-light" to="/login">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
