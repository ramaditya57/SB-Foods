import React, { useEffect, useState } from "react";
import "../../styles/AllOrders.css";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_BASE_API_URL;

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [updateStatus, setUpdateStatus] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/fetch-orders`);
      setOrders(response.data.reverse());
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      alert("Failed to fetch orders");
    }
  };

  const cancelOrder = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/cancel-order`, { id });
      alert("Order cancelled!");
      fetchOrders();
    } catch (error) {
      console.error("Cancel order failed:", error);
      alert("Failed to cancel order");
    }
  };

  const updateOrderStatus = async (id) => {
    if (!updateStatus) {
      alert("Please select a status to update");
      return;
    }

    try {
      await axios.put(`${API_BASE_URL}/update-order-status`, { id, updateStatus });
      alert("Order status updated!");
      setUpdateStatus("");
      fetchOrders();
    } catch (error) {
      console.error("Update order status failed:", error);
      alert("Failed to update order status");
    }
  };

  return (
    <div className="all-orders-page">
      <h3>Orders</h3>

      <div className="all-orders">
        {orders.map((order) => (
          <div className="all-orders-order" key={order._id}>
            <img src={order.foodItemImg} alt={order.foodItemName} />
            <div className="all-orders-order-data">
              <h4>{order.foodItemName}</h4>
              <p>{order.restaurantName}</p>
              <div>
                <span><p><b>UserId: </b> {order.userId}</p></span>
                <span><p><b>Name: </b> {order.name}</p></span>
                <span><p><b>Mobile: </b> {order.mobile}</p></span>
                <span><p><b>Email: </b> {order.email}</p></span>
              </div>
              <div>
                <span>
                  <p>
                    <b>Quantity: </b> {order.quantity}
                  </p>
                </span>
                <span>
                  <p>
                    <b>Total Price: </b> &#8377;{" "}
                    {parseInt(
                      order.price - (order.price * order.discount) / 100
                    ) * order.quantity}{" "}
                    <s>&#8377; {order.price * order.quantity}</s>{" "}
                  </p>
                </span>
                <span><p><b>Payment mode: </b> {order.paymentMethod}</p></span>
              </div>
              <div>
                <span><p><b>Address: </b> {order.address}</p></span>
                <span><p><b>Pincode: </b> {order.pincode}</p></span>
                <span><p><b>Ordered on: </b> {order.orderDate.slice(0, 10)} Time: {order.orderDate.slice(11, 16)}</p></span>
              </div>
              <div><span><p><b>Status: </b> {order.orderStatus}</p></span></div>

              {(order.orderStatus === "order placed" || order.orderStatus === "In-transit") && (
                <div>
                  <span>
                    <div>
                      <select
                        className="form-select form-select-sm"
                        value={updateStatus}
                        onChange={(e) => setUpdateStatus(e.target.value)}
                      >
                        <option value="" disabled>
                          Update order status
                        </option>
                        <option value="order placed">Order Accepted</option>
                        <option value="In-transit">In-transit</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={() => updateOrderStatus(order._id)}
                    >
                      Update
                    </button>
                  </span>

                  <button
                    className="btn btn-outline-danger"
                    onClick={() => cancelOrder(order._id)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllOrders;
