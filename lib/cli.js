#!/usr/bin/env node

var scandalLocal = require("./scandalLocal")
var scandalOnline = require("./scandalOnline")
var path = require("path");
var ArgumentParser = require('argparse').ArgumentParser;

//var cssPath = "E:/wework/wwopenmngnjlogic/public/style/css/main.css";

//var searchPath = "E:/wework/wwopenmngnjlogic/public/js/sso";

main = function() {
    var argParser, options;
    argParser = new ArgumentParser({
        version: require('../package.json').version,
        addHelp: true,
        description: 'detect unused  css , if -p had set  , other param should ignore .'
    });
    argParser.addArgument(['-s', '--searchPath'] , {help : 'path for search'});
    argParser.addArgument(['-c', '--cssFile'] , {help : 'css for detect'});
    argParser.addArgument(['-i', '--include'] , {help : 'search include,eg: *.js,ex/**/*.js (default:*.js,*.tpl,*.html)'});

    argParser.addArgument(['-p', '--webpage'] , {help : 'detect unused css from web page,eg: http://www.qq.com/'});
    //argParser.addArgument(['-e', '--exportPath'] , {help : 'export report path , default : current path'});

    options = argParser.parseArgs();

    //console.log(options.searchPath)
    //console.log(options.cssFile)
    //console.log(path.join( options.cssFile))
    //return ;

    if(options.webpage){
        scandalOnline(options.webpage)
    }else   if (options.searchPath && options.cssFile) {
        var include = options.include? options.include.split(",") : null
        scandalLocal( path.join(options.cssFile)  , path.join(options.searchPath) , include);
    }
};

main();


