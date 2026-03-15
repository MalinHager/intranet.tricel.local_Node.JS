

const express = require('express');
const router = express.Router();
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
const pug_editemployee = pug.compileFile('./masterframe/editemployee.html');

var htmlHead = readHTML('./masterframe/head.html');
var htmlHeader = readHTML('./masterframe/header.html');
var htmlMenu = readHTML('./masterframe/menu.html');
var htmlInfoStart = readHTML('./masterframe/infostart.html');
var htmlInfoStop = readHTML('./masterframe/infostop.html');
var htmlBottom = readHTML('./masterframe/bottom.html');

// Formulär för att editera employee
router.get('/:id', (request, response) =>
{
    // Ta emot inparametrar
    const id = request.params.id;

    // Öppna data-basen
    const ADODB = require ('node-adodb');
    // let str_employeeCode, str_password, str_logintimes, str_lastlogin , str_lockout, str_failedlogintimes;
    const connection = ADODB.open('Provider=Microsoft.jet.OLEDB.4.0;Data Source=./data/mdb/personnelregistry.mdb');

    async function sqlQuery()
    {

    // Skicka SQL-query
    const result = await connection.query("SELECT * FROM employee WHERE id= "+id+"");

    // Läs in variablerna
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
    var photo = "./public/images/default.jpg";
    const photoPath = "./public/photos/"+str_employeeCode+".jpg";
    if(fs.existsSync(photoPath))
    {
        photo = "./public/photos/"+str_employeeCode+".jpg";
    }
    else
    {
        photo = "./public/images/default.jpg";
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

    // Skriver ut höger-meny
    if(request.session && request.session.loggedin)
    {

    var newEmployeeCSS = readHTML('./masterframe/newemployee_css.html');
    response.write(newEmployeeCSS);
    var newEmployeeJS = readHTML('./masterframe/newemployee_js.html');
    response.write(newEmployeeJS);

    console.log("employeecode är"+str_employeeCode)


    response.write(pug_editemployee({
        id : id, 
        employeecode : str_employeeCode,
        name : str_name,
        dateofbirth : str_dateOfBirth,
        signaturedate : str_signatureDate,
        sex : str_sex,
        height : str_height,
        weight : str_weight,
        bloodtype : str_bloodType,
        rank : str_rank,
        department : str_department,
        securityaccesslevel : str_securityAccessLevel,
        background : str_background,
        strengths : str_strengths,
        weaknesses : str_weaknesses,
        photo : photo,
    }));

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



// Router för uppdaterad employee till databasen
router.post('/:id', (request, response) =>  
{
     // Ta emot formulär-data i variabler
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
    
        console.log("penis" +JSON.stringify(fields))
        // Ta emot inparametrar
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
            console.log(employeecode)
            //  Skriver till databasen
            const result = await connection.execute("UPDATE employee SET employeeCode='"+employeecode+"', name='"+name+"', dateOfBirth='"+dateofbirth+"', height='"+height+"', weight='"+weight+"', bloodType='"+bloodtype+"', sex='"+sex+"', rank='"+rank+"', department='"+department+"', securityAccessLevel='"+securityaccess+"', background='"+background+"', strengths='"+strengths+"', weaknesses='"+weaknesses+"' WHERE id="+id+" ");
            response.write("Employee edited <br />");
            response.write("<a href=\"http://localhost:3000/api/personnelregistry\" style=\"color:#336699;\">Edit another employee</a>");
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

module.exports = router;