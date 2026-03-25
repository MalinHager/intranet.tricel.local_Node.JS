const express = require('express');
const router = express.Router();
const ADODB = require('node-adodb');
var cookieParser = require('cookie-parser');
router.use(cookieParser());

router.use(express.static('./public'));
const path = require('path');


const pug = require('pug');
const { response } = require('express');
const pug_loggedinmenu = pug.compileFile('./masterframe/loggedinmenu.html');


// Läser in master-framen
const readHTML = require('./readHTML.js');
var fs = require('fs');

var htmlHead = readHTML('./masterframe/head.html');
var htmlHeader = readHTML('./masterframe/header.html');
var htmlMenu = readHTML('./masterframe/menu.html');
var htmlInfoStart = readHTML('./masterframe/infostart.html');
var htmlInfoStop = readHTML('./masterframe/infostop.html');
var htmlBottom = readHTML('./masterframe/bottom.html');

//router.post('/', (request, response) =>
//{
//    response.write("snopp"); // Läs ur databasen, kontrolera att lösenordet är korekt , att det inte är nån annan.
//    response.end(); // Spara det nya lösenordet som kommer in i en variabel. Sparar du det nya lösenordet i databasen. // eventuella chekpoints (if)
//}
//)


router.get('/', (request, response) =>
{

    // Tar emot in-parametrarna
    const employeecode = request.query.employeecode;
    const password = request.query.password;

    //öppnar Databasen och läs data
    let str_employeeCode, str_password, str_logintimes, str_lastlogin , str_lockout, str_failedlogintimes;
    const connection = ADODB.open('Provider=Microsoft.jet.OLEDB.4.0;Data Source=./data/mdb/personnelregistry.mdb');
    
    async function sqlQuery()
    {
        // Läser ur databasen
        const result = await connection.query("SELECT passwd, lastlogin, logintimes, lockout, failedlogins FROM users WHERE employeeCode='"+employeecode+"'");
        var count = result.length;

         
        // Kolla att användarten finns i tabellen
        if(result.length==0)
        {
            response.redirect('/api/login/unsuccessful');
            // response.write("User not found");
        }
        else
        {
            // Läs in alla användarens variabler
            str_password = result[0]['passwd'];
            str_logintimes = result[0]['logintimes'];
            if(str_logintimes=="")(str_logintimes="0");
            str_lastlogin = result[0]['lastlogin'];
            str_lockout = result[0]['lockout'];
            str_failedlogintimes = result[0]['failedlogins'];
            if(str_failedlogintimes=="" || str_failedlogintimes==null)(str_failedlogintimes="0");

            async function sqlQuery3()
            {
                const result3 = await connection.query("SELECT name, securityAccessLevel FROM employee WHERE employeeCode='"+employeecode+"'");
                str_name = result3[0]['name'];
                let str_securityaccesslevel = result3[0]['securityAccessLevel'];
            
                // Kolla om användaren är utlåst
                if(str_lockout=="x")
                {
                    response.redirect('/api/login/unsuccessful');
                    // response.write("User id locked out");
                }
                else
                {
                    // Kollar om lösenordet är rätt
                    if(str_password != password)   
                    {
                        let int_failedlogintimes = parseInt(str_failedlogintimes)+1;
                        response.redirect("/api/login/unsuccessful, "+int_failedlogintimes+", times");
                        // response.write("Password incorrect");
                        if(int_failedlogintimes>=5)
                        {
                            str_lockout = "x";
                            response.redirect('/api/login/unsuccessful');
                        }
                        async function sqlQuery4()
                        {
                        // Skriver i databasen
                        const result = await connection.execute("UPDATE users SET failedlogins='"+int_failedlogintimes+"', lockout='"+str_lockout+"' WHERE employeeCode='"+employeecode+"'");
                        var count = result.length;
                        }
                        sqlQuery4();
                    }     
                    else
                    {
                        // Uppdatera databasen
                        let int_logintimes = parseInt(str_logintimes)+1;
                        let int_failedlogintimes = 0;

                        let ts = Date.now();
                        let date_ob = new Date(ts);
                        let date = date_ob.getDate();
                        let month = date_ob.getMonth()+1;
                        let year = date_ob.getFullYear();
                        str_lastlogin = date + "."+ month + "." + year;

                        // Skapa cookies
                        response.cookie('employeeCode', employeecode);
                        response.cookie('name', str_name);
                        response.cookie('lastlogin', str_lastlogin);
                        response.cookie('logintimes', int_logintimes);
                        response.cookie('securityaccesslevel', str_securityaccesslevel);

                        // Starta sessionen
                        request.session.loggedin=true;
                        request.session.username = employeecode;
                        request.session.securityaccesslevel = str_securityaccesslevel;


                        async function sqlQuery2()
                        {
                            // Skriver i databasen
                            const result = await connection.execute("UPDATE users SET logintimes= '"+int_logintimes+"', lastlogin='"+str_lastlogin+"', failedlogins='"+int_failedlogintimes+"' WHERE employeeCode='"+employeecode+"'");
                            var count = result.length;
                        }
                        sqlQuery2();

                        response.redirect('/api/login/successful');
                    }
                    // response.write("User is ok");
                }   
            // response.write("User found");            
            }
            sqlQuery3();
        // str_employeeCode = result[i]['employeeCode'];
        }
    }   
    sqlQuery();
});

// Router för lyckad innloggning
router.get('/:successful', (request, response) =>
{
    response.write(htmlHead);
    response.write(htmlHeader);
    response.write(htmlMenu);
    response.write(htmlInfoStart);

    // Skriver ut höger-meny
    if(request.session && request.session.loggedin){var htmlLoggedInMenuCSS = readHTML('./masterframe/loggedinmenu_css.html');response.write(htmlLoggedInMenuCSS);}   
    if(request.session && request.session.loggedin){var htmlLoggedInMenuJS = readHTML('./masterframe/loggedinmenu_js.html');response.write(htmlLoggedInMenuJS);} 
    // if(request.session && request.session.loggedin){var htmlLoggedInMenu = readHTML('./masterframe/loggedinmenu.html');response.write(htmlLoggedInMenu);}

    if(request.session && request.session.loggedin)
    {    
        response.write(pug_loggedinmenu({
            employeecode : request.cookies.employeeCode,
            name : request.cookies.name,
            logintimes : request.cookies.logintimes,
            lastlogin : request.cookies.lastlogin,
            securityaccesslevel : request.cookies.securityaccesslevel
        }));
    }

    if(request.session.loggedin)
    {
        response.write('Login Successful');
    }
    else
    {
        response.write('Login Unsuccessful');

    }
  
    response.write(htmlInfoStop);
    response.write(htmlBottom);
    response.end();
});
// Router för misslyckad innloggning
router.get('/:unsuccessful', (request, response) =>
{
    response.write(htmlHead);
    response.write(htmlHeader);
    response.write(htmlMenu);
    response.write(htmlInfoStart);

    response.write('Login Unsuccessful');

    response.write(htmlInfoStop);
    response.write(htmlBottom);
    response.end();
});


module.exports = router;