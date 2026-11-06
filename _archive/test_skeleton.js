const fs = require('fs');
const THREE = require('./vendor/three.min.js');
global.THREE = THREE;
require('./vendor/GLTFLoader.js');

const buffer = fs.readFileSync('./models/right.glb');
const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

const loader = new THREE.GLTFLoader();
loader.parse(arrayBuffer, '', (gltf) => {
  const mesh = gltf.scene.getObjectByProperty('type', 'SkinnedMesh');
  console.log('Skeleton bone count:', mesh.skeleton.bones.length);
  console.log('Bind matrix inverse count:', mesh.skeleton.boneInverses.length);
});

