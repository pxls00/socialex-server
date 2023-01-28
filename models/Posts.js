const { Schema, model } = require("mongoose");

const Post = new Schema({
  media: [
    {
      url: {
        type: String,
        required: true
      },
      img: {
        type: Boolean,
        default: true
      }
    }
  ],
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  user: {
    name: {
      type: String,
      required: true,
    },
    _id: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      reqired: true,
    },
  },
  likes: [
    {
      name: {
        type: String,
        required: true,
      },
      _id: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        reqired: true,
      },
    },
  ],
  comments: [Object],
  commentsLength: {
    type: Number,
    default: 0
  },
  savedUsers: [Object],
  createdData: {
    type: Date,
    default: Date.now,
  },
});

Post.index({title: "text"})

module.exports = model("Posts", Post);
