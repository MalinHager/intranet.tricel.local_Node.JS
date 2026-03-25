
function showPanicLayer()
{
    if(document.getElementById('panicLayer').style.display=='block')
    {
        document.getElementById('panicLayer').style.display='none';
    }
    else
    {
        document.getElementById('panicLayer').style.display='block';
        document.getElementById('panicresult').innerHTML = '';
        document.getElementById('paniccode').value = '';
    }
}

function submitPanic()
{
    var code = document.getElementById('paniccode').value;

    if(code == '')
    {
        document.getElementById('panicresult').innerHTML = 'Enter panic code';
        return;
    }

    var hashedCode = hex_md5(code);

    var http = new XMLHttpRequest();
    http.open("POST", "http://localhost:3000/api/panic", true);
    http.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    http.send("paniccode=" + encodeURIComponent(hashedCode));

    http.onload = function()
    {
        // Visa serverns svar i rutan (t.ex. "Panic sequence activated...")
        document.getElementById('panicresult').innerHTML = this.responseText;

        // Kolla om raderingen lyckades (om texten innehåller "activated")
        if(this.responseText.includes("activated"))
        {
            // Vänta 2 sekunder (2000 ms) så att man hinner se meddelandet, och skicka sedan användaren till index-sidan
            setTimeout(function() {
                window.location.href = "http://localhost:3000";
            }, 2000);
        }
    }
}
