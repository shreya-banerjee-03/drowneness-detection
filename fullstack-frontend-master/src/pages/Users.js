import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: ''
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { authToken } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!authToken) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:8080/getAllUsers/'+authToken);
        setUsers(response.data);
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch users';
        setError(errorMessage);
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [authToken]);

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.post('http://localhost:8080/deleteUser', {
          userId: userId,
          adminId: authToken
        });
        
        // Remove user from the list
        setUsers(users.filter(user => user.id !== userId));
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to delete user';
        setError(errorMessage);
      }
    }
  };

  // Update user
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('http://localhost:8080/updateUser', {
        adminId: authToken,
        userId: selectedUser.id,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        isVerified: selectedUser.verified,
        macAddress: formData.macAddress || '',
        isMacAssigned: !!formData.macAddress
      });
      
      // Update user in the list
      setUsers(users.map(user => 
        user.id === selectedUser.id ? { ...user, ...response.data } : user
      ));
      
      // Close modal and reset form
      setShowEditModal(false);
      setFormData({ fullName: '', email: '', macAddress: '' });
      setSelectedUser(null);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // View user details
  const handleViewUser = async (userId) => {
    try {
      const response = await axios.post('http://localhost:8080/getUserById', {
        userId: userId,
        adminId: authToken
      });
      
      setSelectedUser(response.data);
      setFormData({
        fullName: response.data.fullName,
        email: response.data.email,
        macAddress: response.data.macAddress || ''
      });
      setShowViewModal(true);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch user details';
      setError(errorMessage);
    }
  };

  // Note: handleToggleVerify has been removed as it's no longer used

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle add user form submission
  const handleAddUser = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName.trim() || !formData.email.trim()) {
      setFormError('Both name and email are required');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setFormError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const response = await axios.post(
        'http://localhost:8080/addUser',
        {
          adminId: authToken,
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          macAddress: formData.macAddress || ''
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('User added successfully:', response.data);

      // Add new user to the list
      setUsers(prevUsers => [...prevUsers, response.data]);
      
      // Close modal and reset form
      setShowAddModal(false);
      setFormData({ fullName: '', email: '', macAddress: '' });
      
    } catch (err) {
      console.error('Error adding user:', err);
      setFormError(err.response?.data?.message || 'Failed to add user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open add user modal
  const openAddModal = () => {
    setFormError('');
    setShowAddModal(true);
  };

  // Close add user modal
  const closeAddModal = () => {
    setShowAddModal(false);
    setFormData({ fullName: '', email: '' });
    setFormError('');
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Manage Users</h2>
        <button 
          className="btn btn-primary"
          onClick={openAddModal}
        >
          <i className="bi bi-plus-circle me-2"></i>Add User
        </button>
      </div>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th className="text-center">Verified</th>
              <th className="text-center">Status</th>
              <th>Created Date</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="align-middle">{user.fullName}</td>
                  <td className="align-middle">
                    <div className="text-truncate" style={{ maxWidth: '200px' }} title={user.email}>
                      {user.email}
                    </div>
                  </td>
                  <td className="text-center align-middle">
                    <span className={`badge ${user.isVerified ? 'bg-success' : 'bg-warning'}`}>
                      {user.isVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </td>
                  <td className="text-center align-middle">
                    <span className={`badge ${user.isExpired ? 'bg-danger' : 'bg-success'}`}>
                      {user.isExpired ? 'Expired' : 'Active'}
                    </span>
                  </td>
                  <td className="align-middle">
                    {new Date(user.createdDate).toLocaleDateString()}
                  </td>
                  <td className="text-end">
                    <button 
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleViewUser(user.id)}
                    >
                      View
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-secondary me-2"
                      onClick={() => {
                        setSelectedUser(user);
                        setFormData({
                          fullName: user.fullName,
                          email: user.email,
                          macAddress: user.macAddress || ''
                        });
                        setShowEditModal(true);
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add responsive pagination if needed */}
      <nav aria-label="User pagination" className="mt-4">
        <ul className="pagination justify-content-center">
          <li className="page-item disabled">
            <button className="page-link" disabled>Previous</button>
          </li>
          <li className="page-item active">
            <button className="page-link">1</button>
          </li>
          <li className="page-item">
            <button className="page-link">2</button>
          </li>
          <li className="page-item">
            <button className="page-link">3</button>
          </li>
          <li className="page-item">
            <button className="page-link">Next</button>
          </li>
        </ul>
      </nav>

      {/* Add User Modal */}
      <div className={`modal fade ${showAddModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showAddModal ? 'rgba(0,0,0,0.5)' : 'transparent' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add New User</h5>
              <button type="button" className="btn-close" onClick={closeAddModal}></button>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="modal-body">
                {formError && (
                  <div className="alert alert-danger" role="alert">
                    {formError}
                  </div>
                )}
                <div className="mb-3">
                  <label htmlFor="fullName" className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email address</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeAddModal} disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Adding...
                    </>
                  ) : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {showAddModal && <div className="modal-backdrop fade show"></div>}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">User Details</h5>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover table-bordered mb-0">
                    <tbody>
                      <tr>
                        <th className="bg-light" style={{ width: '30%' }}>User ID</th>
                        <td className="text-break">{selectedUser.id}</td>
                      </tr>
                      <tr>
                        <th className="bg-light">Full Name</th>
                        <td>{selectedUser.fullName}</td>
                      </tr>
                      <tr>
                        <th className="bg-light">Email</th>
                        <td>{selectedUser.email}</td>
                      </tr>
                      <tr>
                        <th className="bg-light">Verification Status</th>
                        <td>
                          <span className={`badge ${selectedUser.isVerified ? 'bg-success' : 'bg-warning'}`}>
                            {selectedUser.isVerified ? 'Verified' : 'Not Verified'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <th className="bg-light">Account Status</th>
                        <td>
                          <span className={`badge ${selectedUser.isExpired ? 'bg-danger' : 'bg-success'}`}>
                            {selectedUser.isExpired ? 'Expired' : 'Active'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <th className="bg-light">Product Key</th>
                        <td>
                          <div className="text-break">
                            {selectedUser.productKey || 'N/A'}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th className="bg-light">MAC Address</th>
                        <td>
                          {selectedUser.macAddress || 'Not assigned'}
                          {selectedUser.macAddress && (
                            <span className={`ms-2 badge ${selectedUser.isMacAssigned ? 'bg-success' : 'bg-secondary'}`}>
                              {selectedUser.isMacAssigned ? 'Assigned' : 'Not Assigned'}
                            </span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th className="bg-light">Created Date</th>
                        <td>{new Date(selectedUser.createdDate).toLocaleString()}</td>
                      </tr>
                      <tr>
                        <th className="bg-light">Expiry Date</th>
                        <td>{new Date(selectedUser.expiredOn).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowViewModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit User</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <form onSubmit={handleUpdateUser}>
                <div className="modal-body">
                  {formError && <div className="alert alert-danger">{formError}</div>}
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">MAC Address (optional)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.macAddress || ''}
                      onChange={(e) => setFormData({...formData, macAddress: e.target.value})}
                      placeholder="00:1A:2B:3C:4D:5E"
                    />
                  </div>
                  <div className="form-check mb-3">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      checked={selectedUser.verified}
                      onChange={() => {
                        setSelectedUser({...selectedUser, verified: !selectedUser.verified});
                      }}
                      id="verifiedCheck"
                    />
                    <label className="form-check-label" htmlFor="verifiedCheck">
                      Verified
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {(showViewModal || showEditModal) && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default Users;
