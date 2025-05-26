import React, { useEffect, useState, useCallback } from 'react';
import Footer from '../../components/Footer';
import '../../styles/CategoryProducts.css';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const CategoryProducts = () => {
  const navigate = useNavigate();
  const { category } = useParams();

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRestaurantsWithMenuCategory = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch food items of the selected category
      const { data: foodItems } = await axios.get(
        `http://localhost:6001/fetch-food-items-by-menu-category/${category}`
      );

      if (!foodItems || foodItems.length === 0) {
        setRestaurants([]);
        return;
      }

      // Extract unique restaurant IDs
      const restaurantIds = [...new Set(foodItems.map(item => item.restaurantId))];

      // Fetch all restaurants
      const { data: allRestaurants } = await axios.get('http://localhost:6001/fetch-restaurants');

      // Filter restaurants by those IDs
      const filteredRestaurants = allRestaurants.filter(restaurant =>
        restaurantIds.includes(restaurant._id)
      );

      setRestaurants(filteredRestaurants);
    } catch (err) {
      console.error("Error fetching restaurants:", err);
      setRestaurants([]);
      setError("Failed to load restaurants. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchRestaurantsWithMenuCategory();
  }, [fetchRestaurantsWithMenuCategory]);

  return (
    <div className="categoryProducts-page">
      <h2>Restaurants Serving <span className="highlight">{category}</span></h2>

      <div className="restaurants-container">
        <div className="restaurants-body">
          {loading ? (
            <p>Loading restaurants...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : restaurants.length > 0 ? (
            <div className="restaurants">
              {restaurants.map((restaurant) => (
                <div className="restaurant-item" key={restaurant._id}>
                  <div
                    className="restaurant"
                    onClick={() => navigate(`/restaurant/${restaurant._id}`)}
                  >
                    <img
                      src={restaurant.mainImg}
                      alt={restaurant.title}
                      loading="lazy"
                    />
                    <div className="restaurant-data">
                      <h6>{restaurant.title}</h6>
                      <p>{restaurant.address}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No restaurants found serving <b>{category}</b>.</p>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CategoryProducts;
