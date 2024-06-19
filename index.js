const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("./models/Users");
const records = require("./records");
const authenticateToken = require("./auth");
const cors = require("cors");

const app = express();
const port = 8080;

const bodyParser = require("body-parser");
const connectDB = require("./db/db");
const Typing = require("./models/Typing");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

connectDB();

app.post("/register", async (req, res) => {
  try {
    console.log("REQ.BODY", req.body);
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    return res.status(201).json(newUser);
  } catch (error) {
    console.log("err", error);
  }
});

app.post("/login", async (req, res) => {
  console.log("REQ.BODY", req.body);
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  console.log("user", user);
  if (!user)
    return res.status(400).json({ message: "Invalid username or password" });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword)
    return res.status(400).json({ message: "Invalid username or password" });

  const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.json({ token });
});

// app.get("/protected", authenticateToken, (req, res) => {
//   res.json({ message: `Hello, ${req.user.username}` });
// });

app.post("/postTypingData", authenticateToken, async (req, res) => {
  const { wpm, accuracy } = req.body;
  const newRecord = new Typing({ wpm, accuracy, user: req.user.username });
  await newRecord.save();
  res.status(201).json({ message: "Record registered successfully" });
});

app.get("/getMaxSpeed", authenticateToken, async (req, res) => {
  const currentUser = req.user.username;
  const arr = [];
  const typingRecords = await Typing.find({ user: currentUser });

  typingRecords.map((record) => {
    arr.push(record.wpm);
  });
  const maxOfAllArray = Math.max(...arr);

  res
    .status(201)
    .json({ message: "User registered successfully", maxWpm: maxOfAllArray });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
