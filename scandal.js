
var path = require("path");
var PathScanner, PathSearcher, ref, search;

ref = require('scandal'), search = ref.search, PathScanner = ref.PathScanner, PathSearcher = ref.PathSearcher;

var searchPath, scanner, searcher;

searchPath = path.join(__dirname , "test" );

scanner = new PathScanner(searchPath, {
    excludeVcsIgnores: true
});

searcher = new PathSearcher()

searcher.on('results-found', function(result) {
    return console.log("Single Path's Results", result);
});


var name;

name = "Search " + searchPath;

console.time(name);

console.log(name);

search(/text/ig, scanner, searcher, function() {
    return console.timeEnd(name);
});