import React, { useContext, useEffect, useState, useCallback } from 'react';
import '../../styles/IndividualRestaurant.css';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { GeneralContext } from '../../context/GeneralContext';

const IndividualRestaurant = () => {
  const { fetchCartCount } = useContext(GeneralContext);
  const userId = localStorage.getItem('userId');
  const { id } = useParams();

  const BASE_URL = process.env.REACT_APP_BASE_API_URL;

  const [restaurant, setRestaurant] = useState(null);
  const [menuCategories, setMenuCategories] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [items, setItems] = useState([]);
  const [visibleItems, setVisibleItems] = useState([]);
  const [cartItem, setCartItem] = useState('');
  const [quantity, setQuantity] = useState(0);

  const [sortFilter, setSortFilter] = useState('popularity');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState([]);
  const [typeFilter, setTypeFilter] = useState([]);
  const [cuisineFilter, setCuisineFilter] = useState([]);

  const fetchRestaurant = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetch-restaurant/${id}`);
      setRestaurant(res.data);
    } catch (err) {
      console.error('Error fetching restaurant:', err);
    }
  }, [id, BASE_URL]);

  const fetchMenuCategories = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetch-menu-categories`);
      setMenuCategories(res.data);
    } catch (err) {
      console.log('Fallback to extract categories from items');
    }
  }, [BASE_URL]);

  const fetchCuisines = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetch-cuisines`);
      setCuisines(res.data);
    } catch (err) {
      console.log('Fallback to extract cuisines from items');
    }
  }, [BASE_URL]);

  const fetchItems = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fetch-items`);
      const allItems = res.data;
      setItems(allItems);
      setVisibleItems(allItems);

      if (menuCategories.length === 0) {
        const uniqueCategories = [...new Set(allItems.map(item => item.menuCategory))].filter(Boolean);
        setMenuCategories(uniqueCategories);
      }

      if (cuisines.length === 0) {
        const uniqueCuisines = [...new Set(allItems.map(item => item.cuisine))].filter(Boolean);
        setCuisines(uniqueCuisines);
      }
    } catch (err) {
      console.error('Error fetching items:', err);
    }
  }, [BASE_URL, menuCategories.length, cuisines.length]);

  useEffect(() => {
    fetchRestaurant();
    fetchMenuCategories();
    fetchCuisines();
    fetchItems();
  }, [fetchRestaurant, fetchMenuCategories, fetchCuisines, fetchItems]);

  useEffect(() => {
    let filtered = [...items];
    if (restaurant?._id) {
      filtered = filtered.filter(item => item.restaurantId === restaurant._id);
    }
    if (menuCategoryFilter.length > 0) {
      filtered = filtered.filter(item => menuCategoryFilter.includes(item.menuCategory));
    }
    if (typeFilter.length > 0) {
      filtered = filtered.filter(item => typeFilter.includes(item.category));
    }
    if (cuisineFilter.length > 0) {
      filtered = filtered.filter(item => cuisineFilter.includes(item.cuisine));
    }

    if (sortFilter === 'low-price') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortFilter === 'high-price') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortFilter === 'discount') {
      filtered.sort((a, b) => b.discount - a.discount);
    } else if (sortFilter === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    setVisibleItems(filtered);
  }, [restaurant, items, menuCategoryFilter, typeFilter, cuisineFilter, sortFilter]);

  const toggleCheckbox = (value, state, setState) => {
    if (state.includes(value)) {
      setState(state.filter(v => v !== value));
    } else {
      setState([...state, value]);
    }
  };

  const handleSortFilterChange = (e) => {
    setSortFilter(e.target.value);
  };

  const handleAddToCart = async (foodItemId, foodItemName, restaurantId, foodItemImg, price, discount) => {
    if (!quantity || quantity <= 0) {
      alert('Please enter valid quantity');
      return;
    }

    try {
      await axios.post(`${BASE_URL}/add-to-cart`, {
        userId,
        foodItemId,
        foodItemName,
        restaurantId,
        foodItemImg,
        price,
        discount,
        quantity,
      });

      alert('Product added to cart!');
      setCartItem('');
      setQuantity(0);
      fetchCartCount();
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Operation failed!');
    }
  };

  return (
    <div className="IndividualRestaurant-page">
      {restaurant ? (
        <>
          <h2>{restaurant.title}</h2>
          <p>{restaurant.address}</p>

          {/* Remaining UI unchanged */}
          {/* ... */}
        </>
      ) : (
        <p>No restaurant data found.</p>
      )}
    </div>
  );
};

export default IndividualRestaurant;
