const express = require("express")
const app= express()
const User = require("./models/User");
const ejs = require("ejs");
const bodyparser = require("body-parser")
const mongoose = require("mongoose");
const passport = require("passport");
const { initializingPassport,isAuthenticated } = require("./passportConfig");
const expressSession = require("express-session");


// connect database
mongoose.connect("mongodb://localhost:27017/passport")
.then((e)=>console.log(`Connect to the MongoDB : ${e.connection.host}`))
.catch((err)=>console.log(err));

initializingPassport(passport);


// middleware
app.use(express.json());
app.use(bodyparser.json())
app.use(express.urlencoded({ extended : true }))
app.use(expressSession({secret:"secret",resave:"false",
saveUninitialized:false}));
app.use(passport.initialize());
app.use(passport.session());


app.set("view engine","ejs");


app.get("/",(req,res)=>{
    res.render("index")
})
app.get("/register",(req,res)=>{
    res.render("register")
})
app.get("/login",(req,res)=>{
    res.render("login")
})

app.post("/register", async(req,res)=>{

    const user =  await User.findOne({username:req.body.username});

    if(user) return res.status(400).send("User already exist")
    
    const newUser =  await User.create(req.body);

    res.status(201).send(newUser);

})


app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/register', successRedirect:"/profile" }));


app.get("/profile",isAuthenticated, (req,res)=>{
    res.send(req.user);
});

app.get("/logout",(req,res)=>{
    req.logout();
    res.send("logged out");
});

const port = process.env.PORT || 3000;
app.listen(port , ()=>{
    console.log(`server running on port ${port}`);
})