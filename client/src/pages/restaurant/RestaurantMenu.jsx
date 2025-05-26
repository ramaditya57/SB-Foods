import axios from 'axios';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/RestaurantMenu.css';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:6001';

const RestaurantMenu = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const [menuCategories, setMenuCategories] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [restaurant, setRestaurant] = useState();
  const [items, setItems] = useState([]);
  const [visibleItems, setVisibleItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState(null);
  const [sortFilter, setSortFilter] = useState('popularity');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState([]);
  const [typeFilter, setTypeFilter] = useState([]);
  const [cuisineFilter, setCuisineFilter] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // ==== Fetch functions ====

  const fetchMenuCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/fetch-menu-categories`);
      setMenuCategories(response.data);
    } catch {
      try {
        const fallback = await axios.get(`${BASE_URL}/fetch-categories`);
        setMenuCategories(fallback.data);
      } catch (error) {
        console.error('Failed to fetch menu categories:', error);
      }
    }
  }, []);

  const fetchCuisines = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/fetch-cuisines`);
      setCuisines(response.data);
    } catch (error) {
      console.error('Failed to fetch cuisines:', error);
    }
  }, []);

  const fetchRestaurant = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/fetch-restaurant-details/${userId}`);
      setRestaurant(response.data);
    } catch (error) {
      console.error('Failed to fetch restaurant:', error);
    }
  }, [userId]);

  const fetchItems = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/fetch-items`);
      const allItems = response.data;
      setItems(allItems);
      setVisibleItems(allItems);

      if (!menuCategories.length) {
        setMenuCategories([...new Set(allItems.map(item => item.menuCategory))].filter(Boolean));
      }

      if (!cuisines.length) {
        setCuisines([...new Set(allItems.map(item => item.cuisine))].filter(Boolean));
      }
    } catch (error) {
      console.error('Failed to fetch items:', error);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchRestaurant(),
        fetchMenuCategories(),
        fetchCuisines(),
        fetchItems()
      ]);
      setIsLoading(false);
    };
    fetchData();
  }, [fetchRestaurant, fetchMenuCategories, fetchCuisines, fetchItems]);

  // ==== Filtering & Sorting ====

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

    if (searchTerm.trim()) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    switch (sortFilter) {
      case 'low-price':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'high-price':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'discount':
        filtered.sort((a, b) => b.discount - a.discount);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    setVisibleItems(filtered);
  }, [
    items,
    restaurant,
    menuCategoryFilter,
    typeFilter,
    cuisineFilter,
    sortFilter,
    searchTerm
  ]);

  // ==== Handlers ====

  const handleCheckboxChange = (e, setFilter) => {
    const { value, checked } = e.target;
    setFilter(prev => checked ? [...prev, value] : prev.filter(v => v !== value));
  };

  const handleSortChange = (e) => {
    setSortFilter(e.target.value);
  };

  const toggleFilter = (name) => {
    setActiveFilter(prev => (prev === name ? null : name));
  };

  const clearAllFilters = () => {
    setMenuCategoryFilter([]);
    setTypeFilter([]);
    setCuisineFilter([]);
    setSortFilter('popularity');
    setSearchTerm('');
  };

  // ==== JSX ====

  return (
    <div className="restaurant-menu-container">
      <div className="restaurant-menu-wrapper">

        {/* SIDEBAR */}
        <div className="filter-sidebar">
          <h4 className="filter-main-title">Filters</h4>

          <button onClick={clearAllFilters} className="clear-filters-btn">Clear All Filters</button>

          {/* Search */}
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Sort */}
          <div className="filter-group">
            <div className="filter-group-title">Sort By</div>
            <div className="filter-group-body">
              {['popularity', 'low-price', 'high-price', 'discount', 'rating'].map((option, idx) => (
                <div className="filter-item" key={`sort-${idx}`}>
                  <input
                    id={`sort-${idx}`}
                    type="radio"
                    name="sortFilter"
                    value={option}
                    checked={sortFilter === option}
                    onChange={handleSortChange}
                    className="filter-radio"
                  />
                  <label htmlFor={`sort-${idx}`} className="filter-label">
                    {option.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Food Type */}
          <div className="filter-group">
            <div className="filter-group-title">Food Type</div>
            <div className="filter-group-body">
              {['Veg', 'Non Veg', 'Beverages'].map((type, idx) => (
                <div className="filter-item" key={`type-${idx}`}>
                  <input
                    id={`type-${idx}`}
                    type="checkbox"
                    value={type}
                    checked={typeFilter.includes(type)}
                    onChange={(e) => handleCheckboxChange(e, setTypeFilter)}
                    className="filter-checkbox"
                  />
                  <label htmlFor={`type-${idx}`} className="filter-label">{type}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Menu Categories */}
          <div className="filter-group">
            <div className="filter-group-title filter-toggle" onClick={() => toggleFilter('menuCategories')}>
              Menu Categories <span className={`filter-chevron ${activeFilter === 'menuCategories' ? 'rotated' : ''}`}>▼</span>
            </div>
            {activeFilter === 'menuCategories' && (
              <div className="filter-group-body filter-scrollable">
                {menuCategories.map((category, idx) => (
                  <div className="filter-item" key={`category-${idx}`}>
                    <input
                      id={`category-${idx}`}
                      type="checkbox"
                      value={category}
                      checked={menuCategoryFilter.includes(category)}
                      onChange={(e) => handleCheckboxChange(e, setMenuCategoryFilter)}
                      className="filter-checkbox"
                    />
                    <label htmlFor={`category-${idx}`} className="filter-label">{category}</label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cuisines */}
          <div className="filter-group">
            <div className="filter-group-title filter-toggle" onClick={() => toggleFilter('cuisines')}>
              Cuisines <span className={`filter-chevron ${activeFilter === 'cuisines' ? 'rotated' : ''}`}>▼</span>
            </div>
            {activeFilter === 'cuisines' && (
              <div className="filter-group-body filter-scrollable">
                {cuisines.map((cuisine, idx) => (
                  <div className="filter-item" key={`cuisine-${idx}`}>
                    <input
                      id={`cuisine-${idx}`}
                      type="checkbox"
                      value={cuisine}
                      checked={cuisineFilter.includes(cuisine)}
                      onChange={(e) => handleCheckboxChange(e, setCuisineFilter)}
                      className="filter-checkbox"
                    />
                    <label htmlFor={`cuisine-${idx}`} className="filter-label">{cuisine}</label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PRODUCTS */}
        <div className="products-section">
          <div className="products-header">
            <h3>Menu Items ({visibleItems.length})</h3>
          </div>

          {isLoading ? (
            <div className="loading-state">Loading items...</div>
          ) : visibleItems.length === 0 ? (
            <div className="loading-state">
              No items found. <button onClick={clearAllFilters}>Reset Filters</button>
            </div>
          ) : (
            <div className="product-grid">
              {visibleItems.map((item) => (
                <div className="product-card" key={item._id}>
                  <div className="product-image-container">
                    <img
                      src={item.itemImg}
                      alt={item.title}
                      className="product-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/assets/no-image.png';
                      }}
                    />
                    {item.discount > 0 && (
                      <div className="product-badge">{item.discount}% OFF</div>
                    )}
                  </div>

                  <div className="product-info">
                    <h5 className="product-title">{item.title}</h5>
                    <p className="product-description">{item.description}</p>

                    <div className="product-meta">
                      <div className="product-price">₹{item.price}</div>
                      {item.rating && <div className="product-rating">★ {item.rating.toFixed(1)}</div>}
                    </div>

                    <div className="product-tags">
                      {item.category && (
                        <span className={`product-tag ${item.category === 'Veg' ? 'tag-veg' : item.category === 'Non Veg' ? 'tag-non-veg' : 'tag-beverage'}`}>
                          {item.category}
                        </span>
                      )}
                      {item.menuCategory && <span className="product-tag">{item.menuCategory}</span>}
                      {item.cuisine && <span className="product-tag">{item.cuisine}</span>}
                    </div>

                    <button className="update-button" onClick={() => navigate(`/update-product/${item._id}`)}>
                      Update Item
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantMenu;
