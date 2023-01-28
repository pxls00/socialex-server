const Posts = require("../models/Posts");
const Users = require("../models/Users");

class PostLikeController {
  async like(req, res) {
    try {
      const { postId } = req.params;
      const post = await Posts.findById({ _id: postId });
      const user = await Users.findById({ _id: req.user.id });
      if (!post) {
        return res.status(404).json("Post is not defined");
      }
      if (
        post.likes.find((item) => item._id.toString() === user._id.toString())
      ) {
        return res.json("You already liked this post");
      }
      post.likes.unshift({
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
      });
      await post.save();
      res.status(201).json("post has been liked");
    } catch (error) {
      console.error(error);
      return res.json({ message: error });
    }
  }
  async unlike(req, res) {
    try {
      const { postId } = req.params;
      const post = await Posts.findById({ _id: postId });
      const user = await Users.findById({ _id: req.user.id });
      if (!post) {
        return res.status(404).json("Post is not defined");
      }
      if (
        !post.likes.find((item) => item._id.toString() === user._id.toString())
      ) {
        return res.json("You already unliked this post");
      }
      post.likes = post.likes.filter(
        (item) => item._id.toString() !== user._id.toString()
      );
      await post.save();
      res.status(201).json("post has been unliked");
    } catch (error) {
      console.error(error);
      return res.json({ message: error });
    }
  }
}

module.exports = new PostLikeController();
