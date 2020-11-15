const express = require("express");

const router = express.Router();

const User = require("../models/User");

const { auth } = require("../middleware/auth");

// Load Input Validation
const validateRegisterInput = require("../validation/register");
const validateLoginInput = require("../validation/login");

/* GET users listing. */
router.get("/users", (req, res) => {
  User.find().then((users) => res.json(users));
});

router.post("/signup", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  // Check Validation
  if (!isValid) {
    // Return any errors with 400 status
    return res.status(400).json(errors);
  }
  const newUser = new User(req.body);
  if (newUser.password !== newUser.password2) {
    return res.status(400).json({ message: "password not match" });
  }
  User.findOne({ email: newUser.email }, (err, user) => {
    if (user) {
      return res.status(400).json({ auth: false, message: "email exits" });
    }
    newUser.save((err, doc) => {
      if (err) {
        console.log(err);
        return res.status(400).json({ success: false });
      }
      res.status(200).json({
        succes: true,
        user: doc,
      });
    });
  });
});

// login user
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);
  // Check Validation
  if (!isValid) {
    // Return any errors with 400 status
    return res.status(400).json(errors);
  }
  const token = req.cookies.auth;
  User.findByToken(token, (err, user) => {
    if (err) {
      return res(err);
    }
    if (user) {
      return res.status(400).json({
        error: true,
        message: "You are already logged in",
      });
    }
    User.findOne({ email: req.body.email }, (err, user) => {
      if (!user) {
        return res.json({
          isAuth: false,
          message: " Auth failed ,email not found",
        });
      }

      user.comparepassword(req.body.password, (err, isMatch) => {
        if (!isMatch) {
          return res.json({
            isAuth: false,
            message: "password doesn't match",
          });
        }
        const dom = "https://crmaoc.herokuapp.com/";
        user.generateToken((err, user) => {
          if (err) return res.status(400).send(err);
          res.cookie("auth", user.token, {
            domain: dom,
            maxAge: 1000 * 60 * 10,
            httpOnly: false,
          });
          res.status(200).json({
            isAuth: true,
            id: user._id,
            email: user.email,
          });
        });
      });
    });
  });
});

router.get("/logout", auth, (req, res) => {
  req.user.deleteToken(req.token, (err, user) => {
    if (err) return res.status(400).send(err);
    res.sendStatus(200);
  });
});

router.put("/edit/:id", (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!",
    });
  }
  const id = req.params.id;

  User.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update user with id=${id}. Maybe Tutorial was not found!`,
        });
      } else res.send({ message: "User was updated successfully." });
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating user with id=" + id,
      });
    });
});
router.delete("/delete/:id", (req, res) => {
  const id = req.params.id;

  User.findByIdAndRemove(id)
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete user with id=${id}. Maybe Tutorial was not found!`,
        });
      } else {
        res.send({
          message: "User was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete user with id=" + id,
      });
    });
});

module.exports = router;
