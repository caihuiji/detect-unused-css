const getDom = require("../server/lib/getDom/getDom");
const CssAnalyse = require("../server/lib/cssAnalyse");
const compiler = new (require("../server/lib/compiler"))();
const fs = require("fs");
const path = require("path");

let urlReg = /^(https?):\/\//i;

getDom('http://work.weixin.qq.com').on('done', function (html) {
    // This is a cheerio instance

    var cssAnalyse = new CssAnalyse(html  );
    cssAnalyse.$('link[rel="stylesheet"]').each(function (key , value){

        cssAnalyse.loadCssAndCheck( value.attribs.href).then(function (result){
            _render(result,  value.attribs.href , 'http://work.weixin.qq.com')
        }).catch(function (e){
            console.log(e);
        })


    })
    //console.log($("link").length);
}).on('fail', function (why) {
    console.log(why);
});


var _render =  function (result, styleUrl, pageUrl) {
    var css = result.styleObj;

    var compileStr =  compiler.compile(css);
    var result = [
        '<!DOCTYPE html><html><head><title>CSS冗余Reviewer</title><meta charset="utf-8">',
        '<style>',
        fs.readFileSync(__dirname + '/style.css'),
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
    fs.writeFileSync( path.join(__dirname , styleUrl.substring(styleUrl.lastIndexOf('/'))  ) + '.html' , result.join(""));
}