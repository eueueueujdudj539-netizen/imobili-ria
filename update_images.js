const fs = require('fs');

const indexPath = 'C:\\Users\\edval\\.gemini\\antigravity\\scratch\\casa-nobre-imoveis\\index.html';
let content = fs.readFileSync(indexPath, 'utf8');

const images = [
  'images/prop_mansion.png',
  'images/prop_penthouse.png',
  'images/prop_studio.png',
  'images/prop_mansion.png',
  'images/prop_penthouse.png',
  'images/prop_studio.png',
  'images/prop_mansion.png',
  'images/prop_penthouse.png',
  'images/prop_studio.png'
];

let i = 0;
// Replace all <div class="property-image" style="..."> with a background image style.
// Note: Some have style="..." so we'll match that.
content = content.replace(/<div class="property-image" style="background: linear-gradient[^>]+">/g, (match) => {
    if (i < images.length) {
        const bgImg = images[i];
        i++;
        return `<div class="property-image" style="background-image: url('${bgImg}'); background-size: cover; background-position: center;">`;
    }
    return match;
});

// also the modal gallery images have linear gradients! Let's just fix the property-cards first as requested.
fs.writeFileSync(indexPath, content);
console.log('Updated property images successfully!');
