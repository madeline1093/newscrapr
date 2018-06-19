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



app.get("/scrape", function(req, res){
    axios.get("http://www.sciencemag.org/").then(function(response) {
        let $ = cheerio.load(response);
        
        $("div.media_body").each(function(i, element) {
            debugger;
            let results = [];
            let title = $(element).children("a").text();
            let link = "http://www.sciencemag.org/" + $(element).children("a").attr("href");
            console.log(title);
            
            if(title && link) {
                results.push([title, link])
                console.log(results);
                return results;
            }

            db.Article.create(results)
                .then(function(dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function(err){
                    return res.json(err);
                })
        })
/*         .catch(function(err) {
            console.log(err);
        }) */
        res.send("scrape complete");
       
    });
});


app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });