// Create apple-touch-icon.png from SVG

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// For now, let's create a simple HTML file that can be served as a fallback
const iconContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Icon</title>
</head>
<body style="margin:0; padding:0; width:180px; height:180px; background: linear-gradient(45deg, #FF6B35, #F7931E); display:flex; align-items:center; justify-content:center; border-radius:22px;">
    <div style="background:rgba(255,255,255,0.9); width:120px; height:120px; border-radius:60px; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#FF6B35; font-family:Arial,sans-serif;">
        <div style="font-size:36px; margin-bottom:10px;">🍛</div>
        <div style="font-size:10px; font-weight:bold; color:white; line-height:1;">NAMASTE</div>
        <div style="font-size:10px; font-weight:bold; color:white; line-height:1;">CURRY</div>
    </div>
</body>
</html>
`;

// Create a simple text file as placeholder (Vercel will handle this better)
fs.writeFileSync(path.join(__dirname, 'public', 'apple-touch-icon.png.html'), iconContent);

console.log('✅ Created apple-touch-icon placeholder');