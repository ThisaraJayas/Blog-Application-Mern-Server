const express = require('express');
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt') //password encryption
const jst = require('jsonwebtoken') //create session
const app = express();

const salt= bcrypt.genSaltSync(10)//password encryption

app.use(cors())
app.use(express.json())

mongoose.connect('mongodb+srv://bullmoney0:Thisara@practice.fbucg2s.mongodb.net/?retryWrites=true&w=majority')

app.post('/register',async (req,res)=>{
    const {username,password} = req.body
    try{
        const userDoc = await User.create({
            username,
            password:bcrypt.hashSync(password,salt)//password encryption
        })
        res.json(userDoc)
    }catch(e){
        res.status(400).json(e)
    }
    // res.json({requestData:{username,password}}); We use to check wether response is going 
})
app.post('/login', async(req,res)=>{
    const {username,password} = req.body
    const userDoc = await User.findOne({username})
    const passOk = bcrypt.compareSync(password, userDoc.password)
    if(passOk){
        //logged in
    }else{
        res.status(400).json('Wrong Credentials')
    }
})


app.listen(4000)