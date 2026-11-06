const fs = require('fs');
const THREE = require('./vendor/three.min.js');
global.THREE = THREE;
require('./vendor/GLTFLoader.js');

const buffer = fs.readFileSync('./models/right.glb');
const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

const loader = new THREE.GLTFLoader();
loader.parse(arrayBuffer, '', (gltf) => {
  const scene = gltf.scene;
  scene.updateMatrixWorld(true);
  const ringProx = scene.getObjectByName('ring-finger-phalanx-proximal');
  const ringInter = scene.getObjectByName('ring-finger-phalanx-intermediate');
  
  // What is the direction from ringProx to ringInter in ringProx's local coordinates?
  const localInterPos = ringInter.position.clone();
  console.log('Local direction to child:', localInterPos);
  
  // Let's test rotating ringProx on X, Y, Z to see which axis curls the finger
  console.log('Initial rotation:', ringProx.rotation);
});

