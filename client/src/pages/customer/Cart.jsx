import React, { useContext, useEffect, useState, useCallback } from 'react';
import '../../styles/Cart.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GeneralContext } from '../../context/GeneralContext';

const Cart = () => {
  const BASE_URL = process.env.REACT_APP_BASE_API_URL;

  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [deliveryCharges, setDeliveryCharges] = useState(0);

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  const { fetchCartCount } = useContext(GeneralContext);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  const fetchCart = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/fetch-cart/${userId}`);
      setCart(response.data);
    } catch (error) {
      console.error("Failed to fetch cart", error);
    }
  }, [userId]);

  const calculateTotalPrice = useCallback(() => {
    const price = cart.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    const discount = cart.reduce((sum, product) => sum + ((product.price * product.discount) / 100) * product.quantity, 0);
    setTotalPrice(price);
    setTotalDiscount(discount);
    setDeliveryCharges(price > 1000 || cart.length === 0 ? 0 : 50);
  }, [cart]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (cart.length > 0) {
      calculateTotalPrice();
    }
  }, [cart, calculateTotalPrice]);

  useEffect(() => {
    const handleModalClose = () => {
      setName('');
      setMobile('');
      setEmail('');
      setAddress('');
      setPincode('');
      setPaymentMethod('');
    };

    const modal = document.getElementById('staticBackdrop');
    modal?.addEventListener('hidden.bs.modal', handleModalClose);

    return () => modal?.removeEventListener('hidden.bs.modal', handleModalClose);
  }, []);

  const removeItem = async (id) => {
    try {
      await axios.put(`${BASE_URL}/remove-item`, { id });
      fetchCart();
      fetchCartCount();
    } catch (error) {
      console.error("Failed to remove item", error);
    }
  };

  const updateQuantity = async (id, newQuantity) => {
    try {
      await axios.put(`${BASE_URL}/update-cart-quantity`, { id, quantity: newQuantity });
      fetchCart();
    } catch (error) {
      console.error('Failed to update quantity', error);
    }
  };

  const placeOrder = async () => {
    if (cart.length === 0 || !name || !mobile || !email || !address || !pincode || !paymentMethod) {
      alert('Please complete all fields before placing an order.');
      return;
    }

    try {
      await axios.post(`${BASE_URL}/place-cart-order`, {
        userId,
        name,
        mobile,
        email,
        address,
        pincode,
        paymentMethod,
        orderDate: new Date()
      });

      alert('Order placed successfully!');
      document.querySelector('.btn-close').click(); // Close modal
      fetchCart();
      fetchCartCount();
      navigate('/profile');
    } catch (error) {
      console.error("Order placement failed", error);
      alert('Order failed. Please try again.');
    }
  };

  return (
    <div className="cartPage">
      <div className="cartContents">
        {cart.length === 0 ? (
          <p>No items in the cart..</p>
        ) : (
          cart.map((item) => {
            const discountedPrice = Math.round(item.price - (item.price * item.discount) / 100);
            return (
              <div className="cartItem" key={item._id}>
                <img src={item.foodItemImg} alt={item.foodItemName} />
                <div className="cartItem-data">
                  <h4>{item.foodItemName}</h4>
                  <p>{item.restaurantName}</p>
                  <div className="cartItem-inputs">
                    <div className="cartItem-input">
                      <label>Quantity:</label>
                      <input
                        type="number"
                        className="form-control quantity-field"
                        value={item.quantity}
                        min="1"
                        onChange={(e) => updateQuantity(item._id, Number(e.target.value))}
                      />
                    </div>
                    <h6>
                      Price: ₹{discountedPrice}
                      <s> ₹{item.price}</s>
                    </h6>
                  </div>
                  <button className='btn btn-outline-danger' onClick={() => removeItem(item._id)}>Remove</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="cartPriceBody">
        <h4>Price Details</h4>
        <span><b>Total MRP: </b> <p>₹ {totalPrice.toFixed(2)}</p></span>
        <span><b>Discount on MRP: </b> <p style={{ color: "rgb(7, 156, 106)" }}>- ₹ {totalDiscount.toFixed(2)}</p></span>
        <span><b>Delivery Charges: </b> <p style={{ color: "red" }}>+ ₹ {deliveryCharges}</p></span>
        <hr />
        <h5><b>Final Price: </b> ₹ {(totalPrice - totalDiscount + deliveryCharges).toFixed(2)}</h5>
        <button data-bs-toggle="modal" data-bs-target="#staticBackdrop">Place order</button>
      </div>

      {/* Checkout Modal */}
      <div className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="staticBackdropLabel">Checkout</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="checkout-address">
                <h4>Checkout details</h4>

                <div className="form-floating mb-3">
                  <input type="text" className="form-control" id="floatingInput1" value={name} onChange={(e) => setName(e.target.value)} />
                  <label htmlFor="floatingInput1">Name</label>
                </div>

                <section>
                  <div className="form-floating mb-3 span-child-2">
                    <input type="text" className="form-control" id="floatingInput2" value={mobile} onChange={(e) => setMobile(e.target.value)} />
                    <label htmlFor="floatingInput2">Mobile</label>
                  </div>

                  <div className="form-floating mb-3 span-child-1">
                    <input type="text" className="form-control" id="floatingInput3" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <label htmlFor="floatingInput3">Email</label>
                  </div>
                </section>

                <section>
                  <div className="form-floating mb-3 span-child-1">
                    <input type="text" className="form-control" id="floatingInput6" value={address} onChange={(e) => setAddress(e.target.value)} />
                    <label htmlFor="floatingInput6">Address</label>
                  </div>

                  <div className="form-floating mb-3 span-child-2">
                    <input type="text" className="form-control" id="floatingInput7" value={pincode} onChange={(e) => setPincode(e.target.value)} />
                    <label htmlFor="floatingInput7">Pincode</label>
                  </div>
                </section>
              </div>

              <div className="checkout-payment-method">
                <h4>Payment method</h4>
                <div className="form-floating mb-3">
                  <select className="form-select form-select-md mb-3" id="floatingInput8" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="">Choose payment method</option>
                    <option value="netbanking">Netbanking</option>
                    <option value="card">Card Payments</option>
                    <option value="upi">UPI</option>
                    <option value="cod">Cash on Delivery</option>
                  </select>
                  <label htmlFor="floatingInput8">Choose Payment Method</label>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" className="btn btn-primary" onClick={placeOrder}>Order</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;