var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 8000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/newscrapr");

app.get("/scrape", function(req, res) {
  var promisesArray = [];
  axios.get("http://www.sciencemag.org/").then(function(response) {
    let $ = cheerio.load(response.data);

    //console.log($);
    $(".media__headline").each(function(i, element) {
      //debugger;
      let results = {};
      results.title = $(this)
        .children("a")
        .text();
      results.link =
        "http://www.sciencemag.org/" +
        $(this)
          .children("a")
          .attr("href");
      results.save = false;
      console.log(results.title);
      console.log(results.link);

      //results.push([title, link])
      //console.log(results);
      if (results.title && results.link) {
        promisesArray.push(
          db.Article.create(results).catch(err => {
            return err;
          })
        );
      }

      // .then(function(dbArticle) {
      //     console.log(dbArticle);
      //     res.send("scrape com;;plete");
      // })
      // .catch(function(err){
      //     return res.json(err);
      // });
      //return results;
    });
    /*   .catch(function(err) {
            console.log(err); */
    //console.log(promisesArray);
    Promise.all(promisesArray).then(function(values) {
      res.json(values);
    });
  });

  //res.end('scrape complete');
});
//get all articles
app.get("/articles", function(req, res) {
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

//populate article with a note
app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("Note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

//update and save an article's note
app.post("/articles/:id", function(req, res) {
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate(
        { _id: req.params.id },
        { note: dbNote._id },
        { new: true }
      );
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.delete("/articles/:id", function(res, res) {
  db.Note.delete(req.body)
    .then(function(dbNote) {
       return db.Note.findByIdAndRemove(
         {_id: req.params.id},
         { note: dbNote._id},
       )
    })
    .catch(function(erR) {
      res.json(err);
    })
})

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
