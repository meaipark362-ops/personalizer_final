const fs = require('fs');
const THREE = require('./vendor/three.min.js');
global.THREE = THREE;
require('./vendor/GLTFLoader.js');

const buffer = fs.readFileSync('./models/right.glb');
const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

const loader = new THREE.GLTFLoader();
loader.parse(arrayBuffer, '', (gltf) => {
  const mesh = gltf.scene.getObjectByProperty('type', 'SkinnedMesh');
  const bones = {};
  mesh.skeleton.bones.forEach(b => bones[b.name] = b);
  
  // Test curl for index finger:
  // proximal -> intermediate -> distal
  console.log('Rest distance proximal to intermediate:', bones['index-finger-phalanx-proximal'].position.distanceTo(bones['index-finger-phalanx-intermediate'].position));
  console.log('Rest distance intermediate to distal:', bones['index-finger-phalanx-intermediate'].position.distanceTo(bones['index-finger-phalanx-distal'].position));
});

