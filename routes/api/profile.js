const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

const Profile = require("../../models/Profile");
const User = require("../../models/User");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  //reject a file
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

// GET api/profile/me
// Get current users profile
//Private

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );

    if (!profile) {
      return res.status(400).json({ msg: "There is no profile" });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// POST api/profile
// Create or update user profile
//Private

router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      name,
      website,
      homelocation,
      status,
      placesvisited,
      otherinterests,
      bio,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;

    //Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (name) profileFields.name = name;
    if (website) profileFields.website = website;
    if (homelocation) profileFields.homelocation = homelocation;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;

    if (placesvisited) {
      profileFields.placesvisited = placesvisited
        .split(",")
        .map(places => places.trim());
    }
    if (otherinterests) {
      profileFields.otherinterests = otherinterests
        .split(",")
        .map(interest => interest.trim());
    }

    //Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        //Update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.json(profile);
      }

      // Create
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// GET api/profile
// Get all profiles
//Public

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// GET api/profile/user/:user_id
// Get profile by user_id
//Public
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate("user", ["name", "avatar"]);

    if (!profile)
      return res.status(400).json({ msg: "there is no profile for the user" });
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(400).send({ msg: "Profile not found" });
    }
    res.status(500).send("Server Error");
  }
});

// DELETE api/profile
// delete profile, user and posts
//Private
router.delete("/", auth, async (req, res) => {
  try {
    //@todo - remove users posts
    //Remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    // Remove user
    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ msg: "User deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//_______________________________________________________________
// POST api/profile/tourbook
// return new profile with tour
//Private

router.post(
  "/tourbook",
  [
    auth,
    upload.single("productImage"),
    [
      check("title", "Title is required")
        .not()
        .isEmpty(),
      check("location", "Location is required")
        .not()
        .isEmpty(),
      check("from", "From is required")
        .not()
        .isEmpty(),
      check("description", "Description is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    console.log(req.file);
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, location, from, to, current, description } = req.body;

    const newTour = {
      writtenBy: req.user.id,
      title,
      location,
      from,
      to,
      current,
      productImage: req.file.path,
      description
    };

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      profile.tourbook.unshift(newTour);

      await profile.save();
      res.json(profile.tourbook);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// DELETE api/profile/tourbook/:tour_id
// Delete tourbook from profile
//Private

router.delete("/tourbook/:tour_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //Get remove index
    const removeIndex = profile.tourbook
      .map(item => item.id)
      .indexOf(req.params.tour_id);

    profile.tourbook.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//update tourbook
//tourbook/:tour_id
//private

router.post(
  "/tourbook/:tour_id",
  [
    auth,
    upload.array("productImage", 4),
    [
      check("title", "Title is required")
        .not()
        .isEmpty(),
      check("location", "Location is required")
        .not()
        .isEmpty(),
      check("from", "From is required")
        .not()
        .isEmpty(),
      check("description", "Description is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      const { title, location, from, to, current, description } = req.body;

      if (!profile.tourbook.writtenBy === req.user.id) {
        return res
          .status(400)
          .json({ msg: "There is no tourbook for this profile" });
      }

      //Get remove index
      const updateIndex = profile.tourbook
        .map(item => item.id)
        .indexOf(req.params.tour_id);
      // console.log(req.params.tour_id);
      const updateIt = profile.tourbook[updateIndex];
      updateIt.title = title;
      updateIt.location = location;
      updateIt.from = from;
      updateIt.to = to;
      updateIt.description = description;
      updateIt.productImage = req.file.path;
      // profile = await profile.tourbook.findOneAndUpdate(
      //   { _id: req.params.tour_id },
      //   { $set: newTour },
      //   { new: true }
      // );
      console.log(updateIt);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
