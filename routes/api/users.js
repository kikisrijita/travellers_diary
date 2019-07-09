const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
// const formidable = require("formidable");
// const fs = require("fs");

const { check, validationResult } = require("express-validator");

const User = require("../../models/User");

//api/users
router.post(
  "/",
  [
    check("name", "Name is required")
      .not()
      .isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Minimum 6 characters").isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, photo } = req.body;
    try {
      //See if user exists
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }

      //get users gravatar
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm"
      });

      user = new User({
        name,
        email,
        gravatar,
        password
      });

      //Encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();
      //Return jsonwebtoken
      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;

// //profile update
// let form = new formidable.IncomingForm();
// form.keepExtensions = true;
// form.parse(req, (err, fields, files) => {
//   if (err) {
//     return res.status(400).json({
//       error: "Photo could not b uploaded"
//     });
//   }

//   //Save user
//   user = _.extends(user, fields);
//   //user.updated = Date.now();

//   if (files.photo) {
//     user.photo.data = fs.readFileSync(files.photo.path);
//     user.photo.contentType = files.photo.type;
//   }
// });
