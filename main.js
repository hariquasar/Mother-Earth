import gsap from "gsap";
import * as THREE from "three";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import atmosphereVertexShader from "./shaders/atmosphereVertex.glsl";
import atmosphereFragmentShader from "./shaders/atmosphereFragment.glsl";

const canvasContainer = document.querySelector("#canvasContainer");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  canvasContainer.offsetWidth / canvasContainer.offsetHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: document.querySelector("canvas"),
});

renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(5, 50, 50),
  new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      globeTexture: {
        value: new THREE.TextureLoader().load("./img/globe.jpeg"),
      },
    },
  })
);

scene.add(sphere);

const atmosphere = new THREE.Mesh(
  new THREE.SphereGeometry(5, 50, 50),
  new THREE.ShaderMaterial({
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
  })
);

atmosphere.scale.set(1.1, 1.1, 1.1);
scene.add(atmosphere);

const group = new THREE.Group();
group.add(sphere);
scene.add(group);

const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
});
const starVertices = [];
for (let i = 0; i < 10000; i++) {
  const x = (Math.random() - 0.5) * 2000;
  const y = (Math.random() - 0.5) * 2000;
  const z = -(Math.random() + 0.1) * 2000;
  starVertices.push(x, y, z);
}

const stars = new THREE.Points(starGeometry, starMaterial);
starGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(starVertices, 3)
);

scene.add(stars);
camera.position.z = 15;

// 22.3700556 N, 114.177216 W = hong kong
// 23.6260333 -102.5375005

function createPoint(lat, lng) {
  const point = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.1, 0.8),
    new THREE.MeshBasicMaterial({
      color: "#ff0000",
    })
  );
  const latitude = (lat / 180) * Math.PI;
  const longitude = (lng / 180) * Math.PI;
  const radius = 5;
  const x = radius * Math.cos(latitude) * Math.sin(longitude);
  const y = radius * Math.sin(latitude);
  const z = radius * Math.cos(latitude) * Math.cos(longitude);
  console.log({ x, y, z });

  point.position.x = x;
  point.position.y = y;
  point.position.z = z;

  point.lookAt(0,0,0)
  point.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0,0,-0.5))

  group.add(point);
}

createPoint(23.6260333, -102.5375005)
createPoint(22.3700556, 114.177216)
createPoint(-43.3744881, 172.4662705)
createPoint(55.3617609, -3.4433238)
createPoint(37.4900318, 136.4664008)

const mouse = {
  x: 0,
  y: 0,
};

sphere.rotation.y = -Math.PI / 2;

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  // sphere.rotation.y += 0.002
  gsap.to(group.rotation, {
    x: -mouse.y * 1.5,
    y: mouse.x * 1.5,
    duration: 2,
  });
}

animate();

addEventListener("mousemove", () => {
  mouse.x = (event.clientX / innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / innerHeight) * 2 + 1;

  // console.log(mouse)
});
