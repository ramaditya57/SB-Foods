import React, { createContext, useEffect, useState } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const GeneralContext = createContext();

const GeneralContextProvider = ({children}) => {


  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usertype, setUsertype] = useState('');
  const [restaurantAddress, setRestaurantAddress] = useState('');
  const [restaurantImage, setRestaurantImage] = useState('');

  const [productSearch, setProductSearch] = useState('');

  const [cartCount, setCartCount] = useState(0);


  useEffect(()=>{
    fetchCartCount();
  }, [])

  const fetchCartCount = async() =>{
    const userId = localStorage.getItem('userId');
    if(userId){
      await axios.get('https://sb-foods-1.onrender.com/fetch-cart').then(
        (response)=>{
          setCartCount(response.data.filter(item=> item.userId === userId).length);
        }
      )
    }
  }



  const handleSearch = () =>{
    navigate('#products-body')
  }


  
  
  
  const login = async () =>{
    try{
      const loginInputs = {email, password}
        await axios.post('https://sb-foods-1.onrender.com/login', loginInputs)
        .then( async (res)=>{

          localStorage.setItem('userId', res.data._id);
            localStorage.setItem('userType', res.data.usertype);
            localStorage.setItem('username', res.data.username);
            localStorage.setItem('email', res.data.email);
            if(res.data.usertype === 'customer'){
                navigate('/');
            } else if(res.data.usertype === 'admin'){
                navigate('/admin');
            } else if(res.data.usertype === 'restaurant'){
                navigate('/restaurant');
            }
          }).catch((err) =>{
            alert("login failed!!");
            console.log(err);
          });
          
        }catch(err){
          console.log(err);
        }
      }
      
  const inputs = {username, email, usertype, password, restaurantAddress, restaurantImage};

  const register = async () =>{
    try{
        await axios.post('https://sb-foods-1.onrender.com/register', inputs)
        .then( async (res)=>{
            localStorage.setItem('userId', res.data._id);
            localStorage.setItem('userType', res.data.usertype);
            localStorage.setItem('username', res.data.username);
            localStorage.setItem('email', res.data.email);

            if(res.data.usertype === 'customer'){
                navigate('/');
            } else if(res.data.usertype === 'admin'){
                navigate('/admin');
            } else if(res.data.usertype === 'restaurant'){
                navigate('/restaurant');
            }
 
        }).catch((err) =>{
            alert("registration failed!!");
            console.log(err);
        });
    }catch(err){
        console.log(err);
    }
  }


  const logout = async () =>{
    
    localStorage.clear();
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        localStorage.removeItem(key);
      }
    }
    
    navigate('/');
  }


  return (
    <GeneralContext.Provider value={{login, register, logout, username, setUsername, email, setEmail, password, setPassword, usertype, setUsertype, setRestaurantAddress, setRestaurantImage, productSearch, setProductSearch, handleSearch, cartCount, fetchCartCount}} >{children}</GeneralContext.Provider>
  )
}

export default GeneralContextProvider