const getDom = require("../server/lib/getDom/getDom");
const CssUsage = require("../server/lib/cssUsage");
const compiler = new (require("../server/lib/compiler"))();
const fs = require("fs");

let urlReg = /^(https?):\/\//i;

getDom('http://work.weixin.qq.com').on('done', function (html) {
    // This is a cheerio instance

    var cssUsage = new CssUsage(html  );
    cssUsage.$('link[rel="stylesheet"]').each(function (key , value){

        cssUsage.loadCssAndCheck( value.attribs.href).then(function (result){
            _render(result.styleObj , value.attribs.href)
        }).catch(function (e){
            console.log(e);
        })


    })
    //console.log($("link").length);
}).on('fail', function (why) {
    console.log(why);
});


var _render =  function (css, href, selectorList, ruleMap) {
    var result = [
        '<!DOCTYPE html><html><head><title>CSS冗余Reviewer</title><meta charset="utf-8">',
        '<style>',
        fs.readFileSync(__dirname + '/style.css'),
        '</style>',
        '</head><body>',
        '<h3>' + href + '</h3>',
        '<pre><code class="hljs css">',
        compiler.compile(css),
        '</code></pre></body></html>'
    ];
    fs.writeFileSync( __dirname +  href.substring(href.lastIndexOf('/'), href.length) + '.html' , result.join(''));
}