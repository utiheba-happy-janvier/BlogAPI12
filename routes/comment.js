const express = require("express");
const Authorization = require("./Authorization");
const Comment = require("./model/Comment");
const Post = require("./model/Post");

const router = express.Router();
/**
 * @swagger
 * paths:
 *  /comment/{blogId}:
 *   post:
 *    tags: [Comment]
 *    security:
 *     - bearerAuth: []
 *    description: Add a comment to a blog
 *    parameters:
 *     - in: path
 *       name: blogId
 *       description: Id of the blog
 *       required: true
 *       schema:
 *         type: string
 *    requestBody:
 *     required: true
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        properties:
 *         name:
 *          type: string
 *          description: name of the person commenting
 *         email:
 *          type: string
 *          description: email address of the person commenting
 *         comment:
 *          type: string
 *          description: the comment
 *    responses:
 *     201:
 *      description: Comment posted successfully
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         properties:
 *          message:
 *           type: string
 *           description: Success message
 *          blog:
 *           type: object
 *           description: Blog object
 *     404:
 *      description: Blog not found
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         properties:
 *          message:
 *           type: string
 *           description: Error message
 */

router.post("/:blogId", Authorization, async (req, res) => {
  const blog = await Post.findById({ _id: req.params.blogId });

  if (!blog) {
    return res.status(404).json({
      message: "Blog not found",
    });
  }

  const comment = new Comment({
    name: req.body.name,
    email: req.body.email,
    comment: req.body.comment,
  });
  console.log(comment);
  //   const updated = await Post.findByIdAndUpdate(
  //     { _id: req.params.blogId },
  //     { $addToSet: { comments: [comment] } }
  //   );
  blog.comments.push(comment);

  const newPost = await blog.save();

  return res.status(201).json({
    message: "Comment posted successfully",
    blog,
    // updated,
  });
});

module.exports = router;
