import React, { useEffect, useState } from 'react';
import '../../styles/Admin.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Admin = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [ordersCount, setOrdersCount] = useState(0);
  const [promoteList, setPromoteList] = useState([]);
  const [originalPromoteList, setOriginalPromoteList] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchRestaurants();
    fetchOrders();
    fetchPromotions();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/fetch-users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users');
    }
  };

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/fetch-restaurants`);
      setRestaurants(response.data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      alert('Failed to fetch restaurants');
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/fetch-orders`);
      setOrdersCount(response.data.length);
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Failed to fetch orders');
    }
  };

  const fetchPromotions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/fetch-promoted-list`);
      setPromoteList(response.data);
      setOriginalPromoteList(response.data);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      alert('Failed to fetch promotions');
    }
  };

  const approveUser = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/approve-user`, { id });
      alert('Restaurant approved!');
      fetchUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Failed to approve user');
    }
  };

  const rejectUser = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/reject-user`, { id });
      alert('Restaurant rejected!');
      fetchUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Failed to reject user');
    }
  };

  const handlePromoteCheckBox = (e) => {
    const value = e.target.value;
    if (e.target.checked) {
      setPromoteList((prev) => [...prev, value]);
    } else {
      setPromoteList((prev) => prev.filter((id) => id !== value));
    }
  };

  const handlePromoteUpdate = async () => {
    try {
      await axios.post(`${API_BASE_URL}/update-promote-list`, { promoteList });
      alert('Promote list updated!');
      setOriginalPromoteList(promoteList);
    } catch (error) {
      console.error('Error updating promote list:', error);
      alert('Failed to update promote list');
    }
  };

  const isPromoteListChanged = () => {
    if (promoteList.length !== originalPromoteList.length) return true;
    return promoteList.some((id) => !originalPromoteList.includes(id));
  };

  const totalUsers = Array.isArray(users)? users.filter((user) => user.usertype !== 'admin').length: 0;

  return (
    <div className="admin-page">
      <div>
        <div className="admin-home-card">
          <h5>Total users</h5>
          <p>{totalUsers}</p>
          <button onClick={() => navigate('/all-users')}>View all</button>
        </div>
      </div>

      <div>
        <div className="admin-home-card">
          <h5>All Restaurants</h5>
          <p>{restaurants.length}</p>
          <button onClick={() => navigate('/all-restaurants')}>View all</button>
        </div>
      </div>

      <div>
        <div className="admin-home-card">
          <h5>All Orders</h5>
          <p>{ordersCount}</p>
          <button onClick={() => navigate('/all-orders')}>View all</button>
        </div>
      </div>

      <div className="admin-promotions-input">
        <h5>Popular Restaurants (promotions)</h5>
        <div className="promotion-restaurant-list">
          {restaurants.map((restaurant) => (
            <div className="form-check" key={restaurant._id}>
              <input
                className="form-check-input"
                type="checkbox"
                value={restaurant._id}
                checked={promoteList.includes(restaurant._id)}
                id={`promotionRestaurantCheck-${restaurant._id}`}
                onChange={handlePromoteCheckBox}
              />
              <label
                className="form-check-label"
                htmlFor={`promotionRestaurantCheck-${restaurant._id}`}
              >
                {restaurant.title}
              </label>
            </div>
          ))}
        </div>
        <button
          onClick={handlePromoteUpdate}
          disabled={!isPromoteListChanged()}
          style={{ cursor: isPromoteListChanged() ? 'pointer' : 'not-allowed' }}
        >
          Update
        </button>
      </div>

      <div className="admin-approval-container">
        <h5>Approvals</h5>
        <div className="approval-restaurant-list">
          {users.filter((user) => user.approval === 'pending').length === 0 ? (
            <p>No new requests...</p>
          ) : (
            users
              .filter((user) => user.approval === 'pending')
              .map((user) => (
                <div className="approval-request" key={user._id}>
                  <span>
                    <h5>Restaurant</h5>
                    <p>{user.username}</p>
                  </span>
                  <div>
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => approveUser(user._id)}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => rejectUser(user._id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
