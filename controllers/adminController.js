// adminController.js
const mongoose=require('mongoose')

const User = require("../model/Users");

const Bill = require("../model/Bills");

const bcrypt = require('bcrypt');

const validator=require('validator');

const login = async (req, res) => {
    try {

        const username = req.body.username;

        const password = req.body.password;
        console.log(username);
        console.log(password);

        if (!validator.isAlphanumeric(username)) {

            return res.status(400).json({ message: "Invalid username format." });
        }

        const user = await User.findOne({ username: username });

        if (!user) {
            
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (!(user.isAdmin=="true")) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const matchPwd = await bcrypt.compare(password, user.password);

        if (!matchPwd) {
            return res.status(401).json({ message: "Invalid username and password" });
        }

        const token = await user.generateAuthToken();

        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 300000000000000),
            httpOnly: true,
            secure: true
        });

        await user.save();

        res.status(200).json({ username: user.username, jwtToken: token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal service error" });
    }
};


const register = async (req, res) => {
    try {

        const { username, password, confirmPassword } = req.body;

        if (!username || !password || !confirmPassword) {
            return res.status(400).send('Username, password, and confirm password are required.');
        }

        if (password !== confirmPassword) {
            return res.status(400).send('Password and confirm password do not match.');
        }

        if (!validator.isAlphanumeric(username)) {
            return res.status(400).send('Username must be alphanumeric.');
        }

        const existingUser = await User.findOne({ username: username });
        if (existingUser) {
            return res.status(400).send('Username already exists.');
        }

        const newUser = new User({
            username: username,
            password: password,
            role: "user",
            isAdmin: true,
        });

        const addedUser = await newUser.save();

        res.status(201).json(addedUser);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error.');
    }
};


const addUser = async (req, res) => {
    try {

        const { username, password, confirmPassword } = req.body;

        if (!username || !password || !confirmPassword) {
            return res.status(400).send('Username, password, and confirm password are required.');
        }

        if (password !== confirmPassword) {
            return res.status(400).send('Password and confirm password do not match.');
        }

        if (!validator.isAlphanumeric(username)) {
            return res.status(400).send('Username must be alphanumeric.');
        }

        const existingUser = await User.findOne({ username: username });
        if (existingUser) {
            return res.status(400).send('Username already exists.');
        }


        const newUser = new User({
            username: username,
            password: password,
            role: "user",
            isAdmin: false,
        });

        const addedUser = await newUser.save();

        res.status(201).json(addedUser);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error.');
    }
};


const fetchAllBills = async (req, res) => {
    // implementation
    try {
        
        const bills = await Bill.find();
        const totalAmountSpent = bills.reduce((total, bill) => total + bill.amount, 0);
        if (bills) {
            res.status(200).json({count: bills.length, totalAmountSpent ,bills})
        }
        else {
            res.status(200).json({
                message: "No Bills are available in the Data Base..."
            })
        }
    }
    catch (err) {
        console.log(err.message);
        res.status(500), send('Internal Server Error')
    }
};



const changeStatus = async (req, res) => {
    console.log(req.body)

    try {
        const { billId, status } = req.body;
        console.log(req.body)

        if (!mongoose.Types.ObjectId.isValid(billId)) {
            return res.status(400).json({ message: "Invalid bill ID format" });
        }

        const updatedBill = await Bill.findByIdAndUpdate(
            billId,
            { status: status },
            { new: true }
        );

        if (!updatedBill) {
            return res.status(404).json({ message: "Bill not found" });
        }

        res.status(200).json(updatedBill);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



const deleteBill = async (req, res) => {
    try {
        const { billId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(billId)) {
            return res.status(400).json({ message: "Invalid bill ID format" });
        }

        const deletedBill = await Bill.findOneAndDelete({ _id: billId });

        if (!deletedBill) {
            return res.status(404).json({ message: "Bill not found" });
        }

        await User.updateMany(
            { billsSubmitted: billId },
            { $pull: { billsSubmitted: billId } }
        );

        res.json({ message: "Bill deleted successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


const getCategoryStats = async (req, res) => {
    try {
        const { category } = req.body;

        if (!category || typeof category !== 'string') {
            return res.status(400).json({ message: "Category name is required and must be a string" });
        }

        const bills = await Bill.find({ type: category });

        const totalAmountSpent = bills.reduce((total, bill) => total + bill.amount, 0);

        const billCount = bills.length;

        res.status(200).json({ category, billCount, totalAmountSpent, bills });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


const getUserStats = async (req, res) => {
    try {
        const { username } = req.body;

        if (!username || typeof username !== 'string') {
            return res.status(400).json({ message: "Username is required and must be a string" });
        }

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const userBills = await Bill.find({ _id: { $in: user.billsSubmitted } });

        const totalAmountSpent = userBills.reduce((total, bill) => total + bill.amount, 0);
        const userBillCount = userBills.length;

        res.status(200).json({
            username,
            userBillCount,
            totalAmountSpent,
            userBills
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


module.exports = {
    login,
    register,
    addUser,
    fetchAllBills,
    changeStatus,
    deleteBill,
    getCategoryStats,
    getUserStats
};