const fs = require('fs');
const THREE = require('./vendor/three.min.js');
global.THREE = THREE;
require('./vendor/GLTFLoader.js');

const buffer = fs.readFileSync('./models/right.glb');
const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

const loader = new THREE.GLTFLoader();
loader.parse(arrayBuffer, '', (gltf) => {
  const mesh = gltf.scene.getObjectByProperty('type', 'SkinnedMesh');
  const geom = mesh.geometry;
  console.log('Attributes:', Object.keys(geom.attributes));
  console.log('Vertex count:', geom.attributes.position.count);
  console.log('Has index:', !!geom.index);
  console.log('Index count:', geom.index ? geom.index.count : 0);
  console.log('Has skinIndex:', !!geom.attributes.skinIndex);
  console.log('Has skinWeight:', !!geom.attributes.skinWeight);
  console.log('Has normal:', !!geom.attributes.normal);
  console.log('Has uv:', !!geom.attributes.uv);
});

