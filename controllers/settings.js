const Users = require("../models/Users");
const { validationResult } = require("express-validator");
const Posts = require("../models/Posts");
// const bcrypt = require("bcryptjs");

function iterationComments(comment, userId, credentials) {
  if (comment.comments.length) {
    comment.comments.forEach((item) => {
      if (item.user._id.toString() === userId.toString()) {
        item.user.email = credentials.email;
        item.user.name = credentials.name;
        item.user.image = credentials.image;
      }
      if (item.comments.length) {
        iterationComments(item, userId, credentials);
      }
    });
  }
}

class SettingsController {
  async getSettings(req, res) {
    try {
      const user = await Users.findById(req.user.id);
      const settings = JSON.parse(JSON.stringify(user));
      delete settings.token;
      return res.json(settings);
    } catch (error) {
      console.error(error);
      return res.json({ message: error });
    }
  }
  async updateSettings(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty) {
        return res.status(400).json(errors);
      }
      const user = await Users.findById(req.user.id);
      const users = await Users.find();
      const posts = await Posts.find();
      const updateCredentials = {
        email: req.body.email || user.email,
        username: req.body.username || user.username,
        name: req.body.name || user.name,
        image: req.body.image || user.image,
        bio: req.body.bio || user.bio,
      };
      users.forEach(async (userItem, index) => {
        if (userItem.followers.length) {
          userItem.followers.forEach((followerItem) => {
            if (followerItem._id.toString() === user._id.toString()) {
              followerItem.name = updateCredentials.name;
              followerItem.email = updateCredentials.email;
              followerItem.image = updateCredentials.image;
            }
          });
        }
        if (userItem.followings.length) {
          userItem.followers.forEach((followingItem) => {
            if (followingItem._id.toString() === user._id.toString()) {
              followingItem.name = updateCredentials.name;
              followingItem.email = updateCredentials.email;
              followingItem.image = updateCredentials.image;
            }
          });
        }
        if (userItem.savedPosts.length) {
          userItem.savedPosts.forEach((savedPostItem) => {
            if (savedPostItem.likes.length) {
              savedPostItem.likes.forEach((savedUserLikeItem) => {
                if (savedUserLikeItem._id.toString() === user._id.toString()) {
                  savedUserLikeItem.name = updateCredentials.name;
                  savedUserLikeItem.email = updateCredentials.email;
                  savedUserLikeItem.image = updateCredentials.image;
                }
              });
            }
          });
        }
        await users[index].save();
        await Users.findByIdAndUpdate(
          userItem._id,
          {
            $set: {
              followers: userItem.followers,
              followings: userItem.followings,
              savedPosts: userItem.savedPosts,
            },
          },
          { new: true }
        );
      });
      // user.email = updateCredentials.email;
      // user.username = updateCredentials.username;
      // user.name = updateCredentials.name;
      // user.image = updateCredentials.image;
      // user.bio = updateCredentials.bio;
      // await user.save();
      const updatedSettings = await Users.findByIdAndUpdate(
        req.user.id,
        {
          $set: {
            name: updateCredentials.name,
            username: updateCredentials.username,
            email: updateCredentials.email,
            bio: updateCredentials.bio,
            image: updateCredentials.image,
          },
        },
        { new: true }
      );
      posts.forEach(async (postItem, index) => {
        if (postItem.user._id.toString() === user._id.toString()) {
          postItem.user.name = updateCredentials.name;
          postItem.user.email = updateCredentials.email;
          postItem.user.image = updateCredentials.image;
        }
        if (postItem.likes.length) {
          postItem.likes.forEach((likeItem) => {
            if (likeItem._id.toString() === user._id.toString()) {
              likeItem.name = updateCredentials.name;
              likeItem.email = updateCredentials.email;
              likeItem.image = updateCredentials.image;
            }
          });
        }
        if (postItem.savedUsers.length) {
          postItem.savedUsers.forEach((savedUserItem) => {
            if (savedUserItem._id.toString() === user._id.toString()) {
              savedUserItem.name = updateCredentials.name;
              savedUserItem.email = updateCredentials.email;
              savedUserItem.image = updateCredentials.image;
            }
          });
        }
        if (postItem.comments.length) {
          iterationComments(postItem, user._id, updateCredentials);
        }
        await posts[index].save();
        await Posts.findByIdAndUpdate(postItem._id, { ...postItem });
      });
      const settings = JSON.parse(JSON.stringify(updatedSettings));
      delete settings.token;
      res.json(settings);
    } catch (error) {
      console.error(error);
      return res.json({ message: error });
    }
  }
  //   async resetPassword(req, res) {
  //     try {
  //       const errors = validationResult(req);
  //       if (!errors.isEmpty) {
  //         console.log(errors);
  //         return res.status(400).json(errors);
  //       }
  //       const { currentPassword, newPassword } = req.body;
  //       console.log(currentPassword, newPassword);
  //       const user = await User.findById(req.user.id);
  //       const validPassword = bcrypt.compareSync(currentPassword, user.password);
  //       console.log(validPassword);
  //       if (!validPassword) {
  //         return res.status(400).json({
  //           message: `Your current password is not valid ${currentPassword}`,
  //         });
  //       }
  //       const hashPassword = bcrypt.hashSync(newPassword, 7);
  //       const updatedPassword = User.findByIdAndUpdate(
  //         req.user.id,
  //         { $set: { password: hashPassword } },
  //         { new: true }
  //       );
  //       res.json(updatedPassword);
  //     } catch (error) {
  //       console.error(error);
  //       return res.json({ message: error });
  //     }
  //   }
  async deleteAccount(req, res) {
    try {
      await Users.findByIdAndRemove(req.user.id);
    } catch (error) {
      console.error(error);
      return res.json({ message: error });
    }
  }
}

module.exports = new SettingsController();
