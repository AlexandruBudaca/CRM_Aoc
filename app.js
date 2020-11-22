const createError = require("http-errors");
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");

dotenv.config();
const app = express();
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({ credentials: true, origin: true }));

const db = require("./config/keys").mongoURI;

const allowCrossDomain = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://dashboaraoc.netlify.app/");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");

  next();
};
mongoose
  .connect(db, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
  }) // Let us remove that deprecation warrning :)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.use("/", indexRouter);
app.use("/", usersRouter);
app.use(allowCrossDomain);
// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json("error");
});

const { PORT } = process.env;

app.listen(PORT || 5000, () => {
  console.log(`Running at http://localhost:${PORT}`);
});

module.exports = app;
