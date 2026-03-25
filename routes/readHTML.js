var fs = require('fs');

function readHTML(htmlfile) {
    try {
        // Lägg till 'utf8' så du får text, inte en buffer
        const htmltext = fs.readFileSync(htmlfile, 'utf8');
        
        // Returnera här inne, direkt när det lyckas
        return htmltext;
        
    } catch (err) {
        // Logga felet så du ser vad som gick fel i konsolen
        console.error("Fel vid läsning av fil: " + htmlfile);
        console.error(err.message);
        
        // Returnera null (eller en tom sträng) om filen saknas
        return null;
    }
}

module.exports = readHTML;