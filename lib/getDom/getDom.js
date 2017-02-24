/*!
 * url-dom
 * Copyright (c) 2013 Daniel Yang <miniflycn@justany.net>
 * Copyright (c) 2014 QQEDU TEAM
 * MIT Licensed
 */
module.exports = (function () {
  "use strict";
  var spawn = require('child_process').spawn
    , EventEmitter = require('events').EventEmitter
    , util = require('util')
    , moment = require("moment")


  var path = require("path");

  var count = 0;
  /** 
   * DOM
   * @param {String} url
   */
  function GetDom(url) {
    if (!(this instanceof GetDom)) return new GetDom(url);
    EventEmitter.call(this);
    var init = this.init.bind(this);
    process.nextTick(function () {
      init(url);
    });
  }
  util.inherits(GetDom, EventEmitter);
  GetDom.prototype.init = function (url) {
    var id = moment().format("YYYY_MM_DD_") +  (new Date-0)
    //console.log([path.join(__dirname , 'fetch.js')].concat( path.join(__dirname ,"..","..",".." , 'tmp' , id +".png") ).concat(url) )
    var worker = spawn('phantomjs', [path.join(__dirname , 'fetch.js')].concat( path.join(__dirname ,"..","..",".." , 'tmp' , id +".png") ).concat(url) )
      , that = this
      , buffers = [];
    worker.stdout.on('data', function (buffer) {
      buffers.push(buffer);
    });
    worker.stdout.on('end', function () {
      var result = Buffer.concat(buffers);
      //console.log(result.toString())
      var resultString = result.toString();

      if(resultString.indexOf("$$%%_%%$$")  >-1){
        var arr = resultString.split("$$%%_%%$$");
        console.log(arr[0])
        that.emit('done', arr[1] );
      }
    });
    worker.stderr.on('data', function (data) {
      that.emit('fail', data.toString());
    });
    worker.on('close', function (code) {
      that.emit('close', code);
    });

    worker.on('error', function (code) {
      console.log('Failed to run phantomjs.');
      that.emit('close', code);
    });

    return this;
  };
  /** 
   * success
   * @param {Function} cb
   */
  GetDom.prototype.success = function (cb) {
    this.on('done', cb);
    return this;
  };
  /**
   * fail
   * @param {Function} cb
   */
  GetDom.prototype.fail = function (cb) {
    this.on('fail', cb);
    return this;
  };

  return GetDom;
})();