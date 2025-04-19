const User = require("../models/User")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")

const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, username, password } = req.body;
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    user = new User({
      firstName,
      lastName,
      username,
      password: hashedPassword
    })

    await user.save();

    const token = jwt.sign({ id: user._id }, "secret", { expiresIn: "1d" });

    return res.status(200).json({ message: "User saved" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  let user = await User.findOne({ username });
  if (!user) {
    return res.status(400).json({ message: "Invalid credential" })
  }
  console.log(user.username)
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, "secret", { expiresIn: "1d" });
  return res.status(200).json({ message: "Login successful", token, name: user.username });
}


const logoutUser = async (req, res) => {
  try {
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { registerUser, loginUser, logoutUser };