const e = require('express');
const { application } = require('express');
const express = require('express');
const readHTML = require('./readHTML.js');
const router = express.Router();
router.use(express.json());
//var path = require('path');
// Läs in layouten
router.use(express.static('./public'));
var htmlHead = readHTML('./routes/head.html');
var htmlHeader = readHTML('./routes/header.html');
var htmlMenu = readHTML('./routes/menu_back.html');    
var htmlInfoStart = readHTML('./routes/infoStart.html');
var htmlInfoStop = readHTML('./routes/infoStop.html');
 
var htmlBottom = readHTML('./routes/bottom.html');


// Test-array med personal
const personnel = 
[
    { id: 1, employeecode: 'ITXX-01', name: 'Hulk'},
    { id: 2, employeecode: 'ITXX-02', name: 'Grimlock'},
    { id: 3, employeecode: 'ITXX-03', name: 'Professor Chaos'},
    { id: 4, employeecode: 'ITXX-04', name: 'Ironman'},
    { id: 5, employeecode: 'ITXX-05', name: 'Gargamel'},
    { id: 6, employeecode: 'ITXX-06', name: 'Cara Dune'},
    { id: 7, employeecode: 'ITXX-07', name: 'Darkwing Duck'},
    { id: 8, employeecode: 'ITXX-08', name: 'Hellcat'},
    { id: 9, employeecode: 'ITXX-09', name: 'Judge Dredd'}
];

// --------------------- Lista all personal -------------------------------
router.get('/', function(request, response)
{
    //response.send(personnel); // Skriver ut objektet array, kan inte mixa sträng och objekt i res.send()
    //response.sendFile(path.join(__dirname, '../', 'head.html')) // Läser in EN html-fil
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write(htmlHead);
    response.write(htmlHeader);
    response.write(htmlMenu);
    response.write(htmlInfoStart);

    response.write("Personnel Registry")    ;

    response.write(htmlInfoStop);
  
    response.write(htmlBottom);
    response.end();
    
    //response.send(personnel);
});

// --------------------- Hämta en specifik person -------------------------------
router.get('/:id', function(request, response)
{
    const employee = personnel.find(o => o.id === parseInt(request.params.id));
    if(!employee) response.status(404).send('Employee not found!');
    response.send(employee);   
});

// --------------------- Skapa en ny person -------------------------------
router.post('/', function(request, response)
{
    const employee = {
        id: personnel.length + 1,
        employeecode: request.body.employeecode,
        name: request.body.name,
    };
    personnel.push(employee);
    response.send(employee);
});

// --------------------- Uppdatera en person -------------------------------
router.put('/:id', function(request, response)
{
    const employee = personnel.find(o => o.id === parseInt(request.params.id));
    if(!employee) response.status(404).send('Employee not found!');

    employee.employeecode = request.body.employeecode;
    employee.name = request.body.name;
    response.send(employee);   
});

// --------------------- Radera en specifik person -------------------------------
router.delete('/:id', function(request, response)
{
    const employee = personnel.find(o => o.id === parseInt(request.params.id));
    if(!employee) response.status(404).send('Employee not found!');

    const index = personnel.indexOf(employee);
    personnel.splice(index, 1);

    response.send(employee);   
});

module.exports = router;