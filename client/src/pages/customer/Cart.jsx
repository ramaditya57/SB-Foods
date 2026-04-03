import React, { useContext, useEffect, useState, useCallback } from 'react'
import '../../styles/Cart.css'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GeneralContext } from '../../context/GeneralContext';
import useScrollReveal from '../../hooks/useScrollReveal';
import Toast from '../../components/Toast';

const Cart = () => {

  const [cart, setCart] = useState([]);

  const {fetchCartCount} = useContext(GeneralContext);

  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => setToast({ show: true, message, type });
  const hideToast = useCallback(() => setToast(prev => ({ ...prev, show: false })), []);

  useScrollReveal();

  const fetchCart = useCallback(async() =>{
    await axios.get('https://sb-foods-1.onrender.com/fetch-cart').then(
      (response)=>{
        setCart(response.data.filter(item=> item.userId === userId));
      }
    )
  }, [userId]);

  const removeCartItem = async(id) =>{
    await axios.put('https://sb-foods-1.onrender.com/remove-item', {id}).then(
      (response)=>{
        fetchCart();
        fetchCartCount();
      }
    )
  };

  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [deliveryCharges, setDeliveryCharges] = useState(0);

  const calculateTotalPrice = useCallback(() => {
    const price = cart.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    const discount = cart.reduce((sum, product)=> sum + ((product.price * product.discount)/100 )* product.quantity, 0);
    setTotalPrice(price);
    setTotalDiscount(discount);
    if(price > 1000 || cart.length === 0){
      setDeliveryCharges(0);
    } else{ 
      setDeliveryCharges(50);
    }
  }, [cart]);

  useEffect(()=>{
    fetchCart();
  }, [fetchCart]);

  useEffect(()=>{
    calculateTotalPrice();
  }, [cart, calculateTotalPrice]);


  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  const placeOrder = async() =>{
    if(cart.length > 0){
        await axios.post('https://sb-foods-1.onrender.com/place-cart-order', {userId, name, mobile, email, address, pincode, paymentMethod, orderDate: new Date()}).then(
          (response)=>{
            showToast('Order placed successfully! 🎉', 'success');
            setName('');
            setMobile('');
            setEmail('');
            setAddress('');
            setPincode('');
            setPaymentMethod('');
            setTimeout(() => navigate('/profile'), 1500);
          }
        ).catch(() => {
          showToast('Failed to place order. Please try again.', 'error');
        });
    }
  }

  return (
    <div className="cartPage page-enter">
      <div className="cartContents" data-reveal="fade-left">

        {cart.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🛒</div>
            <h4>Your cart is empty</h4>
            <p>Browse restaurants and add delicious items to your cart</p>
          </div>
        ) : null}

        {cart.map((item)=>(
          
            <div className="cartItem">
              <img src={item.foodItemImg} alt="" />
              <div className="cartItem-data">
                <h4>{item.foodItemName}</h4>
                <p>{item.restaurantName}</p>
                <div className="cartItem-inputs">
                  <div className="cartItem-qty-pill">
                      Quantity: <strong>{item.quantity}</strong>
                  </div>
                <h6>Price: &#8377; {parseInt(item.price - (item.price*item.discount)/100)} <s> &#8377;{item.price}</s></h6>
                </div>
                <button className='btn btn-outline-danger' onClick={()=> removeCartItem(item._id)}>Remove</button>
              </div>
            </div>
        ))}


      </div>


      <div className="cartPriceBody" data-reveal="fade-right">
        <h4>Price Details</h4>
        <span><b>Total MRP: </b> <p>&#8377; {totalPrice}</p></span>
        <span><b>Discount on MRP: </b> <p style={{color: 'var(--success)'}}>- &#8377; {totalDiscount}</p></span>
        <span><b>Delivery Charges: </b> <p style={{color: 'var(--accent)'}}>+ &#8377; {deliveryCharges}</p></span>
        <hr />
        <h5><b>Final Price: </b> &#8377; {totalPrice - totalDiscount + deliveryCharges}</h5>
        <button data-bs-toggle="modal" data-bs-target="#staticBackdrop">Place order</button>
      </div>



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
                  <input type="text" className="form-control" id="floatingInput1" value={name} onChange={(e)=> setName(e.target.value)} />
                  <label htmlFor="floatingInput1">Name</label>
                </div>

                <section>
                  <div className="form-floating mb-3 span-child-2">
                    <input type='text' className="form-control" id="floatingInput2" value={mobile} onChange={(e)=> setMobile(e.target.value)} />
                    <label htmlFor="floatingInput2">Mobile</label>
                  </div>

                  <div className="form-floating mb-3 span-child-1">
                    <input type='text' className="form-control" id="floatingInput3" value={email} onChange={(e)=> setEmail(e.target.value)} />
                    <label htmlFor="floatingInput3">Email</label>
                  </div>
                </section>


                <section>
                  <div className="form-floating mb-3 span-child-1">
                    <input type='text' className="form-control" id="floatingInput6" value={address} onChange={(e)=> setAddress(e.target.value)} />
                    <label htmlFor="floatingInput6">Address</label>
                  </div>

                  <div className="form-floating mb-3 span-child-2">
                    <input type='text' className="form-control" id="floatingInput7" value={pincode} onChange={(e)=> setPincode(e.target.value)} />
                    <label htmlFor="floatingInput7">Pincode</label>
                  </div>
                </section>

            </div>

            <div className="checkout-payment-method">
              <h4>Payment method</h4>
              <div className="form-floating mb-3">
                <select className="form-select form-select-md mb-3" id="floatingInput8" value={paymentMethod} onChange={(e)=> setPaymentMethod(e.target.value)}>
                  <option value="">choose payment method</option>
                  <option value="netbanking">netbanking</option>
                  <option value="card">card payments</option>
                  <option value="upi">upi</option>
                  <option value="cod">cash on delivery</option>
                </select>
                <label htmlFor="floatingInput8">Choose Payment method</label>
              </div>
            </div>

            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">cancel</button>
              <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={placeOrder}>Order</button>
            </div>
          </div>
        </div>
      </div>



      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={hideToast} />
    </div>
  )
}

export default Cart