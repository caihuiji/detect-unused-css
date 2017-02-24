const getDom = require("./getDom/getDom");
const CssAnalyse = require("./cssAnalyse");
const compiler = new (require("./compiler"))();
const fs = require("fs");
const path = require("path");
const URL = require("url")

let urlReg = /^(https?):\/\//i;


var _render =  function (result, styleUrl, pageUrl) {
    var css = result.styleObj;

    var compileStr =  compiler.compile(css);
    var result = [
        '<!DOCTYPE html><html><head><title>CSS冗余Reviewer</title><meta charset="utf-8">',
        '<style>',
        fs.readFileSync(path.join(__dirname, "..", "css", 'reportStyle.css')),
        '</style>',
        '</head><body>',
        '<h2>css 冗余检测报告</h2>',
        '<p>检测页面 : '+pageUrl+'</p>',
        '<p>检测样式 : '+styleUrl+'</p>',
        '<p><b>统计结果： 总规则数：'+compiler.totalCount + ', 已使用：'+compiler.usedCount +'，使用比例：'+ Number(compiler.usedCount /compiler.totalCount).toFixed(4) * 100+'%</b></p>',
        '<pre><code class="hljs css">',
        compileStr,
        '</code></pre></body></html>'
    ];


    var exportPath =  path.join( process.cwd() , styleUrl.substring(styleUrl.lastIndexOf('/'))  ) + '.html';
    console.log("result exporting at " + exportPath + ".");
    fs.writeFileSync( exportPath , result.join(""));
}


module.exports= function (webpageUrl){

    console.log("fetch webpage : " + webpageUrl)
    getDom(webpageUrl).on('done', function (html) {
        // This is a cheerio instance

        var cssAnalyse = new CssAnalyse(html  );
        cssAnalyse.$('link[rel="stylesheet"]').each(function (key , value){
            var linkHref = URL.resolve(webpageUrl,  value.attribs.href)
            console.log("start detect style :" + linkHref )
            cssAnalyse.loadCssAndCheck( linkHref ).then(function (result){
                _render(result ,  linkHref , webpageUrl)
            }).catch(function (e){
                console.log(e);
            })


        })
    }).on('fail', function (why) {
        console.log(why);
    });
}