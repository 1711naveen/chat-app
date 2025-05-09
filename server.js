require('dotenv').config()
const express = require("express")
const connectDB = require("./config/db")
const cors = require("cors");
const { createServer } = require('node:http');
const { Server } = require("socket.io");
const { join } = require('node:path');

const app = express()
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
})

connectDB();
const port = 3000

app.use(cors());
app.use(express.json());

// app.get('/', (req, res) => {
//   res.send("hello world")
// })

app.use(express.static(join(__dirname, "public")));
app.use("/uploads", express.static(join(__dirname, "uploads")));
app.use("/uploads/files", express.static(join(__dirname, "uploads/files")))

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, "public/index.html"));
});

app.use("/api/auth/", require("./routes/authRoutes"));
app.use("/api/chat/", require("./routes/chatRoutes"));


// Define a global object to store userId to socketId mappings
const userSockets = {};

io.on('connection', (socket) => {
    console.log("A user connected:", socket.id);

    // Listen for "join" event to associate a user id with the socket id.
    socket.on("join", (userId) => {
        userSockets[userId] = socket.id;
        console.log(`User ${userId} joined with socket id ${socket.id}`);
    });

    // Listen for the sendMessage event from a client.
    socket.on("sendMessage", async (data) => {
        // Update the event data to include the recipient's ID.
        const { senderId, receiverId, content, type } = data;

        console.log("sendMessage data:", data);

        // Save the message to your database.
        // const Message = require("./models/Message");
        // const message = new Message({ sender: senderId, receiver: receiverId, content, type: type || "text" });
        // await message.save();

        // Get the socket id for the receiver if they are online.
        const receiverSocketId = userSockets[receiverId];

        if (receiverSocketId) {
            // Send the message to the receiver.
            io.to(receiverSocketId).emit("receiveMessage", message);
        } else {
            console.log(`User with id ${receiverId} is not connected.`);
            // Optionally, handle offline messages or notify the sender.
        }
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
        // Remove the user from our mapping.
        for (const [userId, sId] of Object.entries(userSockets)) {
            if (sId === socket.id) {
                delete userSockets[userId];
                break;
            }
        }
    });
});



server.listen(port, () => {
    console.log(`server is running on port ${port}`)
})

