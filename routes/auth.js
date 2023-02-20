const router = require("express").Router();
//const Joi = require('joi');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Users = require("./model/User");

require("dotenv").config();
/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *             example:
 *               email: user@example.com
 *               password: 123456
 *               name: John Doe
 *     responses:
 *       '201':
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     password:
 *                       type: string
 *                     name:
 *                       type: string
 *               example:
 *                 token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImZlMzE0YmM4LTkyZTctNGM0Ni05MmM4LWUzZjA2MmE4MjM4MiIsImlhdCI6MTYyMjg4MDY0OCwiZXhwIjoxNjIyOTY3MDQ4fQ.0rgsLbIWxhGBNvQKjNqrRbRGG1-jX9u2O2P-UXXVopw
 *                 user:
 *                   _id: fe314bc8-92e7-4c46-92c8-e3f062a82382
 *                   email: user@example.com
 *                   password: $2b$10$9tp0C0dyyUEytStqxCL8Rud/EylQv1L5iCE81bMqhM5j3q5vUzBgm
 *                   name: John Doe
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 error:
 *                   type: string
 *               example:
 *                 status: fail
 *                 error: Email is in use
 */
router.post("/register", async (req, res) => {
  try {
    // if (req.body.password.length < 6 || req.body.password.length > 12) {
    //   return res.status(400).json({
    //     status: "failed",
    //     error: "Password range is between 6 to 12 characters only",
    //   });
    // }

    // if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email)) {
    //   return res.status(400).json({
    //     status: "fail",
    //     error: "Input a valid email for new user",
    //   });
    // }
    const users = await Users.findOne({ email: req.body.email });
    if (users) {
      return res.status(400).json({
        status: "fail",
        error: "Email is in use",
      });
    }

    //create a new user
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    // const hashedPw = await bcrypt.hash(password, 12);

    const user = new Users({
      email: email,
      password: password,
      name: name,
    });
    const result = await user.save();

    const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
    res.status(201).json({
      token,
      user: result,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: "failed",
      error: error.message,
    });
  }
});
//LOGIN
/**
 * @swagger
 * /api/user/login:
 *   post:
 *     description: Login to the application
 *     produces:
 *       - application/json
 *     tags: [Users]
 *     parameters:
 *       - name: email
 *         description: Email of the user
 *         in: body
 *         required: true
 *         type: string
 *       - name: password
 *         description: Password of the user
 *         in: body
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Login success
 *         schema:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               description: JWT token
 *             message:
 *               type: string
 *               description: Success message
 *       400:
 *         description: Email and password fields are required
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               description: Status of the response
 *             error:
 *               type: string
 *               description: Error message
 *       404:
 *         description: Incorrect email or password
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               description: Status of the response
 *             error:
 *               type: string
 *               description: Error message
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: "fail",
      error: "Email and password  field are required",
    });
  }
  const users = await Users.findOne({ email: req.body.email });
  if (!users)
    return res.status(404).json({
      status: "fail",
      error: "Incorrect email or password",
    });
  const validPass = await bcrypt.compare(req.body.password, users.password);
  if (!validPass) {
    return res.status(400).json({
      status: "fail",
      error: "Incorrect email or password",
    });
  }

  //create and assign a token
  const token = jwt.sign({ id: users._id }, process.env.TOKEN_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
  return res.status(200).json({
    token,
    message: "Login success",
  });
});

module.exports = router;
