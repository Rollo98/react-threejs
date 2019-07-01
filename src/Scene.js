import "./index.css";
import React, { Component } from "react";
import * as THREE from "three";
import Orbitcontrols from "three-orbitcontrols";

class Scene extends Component {
  componentDidMount() {
    this.initThree();
  }
  initThree() {
    let camera, scene, renderer;
    // let group;
    let container = document.getElementById("WebGL-output");
    let width = container.clientWidth,
      height = container.clientHeight;
    let windowHalfX = window.innerWidth / 2,
      windowHalfY = window.innerHeight / 2;
    let orbitControls;

    let loadingScreen = {
      scene: new THREE.Scene(),
      camera: new THREE.PerspectiveCamera(60, width / height, 1, 2000)
      // box: new THREE.Mesh(
      //   new THREE.BoxGeometry(0.5, 0.5, 0.5),
      //   new THREE.MeshBasicMaterial({ color: 0x4444ff })
      // )
    };

    let loadingManager = null;
    let RESOURCES_LOADED = false;

    init();
    animate();

    function init() {
      // Init scene
      scene = new THREE.Scene();
      // group = new THREE.Group();
      // scene.add(group);

      // Create a loading screen
      // loadingScreen.box.position.set(0, 0, 5);
      // loadingScreen.camera.lookAt(loadingScreen.box.position);
      // loadingScreen.scene.add(loadingScreen.box);
      loadingManager = new THREE.LoadingManager();
      loadingManager.onProgress = function() {};
      loadingManager.onLoad = function() {
        RESOURCES_LOADED = true;
      };

      // Init camera and perspective
      camera = new THREE.PerspectiveCamera(65, width / height, 1, 2000);
      camera.position.x = -10;
      camera.position.y = 15;
      camera.position.z = 500;
      camera.lookAt(scene.position);

      // Orbitcontrols
      orbitControls = new Orbitcontrols(camera);
      orbitControls.autoRotate = true;
      orbitControls.autoRotateSpeed = 0.2;
      orbitControls.enableZoom = false;
      orbitControls.enableDamping = true;
      orbitControls.dampingFactor = 0.15; // friction factor
      orbitControls.rotateSpeed = 0.1; // mouse sensitivity

      let ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      let pointLight = new THREE.PointLight(0xffffff, 0.5);
      scene.add(pointLight);

      // Texture
      let planetLoader = new THREE.TextureLoader(loadingManager);
      let backgroundLoader = new THREE.CubeTextureLoader(loadingManager);
      let planetTexture = require("./assets/imgs/planets/world.jpg");
      let backgroundTexture = require("./assets/imgs/planets/stars.jpg");

      // Load planet texture
      planetLoader.load(planetTexture, function(texture) {
        let sphereGeometry = new THREE.SphereGeometry(200, 32, 32, 3.2);
        let material = new THREE.MeshBasicMaterial({
          map: texture
        });
        let mesh = new THREE.Mesh(sphereGeometry, material);
        scene.add(mesh);

        let outline = new THREE.MeshLambertMaterial({
          color: 0xffffff,
          side: THREE.BackSide,
          emissive: 0xffffff
        });
        let outlineMesh = new THREE.Mesh(sphereGeometry, outline);
        outlineMesh.scale.multiplyScalar(1.01);
        scene.add(outlineMesh);
      });

      // Load background texture (cube)
      backgroundLoader.load(
        [
          backgroundTexture,
          backgroundTexture,
          backgroundTexture,
          backgroundTexture,
          backgroundTexture,
          backgroundTexture
        ],
        function(texture) {
          scene.background = texture;
        }
      );

      renderer = new THREE.WebGLRenderer();
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(width, height);
      container.appendChild(renderer.domElement);

      window.addEventListener("resize", onWindowResize, false);
    }

    function animate() {
      if (RESOURCES_LOADED === false) {
        requestAnimationFrame(animate);
        renderer.render(loadingScreen.scene, loadingScreen.camera);
        return; // Stop the function here.
      }
      requestAnimationFrame(animate);
      orbitControls.update(); // required when damping is enabled; otherwise, not required
      render();
    }
    function render() {
      scene.rotation.y += 0.002;
      renderer.render(scene, camera);
    }
    function onWindowResize() {
      windowHalfX = window.innerWidth / 2;
      windowHalfY = window.innerHeight / 2;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }
  render() {
    return (
      <div id="WebGL-output">
        <div className="overlay">
          <h1 className="title">WEB DESIGN</h1>
        </div>
      </div>
    );
  }
}

export default Scene;
