const express = require('express');
const router = express.Router();

const readHTML = require('./readHTML.js');
var fs = require('fs');
const path = require('path');

router.use(express.static('./public'));

var htmlHead = readHTML('./masterframe/head.html');
var htmlHeader = readHTML('./masterframe/header.html');
var htmlMenu = readHTML('./masterframe/menu.html');
var htmlInfoStart = readHTML('./masterframe/infostart.html');
var htmlInfoStop = readHTML('./masterframe/infostop.html');
var htmlBottom = readHTML('./masterframe/bottom.html');

//Deafult-router om ingen knapp har klickats
router.get('/', (request, response) =>
{
    request.session.destroy();

    response.write(htmlHead);
    response.write(htmlHeader);
    // Skriver ut höger-meny
    // if(request.session && request.session.loggedin){var htmlLoggedInMenuCSS = readHTML('./masterframe/loggedinmenu_css.html');response.write(htmlLoggedInMenuCSS);}   
    // if(request.session && request.session.loggedin){var htmlLoggedInMenuJS = readHTML('./masterframe/loggedinmenu_js.html');response.write(htmlLoggedInMenuJS);}   
    // if(request.session && request.session.loggedin){var htmlLoggedInMenu = readHTML('./masterframe/loggedinmenu.html');response.write(htmlLoggedInMenu);}
    response.write(htmlMenu);
    response.write(htmlInfoStart);

    response.write("You are logged out!");

    response.write(htmlInfoStop);
    response.write(htmlBottom);
    response.end();

});

module.exports = router;