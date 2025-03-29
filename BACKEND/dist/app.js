import express from "express";
import mongoose from "./mongo.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cors from "cors";
import globalErrorHandler from "./Repository/errorRepository.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import cookieParser from "cookie-parser";
import cartRoutes from "./routes/cartRoutes.js";
const app = express();
app.use(express.json());
app.use(cookieParser());
const corsOptions = {
    origin: true, // Allow requests from this origin
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"], // Include 'credentials' in the list of allowed headers
    credentials: true, // Allow credentials (cookies)
};
app.use(cors(corsOptions));
// Handle preflight requests
// app.options('*', cors({
//     origin: true, // Allow requests from any origin
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//     allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
//     credentials: true,
//     preflightContinue:false,
// }));
// app.use(cors(corsOptions));
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
mongoose.connection.on("error", (error) => {
    console.error("Error connecting to MongoDB:", error);
});
mongoose.connection.once("open", () => {
    console.log("Connected to MongoDB");
});
//routes
app.use("/user", userRoutes);
app.use("/product", productRoutes);
app.use("/category", categoryRoutes);
app.use("/order", orderRoutes);
app.use("/cart", cartRoutes);
app.use("/uploads", express.static("uploads"));
// handling all the errors that are not caught by specific handlers
app.use(globalErrorHandler);
const port = 5002;
app.listen(port, () => {
    console.log(`server is running at the port ${port}`);
});
