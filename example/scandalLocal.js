var scandalLocal = require("../local/scandalLocal")
var path = require("path");


var include = ["*.html"]
scandalLocal( path.join(__dirname , "test.css")  , path.join(__dirname ) , include);


