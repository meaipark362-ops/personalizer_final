const fs = require('fs');

const buf = fs.readFileSync('./models/right.glb');
const b64 = buf.toString('base64');

const code = `// WebXR Standard Rigged Human Hand (CC0/BSD)
(function(global){
  global.HAND_GLB_BASE64 = "${b64}";
})(typeof window !== 'undefined' ? window : globalThis);
`;

fs.writeFileSync('./models/hand_data.js', code);
console.log('Generated models/hand_data.js with size:', code.length);

