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
  name: {
        type: String,
        required: true,
  },
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
    required: function () {
      return this.billType === "GST";
    }, // Bill number is required only if billType is "GST"
    validate: {
      validator: function (value) {
        if (this.billType === "GST") {
          return value && value.trim().length > 0;
        }
        return true; // If not GST, no need for validation
      },
      message: "Bill number is required for GST bills.",
    },
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
