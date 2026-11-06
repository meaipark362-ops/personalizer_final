const fs = require('fs');
const THREE = require('./vendor/three.min.js');
global.THREE = THREE;
require('./vendor/GLTFLoader.js');

const buffer = fs.readFileSync('./models/right.glb');
const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

const loader = new THREE.GLTFLoader();
loader.parse(arrayBuffer, '', (gltf) => {
  const scene = gltf.scene;
  const bones = {};
  scene.traverse((obj) => {
    if (obj.isBone) {
      bones[obj.name] = obj;
      console.log(`${obj.name} -> parent: ${obj.parent ? obj.parent.name : 'none'}`);
    }
  });
});

