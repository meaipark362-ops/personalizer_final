const fs = require('fs');
const THREE = require('./vendor/three.min.js');
global.THREE = THREE;
require('./vendor/GLTFLoader.js');

const buffer = fs.readFileSync('./models/right.glb');
const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

const loader = new THREE.GLTFLoader();
loader.parse(arrayBuffer, '', (gltf) => {
  const mesh = gltf.scene.getObjectByProperty('type', 'SkinnedMesh');
  const pos = mesh.geometry.attributes.position;
  const nrm = mesh.geometry.attributes.normal;
  
  // Find vertices around palm center: Y around 0.0, Z around 0.0
  let avgNx = 0, avgNy = 0, avgNz = 0, count = 0;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    if (Math.abs(y) < 0.02 && Math.abs(z) < 0.02) {
      avgNx += nrm.getX(i);
      avgNy += nrm.getY(i);
      avgNz += nrm.getZ(i);
      count++;
    }
  }
  console.log('Average palm normal near (0,0,0):', avgNx/count, avgNy/count, avgNz/count);
});

