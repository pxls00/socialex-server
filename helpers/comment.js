const Posts = require("../models/Posts");
const Users = require("../models/Users");

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

async function deleteComment(postId, userId, replyId) {
    const user = await Users.findById(userId);
    const post = await Posts.findById(postId);
    if (!post) {
        return {
            status: 404,
            message: "Post is not defined",
        };
    }
    let comment = null;
    let commentParent = null;
    let commentComments = null;
    let commentIndex = null;
    comment = findReplyComment(post, replyId);
    commentParent = findReplyCommentForDelete(post, replyId);
    commentComments = comment.comments;
    if (!comment || !post) {
        return {
            status: 404,
            message: "Post or comment is not defined",
        };
    }
    if (comment.user._id.toString() !== user._id.toString()) {
        return {
            status: 400,
            message: "Comment is not your",
        };
    }
    commentIndex = commentParent.comments
        .map((item) => item._id.toString())
        .indexOf(comment._id.toString());
    commentParent.comments.splice(commentIndex, 1, ...commentComments);
    post.commentsLength -= 1;
    if (user.savedPosts.length) {
        user.savedPosts.forEach((savedPost) => {
            if (savedPost._id.toString() === post._id.toString()) {
                savedPost.commentsLength = post.commentsLength;
            }
        });
    }
    await post.save();
    await user.save();
    await Users.findByIdAndUpdate(
        userId,
        {
            $set: {
                savedPosts: user.savedPosts,
            },
        },
        { new: true }
    );
    await Posts.findByIdAndUpdate(postId, {
        ...post,
    });
    return {
        message: "Comment has been removed successfully",
    };
}

module.exports = {
    findReplyComment,
    findReplyCommentForDelete,
    deleteComment,
};
