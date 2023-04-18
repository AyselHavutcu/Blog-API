//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const lodash = require("lodash");
const  mongoose = require('mongoose')

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static("public"));

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


app.get("/", function(req, res){
  post.find().then(function(foundedPosts){
    res.render('home', {content: '',posts:foundedPosts});

  }).catch(function(err){
    res.render('home', {content: '',posts: [defaultPost]});
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


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
