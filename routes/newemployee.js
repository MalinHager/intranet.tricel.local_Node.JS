const express = require('express');
const router = express.Router();
const ADODB = require('node-adodb');
var formidable = require('formidable');

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



// Router för inskrivning av new employee till databasen
router.post('/', (request, response) =>
{   
    // Ta emot variablerna från formuläret
    var form = new formidable.IncomingForm();
    form.parse(request, function(err, fields, files)
    {
        var employeecode = fields.femployeecode;
        var name = fields.fname;
        var dateofbirth = fields.fdateofbirth;
        var height = fields.fheight;
        var weight = fields.fweight;
        var bloodtype = fields.fbloodtype;
        var sex = fields.fsex;
        var rank = fields.frank;
        var department = fields.fdepartment;
        var securityaccess = fields.fsecurityaccess;
        var background = fields.fbackground;
        var strengths = fields.fstrengths;
        var weaknesses = fields.fweaknesses;
  

    /*
    // Ta emot formulär-data i variabler
    const employeecode = request.body.femployee;
    const name = request.body.fname;
    const dateofbirth = request.body.fdateofbirth;
    const height = request.body.fheight;
    const weight = request.body.fweight;
    const bloodtype = request.body.fbloodtype;
    const sex = request.body.fsex;
    const rank = request.body.frank;
    const department = request.body.fdepartment;
    const securityaccess = request.body.fsecurityaccess;
    const background = request.body.fbackgrouns;
    const strengths = request.body.fstrengths;
    const weaknesses = request.body.fweaknesses;
    */

    // skapa datum
    let ts = Date.now();
    let date_ob = new Date(ts);
    let date = date_ob.getDate();
    let month = date_ob.getMonth()+1;
    let year = date_ob.getFullYear();
    const signaturedate = date + "."+ month + "." + year;

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
        // Läser ur databasen
        const result = await connection.execute("INSERT INTO employee (employeeCode, name, signatureDate, dateOfBirth, height, weight, bloodtype, sex, rank, department, securityAccessLevel, background, strengths, weaknesses) VALUES ('"+employeecode+"', '"+name+"', '"+signaturedate+"', '"+dateofbirth+"', '"+height+"', '"+weight+"', '"+bloodtype+"', '"+sex+"', '"+rank+"', '"+department+"', '"+securityaccess+"', '"+background+"', '"+strengths+"', '"+weaknesses+"') ");
        
        // Ladda upp foto-filen
        if(files.ffile != undefined && files.ffile.originalFilename != "")
        {
            var oldpath = files.ffile.filepath;
            var newpath = path.resolve(__dirname, "../public/photos/"+employeecode+".jpg");
            fs.renameSync(oldpath, newpath, function(err)
            {
                if(err) throw err;
            });
        }
        
        // Ge respons till användaren
        response.write("Employee added to database <br />");
        response.write("<a href=\"http://localhost:3000/api/newemployee\" style=\"color:#336699;\">Create another employee</a>");
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
});
// Router för new employee
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

    var newEmployeeCSS = readHTML('./masterframe/newemployee_css.html');
    response.write(newEmployeeCSS);
    var newEmployeeJS = readHTML('./masterframe/newemployee_js.html');
    response.write(newEmployeeJS);
    var newEmployee = readHTML('./masterframe/newemployee.html');
    response.write(newEmployee);

    response.write(htmlInfoStop);
    response.write(htmlBottom);
    response.end();

});

module.exports = router;