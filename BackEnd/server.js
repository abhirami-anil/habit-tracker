const express=require('express')
const mongoose=require('mongoose')
const app=express()

const port= 3000
require('dotenv').config()
const cors=require('cors')
const user=require('./Routes/userRoute')
const adminRoute = require('./Routes/adminRoute');
 
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log("DB connected");
    
}).catch((error)=>{
    console.log(error);
})

app.use("/User", user)
app.use("/Admin",adminRoute);
 
app.listen(port, ()=>{
    console.log(`port is running at http://locathost:${port}`);
    
})
