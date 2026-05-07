import React, { useContext, useEffect, useState, useCallback } from 'react'
import '../../styles/Profile.css'
import { GeneralContext } from '../../context/GeneralContext'
import axios from 'axios'
import useScrollReveal from '../../hooks/useScrollReveal'
import Toast from '../../components/Toast'

const Profile = () => {

  const {logout} = useContext(GeneralContext);

  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');
  const email = localStorage.getItem('email');

  const [orders, setOrders] = useState([]);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => setToast({ show: true, message, type });
  const hideToast = useCallback(() => setToast(prev => ({ ...prev, show: false })), []);

  useScrollReveal();

  const fetchOrders = useCallback(async() =>{
    await axios.get('https://sb-foods-5t36.onrender.com/fetch-orders').then(
      (response)=>{
        setOrders(response.data.filter(order=> order.userId === userId).reverse());
      }
    )
  }, [userId]);

  useEffect(()=>{
    fetchOrders();
  },[fetchOrders])

  const cancelOrder = async(id) =>{
    await axios.put('https://sb-foods-5t36.onrender.com/cancel-order', {id}).then(
      (response)=>{
        showToast('Order cancelled successfully', 'info');
        fetchOrders();
      }
    ).catch(() => {
      showToast('Failed to cancel order', 'error');
    });
  }

  return ( 
    <div className="profilePage page-enter">
      
      <div className="profileCard" data-reveal="fade-right">

          <span>
            <h5>Username: </h5>
            <p>{username}</p>
          </span>
          <span>
            <h5>Email: </h5>
            <p>{email}</p>
          </span>
          <span>
            <h5>Orders: </h5>
            <p>{orders.length}</p>
          </span>
          <button className='btn btn-danger' onClick={()=> logout()}>Logout</button>

      </div>

      <div className="profileOrders-container">
        <div className="section-header" data-reveal="fade-up">
          <h3>Your Orders</h3>
        </div>
        <div className="profileOrders">

          {orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <h4>No orders yet</h4>
              <p>Your order history will appear here once you start ordering</p>
            </div>
          ) : null}

          {orders.map((order, index) => (

            <div
              className="profileOrder"
              key={order._id}
              data-reveal="fade-up"
              data-reveal-delay={index * 80}
            >
              <img src={order.foodItemImg} alt={order.foodItemName} />
              <div className="profileOrder-data">
                <h4>{order.foodItemName}</h4>
                <p>{order.restaurantName}</p>
                <div>
                  <span><p><b>Quantity: </b> {order.quantity}</p></span>
                  <span><p><b>Total Price: </b> &#8377; {parseInt(order.price - (order.price*order.discount)/100) * order.quantity} <s>&#8377; {order.price * order.quantity}</s> </p></span>
                  <span><p><b>Payment mode: </b> {order.paymentMethod}</p></span>
                </div>
                <div>
                  <span><p><b>Ordered on: </b> {order.orderDate.slice(0,10)} Time: {order.orderDate.slice(11,16)}</p></span>
                  <span><p><b>Status: </b> {order.orderStatus}</p></span>
                </div>
                {order.orderStatus === 'order placed' || order.orderStatus === 'In-transit' ?
                  <button className="btn btn-outline-danger" onClick={()=> cancelOrder(order._id)}>Cancel</button>
                :
                ""}
              </div>
            </div>
          ))}

        </div>
      </div>

      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={hideToast} />
    </div>
  )
}

export default Profile