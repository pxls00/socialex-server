const Posts = require("../models/Posts");
const Users = require("../models/Users");

class SavePostController {
  async getSavedPosts(req, res) {
    try {
      const savedPosts = await Users.findById(req.user.id);
      return res.json({
        data: savedPosts.savedPosts
      });
    } catch (error) {
      console.error(error);
      return res.json({ message: error });
    }
  }
  async savePost(req, res) {
    try {
      const { postId } = req.params;
      const post = await Posts.findById(postId);
      const user = await Users.findById(req.user.id);
      if (!post) {
        return res.status(404).json({ message: "Post is not defined" });
      }
      if (
        user.savedPosts.find(
          (item) => item._id.toString() === post._id.toString()
        ) &&
        post.savedUsers.find(
          (item) => item._id.toString() === user._id.toString()
        )
      ) {
        return res.status(400).json({ message: "Post already saved" });
      }
      user.savedPosts.unshift({
        _id: post._id,
        img: post.media[0].url,
        likes: post.likes,
        commentsLength: post.commentsLength,
        title: post.title,
      });
      post.savedUsers.unshift({
        _id: user._id,
        image: user.image,
        name: user.name,
        email: user.email,
      });
      await user.save();
      await post.save();
      res.status(201).json({ message: "Post has been saved" });
    } catch (error) {
      console.error(error);
      return res.json({ message: error });
    }
  }
  async removeSavedPost(req, res) {
    try {
      const { postId } = req.params;
      const post = await Posts.findById(postId);
      const user = await Users.findById(req.user.id);
      if (!post) {
        return res.status(404).json({ message: "Post is not defined" });
      }
      if (
        !user.savedPosts.find(
          (item) => item._id.toString() === post._id.toString()
        ) &&
        !post.savedUsers.find(
          (item) => item._id.toString() === user._id.toString()
        )
      ) {
        return res.status(400).json({ message: "Post already removed" });
      }
      post.savedUsers = post.savedUsers.filter(
        (userItem) => userItem._id.toString() !== user._id.toString()
      );
      user.savedPosts = user.savedPosts.filter(
        (postItem) => postItem._id.toString() !== post._id.toString()
      );
      await post.save();
      await user.save();
      return res.json({ message: "Post has been removed" });
    } catch (error) {
      console.error(error);
      return res.json({ message: error });
    }
  }
}

module.exports = new SavePostController();
