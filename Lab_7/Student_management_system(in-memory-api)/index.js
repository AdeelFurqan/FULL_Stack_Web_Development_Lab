// Lab Task 7 - Part 2: E-commerce Store API (Lab 3 features)
// PERSISTENT storage WITHOUT a database: data is saved in data.json,
// so it is still there after the server restarts.

const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

const FILE = "data.json";

// ---------- Helpers to load / save the JSON file ----------
function loadData() {
  // First run: create the file with some sample products
  if (!fs.existsSync(FILE)) {
    const starter = {
      users: [],
      products: [
        { id: 1, name: "Laptop", price: 150000, stock: 10, description: "Fast laptop" },
        { id: 2, name: "Headphones", price: 5000, stock: 25, description: "Wireless headphones" },
        { id: 3, name: "Mouse", price: 1500, stock: 40, description: "Gaming mouse" },
      ],
      reviews: [],
      carts: [],   // each item: { userId, productId, quantity }
      orders: [],
    };
    fs.writeFileSync(FILE, JSON.stringify(starter, null, 2));
  }
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

function saveData(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// ======================= SIGNUP & LOGIN =======================
// (Passwords are stored as plain text to keep it beginner-simple.)

// Signup -> POST /signup   body: { name, email, password }
app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email and password are required" });
  }
  const data = loadData();
  if (data.users.find((u) => u.email === email)) {
    return res.status(400).json({ message: "Email already registered" });
  }
  const user = { id: Date.now(), name, email, password };
  data.users.push(user);
  saveData(data);
  res.status(201).json({ message: "Signup successful", userId: user.id, name });
});

// Login -> POST /login   body: { email, password }
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const data = loadData();
  const user = data.users.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: "Wrong email or password" });
  res.json({ message: "Login successful", userId: user.id, name: user.name });
});

// ======================= PRODUCT LISTING =======================

// All products -> GET /products
app.get("/products", (req, res) => {
  res.json(loadData().products);
});

// One product -> GET /products/:id
app.get("/products/:id", (req, res) => {
  const product = loadData().products.find((p) => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

// ======================= REVIEWS =======================

// Add review -> POST /products/:id/reviews   body: { userId, rating, comment }
app.post("/products/:id/reviews", (req, res) => {
  const { userId, rating, comment } = req.body;
  if (!userId || !rating) {
    return res.status(400).json({ message: "userId and rating are required" });
  }
  const data = loadData();
  const productId = Number(req.params.id);
  if (!data.products.find((p) => p.id === productId)) {
    return res.status(404).json({ message: "Product not found" });
  }
  const user = data.users.find((u) => u.id === Number(userId));
  if (!user) return res.status(404).json({ message: "User not found" });

  const review = { id: Date.now(), productId, userName: user.name, rating, comment: comment || "" };
  data.reviews.push(review);
  saveData(data);
  res.status(201).json(review);
});

// Get reviews of a product -> GET /products/:id/reviews
app.get("/products/:id/reviews", (req, res) => {
  const data = loadData();
  res.json(data.reviews.filter((r) => r.productId === Number(req.params.id)));
});

// ======================= CART =======================

// Add product to cart -> POST /cart   body: { userId, productId, quantity }
app.post("/cart", (req, res) => {
  const { userId, productId, quantity } = req.body;
  if (!userId || !productId) {
    return res.status(400).json({ message: "userId and productId are required" });
  }
  const qty = Number(quantity) || 1;
  const data = loadData();

  if (!data.products.find((p) => p.id === Number(productId))) {
    return res.status(404).json({ message: "Product not found" });
  }

  // If the product is already in the cart, just increase quantity
  const item = data.carts.find(
    (c) => c.userId === Number(userId) && c.productId === Number(productId)
  );
  if (item) {
    item.quantity += qty;
  } else {
    data.carts.push({ userId: Number(userId), productId: Number(productId), quantity: qty });
  }
  saveData(data);
  res.status(201).json({ message: "Added to cart" });
});

// Display cart -> GET /cart/:userId
app.get("/cart/:userId", (req, res) => {
  const data = loadData();
  const myItems = data.carts.filter((c) => c.userId === Number(req.params.userId));

  let total = 0;
  const items = myItems.map((c) => {
    const product = data.products.find((p) => p.id === c.productId);
    const subtotal = product.price * c.quantity;
    total += subtotal;
    return { productId: c.productId, name: product.name, price: product.price, quantity: c.quantity, subtotal };
  });

  res.json({ items, total });
});

// Edit cart (change quantity) -> PUT /cart/:userId/:productId   body: { quantity }
app.put("/cart/:userId/:productId", (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: "quantity must be 1 or more" });
  }
  const data = loadData();
  const item = data.carts.find(
    (c) => c.userId === Number(req.params.userId) && c.productId === Number(req.params.productId)
  );
  if (!item) return res.status(404).json({ message: "Item not in cart" });
  item.quantity = Number(quantity);
  saveData(data);
  res.json({ message: "Cart updated" });
});

// Remove item from cart -> DELETE /cart/:userId/:productId
app.delete("/cart/:userId/:productId", (req, res) => {
  const data = loadData();
  const before = data.carts.length;
  data.carts = data.carts.filter(
    (c) => !(c.userId === Number(req.params.userId) && c.productId === Number(req.params.productId))
  );
  if (data.carts.length === before) return res.status(404).json({ message: "Item not in cart" });
  saveData(data);
  res.json({ message: "Item removed from cart" });
});

// ======================= CHECKOUT =======================

// Checkout -> POST /checkout   body: { userId, address }
app.post("/checkout", (req, res) => {
  const { userId, address } = req.body;
  if (!userId || !address) {
    return res.status(400).json({ message: "userId and address are required" });
  }
  const data = loadData();
  const myItems = data.carts.filter((c) => c.userId === Number(userId));
  if (myItems.length === 0) return res.status(400).json({ message: "Cart is empty" });

  // Check stock, build order, calculate total
  let total = 0;
  const orderItems = [];
  for (const c of myItems) {
    const product = data.products.find((p) => p.id === c.productId);
    if (product.stock < c.quantity) {
      return res.status(400).json({ message: "Not enough stock for " + product.name });
    }
    total += product.price * c.quantity;
    orderItems.push({ productId: product.id, name: product.name, quantity: c.quantity, price: product.price });
  }

  // Reduce stock
  for (const c of myItems) {
    const product = data.products.find((p) => p.id === c.productId);
    product.stock -= c.quantity;
  }

  const order = { id: Date.now(), userId: Number(userId), address, items: orderItems, total };
  data.orders.push(order);

  // Empty this user's cart
  data.carts = data.carts.filter((c) => c.userId !== Number(userId));
  saveData(data);

  res.status(201).json({ message: "Order placed", order });
});

// View a user's orders -> GET /orders/:userId
app.get("/orders/:userId", (req, res) => {
  const data = loadData();
  res.json(data.orders.filter((o) => o.userId === Number(req.params.userId)));
});

// ---------- Start server ----------
app.listen(3001, () => {
  console.log("E-commerce API running on http://localhost:3001");
  test();
});

async function test() {
  const url = "http://localhost:3001";
  const send = (path, body, method = "POST") =>
    fetch(url + path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json());

  console.log("PRODUCTS:", await fetch(url + "/products").then((r) => r.json()));

  const user = await send("/signup", { name: "Ali", email: "ali" + Date.now() + "@test.com", password: "123" });
  console.log("SIGNUP:", user);

  console.log("ADD TO CART:", await send("/cart", { userId: user.userId, productId: 1, quantity: 2 }));
  console.log("CART:", await fetch(url + "/cart/" + user.userId).then((r) => r.json()));
  console.log("EDIT CART:", await send("/cart/" + user.userId + "/1", { quantity: 3 }, "PUT"));
  console.log("CHECKOUT:", await send("/checkout", { userId: user.userId, address: "Islamabad" }));

  process.exit();
}
