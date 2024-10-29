require("dotenv").config();
const connect = require("./config.json");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const User = require("./models/user.model");
const app = express();
const { authenticateToken } = require("./utilities");
const TravelStory = require("./models/travelStory.model");
const upload = require("./multer");
const fs = require("fs");
const path = require("path");
const { error } = require("console");

app.use(express.json());
app.use(cors({ origin: "*" }));
console.log(connect.connectionString);

mongoose
  .connect(connect.connectionString, {
    family: 4,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
//test API
app.post("/create-account", async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) {
    return res
      .status(400)
      .json({ error: true, message: "All fields are required" });
  }
  const isUser = await User.findOne({ email });
  console.log(isUser);
  if (isUser) {
    return res
      .status(400)
      .json({ error: true, message: "User already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    fullName,
    email,
    password: hashedPassword,
  });

  await user.save();

  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "72h" }
  );
  return res.status(201).json({
    error: false,
    user: { fullName: user.fullName, email: user.email },
    accessToken,
    message: "Registration Successful",
  });
});
// Login API
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and Password are required" });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "72h" }
  );
  return res.json({
    error: false,
    message: "Login Successful",
    user: { fullName: user.fullName, email: user.email },
    accessToken,
  });
});
// GET user details
app.get("/get-user", authenticateToken, async (req, res) => {
  const { userId } = res.user;
  const isUser = await User.findOne({ _id: userId });
  if (!isUser) {
    return res.sendStatus(401);
  }
  return res.json({
    user: isUser,
    message: "",
  });
});

//route to handle image Upload
app.post("/image-upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: true, message: "No image uploaded" });
    }
    const imageUrl = `http://localhost:8008/uploads/${req.file.filename}`;
    res.status(201).json({ imageUrl });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

//Delete an image from upload folder
app.delete("/delete-image", async (req, res) => {
  const { imageUrl } = req.query;
  if (!imageUrl) {
    return res
      .status(400)
      .json({ error: true, message: "ImageUrl parameter is required" });
  }
  try {
    //extract the filename from the imageUrl
    const filename = path.basename(imageUrl);

    //Define the file path
    const filePath = path.join(__dirname, "uploads", filename);

    //check if the file path
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.status(200).json({ message: "Image Deleted Successfully" });
    } else {
      res.status(200).json({ error: true, message: "Image not found" });
    }
  } catch (error) {
    return res.status(400).json({ error: true, message: error.message });
  }
});
// ADD travel Story

app.post("/add-travel-story", authenticateToken, async (req, res) => {
  const { title, story, visitedLocation, imageUrl, visitedDate } = req.body;
  const { userId } = req.user;
  //validate Required fields
  if (!title || !story || !visitedLocation || !imageUrl || !visitedDate) {
    return res
      .status(400)
      .json({ error: true, message: "All feilds are required" });
  }

  //convert visitedDate  from milliseconds to date object
  const parsedVisitedDate = new Date(parseInt(visitedDate));

  try {
    const travelStory = new TravelStory({
      title,
      story,
      visitedLocation,
      userId,
      imageUrl,
      visitedDate: parsedVisitedDate,
    });
    await travelStory.save();
    return res
      .status(201)
      .json({ story: travelStory, message: "Added Successfully" });
  } catch (error) {
    res.status(400).json({ error: true, message: error.message });
  }
});

//get all travel stories
app.get("/all-travel-stories", authenticateToken, async (req, res) => {
  const { userId } = req.user;
  try {
    const travelStories = await TravelStory.find({ userId: userId }).sort({
      isFavourite: -1,
    });
    res.status(400).json({ stories: travelStories });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// edit travel story
app.put("/edit-travel-story/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, story, visitedLocation, imageUrl, visitedDate } = req.body;
  const { userId } = req.user;

  // validate the required fields
  if (!title || !story || !visitedLocation || !imageUrl || !visitedDate) {
    return res
      .status(400)
      .json({ error: true, message: "All fields are required" });
  }

  const parsedVisitedDate = new Date(parseInt(visitedDate));

  try {
    //find the travel story by Id and ensures it belongs to the authenticated  user
    const travelStory = await TravelStory.findOne({ _id: id, userId: userId });

    if (!travelStory) {
      return res
        .status(404)
        .json({ error: true, message: "Travel Story not found" });
    }

    const imagePlaceHolder = "http://localhost:8008/assets/Placeholder.png";
    travelStory.title = title;
    travelStory.story = story;
    travelStory.visitedLocation = visitedLocation;
    travelStory.imageUrl = imageUrl;
    travelStory.visitedDate = parsedVisitedDate;

    await travelStory.save();
    return res
      .status(200)
      .json({ travelStory: travelStory, message: "Updated Successfully" });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
});

//Delete Travel Story
app.delete("/delete-travel-story/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  try {
    //find the travel story by Id and ensures it belongs to the authenticated  user
    const travelStory = await TravelStory.findOne({ _id: id, userId: userId });

    if (!travelStory) {
      return res
        .status(404)
        .json({ error: true, message: "Travel Story not found" });
    }
    //Delete the travel story from the database
    await travelStory.deleteOne({ _id: id, userId: userId });
    //Extract the filename from the imageUrl
    const imageUrl = travelStory.imageUrl;
    const filename = path.basename(imageUrl);
    //define the file path
    const filePath = path.join(__dirname, "uploads", filename);

    //delete the image

    fs.unlink(filePath, (error) => {
      if (error) {
        console.log("Failed to delete the image");
      }
    });

    res.status(200).json({ message: "Travel Story Deleted" });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
});

//upade isFavourite
app.put("/update-isFavourite/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { isFavourite } = req.body;
  const { userId } = req.user;

  try {
    const travelStory = await TravelStory.findOne({ _id: id, userId: userId });
    // console.log(travelStory);
    if (!travelStory) {
      res.status(404).json({ message: "Travel story not found" });
    }
    travelStory.isFavourite = isFavourite;
    console.log(travelStory.isFavourite);
    await travelStory.save();

    res
      .status(200)
      .json({ travelStory: travelStory, message: "Update Successful" });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

//search travel stories
app.get("/search", authenticateToken, async (req, res) => {
  const { query } = req.query;
  const { userId } = req.user;
  if (!query) {
    return res.status(404).json({ error: true, message: "query is required" });
  }

  try {
    const searchResult = await TravelStory.find({
      userId: userId,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { story: { $regex: query, $options: "i" } },
        { visitedLocation: { $regex: query, $options: "i" } },
      ],
    }).sort({ isFavourite: -1 });
    res.status(200).json({ stories: searchResult });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

//filter travel stories
app.get("/travel-stories/filter", authenticateToken, async (req, res) => {
  const { startDate, endDate } = req.query;
  const { userId } = req.user;

  try {
    const start = new Date(parseInt(startDate));
    const end = new Date(parseInt(endDate));
    const filterStories = await TravelStory.find({
      userId: userId,
      visitedDate: { $gte: start, $lte: end },
    }).sort({ isFavourite: -1 });
    res.status(200).json({ filterStories: filterStories });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
});

//serve static files from the uploads and assets directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.listen(8008, () => {
  console.log("Listening to the port");
});
module.exports = app;
