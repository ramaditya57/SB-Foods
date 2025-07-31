import mongoose from "mongoose";
import { User, Admin, Restaurant, FoodItem, Orders, Cart } from "./Schema.js";
import bcrypt from "bcrypt";

// Connect to MongoDB
mongoose.connect("mongodb+srv://ketak2022:wWmuP3gRpErZAHe2@sb-foods.8144mqt.mongodb.net/SBF?retryWrites=true&w=majority&appName=SB-Foods", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected successfully"))
.catch(err => console.error("MongoDB connection error:", err));

// Password hashing
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Clear all collections
const clearCollections = async () => {
  await User.deleteMany({});
  await Admin.deleteMany({});
  await Restaurant.deleteMany({});
  await FoodItem.deleteMany({});
  await Orders.deleteMany({});
  await Cart.deleteMany({});
  console.log("All collections cleared");
};

const seedData = async () => {
  try {
    await clearCollections();

    // Create users (owners, customers, admin)
    const users = [
      { username: "customer1", password: await hashPassword("password123"), email: "customer1@example.com", usertype: "customer", approval: "approved" },
      { username: "customer2", password: await hashPassword("password123"), email: "customer2@example.com", usertype: "customer", approval: "approved" },
      { username: "restaurant_owner1", password: await hashPassword("password123"), email: "owner1@example.com", usertype: "restaurant", approval: "approved" },
      { username: "restaurant_owner2", password: await hashPassword("password123"), email: "owner2@example.com", usertype: "restaurant", approval: "approved" },
      { username: "restaurant_owner3", password: await hashPassword("password123"), email: "owner3@example.com", usertype: "restaurant", approval: "approved" },
      { username: "restaurant_owner4", password: await hashPassword("password123"), email: "owner4@example.com", usertype: "restaurant", approval: "approved" },
      { username: "restaurant_owner5", password: await hashPassword("password123"), email: "owner5@example.com", usertype: "restaurant", approval: "approved" },
      { username: "admin", password: await hashPassword("admin123"), email: "admin@example.com", usertype: "admin", approval: "approved" }
    ];
    const createdUsers = await User.insertMany(users);
    console.log(`${createdUsers.length} users created`);

    // Get user references
    const [customer1, customer2, restaurantOwner1, restaurantOwner2, restaurantOwner3, restaurantOwner4, restaurantOwner5, adminUser] = createdUsers;

    // Admin data
    const adminData = {
      categories: ["Italian", "Indian", "Chinese", "Mexican", "Thai", "American"],
      promotedRestaurants: []
    };
    const createdAdmin = await Admin.create(adminData);

    // Create restaurants (one per owner)
    const restaurants = [
      {
        ownerId: restaurantOwner1._id.toString(),
        title: "Bella Italia",
        address: "123 Main Street, New York, NY 10001",
        mainImg: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80",
        cuisine: "Italian",
        menu: []
      },
      {
        ownerId: restaurantOwner2._id.toString(),
        title: "Spice Garden",
        address: "456 Park Avenue, New York, NY 10002",
        mainImg: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1000&q=80",
        cuisine: "Indian",
        menu: []
      },
      {
        ownerId: restaurantOwner3._id.toString(),
        title: "Dragon Wok",
        address: "789 Broadway, New York, NY 10003",
        mainImg: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=1000&q=80",
        cuisine: "Chinese",
        menu: []
      },
      {
        ownerId: restaurantOwner4._id.toString(),
        title: "Taco Fiesta",
        address: "101 5th Avenue, New York, NY 10004",
        mainImg: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=1000&q=80",
        cuisine: "Mexican",
        menu: []
      },
      {
        ownerId: restaurantOwner5._id.toString(),
        title: "Bangkok Spice",
        address: "202 6th Avenue, New York, NY 10005",
        mainImg: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80",
        cuisine: "Thai",
        menu: []
      },
      {
        ownerId: adminUser._id.toString(),
        title: "American Diner",
        address: "303 7th Avenue, New York, NY 10006",
        mainImg: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/11/2c/d9/67/you-can-sit-outide-too.jpg?w=900&h=500&s=1",
        cuisine: "American",
        menu: []
      }
    ];
    const createdRestaurants = await Restaurant.insertMany(restaurants);
    console.log(`${createdRestaurants.length} restaurants created`);

    // Promote first restaurant
    createdAdmin.promotedRestaurants = [createdRestaurants[0]._id.toString()];
    await createdAdmin.save();

    // Food items with cuisine field
    const foodItems = [
      // Bella Italia (Italian)
      {
        title: "Margherita Pizza",
        description: "Classic pizza with tomato sauce, mozzarella, and basil",
        itemImg: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1000&q=80",
        category: "Veg",
        menuCategory: "Pizza",
        cuisine: "Italian",
        restaurantId: createdRestaurants[0]._id.toString(),
        price: 12.99,
        discount: 0,
        rating: 4.5
      },
      {
        title: "Spaghetti Carbonara",
        description: "Pasta with eggs, cheese, pancetta, and black pepper",
        itemImg: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=1000&q=80",
        category: "Non Veg",
        menuCategory: "Pasta",
        cuisine: "Italian",
        restaurantId: createdRestaurants[0]._id.toString(),
        price: 14.99,
        discount: 10,
        rating: 4.7
      },
      {
        title: "Tiramisu",
        description: "Classic Italian dessert with coffee-soaked ladyfingers and mascarpone cream",
        itemImg: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=1000&q=80",
        category: "Veg",
        menuCategory: "Dessert",
        cuisine: "Italian",
        restaurantId: createdRestaurants[0]._id.toString(),
        price: 8.99,
        discount: 0,
        rating: 4.8
      },
      {
        title: "Risotto ai Funghi",
        description: "Creamy risotto with wild mushrooms and parmesan",
        itemImg: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80",
        category: "Veg",
        menuCategory: "Main Course",
        cuisine: "Italian",
        restaurantId: createdRestaurants[0]._id.toString(),
        price: 13.99,
        discount: 5,
        rating: 4.6
      },

      // Spice Garden (Indian)
      {
        title: "Butter Chicken",
        description: "Tender chicken in a rich, creamy tomato sauce",
        itemImg: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=1000&q=80",
        category: "Non Veg",
        menuCategory: "Main Course",
        cuisine: "Indian",
        restaurantId: createdRestaurants[1]._id.toString(),
        price: 16.99,
        discount: 5,
        rating: 4.6
      },
      {
        title: "Paneer Tikka",
        description: "Marinated and grilled cottage cheese with vegetables",
        itemImg: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=1000&q=80",
        category: "Veg",
        menuCategory: "Appetizer",
        cuisine: "Indian",
        restaurantId: createdRestaurants[1]._id.toString(),
        price: 10.99,
        discount: 0,
        rating: 4.4
      },
      {
        title: "Mango Lassi",
        description: "Refreshing yogurt drink with mango pulp",
        itemImg: "https://biancazapatka.com/wp-content/uploads/2020/09/mango-lassi-smoothie.jpg",
        category: "Beverage",
        menuCategory: "Drinks",
        cuisine: "Indian",
        restaurantId: createdRestaurants[1]._id.toString(),
        price: 4.99,
        discount: 0,
        rating: 4.9
      },
      {
        title: "Vegetable Biryani",
        description: "Aromatic basmati rice cooked with mixed vegetables and spices",
        itemImg: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80",
        category: "Veg",
        menuCategory: "Main Course",
        cuisine: "Indian",
        restaurantId: createdRestaurants[1]._id.toString(),
        price: 11.99,
        discount: 0,
        rating: 4.5
      },

      // Dragon Wok (Chinese)
      {
        title: "Kung Pao Chicken",
        description: "Spicy stir-fried chicken with peanuts and vegetables",
        itemImg: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=1000&q=80",
        category: "Non Veg",
        menuCategory: "Main Course",
        cuisine: "Chinese",
        restaurantId: createdRestaurants[2]._id.toString(),
        price: 15.99,
        discount: 0,
        rating: 4.3
      },
      {
        title: "Vegetable Spring Rolls",
        description: "Crispy rolls filled with mixed vegetables",
        itemImg: "https://images.unsplash.com/photo-1607301406259-dfb186e15de8?auto=format&fit=crop&w=1000&q=80",
        category: "Veg",
        menuCategory: "Appetizer",
        cuisine: "Chinese",
        restaurantId: createdRestaurants[2]._id.toString(),
        price: 7.99,
        discount: 15,
        rating: 4.2
      },
      {
        title: "Dim Sum Platter",
        description: "Assorted steamed dumplings with dipping sauces",
        itemImg: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=1000&q=80",
        category: "Veg",
        menuCategory: "Appetizer",
        cuisine: "Chinese",
        restaurantId: createdRestaurants[2]._id.toString(),
        price: 9.99,
        discount: 0,
        rating: 4.4
      },
      {
        title: "Vegetable Lo Mein",
        description: "Stir-fried noodles with fresh vegetables",
        itemImg: "https://cdn.momsdish.com/wp-content/uploads/2020/04/Veggie-Lo-Mein-Under-30-Minutes-07.jpg",
        category: "Veg",
        menuCategory: "Main Course",
        cuisine: "Chinese",
        restaurantId: createdRestaurants[2]._id.toString(),
        price: 10.99,
        discount: 0,
        rating: 4.3
      },

      // Taco Fiesta (Mexican)
      {
        title: "Beef Tacos",
        description: "Soft corn tortillas filled with seasoned beef, lettuce, and cheese",
        itemImg: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=1000&q=80",
        category: "Non Veg",
        menuCategory: "Tacos",
        cuisine: "Mexican",
        restaurantId: createdRestaurants[3]._id.toString(),
        price: 9.99,
        discount: 0,
        rating: 4.5
      },
      {
        title: "Chicken Quesadilla",
        description: "Grilled tortilla stuffed with chicken and cheese",
        itemImg: "https://hips.hearstapps.com/hmg-prod/images/chicken-quesadillas-index-668eeabf1a2c7.jpg?crop=0.6664402942840973xw:1xh;center,top&resize=1200:*",
        category: "Non Veg",
        menuCategory: "Quesadilla",
        cuisine: "Mexican",
        restaurantId: createdRestaurants[3]._id.toString(),
        price: 11.99,
        discount: 0,
        rating: 4.6
      },
      {
        title: "Vegetarian Burrito Bowl",
        description: "Rice, beans, veggies, salsa, and guacamole in a bowl",
        itemImg: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80",
        category: "Veg",
        menuCategory: "Bowl",
        cuisine: "Mexican",
        restaurantId: createdRestaurants[3]._id.toString(),
        price: 10.99,
        discount: 0,
        rating: 4.7
      },

      // Bangkok Spice (Thai)
      {
        title: "Pad Thai",
        description: "Stir-fried rice noodles with tofu, peanuts, and bean sprouts",
        itemImg: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80",
        category: "Veg",
        menuCategory: "Noodles",
        cuisine: "Thai",
        restaurantId: createdRestaurants[4]._id.toString(),
        price: 12.99,
        discount: 0,
        rating: 4.6
      },
      {
        title: "Green Curry Chicken",
        description: "Chicken cooked in spicy green curry with coconut milk",
        itemImg: "https://www.kitchensanctuary.com/wp-content/uploads/2019/06/Thai-Green-Curry-square-FS.jpg",
        category: "Non Veg",
        menuCategory: "Curry",
        cuisine: "Thai",
        restaurantId: createdRestaurants[4]._id.toString(),
        price: 14.99,
        discount: 0,
        rating: 4.7
      },
      {
        title: "Mango Sticky Rice",
        description: "Sweet sticky rice with fresh mango and coconut milk",
        itemImg: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFR4onIklDHl_htOlU7TXCSiXD2r58T109aw&s",
        category: "Veg",
        menuCategory: "Dessert",
        cuisine: "Thai",
        restaurantId: createdRestaurants[4]._id.toString(),
        price: 7.99,
        discount: 0,
        rating: 4.8
      },

      // American Diner (American)
      {
        title: "Classic Cheeseburger",
        description: "Juicy beef patty with cheese, lettuce, tomato, and onion",
        itemImg: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80",
        category: "Non Veg",
        menuCategory: "Burger",
        cuisine: "American",
        restaurantId: createdRestaurants[5]._id.toString(),
        price: 13.99,
        discount: 0,
        rating: 4.5
      },
      {
        title: "Buffalo Wings",
        description: "Spicy chicken wings served with blue cheese dip",
        itemImg: "https://images.getrecipekit.com/20240103192542-buffalo-chicken-wings.jpg?aspect_ratio=16:9&quality=90&",
        category: "Non Veg",
        menuCategory: "Appetizer",
        cuisine: "American",
        restaurantId: createdRestaurants[5]._id.toString(),
        price: 11.99,
        discount: 0,
        rating: 4.6
      },
      {
        title: "Apple Pie",
        description: "Classic American dessert with spiced apples and flaky crust",
        itemImg: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80",
        category: "Veg",
        menuCategory: "Dessert",
        cuisine: "American",
        restaurantId: createdRestaurants[5]._id.toString(),
        price: 6.99,
        discount: 0,
        rating: 4.7
      }
    ];

    const createdFoodItems = await FoodItem.insertMany(foodItems);
    console.log(`${createdFoodItems.length} food items created`);

    // Example orders and cart
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
        foodItemId: createdFoodItems[4]._id.toString(),
        foodItemName: "Butter Chicken",
        foodItemImg: createdFoodItems[4].itemImg,
        quantity: 1,
        price: createdFoodItems[4].price,
        discount: createdFoodItems[4].discount,
        paymentMethod: "Cash on Delivery",
        orderDate: new Date().toISOString(),
        orderStatus: "order placed"
      }
    ];
    await Orders.insertMany(orders);

    const cartItems = [
      {
        userId: customer1._id.toString(),
        restaurantId: createdRestaurants[2]._id.toString(),
        restaurantName: "Dragon Wok",
        foodItemId: createdFoodItems[9]._id.toString(),
        foodItemName: "Vegetable Spring Rolls",
        foodItemImg: createdFoodItems[9].itemImg,
        quantity: 3,
        price: createdFoodItems[9].price,
        discount: createdFoodItems[9].discount
      }
    ];
    await Cart.insertMany(cartItems);

    console.log("Database seeded successfully!");
    mongoose.connection.close();

  } catch (error) {
    console.error("Error seeding database:", error);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedData();