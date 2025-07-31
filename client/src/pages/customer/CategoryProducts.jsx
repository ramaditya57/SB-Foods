import React, { useEffect, useState } from 'react'
import Footer from '../../components/Footer'
import Restaurants from '../../components/Restaurants'
import '../../styles/CategoryProducts.css'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

const CategoryProducts = () => {
  const navigate = useNavigate();
  const { category } = useParams();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurantsWithMenuCategory();
  }, [category]);

  const fetchRestaurantsWithMenuCategory = async () => {
    setLoading(true);
    try {
      // First get all food items with the specified menu category
      const foodItemsResponse = await axios.get(`http://localhost:6001/fetch-food-items-by-menu-category/${category}`);
      
      if (foodItemsResponse.data && foodItemsResponse.data.length > 0) {
        // Extract unique restaurant IDs from the food items
        const restaurantIds = [...new Set(foodItemsResponse.data.map(item => item.restaurantId))];
        
        // Then fetch the restaurant details for these IDs
        const restaurantsResponse = await axios.get('http://localhost:6001/fetch-restaurants');
        
        // Filter restaurants based on the extracted IDs
        const filteredRestaurants = restaurantsResponse.data.filter(restaurant => 
          restaurantIds.includes(restaurant._id)
        );
        
        setRestaurants(filteredRestaurants);
      } else {
        setRestaurants([]);
      }
    } catch (error) {
      console.error("Error fetching restaurants with menu category:", error);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="categoryProducts-page">
      <h2>Restaurants Serving {category}</h2>
      <div className="restaurants-container">
        <div className="restaurants-body">
          {loading ? (
            <p>Loading restaurants...</p>
          ) : restaurants.length > 0 ? (
            <div className="restaurants">
              {restaurants.map((restaurant) => (
                <div className='restaurant-item' key={restaurant._id}>
                  <div className="restaurant" onClick={() => navigate(`/restaurant/${restaurant._id}`)}>
                    <img src={restaurant.mainImg} alt={restaurant.title} />
                    <div className="restaurant-data">
                      <h6>{restaurant.title}</h6>
                      <p>{restaurant.address}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No restaurants found serving {category}</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CategoryProducts;