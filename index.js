const express = require('express');
const path = require('path');
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');

// Gör mapparna tillgängliga för webbläsaren
app.use('/tyrant', express.static(path.join(__dirname, 'tyrant')));
app.use('/uroboros', express.static(path.join(__dirname, 'uroboros')));
app.use('/t-veronica', express.static(path.join(__dirname, 't-veronica')));

// Om master.html ligger i roten:
app.get('/master.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'master.html'));
});

const pug = require('pug');
const { response } = require('express');
const pug_loggedinmenu = pug.compileFile('./masterframe/loggedinmenu.html');

app.use(express.static('public'));

app.use(session({secret:'thisisasecret', resave:false, saveUninitialized:true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

var cookieParser = require('cookie-parser');
app.use(cookieParser());
//Läser in routers
const info = require('./routes/info.js');
const personnelregistry = require('./routes/personnelregistry.js');
const login = require('./routes/login.js');
const logout = require('./routes/logout');
const virusdatabase = require('./routes/virusdatabase.js');
const newemployee = require('./routes/newemployee.js');
const deleteemployee = require('./routes/deleteemployee.js');
const editemployee = require('./routes/editemployee.js');
const getchat = require('./routes/getchat.js');
const chat = require('./routes/chat.js');
const livestream = require('./routes/livestream.js');



// Läser in master-frame
const readHTML = require('./routes/readHTML.js');
var fs = require('fs');

app.use(express.static('./public'));
var htmlHead = readHTML('./masterframe/head.html');
var htmlHeader = readHTML('./masterframe/header.html');
var htmlMenu = readHTML('./masterframe/menu.html');
var htmlInfoStart = readHTML('./masterframe/infostart.html');
var htmlInfoStop = readHTML('./masterframe/infostop.html');
var htmlBottom = readHTML('./masterframe/bottom.html');

// Default router
app.get('/', (request, response) =>
{
    // Utskrift av master_frame övre del
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

    // Utskrift av master-frame nedre del
    response.write(htmlInfoStop);
    response.write(htmlBottom);
    response.end();
});

app.use('/api/info', info);
app.use('/api/personnelregistry', personnelregistry);
app.use('/api/login', login);
app.use('/api/logout', logout);
app.use('/api/virusdatabase', virusdatabase);
app.use('/api/newemployee', newemployee);
app.use('/api/deleteemployee', deleteemployee);
app.use('/api/editemployee', editemployee);
app.use('/api/getchat', getchat);
app.use('/api/chat', chat);
app.use('/api/livestream', livestream);



app.listen(3000, function()
{
    console.log('Listening on port 3000...');
});

