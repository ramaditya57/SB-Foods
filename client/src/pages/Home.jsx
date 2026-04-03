import React, { useEffect, useState } from 'react'
import '../styles/Home.css'
import Footer from '../components/Footer'
import { useNavigate } from 'react-router-dom'
import PopularRestaurants from '../components/PopularRestaurants'
import BannerSlider from '../components/BannerSlider'
import axios from 'axios'
import useScrollReveal from '../hooks/useScrollReveal'

const Home = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);

  useScrollReveal();

  useEffect(() => {
    fetchRestaurants();
  }, [])

  const fetchRestaurants = async() => {
    try {
      const response = await axios.get('https://sb-foods-1.onrender.com/fetch-restaurants');
      setRestaurants(response.data);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  }

  return (
    <div className="HomePage page-enter">
      {/* New Banner Slider Component */}
      <div data-reveal="fade-up">
        <BannerSlider />
      </div>

      <div className="home-categories-container">
        {[
          { name: 'Breakfast', img: 'https://www.lacademie.com/wp-content/uploads/2022/03/indian-breakfast-recipes-500x500.jpg' },
          { name: 'Biriyani', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4-VXaTJIkc6rk02DU8r7r9zR-KaeWvH1oKA&usqp=CAU' },
          { name: 'Pizza', img: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8MTh8fHxlbnwwfHx8fHw%3D&w=1000&q=80' },
          { name: 'Noodles', img: 'https://www.licious.in/blog/wp-content/uploads/2022/12/Shutterstock_2176816723.jpg' },
          { name: 'Burger', img: 'https://media.istockphoto.com/id/1412706551/photo/burger-on-a-dark-wooden-table.jpg?s=612x612&w=0&k=20&c=LPQ-0uaJ6TJCJD-eZV-ZKe6Ob_e-H4zAGH32Fj0aJLI=' },
        ].map((cat, index) => (
          <div
            className="home-category-card"
            key={cat.name}
            onClick={() => navigate(`/category/${cat.name}`)}
            data-reveal="fade-up"
            data-reveal-delay={index * 80}
          >
            <img src={cat.img} alt={cat.name} />
            <h5>{cat.name}</h5>
          </div>
        ))}
      </div>

      <div data-reveal="fade-up">
        <PopularRestaurants />
      </div>

      <div className="restaurants-container" data-reveal="fade-up">
        <div className="restaurants-body">
          <div className="section-header">
            <h3>All Restaurants</h3>
          </div>
          <div className="restaurants">
            {restaurants.map((restaurant, index) => (
              <div
                className='restaurant-item'
                key={restaurant._id}
                data-reveal="fade-up"
                data-reveal-delay={index * 60}
              >
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
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Home