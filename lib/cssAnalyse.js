var fs = require('fs');

const cssParse = require('css-parse')
const _ = require("underscore");
const cheerio = require("cheerio");
const http = require("http");
const https = require("https");
const URL = require('url');
const urlReg = /^(https?):\/\//i;
const pseudoClasses = /\:hover|\:active|\:link|\:visited|\:after|\:before|\:focus/;
const innerClasses = /media|supports/;


var CssUsage = function (html, options) {
    if (_.isString(html)) {
        this.html = html
        this.$ = cheerio.load(html);
    } else {
        this.$ = html;
    }

    this.unchecks = {};
    options = options || {};
    (options.unchecks || []).forEach((selector) => {
        this.unchecks[selector] = true;
    })

}

CssUsage.prototype = {

    defaultCssProtocol: "http:",

    loadCssAndCheck (href) {

        let match = href.match(urlReg)
        let error = new Error("fail to load " + href);
        let promiseFulfill, promiseReject;
        let promise = new Promise(function (fulfill, reject) {
            promiseFulfill = fulfill;
            promiseReject = reject;
        })

        if (!match) {
            href = this.defaultCssProtocol + href;
            match = href.match(urlReg)
            /*     process.nextTick(function (){
             promiseReject(error);
             })
             return;*/
        }

        var httpLib = (match[1].toLowerCase() === 'http') ? http : https
            , opts = URL.parse(href);
        opts.agent = false;
        opts.method = 'GET';

        let req = httpLib.request(opts, (res) => {
            let statusCode = res.statusCode;
            if (statusCode === 200) {
                var buffers = [];
                res.on('data', (chunk) => {
                    buffers.push(chunk);
                })

                res.on('end', () => {
                    promiseFulfill(this.checkCSS(Buffer.concat(buffers).toString()));
                })
            } else if (300 < statusCode && statusCode < 304) {
                req.abort();
                this.loadCssAndCheck(res.headers.location).then(function (data) {
                    promiseFulfill(data)
                })
            } else {
                promiseReject(error);
            }
        });

        req.on('error', function (err) {
            req.abort();
            promiseReject(err)
        });
        req.end();


        return promise;
    },

    /*  _ignore : function (selector){
     if(selector.replace(":link") > -1 ||
     selector.indexOf(":visited") > -1 ||
     selector.indexOf(":hover") > -1 ||
     selector.indexOf(":active ") > -1){
     return
     }
     },*/
    checkCSS (styleStr) {
        var self = this
            , selectorList = []
            , ruleMap = {};

        var styleObj = cssParse(styleStr);

        //取出selector ，并排重
        styleObj.stylesheet.rules.forEach((item) => {
            var hasCache = false;
            if (item.type === 'rule') {
                item.selectors.forEach((selector) => {
                    !ruleMap[selector] &&
                    (ruleMap[selector] = []) &&
                    selectorList.push(selector);

                    // 同一个 rule 存在相同 selector , 过滤之
                    !hasCache &&
                    (hasCache = true) &&
                    ruleMap[selector].push(item);
                });
            } else if (item.type.match(innerClasses)) {

                item.rules.forEach((item) => {
                    if (item.type === 'rule') {
                        item.selectors.forEach((selector) => {
                            !ruleMap[selector] &&
                            (ruleMap[selector] = []) &&
                            selectorList.push(selector);

                            !hasCache &&
                            (hasCache = true) &&
                            ruleMap[selector].push(item);
                        });
                    }
                })
            }
        })

        selectorList.forEach((selector) => {
            var matchDom;
            try {
                matchDom = self.$(selector);
            } catch (e) {
                //console.warn(e);
                if (selector.match(pseudoClasses, "")) {
                    var selector2 = selector.replace(pseudoClasses, "")
                    matchDom = self.$(selector2, self.$);
                } else {
                    matchDom = {};
                }
                //matchDom.replace(":")
            }
            //var matchDom = this.$(selector, self.$);
            if (matchDom.length || self.unchecks[selector]) {
                ruleMap[selector] = null;
                delete ruleMap[selector];
            } else {
                ruleMap[selector].forEach((rule) => {
                    rule.orgType = rule.type
                    rule.type = 'missing';
                });
            }
        });


        return {
            styleStr: styleStr,
            selectorList: selectorList,
            ruleMap: ruleMap,
            styleObj: styleObj,
        }
    },
}

module.exports = CssUsage;