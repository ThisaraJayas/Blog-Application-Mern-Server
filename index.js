const express = require('express');
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt') //password encryption
const jwt = require('jsonwebtoken') //create session
const cookieParser = require('cookie-parser')
const app = express();

const salt= bcrypt.genSaltSync(10)//password encryption
const secret = 'dh43bjfnsnjsn839nmncxr3' //used in jsw Token

app.use(cors({credentials:true, origin:'http://localhost:3000'})) //include additional info to cookie
app.use(express.json())
app.use(cookieParser())

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
        //create token
        //        username   grab userID from userDoc assign to id
        jwt.sign({username,id:userDoc.id}, secret, {} , (err,token)=>{
            if(err) throw err
            //send response as a cookie
            res.cookie('token',token).json({
                id:userDoc._id,
                username
            })
        })
    }else{
        res.status(400).json('Wrong Credentials')
    }
})

app.get('/profile', (req,res)=>{
    const {token} = req.cookies
    jwt.verify(token, secret, {}, (err,info)=>{
        if(err) throw err
        res.json(info)
    })
    res.json(req.cookies) //WE CREATE TO DISABLE REGISTER AND LOGIN BUTTON WHEN LOGIN
})
app.post('/logout', (req,res)=>{
    res.cookie('token','').json('ok')
})
app.listen(4000)