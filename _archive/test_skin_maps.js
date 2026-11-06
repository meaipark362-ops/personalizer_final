// Procedural PBR skin maps generator for Three.js
function createSkinMaps(THREE) {
  // 1. Color Map
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = 512;
  colorCanvas.height = 512;
  const ctx = colorCanvas.getContext('2d');
  
  // Base skin tone
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#d9a68e');
  grad.addColorStop(0.5, '#ce947b');
  grad.addColorStop(1, '#c5866d');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle skin noise / pores
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 14;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 0.8));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.6));
  }
  ctx.putImageData(imgData, 0, 0);

  const colorMap = new THREE.CanvasTexture(colorCanvas);
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.RepeatWrapping;
  colorMap.repeat.set(4, 4);

  // 2. Normal Map (fine skin papillae & micro-wrinkles)
  const normCanvas = document.createElement('canvas');
  normCanvas.width = 256;
  normCanvas.height = 256;
  const nctx = normCanvas.getContext('2d');
  const nImg = nctx.createImageData(256, 256);
  const nd = nImg.data;
  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 256; x++) {
      const idx = (y * 256 + x) * 4;
      // Perlin-like cellular skin pattern
      const nx = Math.sin(x * 0.4) * Math.cos(y * 0.4) * 0.5 + (Math.random() - 0.5) * 0.3;
      const ny = Math.cos(x * 0.4) * Math.sin(y * 0.4) * 0.5 + (Math.random() - 0.5) * 0.3;
      nd[idx] = Math.floor((nx * 0.5 + 0.5) * 255);     // R (X tangent)
      nd[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255); // G (Y tangent)
      nd[idx + 2] = 240;                                // B (Z normal outward)
      nd[idx + 3] = 255;
    }
  }
  nctx.putImageData(nImg, 0, 0);

  const normalMap = new THREE.CanvasTexture(normCanvas);
  normalMap.wrapS = THREE.RepeatWrapping;
  normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(8, 8);

  return { colorMap, normalMap };
}

if (typeof module !== 'undefined') module.exports = createSkinMaps;

