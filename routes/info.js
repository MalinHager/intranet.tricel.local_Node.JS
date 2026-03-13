const express = require('express');
const router = express.Router();

var cookieParser = require('cookie-parser');
router.use(cookieParser());

const readHTML = require('./readHTML.js');
var fs = require('fs');
const path = require('path');

router.use(express.static('./public'));

const pug = require('pug');
const { response } = require('express');
const pug_loggedinmenu = pug.compileFile('./masterframe/loggedinmenu.html');

var htmlHead = readHTML('./masterframe/head.html');
var htmlHeader = readHTML('./masterframe/header.html');
var htmlMenu = readHTML('./masterframe/menu.html');
var htmlInfoStart = readHTML('./masterframe/infostart.html');
var htmlInfoStop = readHTML('./masterframe/infostop.html');
var htmlBottom = readHTML('./masterframe/bottom.html');

//Deafult-router om ingen knapp har klickats
router.get('/', (request, response) =>
{
    response.write(htmlHead);
    response.write(htmlHeader);
    // Skriver ut höger-meny
    if(request.session && request.session.loggedin)
    {
        var htmlLoggedInMenuCSS = readHTML('./masterframe/loggedinmenu_css.html');
        response.write(htmlLoggedInMenuCSS);
    }   
    if(request.session && request.session.loggedin)
    {
        var htmlLoggedInMenuJS = readHTML('./masterframe/loggedinmenu_js.html');
        response.write(htmlLoggedInMenuJS);
    }   
    // if(request.session && request.session.loggedin){var htmlLoggedInMenu = readHTML('./masterframe/loggedinmenu.html');response.write(htmlLoggedInMenu);}
    
    if(request.session && request.session.loggedin)
    {    
        response.write(pug_loggedinmenu({
            employeecode : request.cookies.employeeCode,
            name : request.cookies.name,
            logintimes : request.cookies.logintimes,
            lastlogin : request.cookies.lastlogin
        }));
    }
    
    response.write(htmlMenu);
    response.write(htmlInfoStart);

    var htmlInfo = readHTML('./public/text/index.html');
    response.write(htmlInfo);

    response.write(htmlInfoStop);
    response.write(htmlBottom);
    response.end();

});
//Router för info-sidan, om en knapp har klickats


router.get('/:infotext', (request, response) =>
{
    const infotext = request.params.infotext;
    if(infotext=="")
    {
        var htmlMenu = readHTML('./masterframe/menu.html');
    }
    else
    {
        var htmlMenu = readHTML('./masterframe/menu_back.html');
    }   

    response.write(htmlHead);
    response.write(htmlHeader);
    // Skriver ut höger-meny
        if(request.session && request.session.loggedin)
    {
        var htmlLoggedInMenuCSS = readHTML('./masterframe/loggedinmenu_css.html');
        response.write(htmlLoggedInMenuCSS);
    }   
    if(request.session && request.session.loggedin)
    {
        var htmlLoggedInMenuJS = readHTML('./masterframe/loggedinmenu_js.html');
        response.write(htmlLoggedInMenuJS);
    }   
    // if(request.session && request.session.loggedin){var htmlLoggedInMenu = readHTML('./masterframe/loggedinmenu.html');response.write(htmlLoggedInMenu);}
    
    if(request.session && request.session.loggedin)
    {    
        response.write(pug_loggedinmenu({
            employeecode : request.cookies.employeeCode,
            name : request.cookies.name,
            logintimes : request.cookies.logintimes,
            lastlogin : request.cookies.lastlogin
        }));
    }
    
    response.write(htmlMenu);
    response.write(htmlInfoStart);

    // var htmlInfo = readHTML('./public/text/index.html');
    const filepath = path.resolve(__dirname, "../public/text/"+infotext+".html");
    if(fs.existsSync(filepath))
    {
        htmlInfo = readHTML('./public/text/'+infotext+'.html');
    }
    else
    {
        htmlInfo = readHTML('./public/text/index.html');
    }

    response.write(htmlInfo);

    response.write(htmlInfoStop);
    response.write(htmlBottom);
    response.end();

});
module.exports = router;