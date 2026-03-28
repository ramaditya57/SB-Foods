import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { Admin, Cart, FoodItem, Orders, Restaurant, User } from './Schema.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

const PORT = process.env.PORT || 6001;

// 🔍 Debug (remove later)
console.log("MONGO_URI:", process.env.MONGO_URI);

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ DB Connected");

  // ================= HEALTH =================
  app.get('/', (req, res) => res.send("Server running 🚀"));
  app.get('/health', (req, res) => res.send("OK"));

  // ================= AUTH =================

  app.post('/register', async (req, res) => {
    const { username, email, usertype, password, restaurantAddress, restaurantImage } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'User already exists' });

      const hashedPassword = await bcrypt.hash(password, 10);

      if (usertype === 'restaurant') {
        const user = await new User({
          username, email, usertype,
          password: hashedPassword,
          approval: 'pending'
        }).save();

        await new Restaurant({
          ownerId: user._id,
          title: username,
          address: restaurantAddress,
          mainImg: restaurantImage,
          menu: []
        }).save();

        return res.status(201).json(user);

      } else {
        const user = await new User({
          username, email, usertype,
          password: hashedPassword,
          approval: 'approved'
        }).save();

        return res.status(201).json(user);
      }

    } catch (err) {
      console.log(err);
      res.status(500).json({ message: 'Server Error' });
    }
  });

  app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ message: 'Invalid email or password' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

      res.json(user);

    } catch (err) {
      res.status(500).json({ message: 'Server Error' });
    }
  });

  // ================= USERS =================

  app.get('/fetch-users', async (req, res) => {
    try {
      res.json(await User.find());
    } catch {
      res.status(500).json({ message: 'Error occured' });
    }
  });

  app.get('/fetch-user-details/:id', async (req, res) => {
    try {
      res.json(await User.findById(req.params.id));
    } catch {
      res.status(500).json({ message: 'Error occured' });
    }
  });

  app.put('/delete-user', async (req, res) => {
    const { id } = req.body;

    try {
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      if (user.usertype === 'restaurant') {
        await Restaurant.deleteOne({ ownerId: id });
      }

      await Cart.deleteMany({ userId: id });
      await Orders.deleteMany({ userId: id });
      await User.deleteOne({ _id: id });

      res.json({ message: 'User deleted' });

    } catch (err) {
      res.status(500).json({ message: 'Error occured' });
    }
  });

  // ================= RESTAURANTS =================

  app.get('/fetch-restaurants', async (req, res) => {
    try {
      res.json(await Restaurant.find());
    } catch {
      res.status(500).json({ message: 'Error occured' });
    }
  });

  app.get('/fetch-restaurant/:id', async (req, res) => {
    try {
      res.json(await Restaurant.findById(req.params.id));
    } catch {
      res.status(500).json({ message: 'Error occured' });
    }
  });

  app.get('/fetch-restaurant-details/:id', async (req, res) => {
    try {
      res.json(await Restaurant.findOne({ ownerId: req.params.id }));
    } catch {
      res.status(500).json({ message: 'Error occured' });
    }
  });

  // ================= FOOD =================

  app.get('/fetch-items', async (req, res) => {
    try {
      res.json(await FoodItem.find());
    } catch {
      res.status(500).json({ message: 'Error occured' });
    }
  });

  app.get('/fetch-item-details/:id', async (req, res) => {
    try {
      res.json(await FoodItem.findById(req.params.id));
    } catch {
      res.status(500).json({ message: 'Error occured' });
    }
  });

  app.post('/add-new-product', async (req, res) => {
    const { restaurantId, productName, productDescription, productMainImg, productCategory, productMenuCategory, productNewCategory, productPrice, productDiscount } = req.body;

    try {
      let category = productMenuCategory;

      if (productMenuCategory === 'new category') {
        const admin = await Admin.findOne();
        admin.categories.push(productNewCategory);
        await admin.save();
        category = productNewCategory;

        const restaurant = await Restaurant.findById(restaurantId);
        restaurant.menu.push(productNewCategory);
        await restaurant.save();
      }

      await new FoodItem({
        restaurantId,
        title: productName,
        description: productDescription,
        itemImg: productMainImg,
        category: productCategory,
        menuCategory: category,
        price: productPrice,
        discount: productDiscount,
        rating: 0
      }).save();

      res.json({ message: "Product added" });

    } catch {
      res.status(500).json({ message: "Error occured" });
    }
  });

  app.delete('/delete-product/:id', async (req, res) => {
    try {
      await FoodItem.findByIdAndDelete(req.params.id);
      res.json({ message: "Deleted" });
    } catch {
      res.status(500).json({ message: "Error occured" });
    }
  });

  // ================= ORDERS =================

  app.get('/fetch-orders', async (req, res) => {
    try {
      res.json(await Orders.find());
    } catch {
      res.status(500).json({ message: 'Error occured' });
    }
  });

  app.put('/update-order-status', async (req, res) => {
    const { id, updateStatus } = req.body;

    try {
      const order = await Orders.findById(id);
      order.orderStatus = updateStatus;
      await order.save();

      res.json({ message: "Updated" });

    } catch {
      res.status(500).json({ message: "Error occured" });
    }
  });

  app.put('/cancel-order', async (req, res) => {
    const { id } = req.body;

    try {
      const order = await Orders.findById(id);
      order.orderStatus = 'cancelled';
      await order.save();

      res.json({ message: "Cancelled" });

    } catch {
      res.status(500).json({ message: "Error occured" });
    }
  });

  // ================= CART =================

  app.get('/fetch-cart', async (req, res) => {
    try {
      res.json(await Cart.find());
    } catch {
      res.status(500).json({ message: "Error occured" });
    }
  });

  app.post('/add-to-cart', async (req, res) => {
    const { userId, foodItemId, foodItemName, restaurantId, foodItemImg, price, discount, quantity } = req.body;

    try {
      const restaurant = await Restaurant.findById(restaurantId);

      await new Cart({
        userId,
        foodItemId,
        foodItemName,
        restaurantId,
        restaurantName: restaurant.title,
        foodItemImg,
        price,
        discount,
        quantity
      }).save();

      res.json({ message: "Added" });

    } catch {
      res.status(500).json({ message: "Error occured" });
    }
  });

  app.put('/remove-item', async (req, res) => {
    try {
      await Cart.deleteOne({ _id: req.body.id });
      res.json({ message: "Removed" });
    } catch {
      res.status(500).json({ message: "Error occured" });
    }
  });

  app.post('/place-cart-order', async (req, res) => {
    const { userId, name, mobile, email, address, pincode, paymentMethod, orderDate } = req.body;

    try {
      const cartItems = await Cart.find({ userId });

      for (let item of cartItems) {
        await new Orders({
          userId, name, email, mobile, address, pincode, paymentMethod, orderDate,
          restaurantId: item.restaurantId,
          restaurantName: item.restaurantName,
          foodItemId: item.foodItemId,
          foodItemName: item.foodItemName,
          foodItemImg: item.foodItemImg,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount
        }).save();

        await Cart.deleteOne({ _id: item._id });
      }

      res.json({ message: "Order placed" });

    } catch {
      res.status(500).json({ message: "Error occured" });
    }
  });

  // ================= START SERVER =================

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });

})
.catch(err => {
  console.log("❌ DB ERROR:", err);
});