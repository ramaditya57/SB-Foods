import mongoose from "mongoose";
import { User, Admin, Restaurant, FoodItem, Orders, Cart } from "./Schema.js"; // Update with your actual models file path
import bcrypt from "bcrypt"; // For password hashing

// Connect to MongoDB
mongoose.connect("mongodb+srv://ketak2022:wWmuP3gRpErZAHe2@sb-foods.8144mqt.mongodb.net/SBF?retryWrites=true&w=majority&appName=SB-Foods", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected successfully"))
.catch(err => console.error("MongoDB connection error:", err));

// Function to hash passwords
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Clear existing data
const clearCollections = async () => {
  await User.deleteMany({});
  await Admin.deleteMany({});
  await Restaurant.deleteMany({});
  await FoodItem.deleteMany({});
  await Orders.deleteMany({});
  await Cart.deleteMany({});
  console.log("All collections cleared");
};

// Seed data
const seedData = async () => {
  try {
    await clearCollections();
    
    // Create users
    const users = [
      {
        username: "customer1",
        password: await hashPassword("password123"),
        email: "customer1@example.com",
        usertype: "customer",
        approval: "approved"
      },
      {
        username: "customer2",
        password: await hashPassword("password123"),
        email: "customer2@example.com",
        usertype: "customer",
        approval: "approved"
      },
      {
        username: "restaurant_owner1",
        password: await hashPassword("password123"),
        email: "owner1@example.com",
        usertype: "restaurant",
        approval: "approved"
      },
      {
        username: "restaurant_owner2",
        password: await hashPassword("password123"),
        email: "owner2@example.com",
        usertype: "restaurant",
        approval: "pending"
      },
      {
        username: "admin",
        password: await hashPassword("admin123"),
        email: "admin@example.com",
        usertype: "admin",
        approval: "approved"
      }
    ];
    
    const createdUsers = await User.insertMany(users);
    console.log(`${createdUsers.length} users created`);
    
    // Get IDs for reference
    const adminUser = createdUsers.find(user => user.usertype === "admin");
    const restaurantOwner1 = createdUsers.find(user => user.username === "restaurant_owner1");
    const restaurantOwner2 = createdUsers.find(user => user.username === "restaurant_owner2");
    const customer1 = createdUsers.find(user => user.username === "customer1");
    
    // Create admin data
    const adminData = {
      categories: ["Italian", "Indian", "Chinese", "Mexican", "Thai", "American"],
      promotedRestaurants: []
    };
    
    const createdAdmin = await Admin.create(adminData);
    console.log("Admin data created");
    
    // Create restaurants
    const restaurants = [
      {
        ownerId: restaurantOwner1._id.toString(),
        title: "Bella Italia",
        address: "123 Main Street, New York, NY 10001",
        mainImg: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        menu: []
      },
      {
        ownerId: restaurantOwner1._id.toString(),
        title: "Spice Garden",
        address: "456 Park Avenue, New York, NY 10002",
        mainImg: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        menu: []
      },
      {
        ownerId: restaurantOwner2._id.toString(),
        title: "Dragon Wok",
        address: "789 Broadway, New York, NY 10003",
        mainImg: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        menu: []
      }
    ];
    
    const createdRestaurants = await Restaurant.insertMany(restaurants);
    console.log(`${createdRestaurants.length} restaurants created`);
    
    // Update admin with promoted restaurants
    createdAdmin.promotedRestaurants = [createdRestaurants[0]._id.toString()];
    await createdAdmin.save();
    
    // Create food items
    const foodItems = [
      // Restaurant 1 - Bella Italia
      {
        title: "Margherita Pizza",
        description: "Classic pizza with tomato sauce, mozzarella, and basil",
        itemImg: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        category: "Veg",
        menuCategory: "Pizza",
        restaurantId: createdRestaurants[0]._id.toString(),
        price: 12.99,
        discount: 0,
        rating: 4.5
      },
      {
        title: "Spaghetti Carbonara",
        description: "Pasta with eggs, cheese, pancetta, and black pepper",
        itemImg: "https://images.unsplash.com/photo-1612874742237-6526221588e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        category: "Non Veg",
        menuCategory: "Pasta",
        restaurantId: createdRestaurants[0]._id.toString(),
        price: 14.99,
        discount: 10,
        rating: 4.7
      },
      {
        title: "Tiramisu",
        description: "Classic Italian dessert with coffee-soaked ladyfingers and mascarpone cream",
        itemImg: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        category: "veg",
        menuCategory: "Dessert",
        restaurantId: createdRestaurants[0]._id.toString(),
        price: 8.99,
        discount: 0,
        rating: 4.8
      },
      
      // Restaurant 2 - Spice Garden
      {
        title: "Butter Chicken",
        description: "Tender chicken in a rich, creamy tomato sauce",
        itemImg: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        category: "Non Veg",
        menuCategory: "Main Course",
        restaurantId: createdRestaurants[1]._id.toString(),
        price: 16.99,
        discount: 5,
        rating: 4.6
      },
      {
        title: "Paneer Tikka",
        description: "Marinated and grilled cottage cheese with vegetables",
        itemImg: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        category: "veg",
        menuCategory: "Appetizer",
        restaurantId: createdRestaurants[1]._id.toString(),
        price: 10.99,
        discount: 0,
        rating: 4.4
      },
      {
        title: "Mango Lassi",
        description: "Refreshing yogurt drink with mango pulp",
        itemImg: "https://images.unsplash.com/photo-1527761939622-933c972ea2fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        category: "beverage",
        menuCategory: "Drinks",
        restaurantId: createdRestaurants[1]._id.toString(),
        price: 4.99,
        discount: 0,
        rating: 4.9
      },
      
      // Restaurant 3 - Dragon Wok
      {
        title: "Kung Pao Chicken",
        description: "Spicy stir-fried chicken with peanuts and vegetables",
        itemImg: "https://images.unsplash.com/photo-1525755662778-989d0524087e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        category: "Non Veg",
        menuCategory: "Main Course",
        restaurantId: createdRestaurants[2]._id.toString(),
        price: 15.99,
        discount: 0,
        rating: 4.3
      },
      {
        title: "Vegetable Spring Rolls",
        description: "Crispy rolls filled with mixed vegetables",
        itemImg: "https://images.unsplash.com/photo-1606505286518-83807706f902?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        category: "veg",
        menuCategory: "Appetizer",
        restaurantId: createdRestaurants[2]._id.toString(),
        price: 7.99,
        discount: 15,
        rating: 4.2
      }
    ];
    
    const createdFoodItems = await FoodItem.insertMany(foodItems);
    console.log(`${createdFoodItems.length} food items created`);
    
    // Create orders
    const orders = [
      {
        userId: customer1._id.toString(),
        name: "John Doe",
        email: "customer1@example.com",
        mobile: "123-456-7890",
        address: "101 Customer Street, New York, NY 10001",
        pincode: "10001",
        restaurantId: createdRestaurants[0]._id.toString(),
        restaurantName: "Bella Italia",
        foodItemId: createdFoodItems[0]._id.toString(),
        foodItemName: "Margherita Pizza",
        foodItemImg: createdFoodItems[0].itemImg,
        quantity: 2,
        price: createdFoodItems[0].price,
        discount: createdFoodItems[0].discount,
        paymentMethod: "Credit Card",
        orderDate: new Date().toISOString(),
        orderStatus: "delivered"
      },
      {
        userId: customer1._id.toString(),
        name: "John Doe",
        email: "customer1@example.com",
        mobile: "123-456-7890",
        address: "101 Customer Street, New York, NY 10001",
        pincode: "10001",
        restaurantId: createdRestaurants[1]._id.toString(),
        restaurantName: "Spice Garden",
        foodItemId: createdFoodItems[3]._id.toString(),
        foodItemName: "Butter Chicken",
        foodItemImg: createdFoodItems[3].itemImg,
        quantity: 1,
        price: createdFoodItems[3].price,
        discount: createdFoodItems[3].discount,
        paymentMethod: "Cash on Delivery",
        orderDate: new Date().toISOString(),
        orderStatus: "order placed"
      }
    ];
    
    const createdOrders = await Orders.insertMany(orders);
    console.log(`${createdOrders.length} orders created`);
    
    // Create cart items
    const cartItems = [
      {
        userId: customer1._id.toString(),
        restaurantId: createdRestaurants[2]._id.toString(),
        restaurantName: "Dragon Wok",
        foodItemId: createdFoodItems[7]._id.toString(),
        foodItemName: "Vegetable Spring Rolls",
        foodItemImg: createdFoodItems[7].itemImg,
        quantity: 3,
        price: createdFoodItems[7].price,
        discount: createdFoodItems[7].discount
      }
    ];
    
    const createdCartItems = await Cart.insertMany(cartItems);
    console.log(`${createdCartItems.length} cart items created`);
    
    console.log("Database seeded successfully!");
    mongoose.connection.close();
    
  } catch (error) {
    console.error("Error seeding database:", error);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seed function
seedData();