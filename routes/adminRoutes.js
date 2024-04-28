// adminRoutes.js

const express = require('express');

const router = express.Router();

const authAdminToken = require('../middleware/authAdmin');

const adminController = require('../controllers/adminController');

router.post("/login", adminController.login);

router.post("/register", authAdminToken, adminController.register);

router.post("/addUser", authAdminToken, adminController.addUser);

router.get("/fetchAllBills", authAdminToken, adminController.fetchAllBills);

router.post("/changeStatus", authAdminToken, adminController.changeStatus);

router.delete("/deleteBill", authAdminToken, adminController.deleteBill);

router.post("/stats/category", authAdminToken, adminController.getCategoryStats);

router.post("/stats/user", authAdminToken, adminController.getUserStats);

router.get("/users",authAdminToken,adminController.fetchUsers);

module.exports = router;