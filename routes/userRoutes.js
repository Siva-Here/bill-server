// userRoutes.js

const express = require('express');

const router = express.Router();

const authenticateToken = require('../middleware/auth');

const userController = require('../controllers/userController');

router.post('/login',userController.login);

router.post('/upload', userController.uploadBill); 

router.post('/fetchBills', authenticateToken, userController.fetchBills);

module.exports = router;
