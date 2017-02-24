var scandalLocal = require("../lib/scandalLocal")
var path = require("path");


var include = ["*.html"]
scandalLocal( path.join(__dirname , "test.css")  , path.join(__dirname ) , include);


