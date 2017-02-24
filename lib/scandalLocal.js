const cssParse = require('css-parse')
const fs = require("fs");
const path = require("path");
const _ = require("underscore");

var ref = require('scandal'), search = ref.search, PathScanner = ref.PathScanner;
const PathSearcher = require("../lib/scandal/path-searcher");

const pseudoClasses = /\:hover|\:active|\:link|\:visited|\:after|\:before|\:focus/gi;

const innerClasses = /media|supports/;


var getWordMap = function (styleStr) {
    var selectorList = []
        , ruleMap = {};

    var styleObj = cssParse(styleStr);

    var getClassAndId = function (selector) {

        var arr = [], start = -1;
        for (var i = 0; i < selector.length; i++) {
            var char = selector.charAt(i)

            if (char.match(/[a-zA-Z_-]/)) {
                if (i == selector.length - 1 && start != -1) {
                    arr.push(selector.substring(start, i + 1))
                }
                continue;
            }
            if (start != -1) {
                arr.push(selector.substring(start, i))
                start = -1;
                //continue;
            }

            if (char == "#" || char == ".") {
                start = i;
            }
        }


        return arr

    }

    var str = [];

//取出selector ，并排重
    styleObj.stylesheet.rules.forEach((item) => {
        var hasCache = false;
        if (item.type === 'rule') {
            item.selectors.forEach((selector) => {
                str = [];
                str.push(selector + " ==> ")
                var classAndIdSelector = getClassAndId(selector);

                classAndIdSelector.forEach(function (selectorItem) {
                    str.push(selectorItem + " ")

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
                        str.push(selector + " ==>  ")
                        var classAndIdSelector = getClassAndId(selector);

                        classAndIdSelector.forEach(function (selectorItem) {
                            str.push(selectorItem + " ")

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

    var wordMap = {};
    selectorList.forEach(function (selectorItem) {
        wordMap[selectorItem.replace(/\.|#/gi, "")] = {selectorName: selectorItem, foundFileList: {}, matched: false};
    })

    return wordMap;
}


var analysis = function (wordMap , searchPath ,  inclusions , callback  ) {

//workMap = {"text" : { selectorName : "text" , foundFileList : {} , matched : false} }
    var searcher = new PathSearcher({
        wordMap: wordMap,
        mode: "one"
    });


    var scanner = new PathScanner(searchPath, {
        excludeVcsIgnores: true,
        inclusions: inclusions || ["*.js", "*.tpl", "*.html"]
    });


    var name = "Search " + searchPath;

    console.time(name);
    console.log(name);


    searcher.on('search-done', function (result) {
        console.log(result.filePath + " finished");
    });


    search(/b/ig, scanner, searcher, function (result) {

        var missSelector = {};
        var usedCount = 0, totalCount = 0;
        _.each(searcher.wordMap, function (matchMap, word) {
            totalCount++;

            /* if(Object.keys(matchMap).length == 1){
             console.log("word : " + word + " selectorName :" + matchMap.selectorName )
             console.log("miss");
             }*/

            if (searcher.mode == "one") {
                if (!matchMap.matched) {
                    missSelector[word] = matchMap;
                    //console.log("word : " + word + " selectorName :" + matchMap.selectorName  +"  miss");
                } else {
                    usedCount++;
                }
            } else {

                //console.log("word : " + word + " selectorName :" + matchMap.selectorName  );
                _.each(matchMap.foundFileList, function (matchObj, fileName) {


                    //console.log("   " + fileName + "")
                    if (matchObj.length) {
                        matchObj.forEach(function (matchItem) {

                            //console.log("   L" + matchItem.range[0][0] +"  " + matchItem.lineText + "")

                        })
                    }
                    //console.log(" -------------   ");
                })
            }
        })

        console.timeEnd(name);
        console.log("analysis total : " + totalCount)

        callback({missSelector: missSelector, usedCount: usedCount, totalCount: totalCount})

    });
}

var findWord = function (wordMap , filePath , callback){
    var searcher = new PathSearcher({
        wordMap: wordMap,
        mode: "all"
    });

    searcher.searchPath(null , filePath , callback)
}

var render = function (result, cssFilePath, exportPath , searchPath , inclusions) {

    var str = [];
    _.each(result.missSelector, function (value) {
        str.push('<span class="hljs-class" >' + value.selectorName + '</span>\n')
        var matchArr = value.foundFileList[cssFilePath]
        //    <span class="hljs-rule"><span class="hljs-attribute">font-size</span>:<span class="hljs-value"> <span class="hljs-hexcolor">18px</span></span></span>
        str.push('<span class="hljs-rule">')
        _.each(matchArr , function (matchItem){
            str.push('<span style="display:inline-block;padding:3px 0 3px 15px;">')
            str.push('<span class="hljs-value"><span class="hljs-hexcolor">'+" L " + matchItem.range[0][0] + "</span></span>&nbsp;:&nbsp;")

            str.push('<span class="hljs-attribute">' + matchItem.lineText.replace(value.selectorName , '<span class="match-keyword">' + value.selectorName +'</span>') + "</span>")
            //console.log("   L " + matchItem.range[0][0] +"  " + matchItem.lineText + "")
            str.push('</span>')
            str.push('\n')
        })

        str.push('</span>')
        str.push("\n\n")

    })

    var result = [
        '<!DOCTYPE html><html><head><title>CSS冗余Reviewer</title><meta charset="utf-8">',
        '<style>',
        fs.readFileSync(path.join(__dirname, "..", "css", 'reportStyle.css')),
        '</style>',
        '</head><body>',
        '<h2>Css 冗余检测报告</h2>',
        '<p>扫描目录 : ' + searchPath + '</p>',
        '<p>检测样式 : ' + cssFilePath + '</p>',
        '<div style="font-size: 12px;">',
        '<p style=""> <b>注意：</b>' +
        '<p>1. 只提取 .xxx 和 #xxx 进行分析</p>',
        '<p>2. 检测文件类型： '+ inclusions.join(",")+'</p>',
        '</div>',

        '<p><b>共提取了：' + result.totalCount + '个规则, 已使用：' + result.usedCount + '，使用比例：' + Number(result.usedCount / result.totalCount).toFixed(4) * 100 + '%，未使用规则列表如下：</b></p>',
        '<hr/>',
        '<pre><code class="hljs css">',
        str.join(""),
        '</code></pre>',
        '</body></html>'
    ];
    fs.writeFileSync( exportPath , result.join(""));
}


module.exports =  function (cssFilePath, searchPath , inclusions , exportPath) {
        if (!fs.existsSync(cssFilePath)) {
            console.log("could not found cssFilePath " + cssFilePath)
            return;
        }

        if (!fs.existsSync(searchPath)) {
            console.log("could not found searchPath " + searchPath)
            return;
        }

        var stat = null;
        try {
            stat = fs.statSync(searchPath);
        } catch (_error) {
        }

        if (!stat || !stat.isDirectory() ) {
          console.log("searchPath should be directory" )
          return;
        }



    //var cssPath = "E:/wework/weworkadminnjlogic/public/style/css/main.css";
        //var searchPath = "E:/wework/weworkadminnjlogic/public";



        var styleStr = fs.readFileSync(cssFilePath).toString();
        var name = cssFilePath.substring(cssFilePath.lastIndexOf(path.sep));

        var exportPath =  path.join(process.cwd() , name + ".html");
         analysis (getWordMap(styleStr) , searchPath ,  inclusions,  function (result){
             console.log("result exporting at " + exportPath + ".");
             findWord( result.missSelector , cssFilePath,function (){
                 render(result , cssFilePath , exportPath , searchPath , inclusions)
                 console.log("finished.");
             })

        } )
}












