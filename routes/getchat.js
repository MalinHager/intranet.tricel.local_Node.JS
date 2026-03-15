const express = require('express');
const router = express.Router();

//Deafult-router om ingen knapp har klickats
router.get('/', (request, response) =>
{
    //öppnar Databasen och läs data
    const ADODB = require('node-adodb');
    const connection = ADODB.open('Provider=Microsoft.jet.OLEDB.4.0;Data Source=./data/mdb/personnelregistry.mdb');

    async function sqlQuery()
    {
        // Skicka SQL-guery till databasen och läs in variabler
        const result = await connection.query('SELECT * FROM chat');

        // Ta reda på antalet meddelanden
        var count = result.length;

        //Loopa igenom och skriv ut varje person
        let newmessage = 0;
        let i;
        for(i=0; i<count; i++)
        {
            str_id = result[i]['id'];
            str_message = result[i]['message'];
            str_employeeid = result[i]['employeeid'];
            str_postdate = result[i]['postdate'];
            str_posttime= result[i]['posttime'];
            str_readby = result[i]['readby']; 
            if(str_readby==null)
            {
                str_readby=" ";
            }
            
            if(str_readby.indexOf(request.session.username)== -1)
            {
                newmessage++;
            }    
    }
    response.send(newmessage.toString());
   
    }
sqlQuery(); 
});

module.exports = router;