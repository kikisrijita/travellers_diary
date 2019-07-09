const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const Tour = require("../../models/Tour");
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

//GET api/tours/me
//Get my tours
//private
router.get("/me", auth, async (req, res) => {
  try {
    const tours = await Tour.find({ user: req.user.id });
    res.json(tours);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//GET api/tours/:user_id
//Get all tours by ID
//private

router.get("/:user_id", async (req, res) => {
  try {
    const tours = await Tour.find({ user: req.params.user_id });
    res.json(tours);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//_______________________________________________________________
// POST api/tours
// add new tour
//Private

router.post(
  "/",
  [
    auth,
    upload.single("productImage"),
    [
      check("place", "place is required")
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

    const { place, location, from, to, current, description } = req.body;

    try {
      const user = await User.findById(req.user.id).select("-password");

      const newTour = new Tour({
        user: req.user.id,
        name: user.name,
        avatar: user.avatar,
        place,
        location,
        from,
        to,
        current,
        productImage: req.file.path,
        description
      });

      const tour = await newTour.save();
      res.json(tour);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// DELETE api/tours/:tour_id
// Delete a particular tour by ID
//Private

router.delete("/:tour_id", auth, async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.tour_id);

    if (!tour) {
      return res.status(404).json({ msg: "Tour not found" });
    }

    //check user
    if (tour.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "user not authorized" });
    }

    await tour.remove();
    res.json({ msg: "Tour removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Tour not found" });
    }
    res.status(500).send("Server error");
  }
});

//PUT api/tours/like/:id
//Like a tour
//private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (
      tour.likes.filter(like => like.user.toString() === req.user.id).length > 0
    ) {
      return res.status(400).json({ msg: "Post already liked" });
    }

    tour.likes.unshift({ user: req.user.id });

    await tour.save();
    res.json(post.likes);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
});

//PUT api/tours/like/:id
//Like a tour
//private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (
      tour.likes.filter(like => like.user.toString() === req.user.id).length ===
      0
    ) {
      return res.status(400).json({ msg: "Post has not yet been liked" });
    }

    // get remove index
    const removeIndex = tour.likes
      .map(like => like.user.toString())
      .indexOf(req.user.id);
    tour.likes.splice(removeIndex, 1);

    await tour.save();
    res.json(post.likes);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
});

//POSt api/tours/comment/:id
//Comment on a post
//Private

router.post(
  "/comment/:id",
  [
    auth,
    [
      check("text", "text is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");
      const tour = await Tour.findById(req.params.id);

      const newComment = {
        user: req.user.id,
        name: user.name,
        avatar: user.avatar,
        text: req.body.text
      };

      tour.comments.unshift(newComment);
      await tour.save();

      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

//DELETE api/tours/comment/:id/:comment_id
//Delete comment
//Private
router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    //Pull comment
    const comment = tour.comments.find(comment => comment.id === req.params.id);

    //Make sure comment exisits
    if (!comment) {
      return res.status(404).json({ msg: "Comment dosenot exists" });
    }
    // get remove index
    const removeIndex = tour.comments
      .map(comment => comment.user.toString())
      .indexOf(req.user.id);
    tour.comments.splice(removeIndex, 1);

    await tour.save();
    res.json(post.comments);
    //check user
  } catch (error) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//update tourbook
//api/tours/:tour_id
//private

// router.put(
//   "/:tour_id",
//   [
//     auth,
//     upload.single("productImage"),
//     [
//       check("title", "Title is required")
//         .not()
//         .isEmpty(),
//       check("location", "Location is required")
//         .not()
//         .isEmpty(),
//       check("from", "From is required")
//         .not()
//         .isEmpty(),
//       check("description", "Description is required")
//         .not()
//         .isEmpty()
//     ]
//   ],
//   async (req, res) => {
//     const { place, location, from, to, current, description } = req.body;
//     const user = await User.findById(req.user.id).select("-password");

//     try {
//       let tour = await Tour.findById(req.params.tour_id);
//       console.log(tour);
//       //check user
//       if (tour.user.toString() !== req.user.id) {
//         return res.status(401).json({ msg: "user not authorized" });
//       }

//       tour.update({
//         user: req.user.id,
//         name: user.name,
//         avatar: user.avatar,
//         place: place,
//         location: location,
//         from: from,
//         to: to,
//         current: current,
//         productImage: req.file.path,
//         description: description
//       });
//       console.log(tour);
//       // await profile.save();
//       res.json(tour);
//     } catch (err) {
//       console.error(err.message);
//       res.status(500).send("Server error");
//     }
//   }
// );

module.exports = router;
