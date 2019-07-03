import "./index.css";
import React, { Component } from "react";
import * as THREE from "three";
import Orbitcontrols from "three-orbitcontrols";
import { HamburgerArrow } from "react-animated-burgers";
import Popup from "./Popup";
class Scene extends Component {
  constructor(props) {
    super(props);
    this.state = { showDetails: false };
  }
  componentDidMount() {
    this.initThree();
  }
  togglePopup = () => {
    this.setState({ showDetails: !this.state.showDetails });
  };
  initThree() {
    let camera, scene, renderer;
    // let group;
    let container = document.getElementById("WebGL-output");
    let width = container.clientWidth,
      height = container.clientHeight;
    let windowHalfX = window.innerWidth / 2,
      windowHalfY = window.innerHeight / 2;
    let orbitControls;
    let composer, renderPass;
    let Shaders = {
      earth: {
        uniforms: {
          texture: { type: "t", value: null }
        },
        vertexShader: [
          "varying vec3 vNormal;",
          "varying vec2 vUv;",
          "void main() {",
          "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
          "vNormal = normalize( normalMatrix * normal );",
          "vUv = uv;",
          "}"
        ].join("\n"),
        fragmentShader: [
          "uniform sampler2D texture;",
          "varying vec3 vNormal;",
          "varying vec2 vUv;",
          "void main() {",
          "vec3 diffuse = texture2D( texture, vUv ).xyz;",
          "float intensity = 1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );",
          "vec3 atmosphere = vec3( 10, 10, 10 ) * pow( intensity, 3.0 );",
          "gl_FragColor = vec4( diffuse + atmosphere, 1.0 );",
          "}"
        ].join("\n")
      },
      atmosphere: {
        uniforms: {},
        vertexShader: [
          "varying vec3 vNormal;",
          "void main() {",
          "vNormal = normalize( normalMatrix * normal );",
          "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
          "}"
        ].join("\n"),
        fragmentShader: [
          "varying vec3 vNormal;",
          "void main() {",
          "float intensity = pow( 0.8 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 12.0 );",
          "gl_FragColor = vec4( 2, 2, 2, 2 ) * intensity;",
          "}"
        ].join("\n")
      }
    };
    var shader, uniforms, material;
    var mesh, atmosphere, point;

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

      // Create a loading screen
      loadingManager = new THREE.LoadingManager();
      loadingManager.onProgress = function() {};
      loadingManager.onLoad = function() {
        RESOURCES_LOADED = true;
      };

      // Init camera and perspective
      camera = new THREE.PerspectiveCamera(65, width / height, 1, 2000);
      camera.position.x = 0;
      camera.position.y = 300;
      camera.position.z = 400;
      camera.lookAt(scene.position);

      // Orbitcontrols
      orbitControls = new Orbitcontrols(camera);
      orbitControls.autoRotate = true;
      orbitControls.autoRotateSpeed = 0.2;
      orbitControls.enableZoom = false;
      orbitControls.enableDamping = true;
      orbitControls.dampingFactor = 0.15; // friction factor
      orbitControls.rotateSpeed = 0.1; // mouse sensitivity

      // Lights
      let ambientLight = new THREE.AmbientLight(0xffffff);
      ambientLight.position.set(-10, 15, 500);
      scene.add(ambientLight);

      let pointLight = new THREE.PointLight(0xffffff);
      pointLight.position.set(-10, 15, 500);
      scene.add(pointLight);

      let spotLight = new THREE.SpotLight(0xffffff);
      spotLight.position.set(-10, 15, 500);
      scene.add(spotLight);

      let directionalLight = new THREE.DirectionalLight(0xffffff);
      directionalLight.position.set(-10, 15, 500);
      scene.add(directionalLight);

      // Texture
      let planetLoader = new THREE.TextureLoader(loadingManager);
      let backgroundLoader = new THREE.CubeTextureLoader(loadingManager);
      let planetTexture = require("./assets/imgs/planets/world.jpg");
      let backgroundTexture = require("./assets/imgs/planets/stars.jpg");

      // Load planet texture /w atmosphere
      var geometry = new THREE.SphereGeometry(210, 64, 64);

      shader = Shaders["earth"];
      uniforms = THREE.UniformsUtils.clone(shader.uniforms);

      uniforms["texture"].value = THREE.ImageUtils.loadTexture(planetTexture);

      material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader
      });

      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      shader = Shaders["atmosphere"];
      uniforms = THREE.UniformsUtils.clone(shader.uniforms);

      material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true
      });

      mesh = new THREE.Mesh(geometry, material);
      mesh.scale.set(1.2, 1.2, 1.2);
      scene.add(mesh);

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
      scene.rotation.y += 0.001;
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
          {this.state.showDetails ? (
            <>
              <Popup
                showDetails={this.state.showDetails}
                closePopup={() => this.togglePopup()}
              />
            </>
          ) : (
            <>
              <h1 className="title text-center">Lorem ipsum</h1>
              <HamburgerArrow
                className="hamburger-button"
                isActive={this.props.showDetails}
                toggleButton={this.togglePopup}
                barColor="white"
              />
            </>
          )}
        </div>
      </div>
    );
  }
}

export default Scene;
