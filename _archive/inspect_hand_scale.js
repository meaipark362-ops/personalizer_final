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
  const box = new THREE.Box3().setFromObject(scene);
  console.log('Hand Bounding Box:', box.min, box.max);
  console.log('Ring Prox position:', ringProx.position);
  console.log('Ring Inter position:', ringInter.position);
  console.log('Distance proximal to intermediate (bone length):', ringProx.position.distanceTo(ringInter.position));
});

