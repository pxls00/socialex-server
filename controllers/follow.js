const Users = require("../models/Users");

class FollowController {
  async addFollowing(req, res) {
    if (req.params.userId === req.user.id) {
      return res
        .status(400)
        .json({ message: "You can not follow to this user" });
    }
    const currentUser = await Users.findById(req.user.id);
    const followUser = await Users.findById(req.params.userId);
    if (!followUser) {
      return res.status(404).json({ message: "Following user is not defined" });
    }
    if (
      followUser.followers.find(
        (user) => user._id.toString() === currentUser._id.toString()
      )
    ) {
      return res
        .status(400)
        .json({ message: "Current user already followed this user" });
    }
    currentUser.followings.unshift({
      _id: followUser._id,
      name: followUser.name,
      email: followUser.email,
      image: followUser.image,
    });
    followUser.followers.unshift({
      _id: currentUser._id,
      name: currentUser.name,
      email: currentUser.email,
      image: currentUser.image,
    });
    await currentUser.save();
    await followUser.save();
    res.status(201).json({ message: "user has been followed" });
  }

  async cancelFollowing(req, res) {
    if (req.params.userId === req.user.id) {
      return res
        .status(400)
        .json({ message: "You can not unfollow from this user" });
    }
    const currentUser = await Users.findById(req.user.id);
    const followUser = await Users.findById(req.params.userId);
    if (!followUser) {
      return res.status(404).json({ message: "Following user is not defined" });
    }
    if (
      !followUser.followers.find(
        (user) => user._id.toString() === currentUser._id.toString()
      )
    ) {
      return res
        .status(400)
        .json({ message: "Current user already unfollowed this user" });
    }
    followUser.followers = followUser.followers.filter(
      (user) => user._id.toString() !== currentUser._id.toString()
    );
    currentUser.followings = currentUser.followings.filter(
      (user) => user._id.toString() !== followUser._id.toString()
    );
    await currentUser.save();
    await followUser.save();
    res.json({ message: "user has been unfollowed" });
  }
}

module.exports = new FollowController();
