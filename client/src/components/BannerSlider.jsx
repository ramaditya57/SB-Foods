import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BannerSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  
  // Banner content - you can replace these with your own images and content
  const banners = [
    {
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      title: "Delicious Food Delivered Fast",
      description: "Order from your favorite local restaurants with just a few taps",
      buttonText: "Order Now",
      action: () => navigate('/restaurants')
    },
    {
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      title: "Special Offers Every Day",
      description: "Discover daily deals and discounts from top restaurants near you",
      buttonText: "See Offers",
      action: () => navigate('/offers')
    },
    {
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1474&q=80",
      title: "Quality Food From Local Chefs",
      description: "Support local businesses while enjoying the best food in town",
      buttonText: "Explore",
      action: () => navigate('/restaurants')
    }
  ];

  // Auto slide functionality
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide(prevSlide => (prevSlide + 1) % banners.length);
    }, 5000); // Change slide every 5 seconds
    
    return () => clearInterval(slideInterval);
  }, [banners.length]);

  return (
    <div className="banner-slider">
      {banners.map((banner, index) => (
        <div 
          key={index}
          className="banner-slide"
          style={{ 
            transform: `translateX(${100 * (index - currentSlide)}%)`,
            zIndex: index === currentSlide ? 1 : 0
          }}
        >
          <img 
            src={banner.image} 
            alt={banner.title} 
            className="banner-image"
          />
          <div className="banner-content">
            <h2>{banner.title}</h2>
            <p>{banner.description}</p>
            <button className="banner-button" onClick={banner.action}>
              {banner.buttonText}
            </button>
          </div>
        </div>
      ))}
      
      <div className="slider-dots">
        {banners.map((_, index) => (
          <div 
            key={index}
            className={`slider-dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerSlider;