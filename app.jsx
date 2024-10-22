//  this file exactly same as app.js just copied for a back up , it can be used again by 
// just changing the file extension from .jsx to js 

const mysql = require('mysql2');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const TestRouter = require('./routes/test.routes')
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(TestRouter)

// Database connection
const mysqlConnection = mysql.createConnection({
  host: 'localhost',
  user: 'myDBuser',
  password: 'April2024!!',
  database: 'mydb'
});

mysqlConnection.connect((err) => {
  if (err) console.error('Database connection error:', err);
  else console.log('Connected to the database');
});

// Install: Create the tables necessary
app.get('/install', (req, res) => {
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

  mysqlConnection.query(createProducts, (err) => {
    if (err) console.error('Error creating Products table:', err);
  });
  mysqlConnection.query(createProductDescription, (err) => {
    if (err) console.error('Error creating ProductDescription table:', err);
  });
  mysqlConnection.query(createProductPrice, (err) => {
    if (err) console.error('Error creating ProductPrice table:', err);
  });

  res.send(message);
});

// Insert a new product
app.post('/add-product', (req, res) => {
  const {
    product_name, product_url, product_brief_description,
    product_description, product_img, product_link,
    starting_price, price_range
  } = req.body;

  if (!product_name || !product_url) {
    return res.status(400).send('Required fields are missing.');
  }

  const insertProduct = 'INSERT INTO Products (product_url, product_name) VALUES (?, ?)';
  mysqlConnection.query(insertProduct, [product_url, product_name], (err, result) => {
    if (err) {
      console.error('Error inserting product:', err);
      return res.status(500).send('Error inserting product.');
    }

    const productId = result.insertId; // Get the inserted product ID

    const insertProductDescription = `
      INSERT INTO ProductDescription (product_id, product_brief_description, product_description, product_img, product_link)
      VALUES (?, ?, ?, ?, ?)
    `;
    mysqlConnection.query(insertProductDescription, [productId, product_brief_description, product_description, product_img, product_link], (err) => {
      if (err) {
        console.error('Error inserting product description:', err);
        return res.status(500).send('Error inserting product description.');
      }

      const insertProductPrice = `
        INSERT INTO ProductPrice (product_id, starting_price, price_range)
        VALUES (?, ?, ?)
      `;
      mysqlConnection.query(insertProductPrice, [productId, starting_price, price_range], (err) => {
        if (err) {
          console.error('Error inserting product price:', err);
          return res.status(500).send('Error inserting product price.');
        }

        res.send('Product added successfully');
      });
    });
  });
});

// Get all products
app.get('/products', (req, res) => {
  const query = `
    SELECT * FROM Products
    INNER JOIN ProductDescription ON Products.product_id = ProductDescription.product_id
    INNER JOIN ProductPrice ON Products.product_id = ProductPrice.product_id
  `;
  mysqlConnection.query(query, (err, rows) => {
    if (err) {
      console.error('Error retrieving products:', err);
      return res.status(500).send('Error retrieving products.');
    }
    res.json({ products: rows });
  });
});

// Add route for /iphones to fetch all products
app.get('/iphones', (req, res) => {
  const query = `
    SELECT * FROM Products
    INNER JOIN ProductDescription ON Products.product_id = ProductDescription.product_id
    INNER JOIN ProductPrice ON Products.product_id = ProductPrice.product_id
  `;
  mysqlConnection.query(query, (err, rows) => {
    if (err) {
      console.error('Error retrieving products:', err);
      return res.status(500).send('Error retrieving products.');
    }
    res.json({ products: rows });
  });
});

app.listen(3001, (err) => {
  if (err) {
    console.error('Error starting server:', err);
  } else {
    console.log('Server is listening on port 3001');
  }
});


