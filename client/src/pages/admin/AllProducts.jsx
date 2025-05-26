import React, { useState } from 'react';
import '../../styles/AllProducts.css';

const sampleProducts = [
  {
    id: 1,
    title: 'Product title 1',
    description: 'Description about product',
    price: 499,
    originalPrice: 799,
    discountPercent: 30,
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGnbY9YlH663xUNGHOe0lS9n-zSwrLtiEFVw&usqp=CAU',
    categories: ['Birthday Gifts', 'Cakes'],
    gender: ['Unisex'],
    popularity: 10, // Just an example for sorting
  },
  // Add more products as needed
];

const AllProducts = () => {
  const [products] = useState(sampleProducts);
  const [sort, setSort] = useState('popular');
  const [filters, setFilters] = useState({
    categories: [],
    gender: [],
  });

  // Handle sort change
  const handleSortChange = (e) => {
    setSort(e.target.value);
  };

  // Handle category filter toggle
  const handleCategoryToggle = (category) => {
    setFilters((prev) => {
      const categories = prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category];
      return { ...prev, categories };
    });
  };

  // Handle gender filter toggle
  const handleGenderToggle = (gender) => {
    setFilters((prev) => {
      const genders = prev.gender.includes(gender)
        ? prev.gender.filter((g) => g !== gender)
        : [...prev.gender, gender];
      return { ...prev, gender: genders };
    });
  };

  // Filter and sort products based on state
  const filteredProducts = products
    .filter((product) => {
      // Filter categories if any selected
      if (filters.categories.length > 0) {
        if (!filters.categories.some((cat) => product.categories.includes(cat))) return false;
      }
      // Filter gender if any selected
      if (filters.gender.length > 0) {
        if (!filters.gender.some((g) => product.gender.includes(g))) return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sort) {
        case 'popular':
          return b.popularity - a.popularity;
        case 'priceLow':
          return a.price - b.price;
        case 'priceHigh':
          return b.price - a.price;
        case 'discount':
          return b.discountPercent - a.discountPercent;
        default:
          return 0;
      }
    });

  // Helper to check checkbox checked state
  const isCategoryChecked = (cat) => filters.categories.includes(cat);
  const isGenderChecked = (g) => filters.gender.includes(g);

  return (
    <div className="all-products-page">
      <div className="all-products-container">
        <div className="all-products-filter">
          <h4>Filters</h4>
          <div className="all-product-filters-body">
            <div className="all-product-filter-sort">
              <h6>Sort</h6>
              <div className="all-product-filter-sort-body all-product-sub-filter-body">
                {[
                  { id: 'filter-sort-radio1', label: 'Popular', value: 'popular' },
                  { id: 'filter-sort-radio2', label: 'Price (low to high)', value: 'priceLow' },
                  { id: 'filter-sort-radio3', label: 'Price (high to low)', value: 'priceHigh' },
                  { id: 'filter-sort-radio4', label: 'Discount', value: 'discount' },
                ].map(({ id, label, value }) => (
                  <div className="form-check" key={id}>
                    <input
                      className="form-check-input"
                      type="radio"
                      name="sort"
                      id={id}
                      value={value}
                      checked={sort === value}
                      onChange={handleSortChange}
                    />
                    <label className="form-check-label" htmlFor={id}>
                      {label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="all-product-filter-categories">
              <h6>Categories</h6>
              <div className="all-product-filter-categories-body all-product-sub-filter-body">
                {['Birthday Gifts', 'Anniversary Gifts', 'Cakes', 'Chocolates', 'Flowers', 'Valentines day Gifts'].map((cat) => (
                  <div className="form-check" key={cat}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`filter-category-check-${cat}`}
                      checked={isCategoryChecked(cat)}
                      onChange={() => handleCategoryToggle(cat)}
                    />
                    <label className="form-check-label" htmlFor={`filter-category-check-${cat}`}>
                      {cat}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="all-product-filter-gender">
              <h6>Gender</h6>
              <div className="all-product-filter-gender-body all-product-sub-filter-body">
                {['Men', 'Women', 'Unisex'].map((gender) => (
                  <div className="form-check" key={gender}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`filter-gender-check-${gender}`}
                      checked={isGenderChecked(gender)}
                      onChange={() => handleGenderToggle(gender)}
                    />
                    <label className="form-check-label" htmlFor={`filter-gender-check-${gender}`}>
                      {gender}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="all-products-body">
          <h3>All Products</h3>
          <div className="all-products">
            {filteredProducts.map((product) => (
              <div className="all-product-item" key={product.id}>
                <div className="all-product">
                  <img src={product.img} alt={product.title} />
                  <div className="all-product-data">
                    <h6>{product.title}</h6>
                    <p>{product.description}</p>
                    <h5>
                      &#8377; {product.price} <s>{product.originalPrice}</s>
                      <span> ({product.discountPercent}% off)</span>
                    </h5>
                  </div>
                  <button>Update</button>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && <p>No products match the selected filters.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllProducts;
