import React, { useEffect, useState } from 'react'
import '../styles/PopularRestaurants.css'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PopularRestaurants = () => {

    const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [promoteList, setPromoteList] = useState([]);

    useEffect(()=>{
        fetchRestaurants();
        fetchPromotions();
      }, [])

    const fetchRestaurants = async() =>{
        await axios.get('https://sb-foods-5t36.onrender.com/fetch-restaurants').then(
          (response)=>{
            setRestaurants(response.data);
          }
        )
      }

      const fetchPromotions = async () =>{
        await axios.get('https://sb-foods-5t36.onrender.com/fetch-promoted-list').then(
          (response)=>{
            setPromoteList(response.data);
          }
        )
      }



  return (
    <div className="popularRestaurantContainer">
        <div className="section-header">
          <h3>Popular Restaurants</h3>
        </div>
        <div className="popularRestaurant-body">

            {restaurants.filter(restaurant=> promoteList.includes(restaurant._id)).map((restaurant, index)=>(

                <div
                  className="popularRestaurantCard"
                  key={restaurant._id}
                  onClick={()=> navigate(`/restaurant/${restaurant._id}`)}
                  data-reveal="zoom"
                  data-reveal-delay={index * 100}
                >
                    <img src={restaurant.mainImg} alt={restaurant.title} />
                    <div className="popularRestaurantCard-data">
                        <h6>{restaurant.title}</h6>
                        <p>{restaurant.address}</p>
                    </div>
                </div>
            ))}


        </div>
    </div>
  )
}

export default PopularRestaurants