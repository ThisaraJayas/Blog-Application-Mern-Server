const express = require('express');
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt') //password encryption
const jwt = require('jsonwebtoken') //create session
const cookieParser = require('cookie-parser')
const multer = require('multer')
const uploadMiddleware = multer({dest: 'uploads/'}) //file upload destination
const fs = require('fs')//fs is file system we need to convert file extension
const Post = require('./models/Post')

const app = express();

const salt= bcrypt.genSaltSync(10)//password encryption
const secret = 'dh43bjfnsnjsn839nmncxr3' //used in jsw Token

app.use(cors({credentials:true, origin:'http://localhost:3000'})) //include additional info to cookie
app.use(express.json())
app.use(cookieParser())
app.use('/uploads',express.static(__dirname + '/uploads'))

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


//npm install multer
//this code section is to getimage when upload and store it to upload file
app.post('/post', uploadMiddleware.single('file'),async(req,res)=>{
    const {originalname,path} = req.file
    const parts = originalname.split('.')
    const ext = parts[parts.length -1]
    const newPath = path+'.'+ext
    fs.renameSync(path, newPath)

    const {token} = req.cookies
    jwt.verify(token, secret, {}, async (err,info)=>{
        if(err) throw err
        //now to grab other information
    const {title,summary,content} = req.body
    //postDoc means database
const postDoc =await Post.create({
    //there we define in Post.js class
    title,
    summary,
    content,
    cover: newPath,
    author: info.id,
})
res.json(postDoc)
    })

    
    
})
app.get('/post', async(req,res)=>{
     //we define find because we need to get all the data

     
    res.json(await Post.find()
    //we add populate to get author username
    .populate('author',['username'])
    //this will sort last added post at top
    .sort({createdAt: -1})
    //if 5000 post there it show only 20
    .limit(20)
    )
})
app.get('/post/:id',async(req,res)=>{
    const {id} = req.params
    const postDoc = await Post.findById(id).populate('author',['username'])
    res.json(postDoc)
})
app.listen(4000)