import React, { useEffect, useState } from 'react';
import '../../styles/RestaurantHome.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Import icons if you're using a library like react-icons or insert SVG directly
// For this example I'll use inline SVG for simplicity

const RestaurantHome = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  // --- STATE ---
  const [restaurant, setRestaurant] = useState({ approval: 'pending' });
  const [itemsCount, setItemsCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [restaurantData, setRestaurantData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- EFFECTS ---
  // Fetch User Data (Approval Status)
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setError('User ID not found. Please log in again.');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`https://sb-foods-1.onrender.com/fetch-user-details/${userId}`);
        setRestaurant(response.data || { approval: 'error' });
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError('Failed to fetch user details. Please try again later.');
        setRestaurant({ approval: 'error' });
      } finally {
        // Don't set loading false yet, wait for other data if approved
      }
    };
    fetchUserData();
  }, [userId]);

  // Fetch Restaurant Details (for ID)
  useEffect(() => {
    const fetchRestaurantData = async () => {
      if (!userId || restaurant.approval !== 'approved') {
        if (restaurant.approval !== 'pending') setIsLoading(false);
        return;
      }
      try {
        const response = await axios.get(`https://sb-foods-1.onrender.com/fetch-restaurant-details/${userId}`);
        setRestaurantData(response.data);
      } catch (err) {
        console.error("Error fetching restaurant details:", err);
        setError(prev => prev ? `${prev} Failed to fetch restaurant details.` : 'Failed to fetch restaurant details.');
      }
    };

    if (restaurant.approval === 'approved') {
      fetchRestaurantData();
    } else if (restaurant.approval !== 'pending') {
      setIsLoading(false);
    }
  }, [userId, restaurant.approval]);

  // Fetch Counts
  useEffect(() => {
    if (!restaurantData?._id || restaurant.approval !== 'approved') {
      if (restaurant.approval === 'approved' && !restaurantData) setIsLoading(false);
      return;
    }

    const fetchCounts = async () => {
      try {
        // Fetch in parallel
        const [itemsResponse, ordersResponse] = await Promise.all([
          axios.get('https://sb-foods-1.onrender.com/fetch-items'),
          axios.get('https://sb-foods-1.onrender.com/fetch-orders')
        ]);

        const items = itemsResponse.data || [];
        const orders = ordersResponse.data || [];

        setItemsCount(items.filter(item => item.restaurantId === restaurantData._id).length);
        setOrdersCount(orders.filter(order => order.restaurantId === restaurantData._id).length);
      } catch (err) {
        console.error("Error fetching items or orders:", err);
        setError(prev => prev ? `${prev} Failed to fetch counts.` : 'Failed to fetch item/order counts.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, [restaurantData, restaurant.approval]);

  // --- RENDER LOGIC ---
  if (isLoading) {
    return (
      <div className="restaurantHome-page">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading your dashboard...</p>
      </div>
    );
  }

  // Display critical errors prominently
  if (error && restaurant.approval !== 'approved') {
    return (
      <div className="restaurantHome-page">
        <div className="restaurant-approval-required">
          <h3>An Error Occurred</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '2rem',
              backgroundColor: 'var(--accent-color)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="restaurantHome-page">
      {restaurant.approval === 'pending' ? (
        <div className="restaurant-approval-required">
          <h3>Approval Required</h3>
          <p>Your restaurant is currently pending approval. Our team will review your information and activate your account shortly. Please check back later.</p>
        </div>
      ) : restaurant.approval === 'approved' ? (
        <>
          <h1 className="dashboard-title">Restaurant Dashboard</h1>
          
          {/* Display non-critical errors as warnings */}
          {error && (
            <div className="warning-message">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '10px'}}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              {error}
            </div>
          )}
          
          {/* Dashboard Cards Grid */}
          <div className="dashboard-grid">
            {/* Menu Items Card */}
            <div className="admin-home-card">
              <div>
                <div className="card-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <h5>Menu Items</h5>
                <p>{itemsCount}</p>
              </div>
              <button onClick={() => navigate('/restaurant-menu')}>View Menu</button>
            </div>

            {/* Orders Card */}
            <div className="admin-home-card">
              <div>
                <div className="card-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                </div>
                <h5>All Orders</h5>
                <p>{ordersCount}</p>
              </div>
              <button onClick={() => navigate('/restaurant-orders')}>View Orders</button>
            </div>

            {/* Add Item Card */}
            <div className="admin-home-card">
              <div>
                <div className="card-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--success-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                </div>
                <h5>Add New Item</h5>
                <p className="new-item-text">Create</p>
              </div>
              <button onClick={() => navigate('/new-product')}>Add Now</button>
            </div>
          </div>
        </>
      ) : (
        <div className="restaurant-approval-required">
          <h3>Access Issue</h3>
          <p>There seems to be an issue with your restaurant status ({restaurant.approval || 'unknown'}). Please contact our support team for assistance.</p>
          {error && <p style={{ marginTop: '1rem', fontSize: '0.95rem', opacity: '0.8' }}>Details: {error}</p>}
        </div>
      )}
    </div>
  );
};

export default RestaurantHome;