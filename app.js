//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const lodash = require("lodash");
const  mongoose = require('mongoose')

const app = express();
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const session = require('express-session');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static("public"));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));

//Set `strictQuery: false` to globally opt into filtering by properties that aren't in the schema
// Included because it removes preparatory warnings for Mongoose 7.
// See: https://mongoosejs.com/docs/migrating_to_6.html#strictquery-is-removed-and-replaced-by-strict
mongoose.set("strictQuery", false);

// Define the database URL to connect to.
const mongoDB = "mongodb://localhost:27017/journelDB";

// Wait for database to connect, logging an error if there is a problem
main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(mongoDB);
}

const defaultPost = {title:'Day 1', description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."}
const postSchema = new mongoose.Schema({
    title:String,
    description:String

});
const post = mongoose.model('post', postSchema);

const userSchema = new mongoose.Schema({
    email:String,
    password:String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('user', userSchema);


passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function(req, res){
  post.find().then(function(foundedPosts){
    res.render('home', {posts:foundedPosts, user:req.user},);

  }).catch(function(err){
    res.redirect('/');
  });
});
    

app.get("/about", function(req, res){
  res.render('about', {content: 'Hello, It is me , Aysel.'});
});

app.get("/contact", function(req, res){
  res.render('contact', {content: 'Contact to me from the email below.'});
});

app.get("/compose", function(req, res){
  res.render('compose');
});

app.post("/compose", function(req, res){
    const new_post = {
        title: req.body.postTitle,
        description: req.body.postDescription

    };
   post.find().then(function(foundedPosts){
        if(foundedPosts.length <= 0){
            post.create(defaultPost);
        }else{
          post.create(new_post);
        }
        res.redirect("/");

   }).catch(function(err){
       console.log(err);
   });

});


app.route("/posts/:postId")

.get(function(req, res){
  const postId = req.params.postId;
  post.findOne({_id: postId}).then(function(foundedPost){
    res.render('post', {post:foundedPost});

  }).catch(function(err){
      console.log(err);
      res.redirect("/");
  });
      
})
.put(function(req, res){
  const postId = req.params.postId;
  const updatedContent = req.body;
  post.findOneAndUpdate({_id: postId}, updatedContent).then(function(){
      res.redirect("/");
  }).catch(function(err){
      console.log(err);
  });
})
.delete(function(req, res){
  const postId = req.params.postId;
  post.findOneAndDelete({_id: postId}).then(function(){
    res.redirect("/");
  }).catch(function(err){
      console.log(err);
  });
})

app.get('/register', function(req, res){
  res.render('signup');
});

app.get('/login', function(req, res){
  res.render('login', {user:req.user});
});

app.post('/register', function(req, res){
   console.log(req.body.username);
   User.register(new User({username: req.body.username}), req.body.password).then( function(){
    passport.authenticate('local')(req, res, function () {
      res.redirect('/');
    });
  }).catch(function(err){
     console.log(err);
     res.render('signup');
  });
});

app.post('/login', passport.authenticate('local'), function(req, res){
  res.redirect('/');
});

app.get('/logout',function(req, res){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
 
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
