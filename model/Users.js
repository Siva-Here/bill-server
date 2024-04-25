const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const validator = require('validator');
const Bill=require('../model/Bills');
const jwt=require('jsonwebtoken');
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    validate(value) {
      if (validator.isEmpty(value)) {
        throw new Error('Entered password is undefined...')
      }
    }
  },
  role: {
    type: String,
    required: true,
    enum: {
      values: ["user", "user1", "user2", "user3"],
      message: "Invalid user type...",
    },
  },
  isAdmin: {
    type: String,
    default: false
  },
  billsSubmitted: [{
    type: mongoose.Types.ObjectId,
    ref: 'Bill' // Assuming 'Bill' is the name of the model for your bills
  }],
});


userSchema.methods.generateAuthToken = async function () {
  try {
    const token = jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY)
    return token;
  }
  catch (err) {
    console.log("the error part is " + err)
    throw err;
  }
}

userSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) {
      const hashedPwd = await bcrypt.hash(this.password, 12)
      this.password = hashedPwd
    }
  }
  catch (err) {
    console.log(err)
  }
  next()
})

const User = mongoose.model("User", userSchema);
module.exports = User;