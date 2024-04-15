import mongoose from "mongoose";

async function connectDB(){
    try {
        let conn = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
       console.log(`Connected to DB Successfully! - ${conn.connection.host}`.cyan.underline);
    } catch (error) {
        console.log(`Error Connecting to DB - ${error.message}`.red.bold);
    }
}

export default connectDB;
