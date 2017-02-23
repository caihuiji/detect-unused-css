(function() {
  var ChunkedExecutor, ChunkedLineReader, EventEmitter, LINE_END_REGEX, MAX_LINE_LENGTH, PathSearcher, TRAILING_LINE_END_REGEX, WORD_BREAK_REGEX, fs, os,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  var _ = require("underscore");
  fs = require("fs");

  os = require("os");

  EventEmitter = require("events").EventEmitter;

  //ChunkedExecutor = require("./chunked-executor");

  ChunkedLineReader = require("./chunked-line-reader");

  MAX_LINE_LENGTH = 100;

  WORD_BREAK_REGEX = /[ \r\n\t;:?=&\/]/;

  LINE_END_REGEX = /\r\n|\n|\r/;

  TRAILING_LINE_END_REGEX = /\r?\n?$/;

  module.exports = PathSearcher = (function(superClass) {
    extend(PathSearcher, superClass);

    function PathSearcher(arg) {
      var ref;
      ref = arg != null ? arg : {}, this.maxLineLength = ref.maxLineLength, this.wordBreakRegex = ref.wordBreakRegex;
      if (this.maxLineLength == null) {
        this.maxLineLength = MAX_LINE_LENGTH;
      }
      if (this.wordBreakRegex == null) {
        this.wordBreakRegex = WORD_BREAK_REGEX;
      }

      this.wordMap = _.extend(arg.wordMap || {});

      //  all - found from all file
      //  one - stop match when one file match
      this.mode = arg.mode
    }


    /*
    Section: Searching
     */

   /* PathSearcher.prototype.searchPaths = function(regex, paths, doneCallback) {
      var errors, results, searchPath;
      errors = null;
      results = null;
      searchPath = (function(_this) {
        return function(filePath, pathCallback) {
          return _this.searchPath(regex, filePath, function(pathResult, error) {
            if (pathResult) {
              if (results == null) {
                results = [];
              }
              results.push(pathResult);
            }
            if (error) {
              if (errors == null) {
                errors = [];
              }
              errors.push(error);
            }
            return pathCallback();
          });
        };
      })(this);
      return new ChunkedExecutor(paths, searchPath).execute(function() {
        return doneCallback(results, errors);
      });
    };*/

    PathSearcher.prototype.searchPath = function(regex, filePath, doneCallback) {
      var self = this;
      var wordMap = this.wordMap;
      var error, lineNumber, matches, reader;
      matches = null;
      lineNumber = 0;
      reader = new ChunkedLineReader(filePath);
      error = null;
      reader.on('error', (function(_this) {
        return function(e) {
          error = e;
          return _this.emit('file-error', error);
        };
      })(this));
      reader.on('end', (function(_this) {
        return function() {
          var output = { filePath: filePath};
         /* if (matches != null ? matches.length : void 0) {
            output = {
              filePath: filePath,
              //matches: matches,
              wordMap : wordMap,
            };
            _this.emit('results-found', output);
          } else {
            _this.emit('results-not-found', filePath);
          }*/

          _this.emit('search-done', output);
          return doneCallback(output, error);
        };
      })(this));
      reader.on('data', (function(_this) {
        return function(chunk) {
          var j, len1, line, lineMatches, lines, match;
          lines = chunk.toString().replace(TRAILING_LINE_END_REGEX, '').split(LINE_END_REGEX);

          for (j = 0, len1 = lines.length; j < len1; j++) {
            line = lines[j];

            lineNumber++
            Object.keys(wordMap).forEach(function (wordKey){

              if(self.mode == "one" && wordMap[wordKey]["matched"]){
                return ;
              }

              if (!wordMap[wordKey]["foundFileList"][filePath]  ){
                wordMap[wordKey]["foundFileList"][filePath] = [];
              }

              var regex = new RegExp( "\\b" + wordKey  + "\\b", 'g');
              lineMatches = _this.searchLine(regex, line, lineNumber);
              if (lineMatches != null) {
                if (matches == null) {
                  matches = [];
                }
                var k, len2;
                for (k = 0, len2 = lineMatches.length; k < len2; k++) {
                  match = lineMatches[k];
                  matches.push(match);
                  wordMap[wordKey]["foundFileList"][filePath].push(match);
                  if(self.mode == "one"){
                    wordMap[wordKey]["matched"] = true;
                  }
                }
              }

            })

          }
        };
      })(this));
    };

   /* PathSearcher.prototype.searchPath = function(regex, filePath, doneCallback) {
      var error, lineNumber, matches, reader;
      matches = null;
      lineNumber = 0;
      reader = new ChunkedLineReader(filePath);
      error = null;
      reader.on('error', (function(_this) {
        return function(e) {
          error = e;
          return _this.emit('file-error', error);
        };
      })(this));
      reader.on('end', (function(_this) {
        return function() {
          var output;
          if (matches != null ? matches.length : void 0) {
            output = {
              filePath: filePath,
              matches: matches
            };
            _this.emit('results-found', output);
          } else {
            _this.emit('results-not-found', filePath);
          }
          return doneCallback(output, error);
        };
      })(this));
      reader.on('data', (function(_this) {
        return function(chunk) {
          var j, len1, line, lineMatches, lines, match, results1;
          lines = chunk.toString().replace(TRAILING_LINE_END_REGEX, '').split(LINE_END_REGEX);
          results1 = [];
          for (j = 0, len1 = lines.length; j < len1; j++) {
            line = lines[j];
            lineMatches = _this.searchLine(regex, line, lineNumber++);
            if (lineMatches != null) {
              if (matches == null) {
                matches = [];
              }
              results1.push((function() {
                var k, len2, results2;
                results2 = [];
                for (k = 0, len2 = lineMatches.length; k < len2; k++) {
                  match = lineMatches[k];
                  results2.push(matches.push(match));
                }
                return results2;
              })());
            } else {
              results1.push(void 0);
            }
          }
          return results1;
        };
      })(this));
    };
*/
    PathSearcher.prototype.searchLine = function(regex, line, lineNumber) {
      var lineText, lineTextEndOffset, lineTextLength, lineTextOffset, matchEndIndex, matchIndex, matchLength, matchText, matches, range;
      matches = null;
      lineTextOffset = 0;
      while (regex.test(line)) {
        lineTextOffset = 0;
        lineTextLength = line.length;
        matchText = RegExp.lastMatch;
        matchLength = matchText.length;
        matchIndex = regex.lastIndex - matchLength;
        matchEndIndex = regex.lastIndex;
        if (lineTextLength < this.maxLineLength) {
          lineText = line;
        } else {
          lineTextOffset = Math.round(matchIndex - (this.maxLineLength - matchLength) / 2);
          lineTextEndOffset = lineTextOffset + this.maxLineLength;
          if (lineTextOffset <= 0) {
            lineTextOffset = 0;
            lineTextEndOffset = this.maxLineLength;
          } else if (lineTextEndOffset > lineTextLength - 2) {
            lineTextEndOffset = lineTextLength - 1;
            lineTextOffset = lineTextEndOffset - this.maxLineLength;
          }
          lineTextOffset = this.findWordBreak(line, lineTextOffset, -1);
          lineTextEndOffset = this.findWordBreak(line, lineTextEndOffset, 1) + 1;
          lineTextLength = lineTextEndOffset - lineTextOffset;
          lineText = line.substr(lineTextOffset, lineTextLength);
        }
        range = [[lineNumber, matchIndex], [lineNumber, matchEndIndex]];
        if (matches == null) {
          matches = [];
        }
        matches.push({
          matchText: matchText,
          lineText: lineText,
          lineTextOffset: lineTextOffset,
          range: range
        });
      }
      regex.lastIndex = 0;
      return matches;
    };

    PathSearcher.prototype.findWordBreak = function(line, offset, increment) {
      var checkIndex, i, len, maxIndex;
      i = offset;
      len = line.length;
      maxIndex = len - 1;
      while (i < len && i >= 0) {
        checkIndex = i + increment;
        if (this.wordBreakRegex.test(line[checkIndex])) {
          return i;
        }
        i = checkIndex;
      }
      if (i < 0) {
        return 0;
      }
      if (i > maxIndex) {
        return maxIndex;
      }
      return i;
    };

    return PathSearcher;

  })(EventEmitter);

}).call(this);
