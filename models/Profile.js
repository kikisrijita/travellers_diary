const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  website: {
    type: String
  },
  homelocation: {
    type: String
  },
  status: {
    type: String
  },
  placesvisited: {
    type: [String],
    required: true
  },
  otherinterests: {
    type: [String],
    required: true
  },
  bio: {
    type: String
  },
  social: {
    youtube: {
      type: String
    },
    twitter: {
      type: String
    },
    facebook: {
      type: String
    },
    linkedin: {
      type: String
    },
    instagram: {
      type: String
    }
  },
  date: {
    type: Date,
    default: Date.now()
  }
});

module.exports = Profile = mongoose.model("profile", ProfileSchema);
