/* 3BIT3BOARD PERSONALIZER — Translucent White 3D Human Hand & Smart Ring Model */
(function (global) {
  'use strict';

  function createRealisticHand(THREE, onLoadCallback) {
    const root = new THREE.Group();
    const handGroup = new THREE.Group();
    root.add(handGroup);

    // Clean sculpted hand material (neutral studio look, no colored ambient tint)
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: 0xe6ebf0,
      roughness: 0.38,
      metalness: 0.04,
      emissive: 0x000000,
      emissiveIntensity: 0.0
    });

    // Pure Silver Smart Ring Material
    const silverRingMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8fafd,
      metalness: 0.96,
      roughness: 0.12,
      emissive: 0x181c20,
      emissiveIntensity: 0.06,
      side: THREE.DoubleSide
    });

    let mesh = null;
    let bones = {};
    let ringMeshGroup = null;
    let isReady = false;

    const chains = [
      ['thumb-metacarpal', 'thumb-phalanx-proximal', 'thumb-phalanx-distal', 'thumb-tip'],
      ['index-finger-metacarpal', 'index-finger-phalanx-proximal', 'index-finger-phalanx-intermediate', 'index-finger-phalanx-distal', 'index-finger-tip'],
      ['middle-finger-metacarpal', 'middle-finger-phalanx-proximal', 'middle-finger-phalanx-intermediate', 'middle-finger-phalanx-distal', 'middle-finger-tip'],
      ['ring-finger-metacarpal', 'ring-finger-phalanx-proximal', 'ring-finger-phalanx-intermediate', 'ring-finger-phalanx-distal', 'ring-finger-tip'],
      ['pinky-finger-metacarpal', 'pinky-finger-phalanx-proximal', 'pinky-finger-phalanx-intermediate', 'pinky-finger-phalanx-distal', 'pinky-finger-tip']
    ];

    const restTransforms = {};

    function parseHandGLB(dataBuffer) {
      const loader = new THREE.GLTFLoader();
      loader.parse(dataBuffer, '', function (gltf) {
        const scene = gltf.scene;
        mesh = scene.getObjectByProperty('type', 'SkinnedMesh');
        if (!mesh) return;

        mesh.material = skinMaterial;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        mesh.skeleton.bones.forEach(function (b) {
          bones[b.name] = b;
        });

        // Re-parent bones into hierarchical chain while keeping original GLTF bind boneInverses
        scene.updateMatrixWorld(true);
        chains.forEach(function (chain) {
          bones['wrist'].attach(bones[chain[0]]);
          for (let i = 1; i < chain.length; i++) {
            bones[chain[i - 1]].attach(bones[chain[i]]);
          }
        });

        // Save local rest transforms AFTER hierarchical re-parenting
        mesh.skeleton.bones.forEach(function (b) {
          restTransforms[b.name] = {
            pos: b.position.clone(),
            quat: b.quaternion.clone()
          };
        });

        // Attach Smart Ring (from ring.glb) to Index Finger Proximal Phalanx
        const ringBone = bones['index-finger-phalanx-proximal'];
        if (ringBone) {
          ringMeshGroup = new THREE.Group();

          if (typeof global.RING_GLB_BASE64 === 'string') {
            const rBin = (typeof atob === 'function') ? atob(global.RING_GLB_BASE64) : Buffer.from(global.RING_GLB_BASE64, 'base64').toString('binary');
            const rBytes = new Uint8Array(rBin.length);
            for (let i = 0; i < rBin.length; i++) rBytes[i] = rBin.charCodeAt(i);
            const rLoader = new THREE.GLTFLoader();
            rLoader.parse(rBytes.buffer, '', function (rGltf) {
              let rMesh = null;
              rGltf.scene.traverse(function (o) { if (o.isMesh && !rMesh) rMesh = o; });
              if (rMesh) {
                const rGeom = rMesh.geometry.clone();
                rGeom.center();
                rGeom.computeVertexNormals();
                const ringObj = new THREE.Mesh(rGeom, silverRingMaterial);
                // Hole is along X in original GLB, rotate so hole aligns with finger shaft (-Z)
                ringObj.rotation.y = Math.PI / 2;
                const scaleF = 0.0125;
                ringObj.scale.set(scaleF, scaleF, scaleF);
                ringMeshGroup.add(ringObj);
              }
            });
          } else {
            // Fallback geometry if base64 not yet loaded
            const ringGeo = new THREE.CylinderGeometry(0.0108, 0.0112, 0.008, 48, 1, true);
            ringGeo.rotateX(Math.PI / 2);
            const ringBody = new THREE.Mesh(ringGeo, silverRingMaterial);
            ringMeshGroup.add(ringBody);
          }

          ringMeshGroup.position.set(0, 0, -0.022);
          ringBone.add(ringMeshGroup);
        }

        // Center hand geometry and clear 3/4 dorsal view showing all 5 fingers & ring
        scene.position.set(0.0, -0.015, 0);
        scene.rotation.set(Math.PI * 0.90, 1.15, 0.22);

        handGroup.add(scene);
        isReady = true;

        if (typeof onLoadCallback === 'function') onLoadCallback();
      });
    }

    if (typeof global.HAND_GLB_BASE64 === 'string') {
      const bin = (typeof atob === 'function') ? atob(global.HAND_GLB_BASE64) : Buffer.from(global.HAND_GLB_BASE64, 'base64').toString('binary');
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      parseHandGLB(bytes.buffer);
    }

    function applyPose(p) {
      if (!isReady) return;

      const cI = p.curlIndex || 0;
      const cM = p.curlMiddle || 0;
      const cR = p.curlRing || 0;
      const cP = p.curlPinky || 0;
      const pinch = p.pinch || 0;
      const tap = p.ringTap || 0;
      const gPose = p.gesturePose || 0;

      for (let k in bones) {
        if (restTransforms[k]) {
          bones[k].quaternion.copy(restTransforms[k].quat);
        }
      }

      const baseArch = 0.08 - gPose * 0.14;

      // Index finger:
      // - In PINCH (pinch -> 1): curls down to meet thumb tip (-0.90, -0.90, -0.54)
      // - In CLICK (tap -> 1): stays braced (-0.15, -0.20) so thumb can press the ring on index proximal phalanx
      if (bones['index-finger-phalanx-proximal']) {
        const p1 = -(baseArch * 0.55 + cI * 0.4 + pinch * 0.90 + tap * 0.15);
        const p2 = -(baseArch * 0.65 + cI * 0.45 + pinch * 0.90 + tap * 0.20);
        const p3 = -(baseArch * 0.45 + cI * 0.35 + pinch * 0.54 + tap * 0.10);
        bones['index-finger-phalanx-proximal'].rotateX(p1);
        bones['index-finger-phalanx-intermediate'].rotateX(p2);
        bones['index-finger-phalanx-distal'].rotateX(p3);
        if (gPose > 0.01) {
          bones['index-finger-phalanx-proximal'].rotateY(gPose * 0.18);
        }
      }

      // Middle finger
      if (bones['middle-finger-phalanx-proximal']) {
        const mBend = -(baseArch + 0.05 + cM * 0.6 + pinch * 0.18 + tap * 0.22);
        bones['middle-finger-phalanx-proximal'].rotateX(mBend * 0.55);
        bones['middle-finger-phalanx-intermediate'].rotateX(mBend * 0.65);
        bones['middle-finger-phalanx-distal'].rotateX(mBend * 0.45);
      }

      // Ring finger
      if (bones['ring-finger-phalanx-proximal']) {
        const rBend = -(baseArch + 0.08 + cR * 0.5 + pinch * 0.24 + tap * 0.28);
        bones['ring-finger-phalanx-proximal'].rotateX(rBend * 0.5);
        bones['ring-finger-phalanx-intermediate'].rotateX(rBend * 0.6);
        bones['ring-finger-phalanx-distal'].rotateX(rBend * 0.45);
      }

      // Pinky finger
      if (bones['pinky-finger-phalanx-proximal']) {
        const pBend = -(baseArch + 0.12 + cP * 0.6 + pinch * 0.28 + tap * 0.32);
        bones['pinky-finger-phalanx-proximal'].rotateX(pBend * 0.55);
        bones['pinky-finger-phalanx-intermediate'].rotateX(pBend * 0.65);
        bones['pinky-finger-phalanx-distal'].rotateX(pBend * 0.45);
        if (gPose > 0.01) {
          bones['pinky-finger-phalanx-proximal'].rotateY(-gPose * 0.22);
        }
      }

      // Thumb kinematics:
      // - PINCH (pinch -> 1): thumb tip meets index finger tip (tx: -0.40, ty: +0.20, tp: -0.45, td: -0.27)
      // - CLICK (tap -> 1): thumb tip presses outer left-front edge of smart ring on index finger (tx: 0.20, ty: -0.70, tz: 0.20, tp: -1.00, td: -0.40)
      if (bones['thumb-phalanx-proximal']) {
        const tx = pinch * -0.40 + tap * 0.20 + gPose * 0.18;
        const ty = pinch * 0.20 + tap * -0.70 + gPose * 0.22;
        const tz = tap * 0.20;
        const tp = pinch * -0.45 + tap * -1.00;
        const td = pinch * -0.27 + tap * -0.40;
        bones['thumb-metacarpal'].rotateX(tx);
        bones['thumb-metacarpal'].rotateY(ty);
        bones['thumb-metacarpal'].rotateZ(tz);
        bones['thumb-phalanx-proximal'].rotateX(tp);
        bones['thumb-phalanx-distal'].rotateX(td);
      }

      const roll = p.wristRoll || 0;
      const pitch = p.wristPitch || 0;
      const yaw = p.wristYaw || 0;
      handGroup.rotation.y = roll * 0.95 + yaw * 0.45 + pinch * 0.58 - tap * 0.08;
      handGroup.rotation.z = roll * 0.52 + gPose * 0.22 - pinch * 0.12;
      handGroup.rotation.x = pitch * 0.42 - gPose * 0.18 + pinch * 0.15;
    }

    return {
      root: root,
      handGroup: handGroup,
      applyPose: applyPose,
      isLoaded: function () { return isReady; },
      getRingPosition: function () {
        if (!ringMeshGroup) return new THREE.Vector3();
        const v = new THREE.Vector3();
        ringMeshGroup.getWorldPosition(v);
        return v;
      }
    };
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = createRealisticHand;
  else global.createRealisticHand = createRealisticHand;
})(typeof window !== 'undefined' ? window : globalThis);
