# # Image Display

Billed slideshow med QR-kode upload funktionalitet.

## Deploy til Render.com

1. Gå til [render.com](https://render.com) og opret en konto (gratis)
2. Klik på "New +" og vælg "Web Service"
3. Connect dit GitHub repository: `LAURIDS0/image-display`
4. Indstillinger:
   - **Name**: `image-display` (eller hvad du vil)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Vælg "Free"
5. Klik "Create Web Service"

Efter deploy (ca. 2-3 minutter) får du en URL som `https://image-display-xxxx.onrender.com`

## Brug

- Åbn URL'en på din computer for at se slideshow med QR-kode
- Scan QR-koden fra din mobil for at uploade billeder
- Billederne vises automatisk på computeren i fuld skærm
