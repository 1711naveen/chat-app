const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const protect = require("../middleware/authMiddleware");
const { messages, getConversation, getUsers } = require("../controllers/chatController");
const Message = require("../models/Message");

const router = express.Router();

router.post("/messages", protect, messages);
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

        const { senderId, receiverId } = req.body;
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

const storageFile = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, "../uploads/files");
      console.log(uploadPath)
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"));
    },
  });

const uploadFile = multer({
    storageFile,
    limits: { fileSize: 10 * 1024 * 1024 }
})

router.post("/uploadFile", uploadFile.single("file"), async (req, res) => {
    try {
        if (!req.file)
            return res.status(400).json({ message: "No file uploaded" });
        const fileUrl = `/uploads/files/${req.file.originalname}`

        const { senderId, receiverId } = req.body;
        const newMessage = new Message({
            sender: senderId,
            receiver: receiverId,
            content: fileUrl,
            type: "file"
        });
        await newMessage.save();
        res.status(200).json({ message: "File uploaded", fileUrl });

    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ message: "Server error" });
    }
})

module.exports = router;
