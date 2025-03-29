import dotenv from "dotenv";
import mongoose from "mongoose";

// const envPath = path.resolve(, '../.env'); // Adjust the path as needed

dotenv.config({ path: "config.env" });

const url = process.env.DatabaseUrl || "default-fallback-url";

mongoose.connect(url);

const db = mongoose.connection;

//  const client = new MongoClient(url);

//  async function connect() {
//     try {
//         await client.connect();
//         console.log("connected to mongodb");
//     } catch (err) {
//         console.error('error connecting to mongoDB' , err);

//     }
//  }

//  function getDB(){
//     return client.db(name);
//  }

export default mongoose;
export { db };
