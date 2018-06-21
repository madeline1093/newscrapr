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
        let $ = cheerio.load(response.data);
        //console.log($);
        $(".media__headline").each(function(i, element) {
            //debugger;
            let results = {};
            results.title = $(this).children("a").text();
            results.link = "http://www.sciencemag.org/" + $(this).children("a").attr("href");
            //console.log(results.title);
            //console.log(results.link);
            
             
                //results.push([title, link])
                //console.log(results);
                
            

              db.Article.create(results)
                .then(function(dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function(err){
                    return res.json(err);
                }); 
                //return results;
            })
       /*   .catch(function(err) {
            console.log(err); */
        }); 
        res.end();
       
    });



app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });