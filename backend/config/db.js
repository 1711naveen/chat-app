const mongoose=require("mongoose")

// main().catch(err=>console.log(err))

async function connectDB() {
  try{
    await mongoose.connect('mongodb://127.0.0.1:27017/chatapp')
  }catch(error){
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
}

module.exports = connectDB


