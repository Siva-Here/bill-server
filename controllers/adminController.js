// adminController.js
const mongoose = require('mongoose')

const User = require("../model/Users");

const Bill = require("../model/Bills");

const bcrypt = require('bcrypt');

const validator = require('validator');

const login = async (req, res) => {
    try {
        
        console.log(req);
        console.log("hghghgh");
        const username = req.body.username;

        const password = req.body.password;
        console.log(username);
        console.log(password);

        if (!validator.isAlphanumeric(username)) {

            return res.status(400).json({ message: "Invalid username format." });
        }

        const user = await User.findOne({ username: username });
        console.log(user)

        if (!user) {

            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (!(user.isAdmin == "true")) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const matchPwd = await bcrypt.compare(password, user.password);

        if (!matchPwd) {
            return res.status(401).json({ message: "Invalid username and password" });
        }

        const token = await user.generateAuthToken();
        console.log(token)

        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 300000000000000),
            httpOnly: true,
            secure: true,
        });

        // await user.save();

        res.status(200).json({ username: user.username, jwtToken: token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal service error" });
    }
};


const register = async (req, res) => {
    try {

        const { username,mobile,email, password, confirmPassword } = req.body;

        console.log(username, password, confirmPassword);
        if (!username || !password || !confirmPassword || !mobile || !email) {
            return res.status(400).send('Username, password, and confirm password are required.');
        }

        if (password !== confirmPassword) {
            return res.status(400).send('Password and confirm password do not match.');
        }

        if (!validator.isAlphanumeric(username)) {
            return res.status(400).send('Username must be alphanumeric.');
        }

        const existingUser = await User.findOne({ username: username });
        const existEmail = await User.findOne({email:email});
        const existMobile = await User.findOne({mobile:mobile})
        if (existingUser) {
            return res.status(400).send('Username already exists.');
        }
        if (existEmail) {
            return res.status(400).send('Email already exists.');
        }
        if (existMobile) {
            return res.status(400).send('Mobile number already exists.');
        }
       

        const newUser = new User({
            username: username,
            password: password,
            mobile:mobile,
            email:email,
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

        const { username, password, confirmPassword, mobile, email} = req.body;
        console.log(req.body);

        if (!username || !password || !confirmPassword || !mobile || !email) {
            return res.status(400).send('Username, password, and confirm password are required.');
        }

        if (password !== confirmPassword) {
            return res.status(400).send('Password and confirm password do not match.');
        }

        if (!validator.isAlphanumeric(username)) {
            return res.status(400).send('Username must be alphanumeric.');
        }

        const existingUser = await User.findOne({ username: username });
        const existEmail = await User.findOne({email:email});
        const existMobile = await User.findOne({mobile:mobile})
        if (existingUser) {
            return res.status(400).send('Username already exists.');
        }
        if (existEmail) {
            return res.status(400).send('Email already exists.');
        }
        if (existMobile) {
            return res.status(400).send('Mobile number already exists.');
        }
        


        const newUser = new User({
            username: username,
            password: password,
            mobile:mobile,
            email:email,
            role: "user",
            isAdmin: false,
        });

        const addedUser = await newUser.save();
        console.log("addeduser is:",addedUser);

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
            res.status(200).json({ count: bills.length, totalAmountSpent, bills })
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

const fetchUsers = async (req, res) => {
    try {
        const users = await User.find({}, { username: 1, _id: 0 });
        console.log(users)
        res.status(200).json(users)
    }
    catch (err) {

        console.error(err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

const deleteUser = async (req, res) => {
    try {
        const { username } = req.body
        console.log(username);
        if (!username) {
            return res.status(400).json({ message: "username is required to delete the bill" });
        }
        
        const matchUser =await User.findOne({username})
        if (!matchUser) {
            return res.status(400).json({ message: "Match Not Found" })
        }
        
        const deletedUser = await User.findByIdAndDelete(matchUser._id)
        console.log('deleted User is ', deletedUser);
        return res.status(200).json({ message: "user deleted Sucessfully ", username: deletedUser.username })
        
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal Server Error" })
    }

}


// const fetchApprovedBillsByAmount = async (req, res) => {
//     try {
    
//         let { amount } = req.body; // Amount from frontend
//         console.log("amount is:",amount);

//         if (!amount || isNaN(amount) || amount <= 0) {
//             return res.status(400).json({ message: "Invalid amount" });
//         }

//         // Fetch only approved bills
//         const bills = await Bill.find({ status: "accepted" });

        
//         if (!bills.length) {
//             return res.status(404).json({ message: "No approved bills availableee" });
//         }

//         // Sort bills in descending order based on amount (greedy approach)
//         bills.sort((a, b) => b.amount - a.amount);

//         let selectedBills = [];
//         let currentSum = 0;

//         for (let bill of bills) {
//             if (currentSum + bill.amount <= amount) {
//                 selectedBills.push(bill);
//                 currentSum += bill.amount;
//             }

//             // If we reach an amount close enough to the target (within 95%), break
//             if (currentSum >= amount * 0.95) {
//                 break;
//             }
//         }

//         res.status(200).json({
//             totalSelectedAmount: currentSum,
//             selectedBills,
//         });
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// };

const fetchApprovedBillsByAmount = async (req, res) => {
    try {
        let { amount } = req.body; // Amount from frontend
        console.log("Requested amount is:", amount);

        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ message: "Invalid amount" });
        }

        // Fetch only approved bills
        const bills = await Bill.find({ status: "accepted" });

        if (!bills.length) {
            return res.status(404).json({ message: "No approved bills available" });
        }

        // Sort bills in ascending order based on amount
        bills.sort((a, b) => a.amount - b.amount);

        let selectedBills = [];
        let currentSum = 0;
        let index = 0;

        // Step 1: Add bills until the sum is <= requested amount
        while (index < bills.length && currentSum + bills[index].amount <= amount) {
            selectedBills.push(bills[index]);
            currentSum += bills[index].amount;
            index++;
        }

        let closestSumBelow = currentSum;
        let bestBillsBelow = [...selectedBills];

        // Step 2: Try adding one more bill if available
        if (index < bills.length) {
            let closestSumAbove = currentSum + bills[index].amount;
            let bestBillsAbove = [...selectedBills, bills[index]];

            // Step 3: Compare both sums and return the closer one
            if (Math.abs(amount - closestSumBelow) <= Math.abs(amount - closestSumAbove)) {
                res.status(200).json({ totalSelectedAmount: closestSumBelow, selectedBills: bestBillsBelow });
            } else {
                res.status(200).json({ totalSelectedAmount: closestSumAbove, selectedBills: bestBillsAbove });
            }
        } else {
            // No extra bill available, return what we have
            res.status(200).json({ totalSelectedAmount: closestSumBelow, selectedBills: bestBillsBelow });
        }
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
    getUserStats,
    fetchUsers,
    deleteUser,
    fetchApprovedBillsByAmount
};