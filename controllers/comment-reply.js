const Posts = require("../models/Posts");
const Users = require("../models/Users");
const { validationResult } = require("express-validator");
const { nanoid } = require("nanoid");
function findReplyComment(item, replyId) {
  let commentItem = {};
  item.comments.forEach((comment) => {
    if (comment._id.toString() === replyId.toString()) {
      commentItem = comment;
      return;
    } else if (
      !!comment.comments.length &&
      !Object.keys(commentItem).length &&
      comment._id.toString() !== replyId.toString()
    ) {
      commentItem = findReplyComment(comment, replyId);
    }
  });
  return commentItem;
}

function findReplyCommentForDelete(item, replyId) {
  let commentItem = {};
  item.comments.forEach((comment) => {
    if (comment._id.toString() === replyId.toString()) {
      commentItem = item;
      return;
    } else if (
      !!comment.comments.length &&
      !Object.keys(commentItem).length &&
      comment._id.toString() !== replyId.toString()
    ) {
      commentItem = findReplyCommentForDelete(comment, replyId);
    }
  });
  return commentItem;
}
let commentLength = 1;
function getPostCommentsCount(items) {
  items.forEach((replyItem) => {
    commentLength += 1;
    if (replyItem.comments.length) {
      getPostCommentsCount(replyItem.comments);
    }
  });
}
class CommentReply {
  async addReply(req, res) {
    try {
      const { postId, replyId } = req.params;
      const { body } = req.body;
      const post = await Posts.findById({ _id: postId });
      const user = await Users.findById({ _id: req.user.id });

      if (!post) {
        return res.status(404).json("Post is not defined");
      }
      let comment = null;
      comment = findReplyComment(post, replyId);
      if (!comment) {
        return res.status(404).json("comment is not defined");
      }
      comment.comments.push({
        body,
        comments: [],
        user: {
          name: user.name,
          email: user.email,
          _id: user._id,
          image: user.image,
        },
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
      await user.save();
      await Users.findByIdAndUpdate(req.user.id, {
        $set: {
          savedPosts: user.savedPosts
        }
      }, {new: true})

      res.json({message: "reply comment has been added successfully"});
      await Posts.findByIdAndUpdate(postId, {
        ...post,
      });
    } catch (error) {
      console.error(error);
      return res.json({ message: error });
    }
  }
  async editReply(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty) {
        return res.status(400).json(errors);
      }
      const { postId, replyId } = req.params;
      const post = await Posts.findById({ _id: postId });
      const { body } = req.body;
      const user = await Users.findById({ _id: req.user.id });

      if (!post) {
        return res.status(404).json("Post is not defined");
      }
      let comment = null;
      comment = findReplyComment(post, replyId);
      if (!Object.keys(comment).length) {
        return res.status(404).json("comment is not defined");
      }
      if (comment.user._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: "Comment is not your" });
      }
      comment.body = body;
      res.json({message: "Comment has been updated successfully"});
      await post.save();
      await Posts.findByIdAndUpdate(postId, {
        ...post,
      });
    } catch (error) {
      console.error(error);
      return res.json({ message: error });
    }
  }
  async removeReply(req, res) {
    try {
      const { postId, replyId } = req.params;
      const user = await Users.findById({ _id: req.user.id });
      const post = await Posts.findById({ _id: postId });
      if (!post) {
        return res.status(404).json("Post is not defined");
      }
      let comment = null;
      let commentParent = null;
      let commentComments = null;
      let commentIndex = null;
      comment = findReplyComment(post, replyId);
      commentParent = findReplyCommentForDelete(post, replyId);
      commentComments = comment.comments;
      if (!comment || !post) {
        return res
          .status(404)
          .json({ message: "Post or comment is not defined" });
      }
      if (comment.user._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: "Comment is not your" });
      }
      commentIndex = commentParent.comments
        .map((item) => item._id.toString())
        .indexOf(comment._id.toString());
      commentParent.comments.splice(commentIndex, 1, ...commentComments);
      post.commentsLength -= 1;
      if(user.savedPosts.length) {
        user.savedPosts.forEach(savedPost => {
          if(savedPost._id.toString() === post._id.toString()) {
            savedPost.commentsLength = post.commentsLength
          }
        })
      }
      res.json({message: "Comment has been removed successfully"});
      await post.save();
      await user.save();
      await Users.findByIdAndUpdate(req.user.id, {
        $set: {
          savedPosts: user.savedPosts
        }
      }, {new: true})
      await Posts.findByIdAndUpdate(postId, {
        ...post,
      });
    } catch (error) {
      console.error(error);
      return res.json({ message: error });
    }
  }
}

module.exports = new CommentReply();
