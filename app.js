// provides a set of tools and functions that simplify tasks like routing,
// handling different types of requests, managing cookies and sessions, and serving static files, etc
const express = require("express");
// parse incoming request bodies
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const helmet = require("helmet");
const compression = require("compression");
const fs = require("fs");
const morgan = require("morgan");
const session = require("express-session");
const flash = require("connect-flash");
const multer = require("multer");
app.use(helmet());

require("dotenv").config();
fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  )
    cb(null, true);
  else cb(null, false);
};

// The session object imported from express is passed and stored in MongoDB
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: "sessions",
});

const csrfProtection = csrf();

// const privateKey = fs.readFileSync("server.key");
// const cert = fs.readFileSync("server.cert");

const path = require("path");

const https = require("https");

const User = require("./models/user");

const errorController = require("./controllers/error");

// set global config value (sharing data accross app)
// views tell express where we can find the dynamic view
app.set("view engine", "ejs");

app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(
  multer({
    storage: fileStorage,
    fileFilter: fileFilter,
  }).single("image")
);

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));
app.use(bodyParser.urlencoded({ extended: false }));

//  send your static files to the client
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  session({
    secret: "my secret", // assign the hash
    resave: false, // the session will not be saved on every response, will change if smth changes in the session
    saveUninitialized: true,
    store: store,
  })
);
app.use(flash());

app.use(csrfProtection);

// protext routes that should be accessible to authenticated users
app.use((req, res, next) => {
  // local variables that are passed in the veiws only
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  // check if the user is logged in
  if (!req.session.user) {
    // next middleware
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      // dont store undefined objects if we cant find the user
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

// only routes starting with /admin will go the admin routes file
// I have two ecports in admin i will use both
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use("/500", errorController.get500);
app.use(errorController.get404); // catches all

// error handling middleware
app.use((error, req, res, next) => {
  console.log(error);
  res.status(500).render("500", {
    pageTitle: "Error!",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
});
const PORT = process.env.PORT || 3000;
mongoose
  .connect(process.env.MONGODB_URI)
  .then((result) => {
    // https.createServer({ key: privateKey, cert }, app).listen(3000);
    app.listen(PORT);
  })
  .catch((err) => {
    console.log(err);
  });
