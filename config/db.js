const mongoose=require("mongoose")

// main().catch(err=>console.log(err))

async function connectDB() {
  try{
    await mongoose.connect('mongodb://127.0.0.1:27017/chatapp');
    // await mongoose.connect('mongodb+srv://naveen:naveen@chat-app.dj5tigl.mongodb.net/chat-app?retryWrites=true&w=majority&appName=chat-app')
  }catch(error){
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
}

module.exports = connectDB


