import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/RestaurantMenu.css'; // Import external CSS file

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
  }, []);

  const fetchMenuCategories = async () => {
    try {
      const response = await axios.get('https://sb-foods-1.onrender.com/fetch-menu-categories');
      setMenuCategories(response.data);
    } catch (err) {
      try {
        const response = await axios.get('https://sb-foods-1.onrender.com/fetch-categories');
        setMenuCategories(response.data);
      } catch (secondErr) {
        console.log("Could not fetch menu categories, will extract from items:", secondErr);
      }
    }
  }

  const fetchCuisines = async () => {
    try {
      const response = await axios.get('https://sb-foods-1.onrender.com/fetch-cuisines');
      setCuisines(response.data);
    } catch (err) {
      console.log("Could not fetch cuisines, will extract from items:", err);
    }
  }

  const fetchRestaurant = async () => {
    try {
      const response = await axios.get(`https://sb-foods-1.onrender.com/fetch-restaurant-details/${userId}`);
      setRestaurant(response.data);
    } catch (err) {
      console.log("Could not fetch restaurant details:", err);
    }
  }

  const fetchItems = async () => {
    try {
      const response = await axios.get(`https://sb-foods-1.onrender.com/fetch-items`);
      const allItems = response.data;
      setItems(allItems);
      setVisibleItems(allItems);
      
      // Extract unique menu categories and cuisines if they weren't loaded from API
      if (menuCategories.length === 0) {
        const uniqueMenuCategories = [...new Set(allItems.map(item => item.menuCategory))].filter(Boolean);
        setMenuCategories(uniqueMenuCategories);
      }
      
      if (cuisines.length === 0) {
        const uniqueCuisines = [...new Set(allItems.map(item => item.cuisine))].filter(Boolean);
        setCuisines(uniqueCuisines);
      }
    } catch (err) {
      console.log("Could not fetch items:", err);
    }
  }

  const [sortFilter, setSortFilter] = useState('popularity');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState([]);
  const [typeFilter, setTypeFilter] = useState([]);
  const [cuisineFilter, setCuisineFilter] = useState([]);
  
  const handleMenuCategoryCheckBox = (e) => {
    const value = e.target.value;
    if (e.target.checked) {
      setMenuCategoryFilter([...menuCategoryFilter, value]);
    } else {
      setMenuCategoryFilter(menuCategoryFilter.filter(cat => cat !== value));
    }
  }

  const handleTypeCheckBox = (e) => {
    const value = e.target.value;
    if (e.target.checked) {
      setTypeFilter([...typeFilter, value]);
    } else {
      setTypeFilter(typeFilter.filter(type => type !== value));
    }
  }

  const handleCuisineCheckBox = (e) => {
    const value = e.target.value;
    if (e.target.checked) {
      setCuisineFilter([...cuisineFilter, value]);
    } else {
      setCuisineFilter(cuisineFilter.filter(cuisine => cuisine !== value));
    }
  }

  const handleSortFilterChange = (e) => {
    const value = e.target.value;
    setSortFilter(value);
  }

  const toggleFilter = (filterName) => {
    setActiveFilter(activeFilter === filterName ? null : filterName);
  }

  // Apply filters and sorting
  useEffect(() => {
    // Start with all items
    let filteredItems = [...items];
    
    // Filter by restaurant ID
    if (restaurant && restaurant._id) {
      filteredItems = filteredItems.filter(item => item.restaurantId === restaurant._id);
    }
    
    // Apply filters based on what's selected
    if (menuCategoryFilter.length > 0) {
      filteredItems = filteredItems.filter(item => menuCategoryFilter.includes(item.menuCategory));
    }
    
    if (typeFilter.length > 0) {
      filteredItems = filteredItems.filter(item => typeFilter.includes(item.category));
    }
    
    if (cuisineFilter.length > 0) {
      filteredItems = filteredItems.filter(item => cuisineFilter.includes(item.cuisine));
    }
    
    // Apply current sort
    if (sortFilter === 'low-price') {
      filteredItems = [...filteredItems].sort((a, b) => a.price - b.price);
    } else if (sortFilter === 'high-price') {
      filteredItems = [...filteredItems].sort((a, b) => b.price - a.price);
    } else if (sortFilter === 'discount') {
      filteredItems = [...filteredItems].sort((a, b) => b.discount - a.discount);
    } else if (sortFilter === 'rating') {
      filteredItems = [...filteredItems].sort((a, b) => b.rating - a.rating);
    }
    
    setVisibleItems(filteredItems);
  }, [menuCategoryFilter, typeFilter, cuisineFilter, sortFilter, items, restaurant]);

  return (
    <div className="restaurant-menu-container">
      <div className="restaurant-menu-wrapper">
        {/* Filter Sidebar */}
        <div className="filter-sidebar">
          <h4 className="filter-main-title">Filters</h4>
          
          {/* Sort Filter - Always visible */}
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
                    onChange={handleSortFilterChange}
                    className="filter-radio"
                  />
                  <label htmlFor={`sort-${idx}`} className="filter-label">
                    {option.charAt(0).toUpperCase() + option.slice(1).replace('-', ' ')}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Food Type Filter - Always visible */}
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
                    onChange={handleTypeCheckBox}
                    className="filter-checkbox"
                  />
                  <label htmlFor={`type-${idx}`} className="filter-label">
                    {type}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Menu Categories Filter - Collapsible */}
          <div className="filter-group">
            <div 
              className="filter-group-title filter-toggle"
              onClick={() => toggleFilter('menuCategories')}
            >
              Menu Categories
              <span className={`filter-chevron ${activeFilter === 'menuCategories' ? 'rotated' : ''}`}>▼</span>
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
                      onChange={handleMenuCategoryCheckBox}
                      className="filter-checkbox"
                    />
                    <label htmlFor={`category-${idx}`} className="filter-label">
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Cuisines Filter - Collapsible */}
          <div className="filter-group">
            <div 
              className="filter-group-title filter-toggle"
              onClick={() => toggleFilter('cuisines')}
            >
              Cuisines
              <span className={`filter-chevron ${activeFilter === 'cuisines' ? 'rotated' : ''}`}>▼</span>
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
                      onChange={handleCuisineCheckBox}
                      className="filter-checkbox"
                    />
                    <label htmlFor={`cuisine-${idx}`} className="filter-label">
                      {cuisine}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Products Section */}
        <div className="products-section">
          <div className="products-header">
            <h3>Menu Items ({visibleItems.length})</h3>
          </div>
          
          {isLoading ? (
            <div className="loading-state">
              <div>Loading items...</div>
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="loading-state">
              <div>No items found matching your filters</div>
            </div>
          ) : (
            <div className="product-grid">
              {visibleItems.map((item) => (
                <div 
                  key={item._id}
                  className="product-card"
                >
                  <div className="product-image-container">
                    <img 
                      src={item.itemImg} 
                      alt={item.title}
                      className="product-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x180?text=No+Image';
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
                      {item.rating && (
                        <div className="product-rating">
                          ★ {item.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                    
                    <div className="product-tags">
                      {item.category && (
                        <span className={`product-tag ${item.category === 'Veg' ? 'tag-veg' : item.category === 'Non Veg' ? 'tag-non-veg' : 'tag-beverage'}`}>
                          {item.category}
                        </span>
                      )}
                      {item.menuCategory && (
                        <span className="product-tag">{item.menuCategory}</span>
                      )}
                      {item.cuisine && (
                        <span className="product-tag">{item.cuisine}</span>
                      )}
                    </div>
                    
                    <button 
                      className="update-button"
                      onClick={() => navigate(`/update-product/${item._id}`)}
                    >
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