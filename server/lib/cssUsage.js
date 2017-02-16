var fs = require('fs');

function _$(selector, $) {
    try {
        var tmp = $(selector);
    } catch (e) {
        if (selector.match(pseudoClasses)) {
            return _$(selector.replace(pseudoClasses, ''));
        } else {
            return {};
        }
    }
    return tmp;
}

const cssParse = require('css-parse')
const _ = require("underscore");
const cheerio = require("cheerio");
const http = require("http");
const https = require("https");
const URL = require('url');
const urlReg = /^(https?):\/\//i;
const pseudoClasses = /\:hover|\:active|\:link|\:visited|\:after|\:before|\:focus/;


var CssUsage = function(html , options)  {
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

    defaultCssProtocol : "http:",

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

        styleObj.stylesheet.rules.forEach((item) => {
            if (item.type === 'rule') {
                var hasCache = false;
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

            selectorList.forEach((selector) => {
                var matchDom ;
                try{
                    matchDom = self.$(selector);
                }catch(e){
                    //console.warn(e);
                    if(selector.match(pseudoClasses , "")){
                        var selector2 = selector.replace(pseudoClasses , "")
                        matchDom = self.$(selector2, self.$);
                    }else {
                        matchDom = {};
                    }
                    //matchDom.replace(":")
                }
                //var matchDom = this.$(selector, self.$);
                if (matchDom.length || self.unchecks[selector]) {
                    ruleMap[selector] = null;
                    delete ruleMap[selector];
                } else {
                    ruleMap[selector].forEach((rule) => {;
                        rule.type = 'missing';
                    });
                }
            });


        return {
            styleStr: styleStr,
            selectorList: selectorList,
            ruleMap: ruleMap,
            styleObj : styleObj,
        }
    },
}

module.exports = CssUsage;