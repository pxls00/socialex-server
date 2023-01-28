const Posts = require("../models/Posts");
const Users = require("../models/Users");
const { validationResult } = require("express-validator");
let commentLength = 1;
const { nanoid } = require("nanoid");

class PostCommentController {
  async addComment(req, res) {
    try {
      const { postId } = req.params;
      const { body } = req.body;
      const post = await Posts.findById({ _id: postId });
      const user = await Users.findById({ _id: req.user.id });
      if (!post) {
        return res.status(404).json("Post is not defined");
      }
      post.comments.push({
        body,
        user: {
          name: user.name,
          email: user.email,
          _id: user._id,
          image: user.image,
        },
        comments: [],
        _id: nanoid(),
      });
      post.commentsLength += 1;
      if(user.savedPosts.length) {
        user.savedPosts.forEach(savedPost => {
          if(savedPost._id.toString() === post._id.toString()) {
            savedPost.commentsLength = post.commentsLength
          }
        })
      }
      await post.save();
      await user.save()
      await Users.findByIdAndUpdate(req.user.id, {
        $set: {
          savedPosts: user.savedPosts
        }
      }, {new: true})
      return res.status(201).json("your comment added to post");
    } catch (error) {
      console.error(error);
      return res.json({ message: error });
    }
  }
  async removeComment(req, res) {
    try {
      const { postId, commentId } = req.params;
      const post = await Posts.findById({ _id: postId });
      const comment = post.comments.find(
        (item) => item._id.toString() === commentId
      );
      const user = await Users.findById({ _id: req.user.id });
      if (!comment || !post) {
        return res
          .status(404)
          .json({ message: "Post or comment is not defined" });
      }
      if (
        comment.user._id.toString() !== user._id.toString() &&
        post.user._id.toString() !== user._id.toString()
      ) {
        return res.status(400).json({ message: "Comment is not your" });
      }

      post.comments = post.comments.filter(
        (item) => item._id.toString() !== comment._id.toString()
      );
      post.commentsLength -= commentLength;
      await post.save();
      res.status(202).json("comment has been deleted");
    } catch (error) {
      console.error(error);
      return res.json({ message: error });
    }
  }
}

module.exports = new PostCommentController();
