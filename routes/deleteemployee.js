

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
router.get('/:id', (request, response) =>
{
    // Tar emot inparametrar
    const id = request.params.id;

    // Öppna data-basen
    const ADODB = require ('node-adodb');
    // let str_employeeCode, str_password, str_logintimes, str_lastlogin , str_lockout, str_failedlogintimes;
    const connection = ADODB.open('Provider=Microsoft.jet.OLEDB.4.0;Data Source=./data/mdb/personnelregistry.mdb');

    async function sqlQuery()
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

        if(request.session && request.session.loggedin)
        {
            // Ta reda på employeecoden för personen(för att kunna radera rätt bild)
            const result2 = await connection.query("SELECT employeeCode FROM employee WHERE id="+id+"");
            let str_employeecode = "" + result2[0]['employeeCode'];

            // Radera employeen ur databasen
            const result = await connection.execute("DELETE FROM employee WHERE id="+id+"");

            // Radera bilden om det finns sådan
            const path = "./public/photos/"+str_employeecode+".jpg";
            if(fs.existsSync(path))
            {
                fs.unlinkSync(path);
            }


            response.write("Employee deleted <br />");
            response.write("<a href=\"http://localhost:3000/api/personnelregistry\" style=\"color:#336699;\">Delete another employee</a>");
        }
        else
        {
            response.write("You are not logged in");
        }  

    response.write(htmlInfoStop);
    response.write(htmlBottom);
    response.end();
    }
    sqlQuery();
});

module.exports = router;