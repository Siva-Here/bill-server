// app.js

const express = require("express"); 

const app = express(); 

const cors = require('cors'); 

const PORT = process.env.PORT || 8000; 

require("../db/conn"); 

require("dotenv").config(); 


// Import routes
const adminRoutes = require('../routes/adminRoutes'); 

const userRoutes = require('../routes/userRoutes'); 


app.use(express.json()); 

app.use(cors({ credentials: true })); 


app.use('/uploads', express.static('secure_uploads'));


// Use routes
app.use('/admin', adminRoutes); 

app.use('/user', userRoutes); 


const start = async () => {
  try {
    app.listen(PORT, () => { 
      console.log(`Server Running successfully on ${PORT}`); 
    });
  } catch (err) {
    console.log(err); 
  }
};

start();
