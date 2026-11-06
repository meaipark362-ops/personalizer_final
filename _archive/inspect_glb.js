const fs = require('fs');
const THREE = require('./vendor/three.min.js');
global.THREE = THREE;
require('./vendor/GLTFLoader.js');

const buffer = fs.readFileSync('./models/right.glb');
const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

const loader = new THREE.GLTFLoader();
loader.parse(arrayBuffer, '', (gltf) => {
  console.log('Scene parsed successfully!');
  const bones = [];
  const meshes = [];
  gltf.scene.traverse((obj) => {
    if (obj.isBone) bones.push(obj.name);
    if (obj.isMesh || obj.isSkinnedMesh) {
      meshes.push({ name: obj.name, type: obj.type, count: obj.geometry.attributes.position.count });
    }
  });
  console.log('Bones count:', bones.length);
  console.log('Bones:', bones);
  console.log('Meshes:', meshes);
}, (err) => {
  console.error('Parse error:', err);
});

