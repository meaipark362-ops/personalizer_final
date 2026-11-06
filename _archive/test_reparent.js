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
  
  // Finger chains
  const chains = [
    ['thumb-metacarpal', 'thumb-phalanx-proximal', 'thumb-phalanx-distal', 'thumb-tip'],
    ['index-finger-metacarpal', 'index-finger-phalanx-proximal', 'index-finger-phalanx-intermediate', 'index-finger-phalanx-distal', 'index-finger-tip'],
    ['middle-finger-metacarpal', 'middle-finger-phalanx-proximal', 'middle-finger-phalanx-intermediate', 'middle-finger-phalanx-distal', 'middle-finger-tip'],
    ['ring-finger-metacarpal', 'ring-finger-phalanx-proximal', 'ring-finger-phalanx-intermediate', 'ring-finger-phalanx-distal', 'ring-finger-tip'],
    ['pinky-finger-metacarpal', 'pinky-finger-phalanx-proximal', 'pinky-finger-phalanx-intermediate', 'pinky-finger-phalanx-distal', 'pinky-finger-tip']
  ];
  
  // Re-parent:
  // Convert world positions to local positions under new parent
  const armature = b['wrist'].parent;
  armature.updateMatrixWorld(true);
  
  chains.forEach(chain => {
    b['wrist'].attach(b[chain[0]]);
    for (let i = 1; i < chain.length; i++) {
      b[chain[i - 1]].attach(b[chain[i]]);
    }
  });
  
  mesh.skeleton.calculateInverses();
  console.log('Re-parenting successful! Skeleton updated.');
});

