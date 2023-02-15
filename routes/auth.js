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
 *     description: Register a new user
 *     tags: [Users]
 *     parameters:
 *       - in: body
 *         name: body
 *         description: The body of the request for registering a user
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: Name of the user
 *             email:
 *               type: string
 *               format: email
 *               description: Email of the user
 *             password:
 *               type: string
 *               description: Password of the user
 *     responses:
 *       201:
 *         description: A successful registration returns the token and user details
 *         schema:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               description: The token of the registered user
 *             user:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: Name of the user
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: Email of the user
 *                 password:
 *                   type: string
 *                   description: Hashed password of the user
 *       400:
 *         description: A failed registration returns an error message
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               description: The status of the registration
 *             error:
 *               type: string
 *               description: The error message during registration
 */
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (password.length < 6 || password.length > 12) {
      return res.status(400).json({
        status: "failed",
        error: "Password range is between 6 to 12 characters only",
      });
    }

    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return res.status(400).json({
        status: "fail",
        error: "Input a valid email for new user",
      });
    }
    const users = await Users.findOne({ email: req.body.email });
    if (users) {
      return res.status(400).json({
        status: "fail",
        error: "Email is in use",
      });
    }
    //Hash the passwords
    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(req.body.password, salt);

    //create a new user
    const user = new Users({
      name: req.body.name,
      email: req.body.email,
      password: hashedpassword,
    });

    const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
    const saveUser = await user.save();
    res.status(201).json({
      token,
      user: saveUser,
    });
  } catch (error) {
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
