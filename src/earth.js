import React from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import mapPoints from "./mapPoints.js";

import "./earth.css";

class Earth extends React.Component {

  componentDidMount() {
    const box = document.getElementById("box");
    const canvas = document.getElementById("canvas");

    let glRender;
    let camera;
    let earthMesh;
    let scene;
    let meshGroup; // mesh容器
    let controls;

    glRender = new THREE.WebGLRenderer({ canvas, alpha: true });
    glRender.setSize(canvas.clientWidth, canvas.clientHeight, false);

    scene = new THREE.Scene();

    const fov = 45;
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const near = 1;
    const far = 4000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    camera.position.z = 400;

    controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0, 0);

    meshGroup = new THREE.Group();

    scene.add(meshGroup);

    const globeRadius = 100;
    const globeSegments = 64;
    const geometry = new THREE.SphereGeometry(
      globeRadius,
      globeSegments,
      // 可能有问题
      globeSegments
    );

    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.5,
      color: 0x000000
    });

    earthMesh = new THREE.Mesh(geometry, material);

    meshGroup.add(earthMesh);

    function screenRender() {
      glRender.render(scene, camera);
      controls.update();
      requestAnimationFrame(screenRender);
    }

    screenRender();
  }

  render () {
    return (
      <div id="box" style={{ width: "100%", height: "100%" }}>
        <canvas id="canvas" style={{ width: "100%", height: "100%" }}></canvas>
      </div>
    );
  }

};

export default Earth;
