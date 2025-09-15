import express from 'express';
import "dotenv/config";
import cors from "cors";
import connectDB from './configs/db.js';
import userRouter from './routes/userRoutes.js';

// initialize express
const app = express()

// connect database
await connectDB()

// middleware
app.use(cors())
app.use(express.json());

app.get('/', (req,res)=> res.send("server is running"))
app.use('/api/user', userRouter)

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>console.log(`server running on ${PORT}`))