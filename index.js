import { 
    Scene,
    BoxGeometry,
    MeshBasicMaterial,
    Mesh,
    PerspectiveCamera,
    WebGLRenderer,
    OrthographicCamera,
    MOUSE,
    Vector2,
    Vector3,
    Vector4,
    Quaternion,
    Matrix4,
    Spherical,
    Box3,
    Sphere,
    Raycaster,
    MathUtils,
    Clock,
    MeshLambertMaterial,
    DirectionalLight,
    Color,
    AmbientLight,
    AxesHelper,
    GridHelper,
    SphereGeometry,
    BufferGeometry,
    Float32BufferAttribute
} from 'three';
import CameraControls from 'camera-controls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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
var scene = new Scene();
const canvas = document.getElementById('three-canvas');

// General scene
const axesHelper = new AxesHelper(1.0);
axesHelper.material.depthTest = false;
axesHelper.renderOrder = 2;
//scene.add(axesHelper);

// Camera
const camera = new PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight);
camera.position.x = 0.65;
camera.position.y = 0.6;
camera.position.z = -0.6;
camera.lookAt(axesHelper.position);
scene.add(camera);

// Renderer
var renderer = new WebGLRenderer({canvas: canvas});
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio)); // higher than 2 will just consume uselessly resources
renderer.setSize(canvas.clientHeight, canvas.clientHeight, false);
renderer.setClearColor(0xeeeeee, 1.0);

// Lights
//const ambientLight = new AmbientLight(0xffffff, 0.1);
//scene.add(ambientLight);
const light = new DirectionalLight(0xffffff, 1);
light.position.set(0.5, 1, -1);
scene.add(light);
const light2 = new DirectionalLight(0xffffff, 0.6);
light2.position.set(0, -1, 1);
scene.add(light2);
const light3 = new DirectionalLight(0xffffff, 0.6);
light3.position.set(-1, 1, -1);
scene.add(light3);

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
})

// Load
const loader = new GLTFLoader();
let meshAli;
loader.load( 'ali.glb', function ( gltf ) {
	meshAli = gltf.scene;
  meshAli.rotation.x = -45;
  scene.add( meshAli );
}, undefined, function ( error ) {
	console.error( error );
} );
let meshGlass;
loader.load( 'glass.glb', function ( gltf ) {
	meshGlass = gltf.scene;
  meshGlass.rotation.x = -45;
  scene.add( meshGlass );
}, undefined, function ( error ) {
	console.error( error );
} );
let meshStruct;
loader.load( 'struct.glb', function ( gltf ) {
	meshStruct = gltf.scene;
  meshStruct.rotation.x = -45;
  scene.add( meshStruct );
}, undefined, function ( error ) {
	console.error( error );
} );

const arrayRadius = 0.445;
const sphereRadius = 0.011;
const totalSpheres = 117;
const angleBalls = Math.PI / 5.66;
const spheres = [];
/*for (let i = 0; i < totalSpheres; i++) {
  let angle = (i / totalSpheres) * Math.PI * 2;
  let x = arrayRadius * Math.sin(angle);
  let y = arrayRadius * Math.cos(angle) * Math.cos(angleBalls) - sphereRadius * 2 * Math.sin(angleBalls);
  let z = arrayRadius * Math.cos(angle) * Math.sin(angleBalls) + sphereRadius * 2 * Math.cos(angleBalls);
  const geometry = new BoxGeometry(sphereRadius, 0.016, 0.016);
  const material = new MeshLambertMaterial({ color: 0xffffff });
  const sphere = new Mesh(geometry, material);
  sphere.position.set(x, y, z);
  scene.add(sphere);
  spheres.push(sphere);
}*/

const geometry = new BufferGeometry();
const positions = [];
const normals = [];
const uvs = [];
const radius = 0.011;
const widthSegments = 32;
const heightSegments = 16;
for (let latNumber = 0; latNumber <= heightSegments; latNumber++) {
  const theta = latNumber * Math.PI / heightSegments;
  const sinTheta = Math.sin(theta);
  const cosTheta = Math.cos(theta);

  for (let longNumber = 0; longNumber <= widthSegments; longNumber++) {
    const phi = longNumber * 2 * Math.PI / widthSegments;
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);

    const x = cosPhi * sinTheta;
    const y = cosTheta;
    const z = sinPhi * sinTheta;
    const u = 1 - (longNumber / widthSegments);
    const v = 1 - (latNumber / heightSegments);

    normals.push(x, y, z);
    uvs.push(u, v);
    positions.push(radius * x, radius * y, radius * z);
  }
}
geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
const indices = [];
for (let latNumber = 0; latNumber < heightSegments; latNumber++) {
  for (let longNumber = 0; longNumber < widthSegments; longNumber++) {
    const first = (latNumber * (widthSegments + 1)) + longNumber;
    const second = first + widthSegments + 1;
    indices.push(first, second, first + 1);
    indices.push(second, second + 1, first + 1);
  }
}
geometry.setIndex(indices);
for (let i = 0; i < totalSpheres; i++) {
  let angle = (i / totalSpheres) * Math.PI * 2;
  let x = arrayRadius * Math.sin(angle);
  let y = arrayRadius * Math.cos(angle) * Math.cos(angleBalls) - sphereRadius * 2 * Math.sin(angleBalls);
  let z = arrayRadius * Math.cos(angle) * Math.sin(angleBalls) + sphereRadius * 2 * Math.cos(angleBalls);
  //const geometry = new BoxGeometry(sphereRadius, 0.016, 0.016);
  const material = new MeshLambertMaterial({ color: 0xffffff });
  const sphere = new Mesh(geometry, material);
  sphere.position.set(x, y, z);
  scene.add(sphere);
  spheres.push(sphere);
}

const angle = -0.01;
let boolRotate = false;
let boolExplode = false;
function activateRotation() {
      boolRotate = !boolRotate;
}
const myButtonRotation = document.getElementById('myButtonRotation');
myButtonRotation.addEventListener('click', activateRotation);
const explosion = 0.15;
function activateExplosion() {
    boolExplode = !boolExplode;
}
const myButtonExplosion = document.getElementById('myButtonExplosion');
myButtonExplosion.addEventListener('click', activateExplosion);

// Camera Controls
const subsetOfTHREE = {
    MOUSE,
    Vector2,
    Vector3,
    Vector4,
    Quaternion,
    Matrix4,
    Spherical,
    Box3,
    Sphere,
    Raycaster,
    MathUtils: {
        DEG2RAD: MathUtils.DEG2RAD,
        clamp: MathUtils.clamp
    }
};
CameraControls.install( { THREE: subsetOfTHREE } );
const clock = new Clock();
const cameraControls = new CameraControls(camera, canvas);
cameraControls.dollyToCursor = true;

// Animation loop
let exploded = 0.0;
function animate() {
    const delta = clock.getDelta();
    cameraControls.update(delta);

    if (meshAli) {
      if(boolRotate) {
        meshAli.rotation.y += angle;
      }
    } else {
        console.error('meshAli is not loaded yet.');
    }

    if(meshAli && meshGlass) {
      if(boolExplode) {
        if(exploded < explosion) {
          meshAli.position.y += 0.01 * 2;
          meshAli.position.z -= 0.013 * 2;
          meshGlass.position.y -= 0.01;
          meshGlass.position.z += 0.013;
          spheres.forEach(sphere => {
            sphere.position.y += 0.01;
            sphere.position.z -= 0.013;
          });
          exploded += 0.01;
        }
      }
      else {
        if(exploded > 0.0) {
          meshAli.position.y -= 0.01 * 2;
          meshAli.position.z += 0.013 * 2;
          meshGlass.position.y += 0.01;
          meshGlass.position.z -= 0.013;
          spheres.forEach(sphere => {
            sphere.position.y -= 0.01;
            sphere.position.z += 0.013;
          });
          exploded -= 0.01;
        }
      }
    }

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
