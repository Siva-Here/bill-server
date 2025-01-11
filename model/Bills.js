const mongoose = require("mongoose");
// const billSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   amount: {
//     type: Number,
//     required: true,
//   },
//   type: {
//     type: String,
//     required: true,
//     enum: {
//       values: ["hospitality", "infra", "food"],
//       message: "Invalid bill type...",
//     },
//   },
//   uploadedBy: {
//     type: String,
//   },
//   image: {
//     type: String,
//   },
//   status: {
//     type: String,
//     default: "pending",
//   },
// });

const billSchema = new mongoose.Schema({
  billType: {
    type: String,
    required: true,
    enum: {
      values: ["GST", "Non GST"],
      message: "Invalid bill type. Must be either 'GST' or 'Non GST'.",
    },
  },
  billNumber: {
    type: String,
    required: true,
  },
  category: {
        type: String,
        required: true,
        enum: {
          values: ["printing", "marketing", "travelling", "outside promotions", "stage photography"],
          message: "Invalid bill type...",
        },
  },
  firmName: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
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
