import React, { useEffect, useState } from 'react';
import '../../styles/AllUsers.css';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BASE_API_URL;

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    usertype: 'customer',
    password: '',
    restaurantAddress: '',
    restaurantImage: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingUserId, setLoadingUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/fetch-users`);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setErrorMessage("Failed to fetch users. Please try again.");
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    setLoadingUserId(userId);
    try {
      const response = await axios.put(`${API_BASE_URL}/delete-user`, { id: userId });
      setSuccessMessage('User deleted successfully');
      fetchUsers(); // Refresh the list
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error("Error deleting user:", error);
      const errorMsg = error.response?.data?.message || 'Error deleting user. Please try again.';
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/register`, formData);
      setSuccessMessage('User added successfully');
      setFormData({
        username: '',
        email: '',
        usertype: 'customer',
        password: '',
        restaurantAddress: '',
        restaurantImage: ''
      });
      setShowAddForm(false);
      fetchUsers();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error("Error adding user:", error);
      setErrorMessage(error.response?.data?.message || 'Error adding user');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="all-users-page">
      <div className="header-section">
        <h3>All Users</h3>
        <button 
          className="add-user-btn" 
          onClick={() => setShowAddForm(!showAddForm)}
          disabled={isLoading}
        >
          {showAddForm ? 'Cancel' : 'Add New User'}
        </button>
      </div>

      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      {isLoading && <div className="loading-message">Processing, please wait...</div>}

      {showAddForm && (
        <div className="add-user-form">
          <h4>Add New User</h4>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username:</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label>User Type:</label>
              <select
                name="usertype"
                value={formData.usertype}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              >
                <option value="customer">Customer</option>
                <option value="restaurant">Restaurant</option>
              </select>
            </div>

            {formData.usertype === 'restaurant' && (
              <>
                <div className="form-group">
                  <label>Restaurant Address:</label>
                  <input
                    type="text"
                    name="restaurantAddress"
                    value={formData.restaurantAddress}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label>Restaurant Image URL:</label>
                  <input
                    type="text"
                    name="restaurantImage"
                    value={formData.restaurantImage}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
              </>
            )}

            <button 
              type="submit" 
              className="submit-btn" 
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add User'}
            </button>
          </form>
        </div>
      )}

      <div className="user-cards">
        {users.filter(user => user.usertype !== 'admin').map((user) => (
          <div className="user-card" key={user._id}>
            <span>
              <h5>User Id</h5>
              <p>{user._id}</p>
            </span>
            <span>
              <h5>User Name</h5>
              <p>{user.username}</p>
            </span>
            <span>
              <h5>Email Address</h5>
              <p>{user.email}</p>
            </span>
            <span>
              <h5>User Type</h5>
              <p>{user.usertype}</p>
            </span>
            <span>
              <h5>Status</h5>
              <p>{user.approval}</p>
            </span>
            <div className="user-actions">
              <button 
                className="delete-btn" 
                onClick={() => deleteUser(user._id)}
                disabled={loadingUserId === user._id}
              >
                {loadingUserId === user._id ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllUsers;
