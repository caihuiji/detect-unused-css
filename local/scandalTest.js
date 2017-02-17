const ArgumentParser = require('argparse').ArgumentParser;
const cssParse = require('css-parse')
const fs = require("fs");

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


//selectorList.forEach(function(selector){
//  console.log(selector)
//})


/*
pathSearcher.on('results-found' , (result)=>{
    console.log(result)
})
*/

const pathSearcher = new (require("../lib/scandal/path-searcher")('E:/wework/wwopenmngnjlogic/public/js/' , {
    excludeVcsIgnores: true
}));


pathSearcher.searchPath(/console/gi ,'E:/wework/wwopenmngnjlogic/public/js/' , (result)=>{
    console.log(result)
})


