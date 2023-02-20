const express = require("express");
const router = express.Router();
const Post = require("../routes/model/Post");
const Authorization = require("./Authorization");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.APIKEY,
  api_secret: process.env.APISECRET,
});

let upload = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
      cb(new Error("File type is not supported"), false);
      return;
    }
    cb(null, true);
  },
});

const uploadToCloud = async (file, res) => {
  try {
    const profilePicture = await cloudinary.uploader.upload(file.path, {
      folder: "image",
      use_filename: true,
    });
    return profilePicture;
  } catch (error) {
    return res.status(500).send(error);
  }
};

//find all post
/**
 * @swagger
 * /post:
 *   get:
 *     tags:
 *       - Blogs
 *     description: Returns all posts
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of posts
 *         schema:
 *           type: array
 *       500:
 *         description: Internal server error
 */
router.get("/", async (req, res) => {
  try {
    const post = await Post.find();
    res.json(post);
  } catch (err) {
    res.json({ message: err });
  }
});


//creating posts

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   responses:
 *     UnauthorizedError:
 *       description: Unauthorized access error
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: Unauthorized access
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: An error occurred
 *         details:
 *           type: string
 *           example: Error details here
 * /post:
 *   post:
 *     summary: Create a new post
 *     tags:
 *       - Blogs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *             required:
 *               - title
 *               - description
 *               - image
 *     responses:
 *       200:
 *         description: A new post has been created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: success
 *                 post:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6130f13415e3d229d8477d55
 *                     title:
 *                       type: string
 *                       example: My first post
 *                     description:
 *                       type: string
 *                       example: This is my first blog post.
 *                     image:
 *                       type: string
 *                       example: https://res.cloudinary.com/my-cloud-name/image/upload/v123456789/my-image-file-name.jpg
 *                     date:
 *                       type: string
 *                       example: 2023-02-19T14:40:30.905Z
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.post("/", Authorization, upload.single("image"), async (req, res) => {
  try {
    const result = await uploadToCloud(req.file, res);
    console.log(result.secure_url);
    const post = await Post.create({
      title: req.body.title,
      description: req.body.description,
      image: result.secure_url,
    });
    return res.json({ message: "success", post: post });
  } catch (error) {
    console.log(error);
    return res.json({ error: error });
  }
});
//getting posts by using ID
/**
 * @swagger
 * /post/{postId}:
 *   get:
 *     tags: [Blogs]
 *     description: Get a post by post Id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Post found
 *       404:
 *         description: Post not found
 */
router.get("/:postId", async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    res.json(post);
  } catch (err) {
    res.json({ message: err });
  }
});

//delete post
/**
 * @swagger
 *  /post/{postId}:
 *     delete:
 *       summary: Delete a post by post Id
 *       tags: [Blogs]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: postId
 *           schema:
 *             type: string
 *           required: true
 *           description: Id
 */
router.delete("/:postId", Authorization, async (req, res) => {
  try {
    const removedpost = await Post.remove({ _id: req.params.postId });
    res.json(removedpost);
  } catch (err) {
    res.json({ message: err });
  }
});

//update posts
/**
 * @swagger
 * /post/{postId}:
 *   patch:
 *     tags:
 *       - Blogs
 *     description: Update post by postId
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: postId
 *         in: path
 *         description: ID of the post to update
 *         required: true
 *         type: string
 *       - name: title
 *         in: body
 *         description: The title of the post
 *         required: true
 *         type: string
 *       - name: description
 *         in: body
 *         description: The description of the post
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Update success
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
router.patch("/:postId", Authorization, async (req, res) => {
  try {
    const updatedPost = await Post.updateOne(
      { _id: req.params.postId },
      { $set: { title: req.body.title, description: req.body.description } }
    );
    res.status(200).json({
      message: "Update success",
    });
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;
