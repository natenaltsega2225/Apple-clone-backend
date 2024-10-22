const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const TestRouter = require('./routes/test.routes');
const dbConnection = require('./dbConfig'); // Import the DB connection
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(TestRouter);

// Install: Create the tables necessary
app.get('/install', async (req, res) => {
  const message = 'Tables Created';

  // SQL to create tables
  const createProducts = `
    CREATE TABLE IF NOT EXISTS Products (
      product_id INT AUTO_INCREMENT,
      product_url VARCHAR(255) NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      PRIMARY KEY (product_id)
    )
  `;
  const createProductDescription = `
    CREATE TABLE IF NOT EXISTS ProductDescription (
      description_id INT AUTO_INCREMENT,
      product_id INT NOT NULL,
      product_brief_description TEXT NOT NULL,
      product_description TEXT NOT NULL,
      product_img VARCHAR(255) NOT NULL,
      product_link VARCHAR(255) NOT NULL,
      PRIMARY KEY (description_id),
      FOREIGN KEY (product_id) REFERENCES Products(product_id)
    )
  `;
  const createProductPrice = `
    CREATE TABLE IF NOT EXISTS ProductPrice (
      price_id INT AUTO_INCREMENT,
      product_id INT NOT NULL,
      starting_price VARCHAR(255) NOT NULL,
      price_range VARCHAR(255) NOT NULL,
      PRIMARY KEY (price_id),
      FOREIGN KEY (product_id) REFERENCES Products(product_id)
    )
  `;

  try {
    await dbConnection.query(createProducts);
    await dbConnection.query(createProductDescription);
    await dbConnection.query(createProductPrice);
    res.send(message);
  } catch (err) {
    console.error('Error creating tables:', err);
    res.status(500).send('Error creating tables');
  }
});

// Insert a new product
app.post('/add-product', async (req, res) => {
  const {
    product_name, product_url, product_brief_description,
    product_description, product_img, product_link,
    starting_price, price_range
  } = req.body;

  if (!product_name || !product_url) {
    return res.status(400).send('Required fields are missing.');
  }

  const insertProduct = 'INSERT INTO Products (product_url, product_name) VALUES (?, ?)';
  try {
    const [result] = await dbConnection.query(insertProduct, [product_url, product_name]);
    const productId = result.insertId; // Get the inserted product ID

    const insertProductDescription = `
      INSERT INTO ProductDescription (product_id, product_brief_description, product_description, product_img, product_link)
      VALUES (?, ?, ?, ?, ?)
    `;
    await dbConnection.query(insertProductDescription, [productId, product_brief_description, product_description, product_img, product_link]);

    const insertProductPrice = `
      INSERT INTO ProductPrice (product_id, starting_price, price_range)
      VALUES (?, ?, ?)
    `;
    await dbConnection.query(insertProductPrice, [productId, starting_price, price_range]);

    res.send('Product added successfully');
  } catch (err) {
    console.error('Error inserting product:', err);
    res.status(500).send('Error inserting product.');
  }
});

// Get all products
app.get('/products', async (req, res) => {
  const query = `
    SELECT * FROM Products
    INNER JOIN ProductDescription ON Products.product_id = ProductDescription.product_id
    INNER JOIN ProductPrice ON Products.product_id = ProductPrice.product_id
  `;
  try {
    const [rows] = await dbConnection.query(query);
    res.json({ products: rows });
  } catch (err) {
    console.error('Error retrieving products:', err);
    res.status(500).send('Error retrieving products.');
  }
});

// Add route for /iphones to fetch all products
app.get('/iphones', async (req, res) => {
  const query = `
    SELECT * FROM Products
    INNER JOIN ProductDescription ON Products.product_id = ProductDescription.product_id
    INNER JOIN ProductPrice ON Products.product_id = ProductPrice.product_id
  `;
  try {
    const [rows] = await dbConnection.query(query);
    res.json({ products: rows });
  } catch (err) {
    console.error('Error retrieving products:', err);
    res.status(500).send('Error retrieving products.');
  }
});

app.listen(3001, (err) => {
  if (err) {
    console.error('Error starting server:', err);
  } else {
    console.log('Server is listening on port 3001');
  }
});
