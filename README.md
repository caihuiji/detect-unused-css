#detect-unused-css
A CLI for detect unused css from webPage or local directory.
detect-unused-css provides two utilities:
 - Webpage , fetch webpage and detect which style rule is unused.
 - Local , specify a directory css file , and use specify a directory to detect which style rule is unused.
Unsurprisingly, these two things will generate a report for developer to remove unused style rule.


##Usage
``` javascript
 npm install detect-unused-css -g

#for webpage
 detect-unused-css -p http://www.qq.com
 
 #for local directory 
 detect-unused-css -s /home/data/usr/js  -c /home/data/usr/css/main.css 

```


##Options
- -h, --help            Show this help message and exit.
- -v, --version         Show program's version number and exit.
- -s,--searchPath       path for search
- -c,--cssFile          css for detect
- -i, --include         search include,eg: *.js,ex/**/*.js (default:*.js,*.tpl,*.html)
- -p, --webpage          detect unused css from web page,eg: http://www.qq.com/
>  if -p is set , other arguments will be ignored.
