import React, { useEffect, useState } from 'react';
import '../../styles/RestaurantOrders.css';
import axios from 'axios';

const RestaurantOrders = () => {
  const [orders, setOrders] = useState([]);
  const [updateStatus, setUpdateStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  
  // Get the logged-in user ID from localStorage
  const username = localStorage.getItem('username');
  const userId = localStorage.getItem('userId');
  
  useEffect(() => {
    fetchRestaurantAndOrders();
  }, []);

  const fetchRestaurantAndOrders = async() => {
    setLoading(true);
    try {
      // First get the restaurant details for this user
      const restaurantResponse = await axios.get(`http://localhost:6001/fetch-restaurant-details/${userId}`);
      const restaurantData = restaurantResponse.data;
      setRestaurant(restaurantData);
      
      if (!restaurantData || !restaurantData.title) {
        setError("Could not find restaurant information for your account.");
        setLoading(false);
        return;
      }
      
      // Now fetch all orders
      const ordersResponse = await axios.get('http://localhost:6001/fetch-orders');
      
      // Filter orders by restaurant name from our restaurant data
      const filteredOrders = ordersResponse.data.filter(order => 
        order.restaurantName === restaurantData.title
      );
      
      // Initialize status updates object with current statuses
      const initialStatuses = {};
      filteredOrders.forEach(order => {
        initialStatuses[order._id] = order.orderStatus;
      });
      setUpdateStatus(initialStatuses);
      
      setOrders(filteredOrders.reverse());
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load restaurant data or orders. Please try again.");
      setLoading(false);
    }
  }

  const cancelOrder = async(id) => {
    try {
      await axios.put('http://localhost:6001/cancel-order', {id});
      // Instead of alert, update the UI directly
      setOrders(orders.map(order => 
        order._id === id ? {...order, orderStatus: 'cancelled'} : order
      ));
      // Show a toast notification instead (you would need to add a toast library)
      // toast.success('Order cancelled successfully');
    } catch (error) {
      console.error("Error cancelling order:", error);
      // toast.error("Failed to cancel order"); 
      alert("Failed to cancel order!");
    }
  }

  const updateOrderStatus = async(id) => {
    if (!updateStatus[id]) {
      alert("Please select a status to update!");
      return;
    }
    
    try {
      await axios.put('http://localhost:6001/update-order-status', {
        id, 
        updateStatus: updateStatus[id]
      });
      
      // Update the order in our state immediately for responsive UI
      setOrders(orders.map(order => 
        order._id === id ? {...order, orderStatus: updateStatus[id]} : order
      ));
      
      // toast.success("Order status updated successfully");
    } catch (error) {
      console.error("Error updating order status:", error);
      // toast.error("Order update failed");
      alert("Order update failed!");
    }
  }

  const handleStatusChange = (id, status) => {
    setUpdateStatus({
      ...updateStatus,
      [id]: status
    });
  }

  const getStatusClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'order placed':
        return 'status-placed';
      case 'in-transit':
        return 'status-transit';
      case 'delivered':
        return 'status-delivered';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-placed';
    }
  }

  if (loading) {
    return (
      <div className="restaurant-orders-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="restaurant-orders-page">
        <div className="error-state">
          <h4>Unable to Load Orders</h4>
          <p>{error}</p>
          <button 
            className="btn btn-primary" 
            onClick={fetchRestaurantAndOrders}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Format date for better display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  // Format time for better display
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  }

  // Calculate discounted price
  const calculateDiscountedPrice = (originalPrice, discount, quantity) => {
    return (originalPrice - (originalPrice * discount / 100)) * quantity;
  }

  return (
    <div className="restaurant-orders-page">
      <div className="page-title-container">
        <h1 className="page-title">Restaurant Orders</h1>
        {restaurant && (
          <div className="restaurant-info">
            <p className="restaurant-name">
              <strong>{restaurant.title}</strong>
            </p>
          </div>
        )}
      </div>

      <div className="orders-container">
        <div className="controls-bar">
          <p className="orders-count">
            Total Orders: <span>{orders.length}</span>
          </p>
          <button 
            className="btn btn-primary btn-sm" 
            onClick={fetchRestaurantAndOrders}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38"/>
            </svg>
            Refresh Orders
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="no-orders">
            <h4>No Orders Found</h4>
            <p>There are currently no orders for your restaurant. New orders will appear here when customers place them.</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div 
                className={`order-card ${getStatusClass(order.orderStatus)}`} 
                key={order._id}
              >
                <img 
                  src={order.foodItemImg} 
                  alt={order.foodItemName} 
                  className="order-image" 
                />
                
                <div className="order-details">
                  <div className="order-header">
                    <h3 className="order-title">{order.foodItemName}</h3>
                    <span className={`status-badge ${getStatusClass(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  
                  <div className="order-meta">
                    <div className="meta-group">
                      <div className="meta-item">
                        <b>Customer</b>
                        {order.name}
                      </div>
                      <div className="meta-item">
                        <b>Contact</b>
                        {order.mobile}
                      </div>
                      <div className="meta-item">
                        <b>Email</b>
                        {order.email}
                      </div>
                    </div>
                    
                    <div className="meta-group">
                      <div className="meta-item">
                        <b>Quantity</b>
                        {order.quantity}
                      </div>
                      <div className="meta-item large">
                        <b>Total Price</b>
                        <div className="price-info">
                          <span className="discounted-price">
                            ₹{calculateDiscountedPrice(order.price, order.discount, order.quantity).toFixed(2)}
                          </span>
                          <span className="original-price">
                            ₹{(order.price * order.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="meta-item">
                        <b>Payment</b>
                        {order.paymentMethod}
                      </div>
                    </div>
                  </div>
                  
                  <div className="order-address">
                    <div className="meta-item">
                      <b>Delivery Address</b>
                      {order.address}, {order.pincode}
                    </div>
                  </div>
                  
                  <div className="order-time">
                    <b>Ordered on:</b> {formatDate(order.orderDate)} at {formatTime(order.orderDate)}
                  </div>
                  
                  {(order.orderStatus === 'order placed' || order.orderStatus === 'In-transit') && (
                    <div className="order-actions">
                      <div className="status-update">
                        <select 
                          className="form-select" 
                          value={updateStatus[order._id] || ''}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        >
                          <option value="order placed">Order Accepted</option>
                          <option value="In-transit">In-transit</option>
                          <option value="delivered">Delivered</option>
                        </select>
                        <button 
                          className="btn btn-primary" 
                          onClick={() => updateOrderStatus(order._id)}
                        >
                          Update Status
                        </button>
                      </div>
                      <button 
                        className="btn btn-outline-danger" 
                        onClick={() => cancelOrder(order._id)}
                      >
                        Cancel Order
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantOrders;