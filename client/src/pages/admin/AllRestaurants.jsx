import React, { useEffect, useState } from 'react'
import '../../styles/Restaurants.css'
import axios from 'axios';

const AllRestaurants = () => {

    const [restaurants, setRestaurants] = useState([]);

    useEffect(()=>{
        fetchRestaurants();
      }, [])

    const fetchRestaurants = async() =>{
        await axios.get('https://sb-foods-1.onrender.com/fetch-restaurants').then(
          (response)=>{
            setRestaurants(response.data);
          }
        )
      }

  return (
    <div className="admin-page all-restaurants-admin">
      <div className="admin-content-header">
        <h3>All restaurants</h3>
      </div>
      
      <div className="admin-restaurants-grid">
        {restaurants.map((restaurant) => (
          <div className='restaurant-card-wrapper' key={restaurant._id}>
            <div className="restaurant-card-modern">
              <div className="restaurant-image-container">
                <img 
                  src={restaurant.mainImg} 
                  alt={restaurant.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"; // Fallback
                  }}
                />
              </div>
              <div className="restaurant-details">
                <h6>{restaurant.title}</h6>
                <p>{restaurant.address}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AllRestaurants