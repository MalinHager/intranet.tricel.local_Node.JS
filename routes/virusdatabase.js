const express = require('express');
const router = express.Router();
const ADODB = require('node-adodb');
var cookieParser = require('cookie-parser');
var fs = require('fs');
const path = require('path');
const pug = require('pug');
const readHTML = require('./readHTML.js');
const backupVirus = require('../backup.js');
const { getVirusImagesHTML } = require('./virusimages.js');


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
var htmlVirusimagesCSS = readHTML('./masterframe/virusimages_css.html');

// LISTAN (Huvudsidan)
router.get('/', (request, response) => {
    const connection = ADODB.open('Provider=Microsoft.jet.OLEDB.4.0;Data Source=./data/mdb/researchdata.mdb');

    async function sqlQuery() {
        response.write(htmlHead);
        if(request.session && request.session.loggedin) 
        {
            response.write(readHTML('./masterframe/loggedinmenu_css.html'));
            response.write(readHTML('./masterframe/loggedinmenu_js.html'));
        }   
        response.write(htmlHeader);
        response.write(htmlMenu);
        response.write(htmlInfoStart);

        let htmloutput = "<link rel='stylesheet' href='/css/personnelregistry.css' />" +
            "<table border='0' width='100%'><tr><td width='350'><h2>Research Object Database:</h2></td>";
        
        if(request.session.loggedin) {
            htmloutput += "<td align='right'><a href='/api/virusdatabase/newvi' style='color:#336699;'>Add Research Object</a></td>";
        }
        htmloutput += "</tr></table><table id='personnel'><tr>" +
            "<td class='infoheadinglight'>Number</td><td class='infoheadingdark'>Name</td>" +
            "<td class='infoheadinglight'>Created</td><td class='infoheadinglight'>By</td>" +
            "<td class='infoheadinglight'>Entries</td><td class='infoheadinglight'>Last Entry</td>";

        if(request.session.loggedin) {
            htmloutput += "<td class='infoheadinglight'>EDIT</td><td class='infoheadinglight'>DEL</td>";
        }
        htmloutput += "</tr>";

        const result = await connection.query('SELECT id, objectNumber, objectName, objectCreator, objectCreatedDate, objectStatus FROM ResearchObjects');        
        result.forEach(row => {
            // Hämta användarnivå (vi gör den till stor bokstav för säkerhets skull)
            const userLevel = request.session.securityaccesslevel ? request.session.securityaccesslevel.toUpperCase() : "";

            // --- SÄKERHETSKONTROLL ---
            // Om status är archive och man INTE är nivå A -> Hoppa över (visa inte alls)
            if (row.objectStatus === 'archive' && userLevel !== 'A') {
                return; 
            }

            // Om den är arkiverad (men vi är nivå A), gör raden lite genomskinlig/grå
            const rowStyle = (row.objectStatus === 'archive') ? "style='background-color: #eeeeee; color: #888;'" : "";

            htmloutput += `<tr ${rowStyle}>
                <td class='infolight'>${row.objectNumber}</td>
                <td class='infodark'><a href='/api/virusdatabase/${row.id}' ${(row.objectStatus === 'archive' ? "style='color:#888;'" : "")}>${row.objectName}</a></td>
                <td class='infolight'>${row.objectCreatedDate}</td>
                <td class='infolight'>${row.objectCreator}</td>

                <td class='infolight'>${request.session.logintimes || 0}</td>
                <td class='infolight'>${request.session.lastlogin || 'Never'}</td>`;

            if(request.session.loggedin) {
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

// 2. FORMULÄR FÖR NYTT OBJEKT 
router.get('/newvi', (request, response) => {
    if (!request.session || !request.session.loggedin) return response.redirect('/'); 
    response.write(htmlHead);
    response.write(pug_loggedinmenu(
    {
        employeecode: request.session.employeecode,
        name: request.session.username,
        logintimes: request.session.logintimes,
        lastlogin: request.session.lastlogin,
        securityaccesslevel: request.session.securityaccesslevel
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
                    lastlogin: request.session.lastlogin,
                    securityaccesslevel: request.session.securityaccesslevel
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

// 6. DELETE (Uppdaterad för att även radera bildmappen)
router.get('/deletevirus/:id', (request, response) => {
    const virusId = request.params.id; // Spara ID:t i en variabel
    const connection = ADODB.open('Provider=Microsoft.jet.OLEDB.4.0;Data Source=./data/mdb/researchdata.mdb');

    connection.execute("DELETE FROM ResearchObjects WHERE id = " + virusId)
        .then(() => {
            // Här lägger vi in logiken för att städa upp bilderna
            var imagePath = `./public/virusphoto/${virusId}`;
            
            if(fs.existsSync(imagePath)) {
                // rmdirSync med recursive:true tar bort mappen och allt innehåll
                fs.rmdirSync(imagePath, { recursive: true });
                console.log(`Bilder för virus ${virusId} raderade.`);
            }

            // Först när allt är klart skickar vi tillbaka användaren
            response.redirect('/api/virusdatabase');
        })
        .catch(err => {
            console.error("Fel vid radering:", err);
            response.status(500).send("Kunde inte radera objektet.");
        });
});

router.get('/:id', (request, response) => {
    const connection = ADODB.open('Provider=Microsoft.jet.OLEDB.4.0;Data Source=./data/mdb/researchdata.mdb');
    const str_virusID = request.params.id;

    const targetId = request.params.id; // Ändrat från virusId till id för att matcha din route-parameter
    const safeVirusId = String(targetId).replace(/[^a-zA-Z0-9_-]/g, '');
    const dirPath = path.join(__dirname, '..', 'data', safeVirusId, 'attachments');

    let attachmentsHTML = '';

    if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);

    attachmentsHTML = files.map(file => {
      const fullPath = path.join(dirPath, file);
      const stats = fs.statSync(fullPath);

    return `
      <div class="source_row">
        <span class="source_value">${file}</span>
        <span class="source_size">${(stats.size / 1024).toFixed(1)} KB</span>
        <span class="source_date"></span>
        <div class="source_icons">
          <form method="POST" action="/api/virusdatabase/${safeVirusId}/delete-file" style="display:inline;">
      <input type="hidden" name="fileName" value="${file}">
      <button type="submit">🗑️</button>
    </form>
        </div>
      </div>
    `;
    }).join('');
    } 
    else 
    {
    attachmentsHTML = `<div class="source_row">Inga filer</div>`;
    }


    async function sqlQuery() {
        try {
            const result = await connection.query("SELECT * FROM ResearchObjects WHERE id= " + str_virusID);
            const row = result[0];
            const userLevel = (request.session.securityaccesslevel || "").toUpperCase();

            // 1. Skriv ut grundläggande Layout & Menyer
            response.write(htmlHead);
            if(request.session && request.session.loggedin) {
                response.write(readHTML('./masterframe/loggedinmenu_css.html'));
                response.write(readHTML('./masterframe/loggedinmenu_js.html'));
                response.write(htmlHeader);
                response.write(pug_loggedinmenu({
                    employeecode: request.session.username,
                    name: request.cookies.name || "User",
                    logintimes: request.session.logintimes || 0,
                    lastlogin: request.session.lastlogin || "",
                    securityaccesslevel: request.session.securityaccesslevel
                }));
            } else {
                response.write(htmlHeader);
            }

            response.write(htmlMenu);
            response.write(htmlInfoStart);
            

            // 2. Skapa den nya snygga Header-designen (Flexbox)
            let htmloutput = "" +
            "<div style='display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 20px;'>" +
                "<div style='display: flex; gap: 15px; align-items: baseline;'>" +
                    "<h1 style='margin: 0; font-size: 24px;'>" + row.objectNumber + "</h1>" +
                    "<h2 style='margin: 0; font-size: 20px; color: #555;'>" + row.objectName + "</h2>" +
                "</div>" +
                "<div style='text-align: right; font-size: 12px; color: #666; line-height: 1.4;'>" +
                    "Created " + row.objectCreatedDate + "<br>" +
                    "By " + row.objectCreator + " (Hulk)" +
                "</div>" +
            "</div>";

            // Arkiv-varning om status är archive
            if(row.objectStatus === 'archive') {
                htmloutput += `<p style="color:#ff0000; font-weight:bold; background:rgba(255,0,0,0.1); padding:10px; border:1px solid #ff0000;">[ THIS OBJECT IS ARCHIVED ]</p>`;
            }

            // Textarea för virusbeskrivning
            htmloutput += "<form action='/api/virusdatabase/editvirus/" + str_virusID + "'>" +
                "<textarea name='message' rows='10' cols='75' style='width:100%; box-sizing:border-box;'>" + row.objectText + "</textarea>" +
                "<br><br>" +
                "<input type='submit' value='Edit Info' style='padding: 8px 15px; cursor: pointer;'>" + 
                "</form>";

            // 3. Research Navigation (PDF och Videolänkar)
            htmloutput += `
            <style>
                .nav-item a { color: #336699; text-decoration: none; font-weight: bold; }
                .nav-list { list-style-type: none; padding: 0; margin-top: 20px; }
                .nav-item { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; padding: 5px; border-bottom: 1px solid #eee; }
                .btn-nav { text-decoration: none; padding: 2px 8px; border-radius: 3px; font-size: 12px; color: white; }
                .btn-edit { background-color: #44ad3a; }
                .btn-delete { background-color: #de2648; }
            </style>
            <h2>Research Navigation</h2>
            <ul class="nav-list">
                <li class="nav-item">
                    <span>Security Data Sheet:</span>
                    <a href="/pdf/${encodeURIComponent(row.objectNumber)}.pdf" target="_blank" style="flex-grow: 1;">Open PDF Document</a>
                    <a href="/api/virusdatabase/editvirus/${str_virusID}" class="btn-nav btn-edit">E</a>
                    <a href="/api/virusdatabase/deletevirus/${str_virusID}" class="btn-nav btn-delete">D</a>
                </li>
                <li class="nav-item">
                    <span>Security Presentation Video:</span>
                    <a href="${row.presentationVideoLink}" target="_blank" style="flex-grow: 1;">${row.presentationVideoLink || 'No Link'}</a>
                    <a href="/api/virusdatabase/editvirus/${str_virusID}" class="btn-nav btn-edit">E</a>
                    <a href="/api/virusdatabase/deletevirus/${str_virusID}" class="btn-nav btn-delete">D</a>
                </li>
                <li class="nav-item">
                    <span>Security Handling Video:</span>
                    <a href="${row.securityVideoLink}" target="_blank" style="flex-grow: 1;">${row.securityVideoLink || 'No Link'}</a>
                    <a href="/api/virusdatabase/editvirus/${str_virusID}" class="btn-nav btn-edit">E</a>
                    <a href="/api/virusdatabase/deletevirus/${str_virusID}" class="btn-nav btn-delete">D</a>
                </li>
            </ul>`;

            htmloutput += `
            <div class="addNewFile">
            <p>Upload new file</p>
            <span class="icon_add_file"><a href="/api/data/${safeVirusId}">📝</a></span>
            </div>
            <span class="source_label">Attachment:</span>
            <div id="sources_container">
              ${attachmentsHTML}
            </div>
            `;

            // Skriv ut allt vi byggt hittills i htmloutput
            response.write(htmloutput);

            // 4. Inkludera Research Entries (Loggboken)
            if(request.session && request.session.loggedin) {
                response.write(readHTML('./masterframe/researchentries_css.html'));
                response.write(readHTML('./masterframe/researchentries_js.html'));
                response.write(readHTML('./masterframe/researchentries.html'));

                // 5. Funktionsknappar längst ner (Edit, Backup, Archive)
                response.write(`<div style="display:flex; gap:10px; margin-top:30px; padding-top:20px; border-top:1px solid #ccc; flex-wrap: wrap;">`);

                // Edit (Blå)
                response.write(`<a href="/api/virusdatabase/editvirus/${str_virusID}"><button style="padding:8px 14px; background:#4682B4; color:#fff; border:1px solid #000; font-weight:bold; cursor:pointer;">Edit info</button></a>`);
                
                // Backup (Blå)
                response.write(`<a href="/api/virusdatabase/backup/${str_virusID}"><button style="padding:8px 14px; background:#4682B4; color:#fff; border:1px solid #000; font-weight:bold; cursor:pointer;">Backup virus</button></a>`);
           
                response.write(htmlVirusimagesCSS); 
                response.write(getVirusImagesHTML(str_virusID));
                
                // Archive (Röd - endast Nivå A)
                if (userLevel === 'A') {
                    const btnText = (row.objectStatus === 'archive') ? 'Open Object' : 'Archive Object';
                    response.write(`<a href="/api/virusdatabase/toggle/${str_virusID}"><button style="padding:8px 14px; background:#d80439; color:#fff; border:1px solid #000; font-weight:bold; cursor:pointer;">${btnText}</button></a>`);
                }
                response.write(`</div>`);
            }

            response.write(htmlInfoStop);
            response.write(htmlBottom);
            response.end();

        } catch (err) {
            console.error(err);
            if (!response.headersSent) {
                response.status(500).send("Error: " + err);
            }
        }
    }
    sqlQuery();
});

// --------------------- Läs en virus efter backup-----------------------------
router.get('/backup/:id', async function (request, response) {
    const str_virusID = request.params.id;
    const connection = ADODB.open('Provider=Microsoft.jet.OLEDB.4.0;Data Source=./data/mdb/researchdata.mdb');

    try {
        // 1. Hämta datan (result blir en array)
        const result = await connection.query("SELECT * FROM ResearchObjects WHERE id= " + str_virusID);
        const row = result[0];

        // 2. Skriv ut standard-headers
        response.write(htmlHead);
        if (request.session && request.session.loggedin) {
            response.write(readHTML('./masterframe/loggedinmenu_css.html'));
            response.write(readHTML('./masterframe/loggedinmenu_js.html'));
            response.write(htmlHeader);
            response.write(pug_loggedinmenu({
                employeecode: request.session.username,
                name: request.session.username,
                logintimes: request.session.logintimes,
                lastlogin: request.session.lastlogin,
                securityaccesslevel: request.session.securityaccesslevel
            }));
        } else {
            response.write(htmlHeader);
        }

        response.write(htmlMenu);
        response.write(htmlInfoStart);

        // 3. Bygg HTML-outputen för viruset
        let htmlOutput = `<h1>${row.objectNumber} - ${row.objectName}</h1><p>${row.objectText}</p>`;

        // 4. Din knapp-logik med Await för din Promise-baserade backupVirus
        if (request.session.securityaccesslevel == "A" || request.session.securityaccesslevel == "B") {
            htmlOutput += `
            <div style="display:flex; align-items: center; justify-content: space-between; width: 650px;">
                <a href="http://localhost:3000/api/virusdatabase/editvirus/${str_virusID}" style="color:#336699;text-decoration:none;"> 
                    <button style="margin-top:10px; padding:6px 14px; background:#4682B4; color:#000; border:1px solid #000; border-radius:0; font-size:12px; font-weight:bold; cursor:pointer;">
                        Edit info
                    </button>
                </a>
                <button style="margin-top:10px; padding:6px 14px; background:#4682B4; color:#000; border:1px solid #000; border-radius:0; font-size:12px; font-weight:bold; cursor:pointer;">`;

            // Kör backup-funktionen
            const success = await backupVirus(result); 
            
            if (success) {
                htmlOutput += `Virus is now backed up`;
            } else {
                htmlOutput += `Error backing up virus`;
            }

            htmlOutput += `</button></div>`;
        }

        response.write(htmlOutput);
        response.write(htmlInfoStop);
        response.write(htmlBottom);

        // 5. REDIRECT-LOGIKEN (Inlagd utan att ta bort föregående logik)
        // Vi använder ett litet script i klienten som skickar användaren vidare efter 2 sekunder
        // så att de hinner läsa texten "Virus is now backed up" innan Archive-knappen återställs.
        response.write(`
            <script>
                setTimeout(function() {
                    window.location.href = '/api/virusdatabase/${str_virusID}?msg=backedup';
                }, 2000);
            </script>
        `);

        response.end();

    } catch (err) {
        console.error("Backup process failed:", err);
        response.status(500).send("System error under backup-processen: " + err);
    }
});

// --------------------- Växla Open/Archive -------------------
router.get('/toggle/:id', async function(request, response) {
    const targetId = request.params.id;
    
    let userLevel = request.session.securityaccessLevel || "";
    userLevel = userLevel.toString().trim().toUpperCase();

    if (userLevel !== 'A') {
        return response.status(403).send("<h1>Nekat</h1><p>Bara administratörer (A) får göra detta.</p>");
    }

    const ADODB = require('node-adodb');
    const connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=./data/mdb/researchdata.mdb;');

    try {
        const result = await connection.query(`SELECT objectStatus FROM ResearchObjects WHERE id = ${targetId}`);
        if (result.length > 0) {
            const currentStatus = result[0].objectStatus;
            const newStatus = (currentStatus === 'open') ? 'archive' : 'open';
            await connection.execute(`UPDATE ResearchObjects SET objectStatus = '${newStatus}' WHERE id = ${targetId}`);
        }
        response.redirect('/api/virusdatabase/' + targetId);
    } catch (error) {
        response.status(500).send("Update failed.");
    }
});
// --- LOGIK FÖR BILDUPPLADDNING ---
const formidable = require('formidable');

router.post('/uploadimage/:id', (request, response) => {
    const virusId = request.params.id;
    const uploadDir = path.join(__dirname, '../public/virusphoto', virusId);

    // 1. Skapa mappen automatiskt om den inte finns
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = new formidable.IncomingForm();
    form.uploadDir = uploadDir;
    form.keepExtensions = true;

    form.parse(request, (err, fields, files) => {
        if (err) return response.status(500).send("Upload error");

        const oldPath = files.virusimage.filepath;
        // Vi döper filen till nuvarande timestamp för att undvika dubbletter
        const newFileName = Date.now() + '.jpg'; 
        const newPath = path.join(uploadDir, newFileName);

        fs.rename(oldPath, newPath, (err) => {
            if (err) console.log(err);
            response.redirect('/api/virusdatabase/' + virusId);
        });
    });
});

// --- LOGIK FÖR ATT RADERA EN ENSTAKA BILD ---
router.get('/deleteimage/:id/:filename', (request, response) => {
    const { id, filename } = request.params;
    const filePath = path.join(__dirname, '../public/virusphoto', id, filename);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
    response.redirect('/api/virusdatabase/' + id);
});


module.exports = router;