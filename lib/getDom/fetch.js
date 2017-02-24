var page = require('webpage').create();
var system = require('system')

//var write = system.stdout.write;
//var error = system.stderr.write;

var argv = system.args.slice();

var fileName = argv[1];
var url = argv[2];

var pageW = 1280;
var pageH = 720;


page.viewportSize = {
    width: pageW,
    height: pageH
};

page.open(url, function(status) {
    //console.log("Status: " + status);
    if(status === "success") {
        console.log("export capture " + fileName);
        page.render(fileName);
        console.log("$$%%_%%$$")
        console.log(page.content)
        //write(page.content);
    }else if (status !== 'success') {
        console.log('fail to load the url: ' + url);
        console.log("$$%%_%%$$")
    }

    phantom.exit();
});
