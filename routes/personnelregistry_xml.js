const express = require('express');
const router = express.Router();
router.use(express.json());
const xml2js = require('xml2js');

const readHTML = require('./readHTML.js');
var fs = require('fs');
const path = require('path');


router.use(express.static('./public'));
// Läser in masterframen
var htmlHead = readHTML('./routes/head.html');
var htmlHeader = readHTML('./routes/header.html');
var htmlMenu = readHTML('./routes/menu_back.html');
var htmlInfoStart = readHTML('./routes/infostart.html');
var htmlInfoStop = readHTML('./routes/infostop.html');
var htmlBottom = readHTML('./routes/bottom.html');


// Default-router; alla employees
router.get('/', (request, response) =>
{
   // skiriver ut masterframens övre del
    response.write(htmlHead);
    response.write(htmlHeader);
    response.write(htmlMenu);
    response.write(htmlInfoStart);

    //öppnar XML-filen och läser innehållet
    var fsxml = require('fs');
    let xmltext = fsxml.readFileSync('./data/xml/personnelRegistry.xml');
    xmltext = xmltext.toString();
    xmltext = xmltext.replace(/[\n\t\r]/g,"");

    let htmloutput = "" + 
        "<link rel=\"stylesheet\" href=\"/css/personnelregistry.css\" />" +
    	"<table id=\"personnel\">" +
		"<tr>" +
		  "<td class=\"infoheadinglight\" width=\"130\">EMPLOYEE CODE</td>" +
		  "<td class=\"infoheadingdark\" width=\"210\">&nbsp;NAME</td>" +
		  "<td class=\"infoheadinglight\" width=\"130\">SIGNATURE DATE</td>" +
		  "<td class=\"infoheadinglight\" width=\"130\">RANK</td>" +
		  "<td class=\"infoheadinglight\" width=\"116\">ACCESS LEVEL</td>" +
		 "</tr>"
        "";
    let xmlArray = xmltext.split('<employee>');
    xmlArray.shift();

    let str_employeeCode, str_name, str_signatureDate, str_rank, str_securityAccessLevel;
    xmlArray.forEach(printEmployee);
    function printEmployee(employee)
    {
        str_employeeCode = employee.substring(employee.indexOf('<employeeCode>')+14, employee.lastIndexOf('</employeeCode>'));
        str_name = employee.substring(employee.indexOf('<name>')+6, employee.lastIndexOf('</name>'));
        str_signatureDate = employee.substring(employee.indexOf('<signatureDate>')+15, employee.lastIndexOf('</signatureDate>'));
        str_rank = employee.substring(employee.indexOf('<rank>')+6, employee.lastIndexOf('</rank>'));
        str_securityAccessLevel = employee.substring(employee.indexOf('<securityAccessLevel>')+21, employee.lastIndexOf('</securityAccessLevel>'));
   
        htmloutput +=
        "<tr>" +
		  "<td class=\"infolight\" width=\"130\">"+str_employeeCode+"</td>" +
		  "<td class=\"infodark\" width=\"210\">&nbsp;<a href=\"http://localhost:3000/api/personnelregistry/"+str_employeeCode+"\">"+str_name+"</a></td>" +
		  "<td class=\"infolight\" width=\"130\">"+str_signatureDate+"</td>" +
		  "<td class=\"infolight\" width=\"130\">"+str_rank+"</td>" +
		  "<td class=\"infolight\" width=\"116\"><big><big>"+str_securityAccessLevel+"</big></big></td>" +
		 "</tr>" +
         "";
    }
    
   htmloutput += "</table>";

   response.write(htmloutput);
   
   // skiriver ut masterframens nedre del
    response.write(htmlInfoStop);
    response.write(htmlBottom);
    response.end();

});
// Default-router för en individs personliga info
router.get('/:employeeid', (request, response) =>
{
    const employeeid = request.params.employeeid;

   // skiriver ut masterframens övre del
    response.write(htmlHead);
    response.write(htmlHeader);
    response.write(htmlMenu);
    response.write(htmlInfoStart);

    //öppnar XML-filen och läser innehållet
    var fsxml = require('fs');
    let xmltext = fsxml.readFileSync('./data/xml/personnelRegistry.xml');
    xmltext = xmltext.toString();
    xmltext = xmltext.replace(/[\n\t\r]/g,"");

    let str_employeeCode, str_name, str_signatureDate, str_dateOfBirth, str_sex, str_bloodType, str_height, str_weight, str_rank, str_department, str_securityAccessLevel;
    let count = xmltext.match(/<employee>/g).length;

    xml2js.parseString(xmltext, function(err, result)
    {
        let I;
        for(i=0; i<count; i++)
        {
            if(result['personnelRegistry']['employee'][i]['employeeCode'] == employeeid)
            {
                str_employeeCode = result['personnelRegistry']['employee'][i]['employeeCode'];
                str_name = result['personnelRegistry']['employee'][i]['name'];
                str_signatureDate = result['personnelRegistry']['employee'][i]['signatureDate'];
                str_dateOfBirth = result['personnelRegistry']['employee'][i]['dateOfBirth'];
                str_sex = result['personnelRegistry']['employee'][i]['sex'];
                str_bloodType = result['personnelRegistry']['employee'][i]['bloodType'];
                str_height = result['personnelRegistry']['employee'][i]['height'];
                str_weight = result['personnelRegistry']['employee'][i]['weight'];
                str_rank = result['personnelRegistry']['employee'][i]['rank'];
                str_department = result['personnelRegistry']['employee'][i]['department'];
                str_securityAccessLevel = result['personnelRegistry']['employee'][i]['securityAccessLevel'];
            }
        }
    });

     // Skapa HTML-textsträng för tabellen för utskrift av XML-data
    let htmloutput =""+
    "<link rel=\"stylesheet\" href=\"/css/personnel_registry_employee.css\" \/>\n"+ 
    "<h1>Personnel Registry - " + employeeid + "</h1>\n"+
    "<table id=\"infomiddle\">\n"+
    "<tr><td width=\"166\" valign=\"top\">\n"+
        "<table id=\"photocol\"><tr><td id=\"photobox\"><img src=\"/photos/" + str_employeeCode + ".jpg\" alt=\"" + str_employeeCode + "\" width=\"164\" /></td></tr><tr><td class=\"tablespacer\"></tr>\n"+
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

    let xmltext2 = fsxml.readFileSync("./data/xml/"+employeeid+".xml");
    xmltext2 = xmltext2.toString();
    xmltext2 = xmltext2.replace(/[\n\t\r]/g,"");

    let str_background, str_strengths, str_weaknesses;

    xml2js.parseString(xmltext2, function(err, result2)
    {
        str_background = result2['fields']['Background'];
        str_strengths = result2['fields']['Strengths'];
        str_weaknesses = result2['fields']['Weaknesses'];
    });
    htmloutput += 


    "<h1>Background</h1>\n" + str_background +
    "<p />\n" +
    "<h1>Strengths</h1>\n" + str_strengths +
    "<p />\n" +
    "<h1>Weaknesses</h1>\n" + str_weaknesses +
    "<p />\n" +
    "";
   
    response.write(htmloutput);
    
   // skiriver ut masterframens nedre del
    response.write(htmlInfoStop);
    response.write(htmlBottom);
    response.end();

});

module.exports = router;