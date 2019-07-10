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
  //   photo: {
  //     data: Buffer,
  //     contentType: String
  //},
  // updated: Date,

  tourbook: [
    {
      writtenBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
      },
      title: {
        type: String,
        required: true
      },
      location: {
        type: String,
        required: true
      },
      from: {
        type: String,
        required: true
      },
      to: {
        type: String,
        default: Date.now()
      },
      current: {
        type: Boolean,
        required: false
      },
      description: {
        type: String
      },
      //photos
      productImage: {
        type: String,
        required: true
      },
      likes: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
          }
        }
      ],
      comments: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
          },
          text: {
            type: String,
            required: true
          },
          avatar: {
            type: String
          },
          name: {
            type: String
          },
          date: {
            type: Date,
            default: Date.now
          }
        }
      ],
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
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
