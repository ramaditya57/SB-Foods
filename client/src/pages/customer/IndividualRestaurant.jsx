import React, { useContext, useEffect, useState, useCallback } from 'react'
import '../../styles/IndividualRestaurant.css'
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { GeneralContext } from '../../context/GeneralContext';
import useScrollReveal from '../../hooks/useScrollReveal';
import Toast from '../../components/Toast';

const IndividualRestaurant = () => {
  const {fetchCartCount} = useContext(GeneralContext);
  const userId = localStorage.getItem('userId');
  const {id} = useParams();
  
  const [restaurant, setRestaurant] = useState();
  const [menuCategories, setMenuCategories] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [items, setItems] = useState([]);
  const [visibleItems, setVisibleItems] = useState([]);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  useScrollReveal();

  useEffect(() => {
    fetchMenuCategories();
    fetchCuisines();
    fetchItems();
    fetchRestaurants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchRestaurants = async() => {
    await axios.get(`https://sb-foods-1.onrender.com/fetch-restaurant/${id}`).then(
      (response) => {
        setRestaurant(response.data);
      }
    ).catch((err) => {
      console.log(err);
    });
  };

  const fetchMenuCategories = async() => {
    try {
      const response = await axios.get('https://sb-foods-1.onrender.com/fetch-menu-categories');
      setMenuCategories(response.data);
    } catch (err) {
      console.log("Error fetching menu categories, will extract from items:", err);
    }
  };

  const fetchCuisines = async() => {
    try {
      const response = await axios.get('https://sb-foods-1.onrender.com/fetch-cuisines');
      setCuisines(response.data);
    } catch (err) {
      console.log("Error fetching cuisines, will extract from items:", err);
    }
  };

  const fetchItems = async() => {
    await axios.get(`https://sb-foods-1.onrender.com/fetch-items`).then(
      (response) => {
        const allItems = response.data;
        setItems(allItems);
        setVisibleItems(allItems);
        
        setMenuCategories(prev => prev.length === 0 ? [...new Set(allItems.map(item => item.menuCategory))].filter(Boolean) : prev);
        setCuisines(prev => prev.length === 0 ? [...new Set(allItems.map(item => item.cuisine))].filter(Boolean) : prev);
      }
    );
  };

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
    
    const itemsToSort = [...visibleItems];
    
    if (value === 'low-price') {
      setVisibleItems(itemsToSort.sort((a, b) => a.price - b.price));
    } else if (value === 'high-price') {
      setVisibleItems(itemsToSort.sort((a, b) => b.price - a.price));
    } else if (value === 'discount') {
      setVisibleItems(itemsToSort.sort((a, b) => b.discount - a.discount));
    } else if (value === 'rating') {
      setVisibleItems(itemsToSort.sort((a, b) => b.rating - a.rating));
    }
  }

  useEffect(() => {
    let filteredItems = [...items];
    
    if (restaurant && restaurant._id) {
      filteredItems = filteredItems.filter(item => item.restaurantId === restaurant._id);
    }
    
    if (menuCategoryFilter.length > 0) {
      filteredItems = filteredItems.filter(item => menuCategoryFilter.includes(item.menuCategory));
    }
    
    if (typeFilter.length > 0) {
      filteredItems = filteredItems.filter(item => typeFilter.includes(item.category));
    }
    
    if (cuisineFilter.length > 0) {
      filteredItems = filteredItems.filter(item => cuisineFilter.includes(item.cuisine));
    }
    
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
  }, [restaurant, menuCategoryFilter, typeFilter, cuisineFilter, sortFilter, items]);

  const [cartItem, setCartItem] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = async(foodItemId, foodItemName, restaurantId, foodItemImg, price, discount) => {
    await axios.post('https://sb-foods-1.onrender.com/add-to-cart', {
      userId, foodItemId, foodItemName, restaurantId, foodItemImg, price, discount, quantity
    }).then((response) => {
      showToast(`${foodItemName} added to cart!`, 'success');
      setCartItem('');
      setQuantity(0);
      fetchCartCount();
    }).catch((err) => {
      showToast('Failed to add item. Please try again.', 'error');
    });
  }

  return (
    <div className="IndividualRestaurant-page page-enter">
      {restaurant ? (
        <>
          <h2 data-reveal="fade-up">{restaurant.title}</h2>
          <p data-reveal="fade-up" data-reveal-delay="100">{restaurant.address}</p>

          <div className="IndividualRestaurant-body">
            <div className="restaurants-filter" data-reveal="fade-right">
              <h4>Filters</h4>
              <div className="restaurant-filters-body">

                <div className="filter-sort">
                  <h6>Sort By</h6>
                  <div className="filter-sort-body sub-filter-body">
                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="flexRadioDefault" id="filter-sort-radio1" value="popularity" onChange={handleSortFilterChange} />
                      <label className="form-check-label" htmlFor="filter-sort-radio1">
                        Popularity
                      </label>
                    </div>

                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="flexRadioDefault" id="filter-sort-radio2" value="low-price" onChange={handleSortFilterChange} />
                      <label className="form-check-label" htmlFor="filter-sort-radio2">
                        Low-price
                      </label>
                    </div>

                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="flexRadioDefault" id="filter-sort-radio3" value="high-price" onChange={handleSortFilterChange} />
                      <label className="form-check-label" htmlFor="filter-sort-radio3">
                        High-price
                      </label>
                    </div>

                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="flexRadioDefault" id="filter-sort-radio4" value="discount" onChange={handleSortFilterChange} />
                      <label className="form-check-label" htmlFor="filter-sort-radio4">
                        Discount
                      </label>
                    </div>

                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="flexRadioDefault" id="filter-sort-radio5" value="rating" onChange={handleSortFilterChange} />
                      <label className="form-check-label" htmlFor="filter-sort-radio5">
                        Rating
                      </label>
                    </div>
                  </div>
                </div>

                <div className="filter-categories">
                  <h6>Food Type</h6>
                  <div className="filter-categories-body sub-filter-body">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" value="Veg" id="filter-type-check-1" checked={typeFilter.includes('Veg')} onChange={handleTypeCheckBox} />
                      <label className="form-check-label" htmlFor="filter-type-check-1">
                        Veg
                      </label>
                    </div>

                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" value="Non Veg" id="filter-type-check-2" checked={typeFilter.includes('Non Veg')} onChange={handleTypeCheckBox} />
                      <label className="form-check-label" htmlFor="filter-type-check-2">
                        Non Veg
                      </label>
                    </div>

                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" value="Beverages" id="filter-type-check-3" checked={typeFilter.includes('Beverages')} onChange={handleTypeCheckBox} />
                      <label className="form-check-label" htmlFor="filter-type-check-3">
                        Beverages
                      </label>
                    </div>
                  </div>
                </div>

                {/* Menu Categories section */}
                <div className="filter-menu-categories">
                  <h6>Menu Categories</h6>
                  <div className="filter-menu-categories-body sub-filter-body">
                    {menuCategories.map((category, index) => (
                      <div className="form-check" key={`menu-cat-${index}`}>
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          value={category} 
                          id={`filter-menu-category-check-${index}`} 
                          checked={menuCategoryFilter.includes(category)} 
                          onChange={handleMenuCategoryCheckBox} 
                        />
                        <label className="form-check-label" htmlFor={`filter-menu-category-check-${index}`}>
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cuisines section - now clearly separated */}
                <div className="filter-cuisines">
                  <h6>Cuisines</h6>
                  <div className="filter-cuisines-body sub-filter-body">
                    {cuisines.map((cuisine, index) => (
                      <div className="form-check" key={`cuisine-${index}`}>
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          value={cuisine} 
                          id={`filter-cuisine-check-${index}`} 
                          checked={cuisineFilter.includes(cuisine)} 
                          onChange={handleCuisineCheckBox} 
                        />
                        <label className="form-check-label" htmlFor={`filter-cuisine-check-${index}`}>
                          {cuisine}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="restaurants-body">
              <div className="section-header">
                <h3>All Items</h3>
              </div>
              <div className="restaurants">
                {visibleItems.map((item, index) => (
                  <div
                    className='restaurant-item'
                    key={item._id}
                    data-reveal="fade-up"
                    data-reveal-delay={index * 50}
                  >
                    <div className={`restaurant ${cartItem === item._id ? 'active-card' : ''}`}>
                      <img src={item.itemImg} alt={item.title} />
                      <div className="restaurant-data">
                        <h6>{item.title}</h6>
                        <p>{item.description.slice(0, 25) + '...'}</p>
                        <h6>&#8377; {parseInt(item.price - (item.price * item.discount) / 100)} <s>{item.price}</s></h6>
                        {/* Display cuisine and category for debugging */}
                        <small>
                          {item.cuisine && <span style={{marginRight: '10px'}}>{item.cuisine}</span>}
                          {item.menuCategory && <span>{item.menuCategory}</span>}
                        </small>
                        {cartItem === item._id ? (
                          <>
                            <div className="quantity-selector">
                              <button className="qty-btn" onClick={() => setQuantity(prev => Math.max(1, parseInt(prev) - 1))}>-</button>
                              <span className="qty-value">{quantity}</span>
                              <button className="qty-btn" onClick={() => setQuantity(prev => parseInt(prev) + 1)}>+</button>
                            </div>
                            <button 
                              className='btn btn-outline-primary' 
                              onClick={() => handleAddToCart(item._id, item.title, item.restaurantId, item.itemImg, item.price, item.discount)}
                            >
                              Add to cart
                            </button>
                          </>
                        ) : (
                          <button 
                            className='btn btn-outline-primary' 
                            onClick={() => { setCartItem(item._id); setQuantity(1); }}
                          >
                            Add item
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">🍽️</div>
          <h4>Loading restaurant...</h4>
          <p>Fetching the menu for you</p>
        </div>
      )}

      <Toast 
        show={toast.show} 
        message={toast.message} 
        type={toast.type} 
        onClose={hideToast} 
      />
    </div>
  );
}

export default IndividualRestaurant;