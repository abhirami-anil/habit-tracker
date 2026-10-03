const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require('../Model/model')
const authmiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try{
      const { userName, age, email, password } = req.body;

      if(!userName || !age || !email || !password){
        return res.status(400).json({
          message: "validation error",
          error: "all fields (userName, age, email, password) are required"
        })
      }
      
      const saltRounds = 10
      const hashedPassword= await bcrypt.hash(password,saltRounds)

    const defaultHabits = [
      { id: "h_" + Date.now() + "_1", name: "Drink 3L of Water", category: "health", completed: true, streak: 5 },
      { id: "h_" + Date.now() + "_2", name: "Gym Workout Routine", category: "fitness", completed: false, streak: 3 },
      { id: "h_" + Date.now() + "_3", name: "Read 10 Pages of Book", category: "mind", completed: true, streak: 8 },
      { id: "h_" + Date.now() + "_4", name: "Write Clean React Code", category: "work", completed: false, streak: 12 }
    ];

    const newUser = new User({
      userName,
      age,
      email,
      password: hashedPassword,
      status: "active",
      habits: defaultHabits
    });

   await newUser.save();

  res.status(201).json({message: "Registration successfull", newUser})
}catch(error){
  res.status(400).json({message: "Error in Registration", error: error.message})
}
})

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.json({
      message: "Invalid Email",
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.json({
      message: "Invalid Password",
    });
  }
   

  // JWT Token Generation
  const token = jwt.sign(
    {
      id: user._id,
      email: user.email
    },
    "secretkey",
    {
      expiresIn: "1d",
    },
  );

  res.json({
    message: "Login Successful",
    token,
  });
});

// PROTECTED ROUTE
router.get("/profile", authmiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      message: "Protected Route Accessed",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// UPDATE PROFILE
router.put("/profile", authmiddleware, async (req, res) => {
  try {
    const { userName, age, email, password } = req.body;
    
    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check username uniqueness if modified
    if (userName && userName !== user.userName) {
      const existingUser = await User.findOne({ userName });
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      user.userName = userName;
    }

    if (age) user.age = Number(age);
    if (email) user.email = email;

    if (password && password.trim() !== "") {
      const saltRounds = 10;
      user.password = await bcrypt.hash(password, saltRounds);
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        age: user.age
      }
    });
  } catch (error) {
    res.status(400).json({ message: "Error in updating profile", error: error.message });
  }
});

// UPDATE USER HABITS
router.put("/habits", authmiddleware, async (req, res) => {
  try {
    const { habits } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.habits = habits;
    await user.save();
    res.json({ message: "Habits updated successfully", habits: user.habits });
  } catch (error) {
    res.status(500).json({ message: "Error updating habits", error: error.message });
  }
});

module.exports = router;  