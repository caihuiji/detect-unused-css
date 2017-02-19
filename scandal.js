
var path = require("path");
var PathScanner, PathSearcher, ref, search;

ref = require('scandal'), search = ref.search, PathScanner = ref.PathScanner, PathSearcher = ref.PathSearcher;

var searchPath, scanner, searcher;

searchPath = "E:/wework/wwopenmngnjlogic/public"

scanner = new PathScanner(searchPath, {
    excludeVcsIgnores: true
});

searcher = new PathSearcher()

searcher.on('results-found', function(result) {
    return console.log(result.filePath);
});


var name;

name = "Search " + searchPath;

console.time(name);

console.log(name);

search(/\btext\b/g, scanner, searcher, function() {
    return console.timeEnd(name);
});