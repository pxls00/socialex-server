const { Schema, model } = require("mongoose");

const User = new Schema({
  username: {
    type: String,
    default: "",
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  bio: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    default: "https://firebasestorage.googleapis.com/v0/b/socialex-75528.appspot.com/o/f10ff70a7155e5ab666bcdd1b45b726d.jpg?alt=media&token=c3a2cd94-781e-46d0-8cf6-d964a041c52e",
  },
  followers: [Object],
  followings: [Object],
  savedPosts: [Object],
  messanger: [
    {
      roomId: {
        type: String,
        required: true
      },
      messangerMember: {
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
    }
  ],
  token: { type: Object },
});

module.exports = model("users", User);
