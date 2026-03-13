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
    let str_objectNumber, str_objectName, str_objectCreatedDate, str_objectCreator ;
    const connection = ADODB.open('Provider=Microsoft.jet.OLEDB.4.0;Data Source=./data/mdb/researchdata.mdb');

 

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

        response.write(htmlHeader);
        response.write(htmlMenu);
        response.write(htmlInfoStart);

        let htmloutput = "" + 
        "<link rel=\"stylesheet\" href=\"/css/personnelregistry.css\" />" +


        "<table border=\"0\"><tr>"+
        "<td width=\"350\" align=\"left\"><h2>Reserch Object Database:</h2></td>";
        if(request.session.loggedin)
        {
            htmloutput += "<td width=\"350\" align=\"right\"><a href=\"http://localhost:3000/api/newvi\" style=\"color:#336699;\">Add Research Object</a></td>";
        }
        htmloutput += "</tr></table>"+


    	"<table id=\"personnel\">" +
		"<tr>" +
		  "<td class=\"infoheadinglight\" width=\"130\">Number</td>" +
		  "<td class=\"infoheadingdark\" width=\"210\">&nbsp;Name</td>" +
		  "<td class=\"infoheadinglight\" width=\"130\">Created</td>" +
		  "<td class=\"infoheadinglight\" width=\"130\">By</td>" +
		  "<td class=\"infoheadinglight\" width=\"116\">Entries</td>" +
           "<td class=\"infoheadinglight\" width=\"116\">Last entry</td>";

        if(request.session.loggedin)
        {
            htmloutput += "<td class=\"infoheadinglight\" width=\"116\">EDIT</td>" +
		    "<td class=\"infoheadinglight\" width=\"116\">DELETE</td>";
        }
		htmloutput += "</tr>" +
        "";

        const result = await connection.query('SELECT id, objectNumber, objectName, objectCreator, objectCreatedDate FROM ResearchObjects');
        var count = result.length;

        let i;
        for(i=0; i<count; i++)
        {
            id = result[i]['id'];
            str_objectNumber = result[i]['objectNumber'];
            str_objectName = result[i]['objectName'];
            str_objectCreator = result[i]['objectCreator'];
            str_objectCreatedDate= result[i]['objectCreatedDate'];
          
            
            htmloutput +=
            "<tr>" +
		    "<td class=\"infolight\" width=\"130\">"+str_objectNumber+"</td>" +
		    "<td class=\"infodark\" width=\"210\">&nbsp;<a href=\"http://localhost:3000/api/virusdatabase/"+id+"\">"+str_objectName+"</a></td>" +
            "<td class=\"infolight\" width=\"130\">"+str_objectCreatedDate+"</td>" +
		    "<td class=\"infolight\" width=\"130\">"+str_objectCreator+"</td>" +
		    
            "<td class=\"infolight\" width=\"130\"></td>" +
            "<td class=\"infolight\" width=\"130\"></td>";
            if(request.session.loggedin)
            {
                htmloutput += "<td class=\"infolight\" width=\"116\"><a href=\"http://localhost:3000/api/editvirus/"+id+"\" style=\"color:#336699;\">E</a></td>";
                htmloutput += "<td class=\"infolight\" width=\"116\"><a href=\"http://localhost:3000/api/deletevirus/"+id+"\" style=\"color:#336699;\">D</a></td>";
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
router.get('/:id', (request, response) =>
{
    // var employeeid = request.params.employeeid;

    //öppnar Databasen och läs data
    const connection = ADODB.open('Provider=Microsoft.jet.OLEDB.4.0;Data Source=./data/mdb/researchdata.mdb');
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

        
        response.write(htmlHeader);
        response.write(htmlMenu);
        response.write(htmlInfoStart);

        const objectID = request.params.id;

        // Skicka SQL-query till databasen och läs in variableremployeeCode
        const result = await connection.query("SELECT objectNumber, objectName, objectCreator, objectCreatedDate, objectCreatedTime, objectText, objectStatus, presentationVideoLink, securityVideoLink FROM ResearchObjects WHERE id= "+objectID);
    
        str_objectNumber = result[0]['objectNumber'];
        str_objectName= result[0]['objectName'];
        str_objectCreator= result[0]['objectCreator'];
        str_objectCreatedDate = result[0]['objectCreatedDate'];
        str_objectCreatedTime = result[0]['objectCreatedTime'];
        str_objectText = result[0]['objectText'];
        str_objectStatus = result[0]['objectStatus'];
        str_presentationVideoLink = result[0]['presentationVideoLink'];
        str_securityVideoLink = result[0]['securityVideoLink'];
    

        // Kolla om employeen har ett foto
        // var photo = "images/default.jpg";
        // const path = "./public/photos/"+str_employeeCode+".jpg";
        // if(fs.existsSync(path))
        // {
        //     photo = "photos/"+str_employeeCode+".jpg";
        // }
        // else
        // {
        //    photo = "images/default.jpg";
        //}

          // Skapa HTML-textsträng för tabellen för utskrift av XML-data
    let htmloutput = "" +
    "<div style='display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 20px;'>" +
    
    // Vänster sida: Nummer och Namn
    "<div style='display: flex; gap: 15px; align-items: baseline;'>" +
        "<h1 style='margin: 0; font-size: 24px;'>" + str_objectNumber + "</h1>" +
        "<h2 style='margin: 0; font-size: 20px; color: #555;'>" + str_objectName + "</h2>" +
    "</div>" +

    // Höger sida: Skapad-info (mindre text)
    "<div style='text-align: right; font-size: 12px; color: #666; line-height: 1.4;'>" +
        "Created " + str_objectCreatedDate + "<br>" +
        "By " + str_objectCreator + " (Hulk)" +
    "</div>" +

    "</div>" +
        "<form action=\"/"+objectID+"\">" +
        "<textarea name=\"message\" rows=\"10\" cols=\"75\">"+str_objectText+"</textarea>" +
        "<br><br>" +
        "<input type='submit' value='Edit Info' style='padding: 8px 15px; cursor: pointer;'>" + 
        "</form>";

    htmloutput +=
    "<style>" +
    ".nav-item a {" + 
    "color: #336699;" +
    "text-decoration: none;" + 
    "font-weight: bold;" +
    "}" +
    "  .nav-list { list-style-type: none; padding: 0; }" +
    "  .nav-item { " +
    "    display: flex;" + 
    "    align-items: center;" +  
    "    gap: 10px;" + 
    "    margin-bottom: 8px;" + 
    "    padding: 5px;" + 
    "    border-bottom: 1px solid #eee;" + 
    "  }" + 
    "  .btn {" +  
    "    text-decoration: none;"+ 
    "    padding: 2px 8px;" + 
    "    border-radius: 3px;" + 
    "    font-size: 12px;" +
    "    color: white;" +
    "  }" +
    "  .btn-edit { background-color: #44ad3a; }" +
    "  .btn-delete { background-color: #de2648; }" +
    "</style>" +

    "<h2>Research Navigation</h2>" +

    "<ul class=\"nav-list\">" +
    "<li class=\"nav-item\">" +
    "<span>Security Data Sheet:</span>" +
    "<a href=\"/pdf/" + encodeURIComponent(str_objectNumber) + ".pdf\" target=\"_blank\" style=\"flex-grow: 1;\">Open PDF Document</a>" +
    "<a href=\"/edit/1\" class=\"btn btn-edit\">E</a>" + 
    "<a href=\"/delete/1\" class=\"btn btn-delete\">D</a>" +
    "</li>" +




"  <li class=\"nav-item\">" +
"    <span>Security Presentation Video:</span>" +
"    <a href=\"" + str_presentationVideoLink + "\" target=\"_blank\" style=\"flex-grow: 1;\">" + str_presentationVideoLink + "</a>" +
"    <a href=\"/api/editvirus/" + objectID + "\" class=\"btn btn-edit\">E</a>" +
"    <a href=\"/api/deletevirus/" + objectID + "\" class=\"btn btn-delete\">D</a>" +
"  </li>" +

"  <li class=\"nav-item\">" +
"    <span>Security Handling Video:</span>" + // Ändrade texten så du ser skillnad
"    <a href=\"" + str_securityVideoLink + "\" target=\"_blank\" style=\"flex-grow: 1;\">" + str_securityVideoLink + "</a>" +
"    <a href=\"/api/editvirus/" + objectID + "\" class=\"btn btn-edit\">E</a>" +
"    <a href=\"/api/deletevirus/" + objectID + "\" class=\"btn btn-delete\">D</a>" +
"  </li>" + 
"</ul>";

        response.write(htmloutput); // Skriv ut 

        // skiriver ut masterframens nedre del
        response.write(htmlInfoStop);
        response.write(htmlBottom);
        response.end();
    }
sqlQuery();   

});

module.exports = router;