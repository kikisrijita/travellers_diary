const express = require("express");
const connectDB = require("./config/db");

const app = express();

//connect Database
connectDB();

//making uploads publicly available
app.use("/uploads", express.static("uploads"));
//Init Middleware
app.use(express.json({ extended: false }));

app.get("/", (req, res) => res.send("API Running"));

//Define Routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/tours", require("./routes/api/tours"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
