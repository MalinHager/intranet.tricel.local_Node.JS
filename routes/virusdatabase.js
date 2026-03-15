const express = require('express');
const router = express.Router();
const ADODB = require('node-adodb');
var cookieParser = require('cookie-parser');
var fs = require('fs');
const path = require('path');
const pug = require('pug');
const readHTML = require('./readHTML.js');

// --- VIKTIGT: Parser för att kunna skapa nya objekt ---
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(cookieParser());
router.use(express.static('./public'));

// Kompilera Pug-filer
const pug_loggedinmenu = pug.compileFile('./masterframe/loggedinmenu.html');
const pug_editvirus = pug.compileFile('./masterframe/editvirus.html'); 

// Läser in masterframen
var htmlHead = readHTML('./masterframe/head.html');
var htmlHeader = readHTML('./masterframe/header.html');
var htmlMenu = readHTML('./masterframe/menu_back.html');
var htmlInfoStart = readHTML('./masterframe/infostart.html');
var htmlInfoStop = readHTML('./masterframe/infostop.html');
var htmlBottom = readHTML('./masterframe/bottom.html');

// 1. LISTAN (Huvudsidan)
router.get('/', (request, response) => {
    const connection = ADODB.open('Provider=Microsoft.jet.OLEDB.4.0;Data Source=./data/mdb/researchdata.mdb');

    async function sqlQuery() {
        response.write(htmlHead);
        if(request.session && request.session.loggedin) {
            response.write(readHTML('./masterframe/loggedinmenu_css.html'));
            response.write(readHTML('./masterframe/loggedinmenu_js.html'));
        }   
        response.write(htmlHeader);
        response.write(htmlMenu);
        response.write(htmlInfoStart);

        let htmloutput = "<link rel='stylesheet' href='/css/personnelregistry.css' />" +
            "<table border='0'><tr><td width='350'><h2>Research Object Database:</h2></td>";
        
        if(request.session.loggedin) {
            htmloutput += "<td align='right'><a href='/api/virusdatabase/newvi' style='color:#336699;'>Add Research Object</a></td>";
        }
        htmloutput += "</tr></table><table id='personnel'><tr>" +
            "<td class='infoheadinglight'>Number</td><td class='infoheadingdark'>Name</td>" +
            "<td class='infoheadinglight'>Created</td><td class='infoheadinglight'>By</td>";

        if(request.session.loggedin) {
            htmloutput += "<td class='infoheadinglight'>EDIT</td><td class='infoheadinglight'>DEL</td>";
        }
        htmloutput += "</tr>";

        const result = await connection.query('SELECT id, objectNumber, objectName, objectCreator, objectCreatedDate FROM ResearchObjects');
        
        result.forEach(row => {
            htmloutput += `<tr>
                <td class='infolight'>${row.objectNumber}</td>
                <td class='infodark'><a href='/api/virusdatabase/${row.id}'>${row.objectName}</a></td>
                <td class='infolight'>${row.objectCreatedDate}</td>
                <td class='infolight'>${row.objectCreator}</td>`;
            if(request.session.loggedin) {
                // KORRIGERAD LÄNK: går till editvirus istället för newvi
                htmloutput += `<td class='infolight'><a href='/api/virusdatabase/editvirus/${row.id}' style='color:#336699;'>E</a></td>`;
                htmloutput += `<td class='infolight'><a href='/api/virusdatabase/deletevirus/${row.id}' style='color:#336699;'>D</a></td>`;
            }
            htmloutput += "</tr>";
        });

        htmloutput += "</table>";
        response.write(htmloutput);
        response.write(htmlInfoStop);
        response.write(htmlBottom);
        response.end();    
    }
    sqlQuery(); 
});

// 2. FORMULÄR FÖR NYTT OBJEKT (Måste ligga ovanför /:id)
router.get('/newvi', (request, response) => {
    if (!request.session || !request.session.loggedin) return response.redirect('/'); 
    response.write(htmlHead);
    response.write(pug_loggedinmenu({
        employeecode: request.session.employeecode,
        name: request.session.username,
        logintimes: request.session.logintimes,
        lastlogin: request.session.lastlogin
    }));
    response.write(htmlHeader);
    response.write(htmlMenu);
    response.write(htmlInfoStart);
    // ... (din HTML-sträng för formuläret här)
    response.write(htmlInfoStop);
    response.write(htmlBottom);
    response.end();
});

// 3. FORMULÄR FÖR ATT EDITERA
router.get('/editvirus/:id', (request, response) => {
    const id = request.params.id;
    const connection = ADODB.open('Provider=Microsoft.jet.OLEDB.4.0;Data Source=./data/mdb/researchdata.mdb');
    
    async function sqlQuery() {
        try {
            const result = await connection.query("SELECT * FROM ResearchObjects WHERE id= " + id);
            const data = result[0];

            // 1. Skriv ut huvudet
            response.write(htmlHead);

            if (request.session && request.session.loggedin) {
                // --- FIX BÖRJAR HÄR: Lägg till CSS och JS för menyn ---
                var htmlLoggedInMenuCSS = readHTML('./masterframe/loggedinmenu_css.html');
                var htmlLoggedInMenuJS = readHTML('./masterframe/loggedinmenu_js.html');
                response.write(htmlLoggedInMenuCSS);
                response.write(htmlLoggedInMenuJS);
                // --- FIX SLUT ---

                response.write(htmlHeader); // Skriv ut header efter CSS/JS

                // 2. Skriv ut den inloggade menyn via Pug
                response.write(pug_loggedinmenu({
                    employeecode: request.session.employeecode,
                    name: request.session.username,
                    logintimes: request.session.logintimes,
                    lastlogin: request.session.lastlogin
                }));

                response.write(htmlMenu);
                response.write(htmlInfoStart);

                // 3. Skriv ut själva editeringsformuläret
                response.write(pug_editvirus({
                    id: id,
                    objectNumber: data.objectNumber,
                    objectName: data.objectName,
                    objectText: data.objectText,
                    presentationVideoLink: data.presentationVideoLink,
                    securityVideoLink: data.securityVideoLink
                }));
            } else {
                // Om man inte är inloggad
                response.write(htmlHeader);
                response.write(htmlMenu);
                response.write(htmlInfoStart);
                response.write("<h1>Access Denied</h1><p>You must be logged in to view this page.</p>");
            }

            response.write(htmlInfoStop);
            response.write(htmlBottom);
            response.end();
        } catch (err) { 
            console.error(err);
            response.status(500).send("Database Error: " + err); 
        }
    }
    sqlQuery();
});

// 4. POST: SPARA ÄNDRINGAR
router.post('/editvirus/:id', (request, response) => {
    const id = request.params.id;
    const formidable = require('formidable');
    const form = new formidable.IncomingForm();

    form.parse(request, function (err, fields) {
        if (err) {
            console.error("Form parsing error:", err);
            return response.status(500).send("Form error");
        }

        const connection = ADODB.open('Provider=Microsoft.jet.OLEDB.4.0;Data Source=./data/mdb/researchdata.mdb');
        
        async function updateQuery() {
            try {
                // Här har jag lagt till pdfLink='${fields.fpdfurl}' i SQL-frågan
                const sql = `UPDATE ResearchObjects SET 
                             objectNumber='${fields.fobjectnumber}', 
                             objectName='${fields.fobjectname}', 
                             objectText='${fields.fobjecttext}', 
                             pdfLink='${fields.fpdfurl}', 
                             presentationVideoLink='${fields.fpresentationvideo}', 
                             securityVideoLink='${fields.fhandlingvideo}' 
                             WHERE id=${id}`;

                await connection.execute(sql);
                // Efter att ha sparat skickar vi användaren tillbaka till listan
                response.redirect('/api/virusdatabase');
            } catch (error) {
                console.error("Database Update Error:", error);
                response.status(500).send("Kunde inte uppdatera databasen: " + error);
            }
        }
        updateQuery();
    });
});

// 5. POST: SKAPA NYTT
router.post('/create', (request, response) => {
    if (request.session && request.session.loggedin) {
        const { objectNumber, objectName, objectText, presentationVideo, handlingVideo } = request.body;
        const connection = ADODB.open('Provider=Microsoft.jet.OLEDB.4.0;Data Source=./data/mdb/researchdata.mdb');
        async function insertData() {
            const sql = `INSERT INTO ResearchObjects (objectNumber, objectName, objectText, objectCreator, objectCreatedDate, presentationVideoLink, securityVideoLink) 
                         VALUES ('${objectNumber}', '${objectName}', '${objectText}', '${request.session.username}', '${new Date().toLocaleDateString()}', '${presentationVideo}', '${handlingVideo}')`;
            await connection.execute(sql);
            response.redirect('/api/virusdatabase');
        }
        insertData();
    }
});

// 6. DELETE
router.get('/deletevirus/:id', (request, response) => {
    const connection = ADODB.open('Provider=Microsoft.jet.OLEDB.4.0;Data Source=./data/mdb/researchdata.mdb');
    connection.execute("DELETE FROM ResearchObjects WHERE id = " + request.params.id)
        .then(() => response.redirect('/api/virusdatabase'));
});

// 7. VISA ENSTAKA OBJEKT (Måste ligga SIST av alla GET)
router.get('/:id', (request, response) => {
    const connection = ADODB.open('Provider=Microsoft.jet.OLEDB.4.0;Data Source=./data/mdb/researchdata.mdb');
    async function sqlQuery() {
        const result = await connection.query("SELECT * FROM ResearchObjects WHERE id= " + request.params.id);
        const row = result[0];
        response.write(htmlHead);
        response.write(htmlHeader);
        response.write(htmlMenu);
        response.write(htmlInfoStart);
        response.write(`<h1>${row.objectNumber} - ${row.objectName}</h1><p>${row.objectText}</p>`);
        response.write(htmlInfoStop);
        response.write(htmlBottom);
        response.end();
    }
    sqlQuery();
});

module.exports = router;