import mongoose from "mongoose";

export const connectDB = async () => {
	try{
		const conn = await mongoose.connect(process.env.DATABASE_URI);
		console.log(`mongoose db connected ${conn.connection.host}`);
	}
	catch(error){
		console.log(`error connecting to mongo db ${error.message}`);
		process.exit(1);
	}
}
