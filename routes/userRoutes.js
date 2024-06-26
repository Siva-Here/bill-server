// userRoutes.js

const express = require('express');

const router = express.Router();

const authenticateToken = require('../middleware/auth');

const userController = require('../controllers/userController');

router.post('/login',userController.login);

router.post('/upload',authenticateToken,userController.uploadBill); 

router.post('/fetchBills', authenticateToken, userController.fetchBills);

router.delete('/deleteBill',authenticateToken,userController.deleteBill);

module.exports = router;
