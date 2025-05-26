import React, { useEffect, useState } from 'react';
import '../../styles/Restaurants.css';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BASE_API_URL;

const AllRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/fetch-restaurants`);
      setRestaurants(response.data);
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
      // Optionally add error state/UI here
    }
  };

  return (
    <div className="AllRestaurantsPage" style={{ marginTop: '14vh' }}>
      <div className="restaurants-container">
        <div className="restaurants-body">
          <h3>All restaurants</h3>
          <div className="restaurants">
            {restaurants.map((restaurant) => (
              <div className='restaurant-item' key={restaurant._id}>
                <div className="restaurant">
                  <img src={restaurant.mainImg} alt={restaurant.title || "restaurant"} />
                  <div className="restaurant-data">
                    <h6>{restaurant.title}</h6>
                    <p>{restaurant.address}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllRestaurants;
