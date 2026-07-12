import express from "express";
import cors from "cors";
import { config } from "dotenv"; 
import { connectDB, disconnectDB } from "./config/db.js";

//import routes
import newRoute from "./routes/newroute.js";
import authroute from "./routes/authroutes.js";

config();
connectDB();

const app = express();

// Enable CORS for frontend requests
app.use(cors({ origin: "http://localhost:5173" }));

//Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/routes", newRoute);
app.use("/auth", authroute); 

app.get("/hello", (req, res) => {
    res.json({"message": "Hello World"});
});

const PORT = 5001; //run server on port 5001
const server = app.listen(PORT, () => {
    console.log(
      'Server is running successfully on port ' + PORT
    );
});

// Handle unhandled promise rejections (e.g., database connection errors)
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", async (err) => {
  console.error("Uncaught Exception:", err);
  await disconnectDB();
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
});


//https://localhost:5001/routes/
