const fs = require('fs');
const THREE = require('./vendor/three.min.js');
global.THREE = THREE;
require('./vendor/GLTFLoader.js');

const buffer = fs.readFileSync('./models/right.glb');
const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

const loader = new THREE.GLTFLoader();
loader.parse(arrayBuffer, '', (gltf) => {
  const mesh = gltf.scene.getObjectByProperty('type', 'SkinnedMesh');
  const bones = mesh.skeleton.bones;
  
  // Store rest transforms
  const rest = bones.map(b => ({
    pos: b.position.clone(),
    quat: b.quaternion.clone()
  }));

  // Let's see: how do the bones deform the mesh?
  // In SkinnedMesh, each vertex has skinIndex and skinWeight.
  // When intermediate bone position is rotated around proximal bone:
  // v_new = proximal.position + (intermediate.position - proximal.position).applyAxisAngle(...)
  console.log('Rest bone transforms captured for', rest.length, 'bones');
});

