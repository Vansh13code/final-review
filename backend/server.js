import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import adminRouter from "./routes/adminRoute.js";

// app config
const app = express();
const port = process.env.PORT || 4000;

// Connect DB & Cloudinary
connectDB();
connectCloudinary();

// Middlewares
app.use(express.json());

// CORS for Vercel frontend
app.use(cors({
    origin: [
        "https://final-review-xekl.vercel.app"   // Your frontend URL on Vercel
        // Add admin URL here when you deploy admin:
        // "https://final-review-admin.vercel.app"
    ],
    credentials: true
}));

// API endpoints
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);

// Default route
app.get("/", (req, res) => {
  res.send("API Working");
});

// Server start
app.listen(port, () => console.log(`Server started on PORT:${port}`));
