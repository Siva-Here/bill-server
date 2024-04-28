// userController.js

const User = require("../model/Users");
const Bill = require("../model/Bills");
const fs = require('fs');
const multer = require('multer');
const { format } = require('date-fns');
const bcrypt=require('bcrypt');

// Define multer storage and upload settings
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const currentDate = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
    const fileExtension = getFileExtension(file.originalname); 
    const filename = `${currentDate}.${fileExtension}`;
    cb(null, filename);
  }
});

// Function to get file extension
function getFileExtension(filename) {
  const parts = filename.split('.');
  if (parts.length === 1) {
    return parts[0];
  }
  return parts.pop();
}

// Set up multer upload settings
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, JPG, and PNG files are allowed.'));
    }
  },
  limits: {
  fileSize: 20 * 1024 * 1024 // 20MB limit
  }
}).single('file');

const uploadBill = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File is too large. Maximum size allowed is 1MB.' });
        }
        return res.status(400).json({ error: err.message });
      }
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
      }
      const uploadDir = 'secure_uploads/';
      const securePath = uploadDir + req.file.filename;
      const { name, amount, category, username,imgLink } = req.body;
      try {
        console.log(req.body);
        fs.mkdirSync(uploadDir, { recursive: true }); 
        fs.renameSync(req.file.path, securePath);
        const newBill = new Bill({
          name,
          amount,
          type: category,
          uploadedBy: username,
        // image: `${process.env.IMG_URI}/uploads/${req.file.filename}`,
          image:imgLink,
        });
        const savedBill = await newBill.save();
        if (savedBill) {
          const updateUser = await User.findOneAndUpdate(
            { username: username }, 
            { $push: { billsSubmitted: savedBill._id } }, 
            { new: true } 
          );
          if (!updateUser) {
            return res.status(404).json({ error: 'User not found.' });
          }
        }
        res.status(201).json(savedBill);
      } catch (error) {
        console.error('Error storing file:', error);
        fs.unlinkSync(req.file.path);
        return res.status(500).json({ error: 'Failed to store the file securely.', err });
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload the file.' });
  }
};


const fetchBills = async (req, res) => {
  const { username } = req.body;
  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const userBills = await Bill.find({ uploadedBy: username });

    const totalAmountSpent = userBills.reduce((total, bill) => total + bill.amount, 0);

    const userBillCount = userBills.length;

    res.status(200).json({ userBillCount, totalAmountSpent, userBills });
  } catch (error) {
    console.error('Error fetching user bills:', error);
    res.status(500).json({ error: 'Failed to fetch user bills.' });
  }
};



const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(username);
    console.log(password);

    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: "Invalid username or password format" });
    }

    const user = await User.findOne({ username });
    console.log('user check',user)
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const matchPwd = await bcrypt.compare(password, user.password);
    console.log('matchPwd',matchPwd);
    if (!matchPwd) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = await user.generateAuthToken();

    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 300000000000000),
      httpOnly: true,
      secure: true
    });

    await user.save();

    res.status(200).json({ username: user.username ,token});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal service error" });
  }
};

const deleteBill = async (req, res) => {
  try {
  
    const { billId } = req.body;


    if (!billId) {
      return res.status(400).json({ message: "Bill Id is needed to delete the Bill" });
    }


    const deletedBill = await Bill.findByIdAndDelete(billId);


    if (!deletedBill) {
      return res.status(404).json({ message: "Bill not found in the database" });
    }


    return res.status(200).json({ message: "Bill deleted successfully", deletedBill });
  } catch (err) {
    console.error(err);

    return res.status(500).json({ message: "Internal Server Error" });
  }
};


module.exports = {
  uploadBill,
  fetchBills,
  login,
  deleteBill
};
