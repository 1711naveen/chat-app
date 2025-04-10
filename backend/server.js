const express = require("express")
const connectDB = require("./config/db")
const cors = require("cors");
const { createServer } = require('node:http');
const { Server } = require("socket.io");

const app = express()
const server = createServer(app);
const io = new Server(server,{
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

connectDB();
const port = 3005

app.use(cors());
app.use(express.json());

// app.get('/', (req, res) => {
//   res.send("hello world")
// })
app.use("/api/auth/", require("./routes/authRoutes"));

app.listen(port, () => {
  console.log(`server is running on port ${port}`)
})
