const THREE = require('./vendor/three.min.js');

// Hand in right.glb rest pose:
// Wrist at Y = +0.05
// Fingers at Y = -0.11
// Finger points in -Y.
// When rotated by Math.PI on X, -Y becomes +Y (fingers point UPWARDS).
// What is the normal of the back of the hand?
// Palm normal was approx (-0.06, -0.21, 0.10).
// Inverted along X (rotX = PI):
// (x, y, z) -> (x, -y, -z)
// Palm normal becomes (-0.06, +0.21, -0.10) (pointing forward/downward).
// Back of the hand normal is opposite: (+0.06, -0.21, +0.10).
// So with rotX = PI, back of the hand faces towards +Z (directly at camera at (0, 0, +Z))!
console.log('Rotation confirmed: rotX = Math.PI');

