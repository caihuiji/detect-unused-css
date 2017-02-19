const ArgumentParser = require('argparse').ArgumentParser;
const cssParse = require('css-parse')
const fs = require("fs");
const _ = require("underscore");

const pseudoClasses = /\:hover|\:active|\:link|\:visited|\:after|\:before|\:focus/gi;

const innerClasses = /media|supports/;

var styleStr =  fs.readFileSync("E:/wework/wwopenmngnjlogic/public/style/css/main.css").toString();

var  selectorList = []
    , ruleMap = {};

var styleObj = cssParse(styleStr);

var getClassAndId = function (selector){

    var arr = [] , start = -1 ;
    for(var i= 0 ; i < selector.length ; i ++){
        var char = selector.charAt(i)

        if(char.match(/[a-zA-Z_-]/)  ){
            if(i == selector.length -1 && start != -1 ){
                arr.push(selector.substring(start,i+1))
            }
            continue;
        }
        if(start != -1){
            arr.push(selector.substring(start,i))
            start = -1;
            //continue;
        }

        if(char == "#" || char == "."){
            start = i;
        }
    }


 /*   var elements = selector.replace(/\[[^\]]+\]/ , "").replace(pseudoClasses , "").split(/\s|\:\:?|>|~|\*|\+/)

    elements.forEach(function (value , key){
        if(value && value.match(/^\.|^#/)){
            arr.push(value)
        }else {
        //    console.log("     remove ==> " + value)
        }*/
    //})

    return arr

}

var str = [];

//取出selector ，并排重
styleObj.stylesheet.rules.forEach((item) => {
    var hasCache = false;
    if (item.type === 'rule') {
        item.selectors.forEach((selector) => {
            str = [];
            str.push(selector + " ==> " )
            var classAndIdSelector = getClassAndId(selector);

            classAndIdSelector.forEach(function(selectorItem){
                str.push(selectorItem + " " )

                !ruleMap[selectorItem] &&
                (ruleMap[selectorItem] = []) &&
                selectorList.push(selectorItem);

                !hasCache &&
                (hasCache = true) &&
                ruleMap[selectorItem].push(item);
            })

          //  console.log(str.join("") + "\n");

        });
    } else if (item.type.match(innerClasses)) {

        item.rules.forEach((item) => {
            if (item.type === 'rule') {
                item.selectors.forEach((selector) => {
                    str = [];
                    str.push(selector + " ==>  " )
                    var classAndIdSelector = getClassAndId(selector);

                    classAndIdSelector.forEach(function(selectorItem){
                        str.push(selectorItem + " " )

                        !ruleMap[selectorItem] &&
                        (ruleMap[selectorItem] = []) &&
                        selectorItem.push(selectorItem);

                        !hasCache &&
                        (hasCache = true) &&
                        ruleMap[selectorItem].push(item);
                    })

                 //   console.log(str.join("") + "\n");
                });
            }
        })
    }
})




var workMap = {};
selectorList.forEach(function (selectorItem){
    workMap[ selectorItem.replace(/\.|#/gi , "")] = { selectorName : selectorItem , foundFileList : {} , matched : false};
})

const scandal = require("scandal");
var ref = require('scandal'), search = ref.search, PathScanner = ref.PathScanner;
const PathSearcher = require("../lib/scandal/path-searcher");

var searchPath = "E:/wework/wwopenmngnjlogic/public";


//workMap = {"text" : { selectorName : "text" , foundFileList : {} , matched : false} }
var searcher = new PathSearcher({
    wordMap : workMap,
    mode : "one"
});


var scanner = new PathScanner( searchPath, {
    excludeVcsIgnores: true,
    inclusions : ["*.js" , "*.tpl" , "*.html"]
});

/*
scanner.on("path-found" , function (path){
    console.log(path);
})

scanner.scan();
*/







var name;

name = "Search " + searchPath;

console.time(name);

console.log(name);

/*
scanner.on("path-found" , function (path){
    console.log(path);
})
*/

searcher.on('search-done', function(result) {
    console.log(result.filePath + " finished");
});

search(/b/ig, scanner, searcher, function(result) {


    var  matchCount = 0 , total = 0
    _.each( searcher.wordMap , function ( matchMap , word){

       /* if(Object.keys(matchMap).length == 1){
            console.log("word : " + word + " selectorName :" + matchMap.selectorName )
            console.log("miss");
        }*/

        if(searcher.mode == "one"){
            if(!matchMap.matched ){
                console.log("word : " + word + " selectorName :" + matchMap.selectorName  +"  miss");
            }
        }else {
            console.log("word : " + word + " selectorName :" + matchMap.selectorName  );
            _.each( matchMap.foundFileList , function ( matchObj , fileName){


                console.log("   " + fileName + "")
                if(matchObj.length){
                    matchObj.forEach(function (matchItem ){

                        console.log("   L" + matchItem.range[0][0] +"  " + matchItem.lineText + "")

                    })
                    matchCount ++ ;
                }
                console.log(" -------------   ");
            })
        }
    })

    console.log(matchCount , "  ", total)
    console.timeEnd(name);

});


