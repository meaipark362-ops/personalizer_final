const fs = require('fs');
const THREE = require('./vendor/three.min.js');
global.THREE = THREE;
require('./vendor/GLTFLoader.js');

const buffer = fs.readFileSync('./models/right.glb');
const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

const loader = new THREE.GLTFLoader();
loader.parse(arrayBuffer, '', (gltf) => {
  const mesh = gltf.scene.getObjectByProperty('type', 'SkinnedMesh');
  const b = {};
  mesh.skeleton.bones.forEach(bone => b[bone.name] = bone);
  
  console.log('Wrist:', b['wrist'].position);
  console.log('Index MCP:', b['index-finger-phalanx-proximal'].position);
  console.log('Index Tip:', b['index-finger-tip'].position);
  
  // Vector from MCP to Tip
  const v = b['index-finger-tip'].position.clone().sub(b['index-finger-phalanx-proximal'].position);
  console.log('Index finger direction (MCP to Tip):', v);

  // Thumb direction
  const vt = b['thumb-tip'].position.clone().sub(b['thumb-phalanx-proximal'].position);
  console.log('Thumb direction (Prox to Tip):', vt);
});

