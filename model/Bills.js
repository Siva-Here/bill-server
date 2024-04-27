const mongoose = require("mongoose");
const billSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique:true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: {
      values: ["hospitality", "infra", "food"],
      message: "Invalid bill type...",
    },
  },
  uploadedBy: {
    type: String,
  },
  image: {
    type: String,
  },
  status: {
    type: String,
    default: "pending",
  },
});


const Bill = mongoose.model("Bill", billSchema);
module.exports = Bill;
