const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const protect = require("../middleware/authMiddleware");
const { getMessages, getConversation, getUsers } = require("../controllers/chatController");

const router = express.Router();

router.get("/messages", protect, getMessages);
router.get("/conversation", protect, getConversation);
router.get("/users", protect, getUsers);


// Set up storage options
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../uploads"));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});


const uploadPath = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}


const upload = multer({ storage });

// Upload image endpoint
router.post("/uploadImage", upload.single("image"), async (req, res) => {
    try {
        // File is now stored, and you have access via req.file
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Construct a URL or file path to save in your database.
        // For example, if hosting locally:
        const imageUrl = `/uploads/${req.file.filename}`;

        // Optionally: Save the image data into DB (if needed) along with sender/receiver info.
        // For example, using your Message model if you want to store it as a message:
        // const Message = require("../models/Message");
        // const { senderId, receiverId } = req.body;
        // const newMessage = new Message({
        //     sender: senderId,
        //     receiver: receiverId,
        //     content: imageUrl,  // Store the image URL
        //     type: "image"       // Optionally mark it as an image message
        // });
        // await newMessage.save();

        res.status(200).json({ imageUrl, message: "Image uploaded successfully" });
    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ message: "Server error" });
    }
});



module.exports = router;
