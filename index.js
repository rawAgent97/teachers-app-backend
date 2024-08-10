const express = require('express');
const mongoose = require('mongoose');
const dotEnv = require("dotenv")
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const studentRoutes=require("./routes/students")
const cors = require('cors');
dotEnv.config()
const app = express();
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000' // Replace with your front-end URL
}));

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("MongoDB Connected Successfully")
})
.catch((error)=>{
    console.log("error generated")
console.log(error)
})

// Use routes
app.use('/auth', authRoutes);
app.use('/students', studentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

