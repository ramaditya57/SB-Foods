import React, { useEffect, useState } from 'react';
import '../../styles/NewProducts.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NewProduct = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productMainImg, setProductMainImg] = useState('');
  const [productMenuCategory, setProductMenuCategory] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productCuisine, setProductCuisine] = useState('');
  const [productNewCategory, setProductNewCategory] = useState('');
  const [productPrice, setProductPrice] = useState(0);
  const [productDiscount, setProductDiscount] = useState(0);
  const [productRating, setProductRating] = useState(0);

  const [availableMenuCategories, setAvailableMenuCategories] = useState([
    "Pizza","Pasta","Dessert","Main Course","Appetizer","Drinks",
    "Tacos","Quesadilla","Bowl","Noodles","Curry","Burger"
  ]);
  const [availableCuisines, setAvailableCuisines] = useState([
    'Italian','Indian','Chinese','Mexican','American','Thai',
    'Japanese','Continental','Middle Eastern','Other'
  ]);
  const [restaurant, setRestaurant] = useState();

  useEffect(() => {
    fetchMenuCategories();
    fetchCuisines();
    fetchRestaurant();
    // eslint-disable-next-line
  }, []);

  const fetchMenuCategories = async () => {
    const defaults = availableMenuCategories;
    setAvailableMenuCategories(defaults);
    try {
      const { data } = await axios.get('https://sb-foods-1.onrender.com/fetch-categories');
      const filtered = data.filter(cat => !availableCuisines.includes(cat));
      setAvailableMenuCategories([...new Set([...defaults, ...filtered])]);
    } catch {
      // fallback to defaults
    }
  };

  const fetchCuisines = async () => {
    try {
      const { data } = await axios.get('https://sb-foods-1.onrender.com/fetch-cuisines');
      setAvailableCuisines(data);
    } catch {
      // fallback
    }
  };

  const fetchRestaurant = async () => {
    try {
      const { data } = await axios.get(`https://sb-foods-1.onrender.com/fetch-restaurant-details/${userId}`);
      setRestaurant(data);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setProductName('');
    setProductDescription('');
    setProductMainImg('');
    setProductCategory('');
    setProductMenuCategory('');
    setProductCuisine('');
    setProductNewCategory('');
    setProductPrice(0);
    setProductDiscount(0);
    setProductRating(0);
  };

  const handleNewProduct = async () => {
    const finalMenuCategory =
      productMenuCategory === 'new category'
        ? productNewCategory
        : productMenuCategory;

    try {
      await axios.post('https://sb-foods-1.onrender.com/add-new-product', {
        restaurantId: restaurant._id,
        productName,
        productDescription,
        productMainImg,
        productCategory,
        productMenuCategory: finalMenuCategory,
        productCuisine,
        productNewCategory,
        productPrice,
        productDiscount,
        productRating
      });
      alert('Product added successfully');
      resetForm();
      navigate('/restaurant-menu');
    } catch (err) {
      alert('Error adding product: ' + err.message);
    }
  };

  return (
    <div className="new-product-page">
      <div className="new-product-container">
        <h3>New Product</h3>

        <div className="new-product-body">
          <span>
            <div className="form-floating mb-3 span-21">
              <input
                type="text"
                className="form-control"
                id="floatingNewProduct1"
                value={productName}
                onChange={e => setProductName(e.target.value)}
              />
              <label htmlFor="floatingNewProduct1">Product name</label>
            </div>
            <div className="form-floating mb-3 span-22">
              <input
                type="text"
                className="form-control"
                id="floatingNewProduct2"
                value={productDescription}
                onChange={e => setProductDescription(e.target.value)}
              />
              <label htmlFor="floatingNewProduct2">Product Description</label>
            </div>
          </span>

          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control"
              id="floatingNewProductImg"
              value={productMainImg}
              onChange={e => setProductMainImg(e.target.value)}
            />
            <label htmlFor="floatingNewProductImg">Thumbnail Img URL</label>
          </div>

          <section>
            <h4>Food Type</h4>
            <span>
              {['Veg','Non Veg','Beverages'].map(type => (
                <div className="form-check" key={type}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name="productCategory"
                    value={type}
                    id={`flexRadio${type}`}
                    onChange={e => setProductCategory(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor={`flexRadio${type}`}>{type}</label>
                </div>
              ))}
            </span>
          </section>

          <div className="form-floating mb-3">
            <select
              className="form-select"
              id="floatingCuisine"
              value={productCuisine}
              onChange={e => setProductCuisine(e.target.value)}
            >
              <option value="">Select Cuisine</option>
              {availableCuisines.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <label htmlFor="floatingCuisine">Cuisine (Italian, Indian, etc.)</label>
          </div>

          <span>
            <div className="form-floating mb-3 span-3">
              <select
                className="form-select"
                id="floatingMenuCategory"
                value={productMenuCategory}
                onChange={e => setProductMenuCategory(e.target.value)}
              >
                <option value="">Choose Menu Category</option>
                {availableMenuCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                <option value="new category">New category</option>
              </select>
              <label htmlFor="floatingMenuCategory">Menu Category</label>
            </div>
            <div className="form-floating mb-3 span-3">
              <input
                type="number"
                className="form-control"
                id="floatingPrice"
                value={productPrice}
                onChange={e => setProductPrice(e.target.value)}
              />
              <label htmlFor="floatingPrice">Price</label>
            </div>
            <div className="form-floating mb-3 span-3">
              <input
                type="number"
                className="form-control"
                id="floatingDiscount"
                value={productDiscount}
                onChange={e => setProductDiscount(e.target.value)}
              />
              <label htmlFor="floatingDiscount">Discount (%)</label>
            </div>
          </span>

          {productMenuCategory === 'new category' && (
            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="floatingNewCategory"
                value={productNewCategory}
                onChange={e => setProductNewCategory(e.target.value)}
              />
              <label htmlFor="floatingNewCategory">New Menu Category</label>
            </div>
          )}

          <div className="form-floating mb-3">
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              className="form-control"
              id="floatingRating"
              value={productRating}
              onChange={e => setProductRating(parseFloat(e.target.value))}
            />
            <label htmlFor="floatingRating">Initial Rating (0-5)</label>
          </div>
        </div>

        <div className="action-buttons">
          <button className="btn btn-primary" onClick={handleNewProduct}>
            Add Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewProduct;