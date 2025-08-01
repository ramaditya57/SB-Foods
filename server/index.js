import express from 'express'
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import {Admin, Cart, FoodItem, Orders, Restaurant, User } from './Schema.js'

const app = express();

app.use(express.json());
app.use(bodyParser.json({limit: "30mb", extended: true}))
app.use(bodyParser.urlencoded({limit: "30mb", extended: true}));
app.use(cors());

const PORT = 6001;

mongoose.connect('mongodb+srv://ketak2022:wWmuP3gRpErZAHe2@sb-foods.8144mqt.mongodb.net/SBF?retryWrites=true&w=majority&appName=SB-Foods', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(()=>{

    app.post('/register', async (req, res) => {
        const { username, email, usertype, password , restaurantAddress, restaurantImage} = req.body;
        try {
          
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            if(usertype === 'restaurant'){
                const newUser = new User({
                    username, email, usertype, password: hashedPassword, approval: 'pending'
                });
                const user =  await newUser.save();
                console.log(user._id);
                const restaurant = new Restaurant({ownerId: user._id ,title: username, address: restaurantAddress, mainImg: restaurantImage, menu: []});
                await restaurant.save();

                return res.status(201).json(user);

            } else{

                const newUser = new User({
                    username, email, usertype, password: hashedPassword, approval: 'approved'
                });
                const userCreated = await newUser.save();
                return res.status(201).json(userCreated);
            }


        } catch (error) {
          console.log(error);
          return res.status(500).json({ message: 'Server Error' });
        }
    });



    app.post('/login', async (req, res) => {
        const { email, password } = req.body;
        try {

            const user = await User.findOne({ email });
    
            if (!user) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid email or password' });
            } else{
                return res.json(user);
            }
          
        } catch (error) {
          console.log(error);
          return res.status(500).json({ message: 'Server Error' });
        }
    });

    // promote restaurant

    app.post('/update-promote-list', async(req, res)=>{
        const {promoteList} = req.body;
        try{
            const admin = await Admin.findOne();
            admin.promotedRestaurants = promoteList;
            await admin.save();
            res.json({message: 'approved'});

        }catch(err){
            res.status(500).json({ message: 'Error occured' });
        }
    })

    // approve restaurant

    app.post('/approve-user', async(req, res)=>{
        const {id} = req.body;
        try{
            const restaurant = await User.findById(id);
            restaurant.approval = 'approved';
            await restaurant.save();
            res.json({message: 'approved'});

        }catch(err){
            res.status(500).json({ message: 'Error occured' });
        }
    })

    // reject restaurant

    app.post('/reject-user', async(req, res)=>{
        const {id} = req.body;
        try{
            const restaurant = await User.findById(id);
            restaurant.approval = 'rejected';
            await restaurant.save();
            res.json({message: 'rejected'});

        }catch(err){
            res.status(500).json({ message: 'Error occured' });
        }
    })



    // fetch user details

    app.get('/fetch-user-details/:id', async(req, res)=>{

        try{
            const user = await User.findById(req.params.id);
            res.json(user);

        }catch(err){
            res.status(500).json({ message: 'Error occured' });
        }
    })

    // fetch users

    app.get('/fetch-users', async(req, res)=>{
        try{
            const users = await User.find();
            res.json(users);

        }catch(err){
            res.status(500).json({ message: 'Error occured' });
        }
    })

    // fetch restaurants

    app.get('/fetch-restaurants', async(req, res)=>{
        try{
            const restaurants = await Restaurant.find();
            res.json(restaurants);

        }catch(err){
            res.status(500).json({ message: 'Error occured' });
        }
    })

    //  // Fetch individual product
    //  app.get('/fetch-product-details/:id', async(req, res)=>{
    //     const id = req.params.id;
    //     try{
    //         const product = await Product.findById(id);
    //         res.json(product);
    //     }catch(err){
    //         res.status(500).json({message: "Error occured"});
    //     }
    // })

    // // fetch products

    // app.get('/fetch-products', async(req, res)=>{
    //     try{
    //         const products = await Product.find();
    //         res.json(products);

    //     }catch(err){
    //         res.status(500).json({ message: 'Error occured' });
    //     }
    // })

    // fetch orders

    app.get('/fetch-orders', async(req, res)=>{
        try{
            const orders = await Orders.find();
            res.json(orders);

        }catch(err){
            res.status(500).json({ message: 'Error occured' });
        }
    })

    // fetch food items

    app.get('/fetch-items', async(req, res)=>{
        try{
            const items = await FoodItem.find();
            res.json(items);

        }catch(err){
            res.status(500).json({ message: 'Error occured' });
        }
    })


    // Fetch categories

    app.get('/fetch-categories', async(req, res)=>{
        try{
            const data = await Admin.find();
            if(data.length===0){
                const newData = new Admin({ categories: [], promotedRestaurants: []})
                await newData.save();
                return res.json(newData[0].categories);
            }else{
                return res.json(data[0].categories);
            }
        }catch(err){
            res.status(500).json({message: "Error occured"});
        }
    })

    // Fetch promoted list

    app.get('/fetch-promoted-list', async(req, res)=>{
        try{
            const data = await Admin.find();
            if(data.length===0){
                const newData = new Admin({ categories: [], promotedRestaurants: []})
                await newData.save();
                return res.json(newData[0].promotedRestaurants);
            }else{
                return res.json(data[0].promotedRestaurants);
            }
        }catch(err){
            res.status(500).json({message: "Error occured"});
        }
    })

    // fetch restaurant details with owner id

    app.get('/fetch-restaurant-details/:id', async(req, res)=>{

        try{
            const restaurant = await Restaurant.findOne({ownerId: req.params.id});
            res.json(restaurant);

        }catch(err){
            res.status(500).json({ message: 'Error occured' });
        }
    })

    

     // fetch restaurant details with restaurant id

     app.get('/fetch-restaurant/:id', async(req, res)=>{

        try{
            const restaurant = await Restaurant.findById( req.params.id);
            res.json(restaurant);

        }catch(err){
            res.status(500).json({ message: 'Error occured' });
        }
    })

     // fetch item details

     app.get('/fetch-item-details/:id', async(req, res)=>{

        try{
            const item = await FoodItem.findById(req.params.id);
            res.json(item);

        }catch(err){
            res.status(500).json({ message: 'Error occured' });
        }
    })



    // Add new product
//=========================================================================Admin Endpoint Open=======================================================
// Delete user endpoint
// Delete user endpoint - Fix the implementation
// Add this to your index.js file
// Add this to your index.js file
// Improved delete user endpoint
app.put('/delete-user', async (req, res) => {
    const { id } = req.body;
    console.log("Attempting to delete user with ID:", id);
    
    if (!id) {
        return res.status(400).json({ message: 'User ID is required' });
    }
    
    try {
        // First find the user to make sure they exist
        const user = await User.findById(id);
        
        if (!user) {
            console.log("User not found with ID:", id);
            return res.status(404).json({ message: 'User not found' });
        }
        
        console.log("Found user:", user.username, "with type:", user.usertype);
        
        // Delete associated restaurant if user is restaurant owner
        if (user.usertype === 'restaurant') {
            console.log("Deleting associated restaurant data");
            const deletedRestaurant = await Restaurant.deleteOne({ ownerId: id });
            console.log("Restaurant deletion result:", deletedRestaurant);
        }
        
        // Remove any cart items for this user
        const deletedCartItems = await Cart.deleteMany({ userId: id });
        console.log("Cart items deletion result:", deletedCartItems);
        
        // Remove any orders for this user
        const deletedOrders = await Orders.deleteMany({ userId: id });
        console.log("Orders deletion result:", deletedOrders);
        
        // Now delete the user
        const deletedUser = await User.deleteOne({ _id: id });
        console.log("User deletion result:", deletedUser);
        
        if (deletedUser.deletedCount === 0) {
            console.log("Failed to delete user");
            return res.status(500).json({ message: 'Failed to delete user' });
        }
        
        console.log("User successfully deleted");
        return res.status(200).json({ message: 'User successfully deleted' });
    } catch (err) {
        console.error("Error in delete user:", err);
        return res.status(500).json({ message: 'Server error when deleting user', error: err.message });
    }
});

//=========================================================================Admin Endpoint Close=======================================================
    app.post('/add-new-product', async(req, res)=>{
        const {restaurantId, productName, productDescription, productMainImg, productCategory, productMenuCategory, productNewCategory, productPrice, productDiscount} = req.body;
        try{
            if(productMenuCategory === 'new category'){
                const admin = await Admin.findOne();
                admin.categories.push(productNewCategory);
                await admin.save();
                const newProduct = new FoodItem({restaurantId, title: productName, description: productDescription, itemImg: productMainImg, category: productCategory, menuCategory: productNewCategory, price: productPrice, discount: productDiscount, rating: 0});
                await newProduct.save();
                const restaurant = await Restaurant.findById(restaurantId);
                restaurant.menu.push(productNewCategory);
                await restaurant.save();
            } else{
                const newProduct = new FoodItem({restaurantId, title: productName, description: productDescription, itemImg: productMainImg, category: productCategory, menuCategory: productMenuCategory,  price: productPrice, discount: productDiscount, rating: 0});
                await newProduct.save();
            }
            res.json({message: "product added!!"});
        }catch(err){
            res.status(500).json({message: "Error occured"});
        }
    })




    // update product

    // Endpoint to fetch menu categories
// Endpoint to fetch menu categories
app.get('/fetch-menu-categories', async (req, res) => {
    try {
      const data = await Admin.find();
      if (data.length === 0) {
        const defaultCategories = [
          "Pizza", "Pasta", "Dessert", "Main Course", "Appetizer", "Drinks", 
          "Tacos", "Quesadilla", "Bowl", "Noodles", "Curry", "Burger"
        ];
        const newData = new Admin({ categories: defaultCategories, promotedRestaurants: [] });
        await newData.save();
        return res.json(defaultCategories);
      } else {
        return res.json(data[0].categories);
      }
    } catch (err) {
      res.status(500).json({ message: "Error occurred" });
    }
  });
  

  // Endpoint to fetch cuisines
app.get('/fetch-cuisines', async (req, res) => {
    try {
      // You might want to store cuisines in a separate field in your Admin model
      // For now, we'll return a fixed list that matches the frontend defaults
      const cuisines = ['Italian', 'Indian', 'Chinese', 'Mexican', 'American', 'Thai', 
                       'Japanese', 'Continental', 'Middle Eastern', 'Other'];
      res.json(cuisines);
    } catch (err) {
      res.status(500).json({ message: "Error occurred" });
    }
  });
  

  app.put('/update-product/:id', async(req, res) => {
    const {restaurantId, productName, productDescription, productMainImg, productCategory, productMenuCategory, productCuisine, productNewCategory, productPrice, productDiscount} = req.body;
    try {
        if(productMenuCategory === 'new category'){
            const admin = await Admin.findOne();
            admin.categories.push(productNewCategory);
            await admin.save();

            const product = await FoodItem.findById(req.params.id);

            product.title = productName;
            product.description = productDescription;
            product.itemImg = productMainImg;
            product.category = productCategory;
            product.menuCategory = productNewCategory;
            product.cuisine = productCuisine; // Fixed: was using menuCuisine
            product.price = productPrice;
            product.discount = productDiscount;

            await product.save();
           
        } else {
            const product = await FoodItem.findById(req.params.id);

            product.title = productName;
            product.description = productDescription;
            product.itemImg = productMainImg;
            product.category = productCategory;
            product.menuCategory = productMenuCategory;
            product.cuisine = productCuisine; // Fixed: was using menuCuisine
            product.price = productPrice;
            product.discount = productDiscount;

            await product.save();
        }
        res.json({message: "product updated!!"});
    } catch(err) {
        res.status(500).json({message: "Error occurred"});
    }
});



   
    // cancel order

    app.put('/cancel-order', async(req, res)=>{
        const {id} = req.body;
        try{

            const order = await Orders.findById(id);
            order.orderStatus = 'cancelled';
            await order.save();
            res.json({message: 'order cancelled'});

        }catch(err){
            res.status(500).json({message: "Error occured"});
        }
    })


    // update order status

    app.put('/update-order-status', async(req, res)=>{
        const {id, updateStatus} = req.body;
        try{

            const order = await Orders.findById(id);
            order.orderStatus = updateStatus;
            await order.save();
            res.json({message: 'order status updated'});

        }catch(err){
            res.status(500).json({message: "Error occured"});
        }
    })


    // fetch cart items

    app.get('/fetch-cart', async(req, res)=>{
        try{
            
            const items = await Cart.find();
            res.json(items);

        }catch(err){
            res.status(500).json({message: "Error occured"});
        }
    })


    // add cart item

    app.post('/add-to-cart', async(req, res)=>{

        const {userId, foodItemId, foodItemName, restaurantId, foodItemImg, price, discount, quantity} = req.body
        try{

            const restaurant = await Restaurant.findById(restaurantId);

            const item = new Cart({userId, foodItemId, foodItemName, restaurantId, restaurantName: restaurant.title, foodItemImg, price, discount, quantity});
            await item.save();

            res.json({message: 'Added to cart'});
            
        }catch(err){
            res.status(500).json({message: "Error occured"});
        }
    })

    // Endpoint to fetch food items by menu category
    app.get('/fetch-food-items-by-menu-category/:menuCategory', async (req, res) => {
        try {
        const { menuCategory } = req.params;
        const foodItems = await FoodItem.find({ menuCategory: menuCategory });
        res.json(foodItems);
        } catch (error) {
        console.error('Error fetching food items by menu category:', error);
        res.status(500).json({ message: 'Server error' });
        }
    });

    // Endpoint to delete a food item by ID
app.delete('/delete-product/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await FoodItem.findByIdAndDelete(id);
      
      if (!result) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      res.json({ message: 'Product deleted successfully', deletedProduct: result });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  




    // remove from cart

    app.put('/remove-item', async(req, res)=>{
        const {id} = req.body;
        try{
            const item = await Cart.deleteOne({_id: id});
            res.json({message: 'item removed'});
        }catch(err){
            res.status(500).json({message: "Error occured"});
        }
    });


    // Order from cart

    app.post('/place-cart-order', async(req, res)=>{
        const {userId, name, mobile, email, address, pincode, paymentMethod, orderDate} = req.body;
        try{

            const cartItems = await Cart.find({userId});
            cartItems.map(async (item)=>{

                const newOrder = new Orders({userId, name, email, mobile, address, pincode, paymentMethod, orderDate, restaurantId: item.restaurantId, restaurantName: item.restaurantName, foodItemId: item.foodItemId, foodItemName: item.foodItemName, foodItemImg: item.foodItemImg, quantity: item.quantity, price: item.price, discount: item.discount})
                await newOrder.save();
                await Cart.deleteOne({_id: item._id})
            })
            res.json({message: 'Order placed'});

        }catch(err){
            res.status(500).json({message: "Error occured"});
        }
    })



    app.listen(PORT, ()=>{
        console.log('running @ 6001');
    })
}).catch((e)=> console.log(`Error in db connection ${e}`));