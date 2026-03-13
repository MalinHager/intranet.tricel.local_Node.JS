const express = require('express');
const router = express.Router();
const ADODB = require('node-adodb');

var cookieParser = require('cookie-parser');
router.use(cookieParser());

const readHTML = require('./readHTML.js');
var fs = require('fs');
const path = require('path');

router.use(express.static('./public'));

const pug = require('pug');
const { response } = require('express');
const pug_loggedinmenu = pug.compileFile('./masterframe/loggedinmenu.html');

// Läser in masterframen
var htmlHead = readHTML('./masterframe/head.html');
var htmlHeader = readHTML('./masterframe/header.html');
var htmlMenu = readHTML('./masterframe/menu_back.html');
var htmlInfoStart = readHTML('./masterframe/infostart.html');
var htmlInfoStop = readHTML('./masterframe/infostop.html');
var htmlBottom = readHTML('./masterframe/bottom.html');


// Default-router; alla employees
router.get('/', (request, response) =>
{
    //öppnar Databasen och läs data
    let str_employeeCode, str_name, str_signatureDate, str_rank, str_securityAccessLevel;
    const connection = ADODB.open('Provider=Microsoft.jet.OLEDB.4.0;Data Source=./data/mdb/personnelregistry.mdb');

    async function sqlQuery()
    {
         // skiriver ut masterframens övre del
        response.write(htmlHead);
        
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
        response.write(htmlHeader);
        response.write(htmlMenu);
        response.write(htmlInfoStart);

        let htmloutput = "" + 
        "<link rel=\"stylesheet\" href=\"/css/personnelregistry.css\" />" +


        "<table border=\"0\"><tr>"+
        "<td width=\"350\" align=\"left\"><h2>Personnel Registry:</h2></td>";
        if(request.session.loggedin)
        {
            htmloutput += "<td width=\"350\" align=\"right\"><a href=\"http://localhost:3000/api/newemployee\" style=\"color:#336699;\">Add new employee</a></td>";
        }
        htmloutput += "</tr></table>"+


    	"<table id=\"personnel\">" +
		"<tr>" +
		  "<td class=\"infoheadinglight\" width=\"130\">EMPLOYEE CODE</td>" +
		  "<td class=\"infoheadingdark\" width=\"210\">&nbsp;NAME</td>" +
		  "<td class=\"infoheadinglight\" width=\"130\">SIGNATURE DATE</td>" +
		  "<td class=\"infoheadinglight\" width=\"130\">RANK</td>" +
		  "<td class=\"infoheadinglight\" width=\"116\">ACCESS LEVEL</td>";

        if(request.session.loggedin)
        {
            htmloutput += "<td class=\"infoheadinglight\" width=\"116\">EDIT</td>" +
		    "<td class=\"infoheadinglight\" width=\"116\">DELETE</td>";
        }
		htmloutput += "</tr>" +
        "";

        const result = await connection.query('SELECT id, employeeCode, name, signatureDate, rank, securityAccessLevel FROM employee');
        var count = result.length;

        let i;
        for(i=0; i<count; i++)
        {
            id = result[i]['id'];
            str_employeeCode = result[i]['employeeCode'];
            str_name = result[i]['name'];
            str_signatureDate = result[i]['signatureDate'];
            str_rank= result[i]['rank'];
            str_securityAccessLevel = result[i]['securityAccessLevel'];  
            
            htmloutput +=
            "<tr>" +
		    "<td class=\"infolight\" width=\"130\">"+str_employeeCode+"</td>" +
		    "<td class=\"infodark\" width=\"210\">&nbsp;<a href=\"http://localhost:3000/api/personnelregistry/"+str_employeeCode+"\">"+str_name+"</a></td>" +
		    "<td class=\"infolight\" width=\"130\">"+str_signatureDate+"</td>" +
		    "<td class=\"infolight\" width=\"130\">"+str_rank+"</td>" +
		    "<td class=\"infolight\" width=\"116\"><big><big>"+str_securityAccessLevel+"</big></big></td>";
            if(request.session.loggedin)
            {
                htmloutput += "<td class=\"infolight\" width=\"116\"><a href=\"http://localhost:3000/api/editemployee/"+id+"\" style=\"color:#336699;\">E</a></td>";
                htmloutput += "<td class=\"infolight\" width=\"116\"><a href=\"http://localhost:3000/api/deleteemployee/"+id+"\" style=\"color:#336699;\">D</a></td>";
            }
		    htmloutput += "</tr>" +
            "";
        }

        htmloutput += "</table>";
        response.write(htmloutput);

        // skiriver ut masterframens nedre del
        response.write(htmlInfoStop);
        response.write(htmlBottom);
        response.end();    
    }
    sqlQuery(); 
});
// Default-router för en individs personliga info
router.get('/:employeeid', (request, response) =>
{
    var employeeid = request.params.employeeid;

    //öppnar Databasen och läs data
    const connection = ADODB.open('Provider=Microsoft.jet.OLEDB.4.0;Data Source=./data/mdb/personnelregistry.mdb');
    async function sqlQuery()
    {
         // skiriver ut masterframens övre del och höger meny
        response.write(htmlHead);
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
        
        response.write(htmlHeader);
        response.write(htmlMenu);
        response.write(htmlInfoStart);

        const employeeid = request.params.employeeid;

        // Skicka SQL-query till databasen och läs in variabler
        const result = await connection.query("SELECT employeeCode, name, signatureDate, rank, securityAccessLevel, dateOfBirth, sex, bloodType, height, weight, department, background, strengths, weaknesses FROM employee WHERE employeeCode='"+employeeid+"'");
    
        str_employeeCode = result[0]['employeeCode'];
        str_name = result[0]['name'];
        str_signatureDate = result[0]['signatureDate'];
        str_dateOfBirth = result[0]['dateOfBirth'];
        str_sex = result[0]['sex'];
        str_bloodType = result[0]['bloodType'];
        str_height = result[0]['height'];
        str_weight = result[0]['weight'];
        str_rank = result[0]['rank'];
        str_department = result[0]['department'];
        str_securityAccessLevel = result[0]['securityAccessLevel'];
        str_background = result[0]['background'];
        str_strengths = result[0]['strengths'];
        str_weaknesses = result[0]['weaknesses'];

        // Kolla om employeen har ett foto
        var photo = "images/default.jpg";
        const path = "./public/photos/"+str_employeeCode+".jpg";
        if(fs.existsSync(path))
        {
            photo = "photos/"+str_employeeCode+".jpg";
        }
        else
        {
            photo = "images/default.jpg";
        }

          // Skapa HTML-textsträng för tabellen för utskrift av XML-data
        let htmloutput =""+
        "<link rel=\"stylesheet\" href=\"/css/personnel_registry_employee.css\" \/>\n"+ 
        "<h1>Personnel Registry - " + employeeid + "</h1>\n"+
        "<table id=\"infomiddle\">\n"+
        "<tr><td width=\"166\" valign=\"top\">\n"+
        "<table id=\"photocol\"><tr><td id=\"photobox\"><img src=\"" + photo + "\" alt=\"" + photo + "\" width=\"164\" /></td></tr><tr><td class=\"tablespacer\"></tr>\n"+
        "<tr><td id=\"employeecode\">EMPLOYEE CODE: </b><br /><b>" + str_employeeCode + "</b></td></tr><tr><td class=\"tablespacer\"></tr>\n"+
        "<tr> <td id=\"securitylevel\">SECURITY CLEARANCE LEVEL: </b><br /><big><big><big>" +str_securityAccessLevel+ "</big></big></big></td></tr></table>\n"+
        "</td><td width=\"135\" valign=\"top\">\n"+
        "<table><tr><td class=\"variablecol\">NAME: &nbsp;</td></tr><tr><td class=\"tablespacer\"></tr>\n"+
        "<tr><td class=\"variablecol\">DATE OF BIRTH: &nbsp;</td></tr><tr><td class=\"tablespacer\"></tr>\n"+
        "<tr><td class=\"variablecol\">SEX: &nbsp;</td></tr><tr><td class=\"tablespacer\"></tr>\n"+
        "<tr><td class=\"variablecol\">BLOOD TYPE: &nbsp;</td></tr><tr><td class=\"tablespacer\"></tr>\n"+
        "<tr><td class=\"variablecol\">HEIGHT: &nbsp;</td></tr><tr><td class=\"tablespacer\"></tr>\n"+
        "<tr><td class=\"variablecol\">WEIGHT: &nbsp;</td></tr><tr><td class=\"tablespacer\"></tr>\n"+
        "<tr><td class=\"variablecol\">DEPARTMENT: &nbsp;</td></tr><tr><td class=\"tablespacer\"></tr>\n"+
        "<tr><td class=\"variablecol\">RANK: &nbsp;</td></tr><tr><td class=\"tablespacer\"></tr></table>\n"+
        "</td><td width=\"245\" valign=\"top\">\n"+
        "<table><tr><td class=\"valuecol\">" +str_name+ "</td></tr><tr><td class=\"blackline\"></td></tr><tr><td class=\"tablespacer\"></tr>\n"+
        "<tr><td class=\"valuecol\">" +str_dateOfBirth+ "</div></td></tr><tr><td class=\"blackline\"></td></tr><tr><td class=\"tablespacer\"></tr>\n"+
        "<tr><td class=\"valuecol\">" +str_sex+ "</td></tr><tr><td class=\"blackline\"></td></tr><tr><td class=\"tablespacer\"></tr>\n"+
        "<tr><td class=\"valuecol\">" +str_bloodType+ "</td></tr><tr><td class=\"blackline\"></td></tr><tr><td class=\"tablespacer\"></tr>\n"+
        "<tr><td class=\"valuecol\">" +str_height+ "</td></tr><tr><td class=\"blackline\"></td></tr><tr><td class=\"tablespacer\"></tr>\n"+
        "<tr><td class=\"valuecol\">" +str_weight+ "</td></tr><tr><td class=\"blackline\"></td></tr><tr><td class=\"tablespacer\"></tr>\n"+
        "<tr><td class=\"valuecol\">" +str_department+ "</td></tr><tr><td class=\"blackline\"></td></tr><tr><td class=\"tablespacer\"></tr>\n"+
        "<tr><td class=\"valuecol\">" +str_rank+ "</td></tr><tr><td class=\"blackline\"></td></tr><tr><td class=\"tablespacer\"></tr></table>\n"+
        "<td width=\"182\" valign=\"top\">\n"+
        "</td>\n"+
        "</td></tr></table>\n";

            htmloutput += 
        "<h1>Background</h1>\n" + str_background +
        "<p />\n" +
        "<h1>Strengths</h1>\n" + str_strengths +
        "<p />\n" +
        "<h1>Weaknesses</h1>\n" + str_weaknesses +
        "<p />\n" +
        "";

        response.write(htmloutput); // Skriv ut 

        // skiriver ut masterframens nedre del
        response.write(htmlInfoStop);
        response.write(htmlBottom);
        response.end();
    }
sqlQuery();   

});

module.exports = router;