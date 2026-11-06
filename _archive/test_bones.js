const fs = require('fs');
const THREE = require('./vendor/three.min.js');
global.THREE = THREE;
require('./vendor/GLTFLoader.js');

const buffer = fs.readFileSync('./models/right.glb');
const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

const loader = new THREE.GLTFLoader();
loader.parse(arrayBuffer, '', (gltf) => {
  const mesh = gltf.scene.getObjectByProperty('type', 'SkinnedMesh');
  const skeleton = mesh.skeleton;
  
  // Let's print each bone's bind matrix and position
  skeleton.bones.forEach((b, i) => {
    console.log(`[${i}] ${b.name}: pos(${b.position.x.toFixed(3)}, ${b.position.y.toFixed(3)}, ${b.position.z.toFixed(3)}) rot(${b.rotation.x.toFixed(2)}, ${b.rotation.y.toFixed(2)}, ${b.rotation.z.toFixed(2)})`);
  });
});

