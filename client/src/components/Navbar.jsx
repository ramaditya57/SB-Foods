import React, { useContext, useEffect, useState } from 'react'
import { BsCart3, BsPersonCircle } from 'react-icons/bs'
import { FcSearch } from 'react-icons/fc'
import { useNavigate } from 'react-router-dom'
import { GeneralContext } from '../context/GeneralContext'
import axios from 'axios'
import { ImCancelCircle } from 'react-icons/im'
import '../styles/Navbar.css'
import logoImg from './logo.png' // Make sure logo is in assets folder

const Navbar = () => {
  const navigate = useNavigate();
  const usertype = localStorage.getItem('userType');
  const username = localStorage.getItem('username');
  const { logout, cartCount } = useContext(GeneralContext);
  const [productSearch, setProductSearch] = useState('');
  const [noResult, setNoResult] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    fetchData();
  }, [])

  const fetchData = async() => {
    try {
      const response = await axios.get('http://localhost:6001/fetch-categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  const handleSearch = () => {
    if (productSearch.trim() === '') return;
    
    if (categories.includes(productSearch)) {
      navigate(`/category/${productSearch}`);
      setNoResult(false);
    } else {
      setNoResult(true);
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  const renderUserNavbar = () => (
    <div className="navbar">
      <div className="navbar-brand" onClick={() => navigate('')}>
        <img src={logoImg} alt="SB Foods Logo" className="navbar-logo" />
        <h3>SB Foods</h3>
      </div>
      
      <div className="nav-content">
        <div className={`nav-search ${isSearchFocused ? 'focused' : ''}`}>
          <input 
            type="text" 
            name="nav-search" 
            id="nav-search" 
            placeholder='Search restaurants, cuisine, etc.,' 
            onChange={(e) => setProductSearch(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          <FcSearch className="nav-search-icon" onClick={handleSearch} />
          {noResult && (
            <div className='search-result-data'>
              No items found... try searching for Biriyani, Pizza, etc.
              <ImCancelCircle 
                className='search-result-data-close-btn' 
                onClick={() => setNoResult(false)} 
              />
            </div>
          )}
        </div>

        {!usertype ? (
          <button className='btn login-btn' onClick={() => navigate('/auth')}>
            Login
          </button>
        ) : usertype === 'customer' ? (
          <div className='nav-content-icons'>
            <div className="nav-profile" onClick={() => navigate('/profile')}>
              <BsPersonCircle className='navbar-icons' title="Profile" />
              <p>{username}</p>
            </div>
            <div className="nav-cart" onClick={() => navigate('/cart')}>
              <BsCart3 className='navbar-icons' title="Cart" />
              {cartCount > 0 && <div className="cart-count">{cartCount}</div>}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );

  const renderAdminNavbar = () => (
    <div className="navbar-admin">
      <div className="navbar-brand" onClick={() => navigate('/admin')}>
        <img src={logoImg} alt="SB Foods Logo" className="navbar-logo-admin" />
        <h3>SB Foods (Admin)</h3>
      </div>
      
      <ul className="admin-nav-links">
        <li onClick={() => navigate('/admin')}>Home</li>
        <li onClick={() => navigate('/all-users')}>Users</li>
        <li onClick={() => navigate('/all-orders')}>Orders</li>
        <li onClick={() => navigate('/all-restaurants')}>Restaurants</li>
        <li onClick={() => logout()}>Logout</li>
      </ul>
    </div>
  );

  const renderRestaurantNavbar = () => (
    <div className="navbar-admin">
      <div className="navbar-brand" onClick={() => navigate('/restaurant')}>
        <img src={logoImg} alt="SB Foods Logo" className="navbar-logo-admin" />
        <h3>SB Foods (Restaurant)</h3>
      </div>
      
      <ul className="admin-nav-links">
        <li onClick={() => navigate('/restaurant')}>Home</li>
        <li onClick={() => navigate('/restaurant-orders')}>Orders</li>
        <li onClick={() => navigate('/restaurant-menu')}>Menu</li>
        <li onClick={() => navigate('/new-product')}>New Item</li>
        <li onClick={() => logout()}>Logout</li>
      </ul>
    </div>
  );

  if (usertype === 'admin') {
    return renderAdminNavbar();
  } else if (usertype === 'restaurant') {
    return renderRestaurantNavbar();
  } else {
    return renderUserNavbar();
  }
}

export default Navbar