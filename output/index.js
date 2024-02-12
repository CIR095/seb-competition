'use strict';

var three = require('three');
var CameraControls = require('camera-controls');
var threeColladaLoader = require('three-collada-loader');

// Get the video
var video = document.getElementById("videoPlayer");

// Function to toggle fullscreen
function toggleFullScreen() {
  if (!document.fullscreenElement) {
    video.requestFullscreen().catch(err => {
      alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
    });
  } else {
    document.exitFullscreen();
  }
}

// Event listener for the video to go fullscreen on click
video.addEventListener('click', toggleFullScreen);


// THREE

// Scene
var scene = new three.Scene();
const canvas = document.getElementById('three-canvas');

// General scene
const axesHelper = new three.AxesHelper(5.0);
axesHelper.material.depthTest = false;
axesHelper.renderOrder = 2;
scene.add(axesHelper);

const grid = new three.GridHelper();
grid.renderOrder = 1;
scene.add(grid);

/*const geometry = new BoxGeometry(2.0, 2.0, 0.5);
const material = new MeshLambertMaterial({color: 0x88ff00, wireframe: false});
const mesh = new Mesh(geometry, material);
mesh.position.x = 2;
scene.add(mesh);*/

// Camera
const camera = new three.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight);
camera.position.x = 5;
camera.position.y = 5;
camera.position.z = 5;
camera.lookAt(axesHelper.position);
scene.add(camera);

// Renderer
var renderer = new three.WebGLRenderer({canvas: canvas});
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio)); // higher than 2 will just consume uselessly resources
renderer.setSize(canvas.clientHeight, canvas.clientHeight, false);
renderer.setClearColor(0x3e3e3e, 1.0);

// Lights
const ambientLight = new three.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
});

// Load a model
var loader = new threeColladaLoader.ColladaLoader();
loader.load('xport.dae', function(collada) {
    var model = collada.scene;
    scene.add(model);
    animate();
});

// Camera Controls
const subsetOfTHREE = {
    MOUSE: three.MOUSE,
    Vector2: three.Vector2,
    Vector3: three.Vector3,
    Vector4: three.Vector4,
    Quaternion: three.Quaternion,
    Matrix4: three.Matrix4,
    Spherical: three.Spherical,
    Box3: three.Box3,
    Sphere: three.Sphere,
    Raycaster: three.Raycaster,
    MathUtils: {
        DEG2RAD: three.MathUtils.DEG2RAD,
        clamp: three.MathUtils.clamp
    }
};
CameraControls.install( { THREE: subsetOfTHREE } );
const clock = new three.Clock();
const cameraControls = new CameraControls(camera, canvas);
cameraControls.dollyToCursor = true;

// Animation loop
function animate() {
    const delta = clock.getDelta();
    cameraControls.update(delta);

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
