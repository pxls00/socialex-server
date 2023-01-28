const Users = require("../models/Users");
const { validationResult } = require("express-validator");
const Posts = require("../models/Posts");
const {
    deleteComment
} = require("../helpers/comment");
const request = require("request");
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

async function itarationCommentsAndDelete(comment, userId, postId) {
    let obj = {}
    if (comment.comments.length) {
        comment.comments.forEach((item) => {
            if (item.user._id.toString() === userId.toString()) {
                new Promise((resolve, reject) => {
                    const resObj = deleteComment(postId, userId, item._id)
                    resolve(resObj);
                }).then(async (resObj) => {
                    obj = resObj
                    if(item.comments.length) {
                        await itarationCommentsAndDelete(item, userId, postId)
                    }
                })
            }
            if (item.comments.length) {
                itarationCommentsAndDelete(item, userId, postId);
            }
        });
    }
    return await obj
}
class SettingsController {
    async getSettings(req, res) {
        try {
            const user = await Users.findById(req.user.id);
            const settings = JSON.parse(JSON.stringify(user));
            delete settings.token;
            return res.json(settings);
        } catch (error) {
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
                        if (
                            followerItem._id.toString() === user._id.toString()
                        ) {
                            followerItem.name = updateCredentials.name;
                            followerItem.email = updateCredentials.email;
                            followerItem.image = updateCredentials.image;
                        }
                    });
                }
                if (userItem.followings.length) {
                    userItem.followers.forEach((followingItem) => {
                        if (
                            followingItem._id.toString() === user._id.toString()
                        ) {
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
                                if (
                                    savedUserLikeItem._id.toString() ===
                                    user._id.toString()
                                ) {
                                    savedUserLikeItem.name =
                                        updateCredentials.name;
                                    savedUserLikeItem.email =
                                        updateCredentials.email;
                                    savedUserLikeItem.image =
                                        updateCredentials.image;
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
                        if (
                            savedUserItem._id.toString() === user._id.toString()
                        ) {
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
            const posts = await Posts.find();
            const users = await Users.find();
            users.forEach(async (item, index) => {
                if (item.followers.length || item.followings.length) {
                    item.followers = item.followers.filter(
                        (item) => item._id.toString() !== req.user.id.toString()
                    );
                    users[index].save();
                    item.followings = item.followings.filter(
                        (item) => item._id.toString() !== req.user.id.toString()
                    );
                    await Users.findByIdAndUpdate(
                        item._id,
                        {
                            $set: {
                                followers: item.followers,
                                followings: item.followings,
                            },
                        },
                        { $new: true }
                    );
                }
            });
            posts.forEach(async (postItem, index) => {
                if (postItem.user._id.toString() === req.user.id.toString()) {
                    users.forEach(async (userItem, index) => {
                        if (userItem.savedPosts.length) {
                            userItem.savedPosts = userItem.savedPosts.filter(
                                (savedPost) =>
                                    savedPost._id.toString() !==
                                    postItem._id.toString()
                            );
                            await Users.findByIdAndUpdate(
                                userItem._id,
                                {
                                    $set: {
                                        savedPosts: userItem.savedPosts,
                                    },
                                },
                                { new: true }
                            );
                        }
                    });
                    await Posts.findByIdAndRemove(postItem._id);
                } else {
                    if (postItem.likes.length || postItem.savedUsers.length || postItem.comments.length) {
                        new Promise((resolve, reject) => {
                            postItem.likes = postItem.likes.filter(
                                (likeItem) =>
                                    likeItem._id.toString() !==
                                    req.user.id.toString()
                            );
                            postItem.savedUsers = postItem.savedUsers.filter(
                                (savedUser) =>
                                    savedUser._id.toString() !==
                                    req.user.id.toString()
                            );
                            posts[index].save();
                            Posts.findByIdAndUpdate(
                                postItem._id,
                                {
                                    $set: {
                                        likes: postItem.likes,
                                        savedUsers: postItem.savedUsers,
                                    },
                                },
                                { new: true }
                            );
                            resolve(posts[index])
                        }).then(async (post) => {
                            new Promise((resolve, reject) => {
                                const obj = itarationCommentsAndDelete(
                                    postItem,
                                    req.user.id,
                                    postItem._id
                                )
                                resolve(obj)
                            }).then(async (obj) => {
                                setTimeout(async () => {
                                    res.json({message: "User has been deleted"})
                                    await Users.findByIdAndRemove(req.user.id);
                                }, 3000)
                            })
                        })
                    }
                }
            });
        } catch (error) {
            return res.json({ message: error });
        }
    }
}

module.exports = new SettingsController();
