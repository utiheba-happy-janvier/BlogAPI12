const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/post");
const commentRoute = require("./routes/comment");
const dotenv = require("dotenv");
// const swaggerjsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
dotenv.config();
//connect to database
mongoose.set("strictQuery", false);
mongoose
  .connect(
    "mongodb+srv://happy:1234@cluster0.2zfc2cj.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log(`successfully connected`);
  })
  .catch((e) => {
    console.log(`not connected`);
  });

// middleware

// parse application/x-www-form-urlencoded

// parse application/json
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded());
//Route Middlewares
// const cors = require("cors");
// const corsOptions = {
//   origin: "*",
//   credentials: true, //access-control-allow-credentials:true
//   optionSuccessStatus: 200,
// };

// app.use(cors(corsOptions));
const swaggerJsdoc = require("swagger-jsdoc");
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Hello World",
      version: "1.0.0",
      description: "My blog API",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "apiKey",
          scheme: "bearer",
          name: "Authorization",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    servers: [
      {
        url: "http://localhost:4000",
      },
    ],
  },
  apis: ["./routes/*.js"], // files containing annotations as above
};

const openapiSpecification = swaggerJsdoc(options);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//import Routes

app.use("/api/user", authRoute);
app.use("/post", postRoute);
app.use("/comment", commentRoute);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiSpecification));
app.listen(process.env.PORT || 3003, () =>
  console.log("server up and running on port: " + process.env.PORT)
);
