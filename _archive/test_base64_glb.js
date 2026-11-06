const fs = require('fs');
const THREE = require('./vendor/three.min.js');
global.THREE = THREE;
require('./vendor/GLTFLoader.js');

const buffer = fs.readFileSync('./models/right.glb');
const base64 = buffer.toString('base64');
console.log('Base64 length:', base64.length);

// In browser:
// const binary = atob(base64);
// const bytes = new Uint8Array(binary.length);
// for(let i=0; i<binary.length; i++) bytes[i] = binary.charCodeAt(i);
// loader.parse(bytes.buffer, '', (gltf) => ...);

const binary = Buffer.from(base64, 'base64');
const arrayBuffer = binary.buffer.slice(binary.byteOffset, binary.byteOffset + binary.byteLength);

const loader = new THREE.GLTFLoader();
loader.parse(arrayBuffer, '', (gltf) => {
  console.log('Successfully parsed from base64!');
  console.log('Root children:', gltf.scene.children.length);
});

