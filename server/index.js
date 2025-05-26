import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Admin, Cart, FoodItem, Orders, Restaurant, User } from './Schema.js';

dotenv.config();  // Load environment variables from .env

const app = express();
const PORT = process.env.PORT || 6001;

// Middleware
app.use(express.json());
app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));
app.use(cors());

// MongoDB Connection
mongoose.connect(
  process.env.MONGO_URI || 'mongodb+srv://newuser:newpass@m0.jrajtcs.mongodb.net/SBF?retryWrites=true&w=majority&appName=M0',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)
.then(() => {
  console.log('MongoDB connected');

  // ----------------- Routes -------------------

  // Register user
  app.post('/register', async (req, res) => {
    const { username, email, usertype, password, restaurantAddress, restaurantImage } = req.body;
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'User already exists' });

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        username,
        email,
        usertype,
        password: hashedPassword,
        approval: usertype === 'restaurant' ? 'pending' : 'approved',
      });

      const savedUser = await newUser.save();

      if (usertype === 'restaurant') {
        const restaurant = new Restaurant({
          ownerId: savedUser._id,
          title: username,
          address: restaurantAddress,
          mainImg: restaurantImage,
          menu: [],
        });
        await restaurant.save();
      }

      res.status(201).json(savedUser);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    }
  });

  // Login user with JWT token generation
  app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ message: 'Invalid email or password' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, email: user.email, usertype: user.usertype },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Exclude password field from user object
      const { password: _, ...userData } = user.toObject();

      res.json({ user: userData, token, message: 'Login successful' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    }
  });

  // Promote, approve, reject users
  app.post('/update-promote-list', async (req, res) => {
    try {
      const admin = await Admin.findOne();
      admin.promotedRestaurants = req.body.promoteList;
      await admin.save();
      res.json({ message: 'approved' });
    } catch {
      res.status(500).json({ message: 'Error occurred' });
    }
  });

  app.post('/approve-user', async (req, res) => {
    try {
      const user = await User.findById(req.body.id);
      user.approval = 'approved';
      await user.save();
      res.json({ message: 'approved' });
    } catch {
      res.status(500).json({ message: 'Error occurred' });
    }
  });

  app.post('/reject-user', async (req, res) => {
    try {
      const user = await User.findById(req.body.id);
      user.approval = 'rejected';
      await user.save();
      res.json({ message: 'rejected' });
    } catch {
      res.status(500).json({ message: 'Error occurred' });
    }
  });

  // Admin deletes user
  app.put('/delete-user', async (req, res) => {
    const { id } = req.body;
    try {
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      if (user.usertype === 'restaurant') await Restaurant.deleteOne({ ownerId: id });
      await Cart.deleteMany({ userId: id });
      await Orders.deleteMany({ userId: id });
      await User.deleteOne({ _id: id });

      res.status(200).json({ message: 'User successfully deleted' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting user', error: err.message });
    }
  });

  // Fetch details
  app.get('/fetch-user-details/:id', async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      res.json(user);
    } catch {
      res.status(500).json({ message: 'Error occurred' });
    }
  });

  app.get('/fetch-users', async (_, res) => {
    try {
      const users = await User.find();
      res.json(users);
    } catch {
      res.status(500).json({ message: 'Error occurred' });
    }
  });

  app.get('/fetch-restaurants', async (_, res) => {
    try {
      const restaurants = await Restaurant.find();
      res.json(restaurants);
    } catch {
      res.status(500).json({ message: 'Error occurred' });
    }
  });

  app.get('/fetch-orders', async (_, res) => {
    try {
      const orders = await Orders.find();
      res.json(orders);
    } catch {
      res.status(500).json({ message: 'Error occurred' });
    }
  });

  app.get('/fetch-items', async (_, res) => {
    try {
      const items = await FoodItem.find();
      res.json(items);
    } catch {
      res.status(500).json({ message: 'Error occurred' });
    }
  });

  app.get('/fetch-categories', async (_, res) => {
    try {
      let data = await Admin.find();
      if (data.length === 0) {
        const newData = new Admin({ categories: [], promotedRestaurants: [] });
        await newData.save();
        data = [newData];
      }
      res.json(data[0].categories);
    } catch {
      res.status(500).json({ message: 'Error occurred' });
    }
  });

  app.get('/fetch-promoted-list', async (_, res) => {
    try {
      let data = await Admin.find();
      if (data.length === 0) {
        const newData = new Admin({ categories: [], promotedRestaurants: [] });
        await newData.save();
        data = [newData];
      }
      res.json(data[0].promotedRestaurants);
    } catch {
      res.status(500).json({ message: 'Error occurred' });
    }
  });

  // Restaurant and Item Details
  app.get('/fetch-restaurant-details/:id', async (req, res) => {
    try {
      const restaurant = await Restaurant.findOne({ ownerId: req.params.id });
      res.json(restaurant);
    } catch {
      res.status(500).json({ message: 'Error occurred' });
    }
  });

  app.get('/fetch-restaurant/:id', async (req, res) => {
    try {
      const restaurant = await Restaurant.findById(req.params.id);
      res.json(restaurant);
    } catch {
      res.status(500).json({ message: 'Error occurred' });
    }
  });

  app.get('/fetch-item-details/:id', async (req, res) => {
    try {
      const item = await FoodItem.findById(req.params.id);
      res.json(item);
    } catch {
      res.status(500).json({ message: 'Error occurred' });
    }
  });

  app.get('/fetch-menu-categories', async (_, res) => {
    try {
      let data = await Admin.find();
      if (data.length === 0) {
        const defaultCategories = [
          'Pizza', 'Pasta', 'Dessert', 'Main Course', 'Appetizer', 'Drinks',
          'Tacos', 'Quesadilla', 'Bowl', 'Noodles', 'Curry', 'Burger',
        ];
        const newData = new Admin({ categories: defaultCategories, promotedRestaurants: [] });
        await newData.save();
        data = [newData];
      }
      res.json(data[0].categories);
    } catch {
      res.status(500).json({ message: 'Error occurred' });
    }
  });

  app.get('/fetch-cuisines', (_, res) => {
    res.json([
      'Italian', 'Indian', 'Chinese', 'Mexican', 'American',
      'Thai', 'Japanese', 'Continental', 'Middle Eastern', 'Other'
    ]);
  });

  app.post('/add-new-product', async (req, res) => {
    const {
      restaurantId, productName, productDescription, productMainImg,
      productCategory, productMenuCategory, productNewCategory,
      productPrice, productDiscount,
    } = req.body;

    try {
      let menuCategory = productMenuCategory;
      if (productNewCategory && productNewCategory.trim() !== '') {
        const admin = await Admin.findOne();
        if (!admin.categories.includes(productNewCategory)) {
          admin.categories.push(productNewCategory);
          await admin.save();
        }
        menuCategory = productNewCategory;
      }

      const newItem = new FoodItem({
        name: productName,
        description: productDescription,
        mainImg: productMainImg,
        category: productCategory,
        menuCategory: menuCategory,
        price: productPrice,
        discount: productDiscount,
        restaurantId,
      });
      await newItem.save();

      // Add item to restaurant's menu
      await Restaurant.findByIdAndUpdate(restaurantId, {
        $push: { menu: newItem._id }
      });

      res.json({ message: 'Product added successfully' });
    } catch {
      res.status(500).json({ message: 'Error occurred' });
    }
  });

  // Cart management
  app.post('/add-to-cart', async (req, res) => {
    const { userId, itemId, quantity } = req.body;
    try {
      const existingCart = await Cart.findOne({ userId, itemId });
      if (existingCart) {
        existingCart.quantity += quantity;
        await existingCart.save();
      } else {
        const newCart = new Cart({ userId, itemId, quantity });
        await newCart.save();
      }
      res.json({ message: 'Item added to cart' });
    } catch {
      res.status(500).json({ message: 'Error occurred' });
    }
  });

  app.post('/fetch-cart/:userId', async (req, res) => {
    try {
      const cartItems = await Cart.find({ userId: req.params.userId }).populate('itemId');
      res.json(cartItems);
    } catch {
      res.status(500).json({ message: 'Error occurred' });
    }
  });

  app.post('/remove-from-cart', async (req, res) => {
    const { userId, itemId } = req.body;
    try {
      await Cart.deleteOne({ userId, itemId });
      res.json({ message: 'Item removed from cart' });
    } catch {
      res.status(500).json({ message: 'Error occurred' });
    }
  });

  // Orders
  app.post('/place-order', async (req, res) => {
    const { userId, items, total } = req.body;
    try {
      const newOrder = new Orders({ userId, items, total, status: 'pending' });
      await newOrder.save();
      await Cart.deleteMany({ userId }); // clear cart after ordering
      res.json({ message: 'Order placed successfully' });
    } catch {
      res.status(500).json({ message: 'Error occurred' });
    }
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

})
.catch(err => {
  console.error('MongoDB connection error:', err);
});
