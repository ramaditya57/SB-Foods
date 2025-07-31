
import React from 'react';
import { useNavigate } from 'react-router-dom';

const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();

  return (
    <div className="restaurant-item" onClick={() => navigate(`/restaurant/${restaurant._id}`)}>
      <div className="restaurant-image-container">
        <img src={restaurant.mainImg} alt={restaurant.title} />
      </div>
      <div className="restaurant-info">
        <h6>{restaurant.title}</h6>
        <p>{restaurant.address}</p>
      </div>
    </div>
  );
};

export default RestaurantCard;