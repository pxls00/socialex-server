const Posts = require("../models/Posts");
const Users = require("../models/Users");
class PostController {
  async getPosts(req, res) {
    try {
      const { query } = req;
      const { skip, limit } = query;
      delete query.skip;
      delete query.limit;
      const q =
        "user" in query
          ? { "user._id": query.user }
          : "search" in query
          ? { title: new RegExp(query.search, "i") }
          : query;
      const data = await Posts.find(q)
      const result = await Posts.find(q).sort({createdData: -1}).skip(+skip).limit(+limit).exec()
      const count = await Posts.find(q).count()
      const next = (data.length - result.length) > +skip
      return res.json({
        data: result,
        count,
        next
      });
    } catch (error) {
      console.error(error);
      return res.json({ message: error });
    }
  }
  async getPostById(req, res) {
    try {
      const { postId } = req.params;
      const data = await Posts.findById(postId);
      res.json(data);
    } catch (error) {
      return res.json({ message: error });
    }
  }
  async addPost(req, res) {
    try {
      const { media, title, description } = req.body;
      const author = await Users.findById(req.user.id);
      const user = {
        _id: author._id,
        name: author.name,
        image: author.image,
        email: author.email,
      };
      if (media.length > 10) {
        return res.status(400).json({ message: "You can upload max 10 files" });
      }
      const createdPost = new Posts({ media, title, description, user });
      await createdPost.save();
      res.status(201).json(createdPost);
    } catch (error) {
      console.error(error);
      return res.json({ message: error });
    }
  }
  async editPost(req, res) {
    try {
      const { postId } = req.params;
      const post = await Posts.findById(postId);
      const {
        title = post.title,
        description = post.description,
        media = post.media
      } = req.body;
      if (post.user._id.toString() !== req.user.id.toString()) {
        return res.status(400).json({ message: "Post is not your" });
      }
      await Posts.findByIdAndUpdate(
        postId,
        {
          $set: { title, description, media },
        },
        { new: true }
      );
      res.status(201).json(createdPost);
    } catch (error) {
      console.error(error);
      return res.json({ message: error });
    }
  }
  async deletePost(req, res) {
    try {
      const { postId } = req.params;
      const post = await Posts.findById({ _id: postId });
      if (!post) {
        return res.status(404).json("Post is not defined");
      }
      if (post.user._id.toString() !== req.user.id.toString()) {
        return res.status(400).json("Post is not your");
      }
      await Posts.findByIdAndRemove({ _id: post._id });
      res.json("post has been deleted");
    } catch (error) {
      console.error(error);
      return res.json({ message: error });
    }
  }
}

module.exports = new PostController();
