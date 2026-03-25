const fs = require('fs');

function getVirusImagesHTML(virusId) {
    let html = '';

    // Lightbox modal (förstoring)
    html += `
        <div id="image-lightbox" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:9999; justify-content:center; align-items:center; cursor:pointer;" onclick="this.style.display='none';">
            <span style="position:absolute; top:20px; right:30px; color:#fff; font-size:36px; font-weight:bold; cursor:pointer; z-index:10000; line-height:1;" onclick="event.stopPropagation(); document.getElementById('image-lightbox').style.display='none';">&#x2715;</span>
            <img id="lightbox-img" src="" alt="Enlarged" style="max-width:90%; max-height:90%; object-fit:contain; border:2px solid #fff; cursor:default;" onclick="event.stopPropagation();">
        </div>
    `;

    html += '<div class="virusimages-section" style="margin-top:50px; border-top: 2px solid #eee; padding-top: 20px;">';

    // Header med STÖRRE titel och SNYGGARE upload-del
    html += '<div style="display:flex; justify-content:space-between; align-items: center; margin-bottom: 25px;">';
    html += '<h2 style="margin:0; font-size: 26px; color: #333; letter-spacing: 1px;">Research Images</h2>';
    
    // Upload-knapp och text närmare varandra
    html += `
        <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 14px; font-weight: bold; color: #555;">Upload image</span>
            <a id="upload-new-image-btn" 
               onclick="document.getElementById('virusimage-input').click();" 
               style="display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; background: #4682B4; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; cursor: pointer; transition: background 0.2s; font-size: 20px; border: 1px solid #333;">+</a>
        </div>
    `;

    // Dolt formulär
    html += `
        <form id="upload-image-form" action="/api/virusdatabase/uploadimage/${virusId}" method="POST" enctype="multipart/form-data" style="display:none;">
            <input type="file" name="virusimage" id="virusimage-input" accept="image/jpeg" onchange="this.form.submit()">
        </form>
    `;

    html += '</div>';

    // Gallery grid - Vi använder 4 kolumner för att få lagom stora bilder
    html += '<div class="virusimages-gallery" style="display:grid; grid-template-columns: repeat(4, 1fr); gap:15px;">';

    const imageDir = `./public/virusphoto/${virusId}`;
    if (fs.existsSync(imageDir)) {
        const files = fs.readdirSync(imageDir).filter(file => file.endsWith('.jpg')).sort((a, b) => {
            return parseInt(a) - parseInt(b);
        });

        if (files.length === 0) {
            html += '<p style="color:#999; font-style:italic; grid-column: span 4;">No research images found in database.</p>';
        }

        files.forEach((file) => {
            // Alla bilder är nu lika stora och visas i 4 kolumner
            html += `
                <div class="image-item" style="position:relative; border: 1px solid #ccc; background: #f9f9f9; padding: 5px; box-shadow: 2px 2px 5px rgba(0,0,0,0.1);">
                    <img src="/virusphoto/${virusId}/${file}"
                         style="width:100%; height:180px; object-fit:cover; cursor:pointer; display: block;"
                         onclick="event.stopPropagation(); var lb = document.getElementById('image-lightbox'); document.getElementById('lightbox-img').src=this.src; lb.style.display='flex';">
                    
                    <a class="delete-image-btn" 
                       href="/api/virusdatabase/deleteimage/${virusId}/${file}" 
                       style="position:absolute; top:10px; right:10px; background:rgba(222, 38, 72, 0.9); color:white; text-decoration:none; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size:12px; font-weight: bold; border: 1px solid white;"
                       onclick="return confirm('Delete this image?');">
                        &#x2715;
                    </a>
                </div>
            `;
        });
    }

    html += '</div></div>';
    return html;
}

module.exports = { getVirusImagesHTML };