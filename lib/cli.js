#!/usr/bin/env node

var scandalLocal = require("../local/scandalLocal")
var path = require("path");
var ArgumentParser = require('argparse').ArgumentParser;

//var cssPath = "E:/wework/wwopenmngnjlogic/public/style/css/main.css";

//var searchPath = "E:/wework/wwopenmngnjlogic/public/js/sso";

main = function() {
    var argParser, options;
    argParser = new ArgumentParser({
        version: require('../package.json').version,
        addHelp: true,
        description: 'detect unused  css '
    });
    argParser.addArgument(['-s', '--searchPath'] , {help : 'path for search'});
    argParser.addArgument(['-c', '--cssFile'] , {help : 'css for detect'});
    argParser.addArgument(['-i', '--include'] , {help : 'search include , default : *.js,*.tpl,*.html'});
    //argParser.addArgument(['-e', '--exportPath'] , {help : 'export report path , default : current path'});

    options = argParser.parseArgs();

    //console.log(options.searchPath)
    //console.log(options.cssFile)
    //console.log(path.join( options.cssFile))
    //return ;
    if (options.searchPath && options.cssFile) {
        var include = options.include? options.include.split(",") : ["*.js", "*.tpl", "*.html"]
        scandalLocal( path.join(options.cssFile)  , path.join(options.searchPath) , include);
    }
};

main();


