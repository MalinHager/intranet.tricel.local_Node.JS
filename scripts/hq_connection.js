function startHQConnection() {
    console.log("Ansluter till Tricell HQ...");
    
    // Skapa eller hämta behållaren
    let holder = document.getElementById('popupHolder');
    if (!holder) {
        holder = document.createElement('div');
        holder.id = 'popupHolder';
        document.body.appendChild(holder);
    }

    // Hämta HTML-filen
    fetch('/html/hq_popup.html')
        .then(response => {
            if (!response.ok) throw new Error("Kunde inte hitta hq_popup.html");
            return response.text();
        })
        .then(html => {
            holder.innerHTML = html;
            const popup = document.getElementById('hqPopup');
            if (popup) {
                popup.style.display = 'block';
                animateSteps();
            }
        })
        .catch(err => console.error("HQ Error:", err));
}

function animateSteps() {
    const totalSteps = 8;
    for (let i = 0; i < totalSteps; i++) {
        setTimeout(() => {
            const step = document.getElementById('hqStep' + i);
            if (step) {
                step.style.color = '#2a7a2a';
                step.innerHTML = '✔ ' + step.innerText.replace('□', '').trim();
            }

            // När sista steget är klart
            if (i === totalSteps - 1) {
                const msg = document.getElementById('hqDoneMsg');
                if (msg) msg.style.display = 'block';
                
                setTimeout(() => {
                    window.location.href = "/api/virusdatabase";
                }, 1500);
            }
        }, i * 400);
    }
}