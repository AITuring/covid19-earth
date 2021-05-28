import React from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils";
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

    const globeWidth = 4098 / 2;
    const globeHeight = 1968 / 2;

    function convertFlatCoordsToSphereCoords(x, y) {
      let latitude = ((x - globeWidth) / globeWidth) * -180;
      let longitude = ((y - globeHeight) / globeHeight) * -90;
      latitude = (latitude * Math.PI) / 180;
      longitude = (longitude * Math.PI) / 180;
      const radius = Math.cos(longitude) * globeRadius;
      const dx = Math.cos(latitude) * radius;
      const dy = Math.sin(longitude) * globeRadius;
      const dz = Math.sin(latitude) * radius;
      return { dx, dy, dz };
    }

    function createMapPoints() {
      const metrial = new THREE.MeshBasicMaterial({ color: "#AAA" });

      const sphere = [];

      for (let point of mapPoints.points) {
        const pos = convertFlatCoordsToSphereCoords(point.x, point.y);
        if (pos.dx && pos.dy && pos.dz) {
          const pingGeometry = new THREE.SphereGeometry(0.4, 5, 5);
          pingGeometry.translate(pos.dx, pos.dy, pos.dz);
          sphere.push(pingGeometry);
        }
      }

      const earthMapPoints = new THREE.Mesh(
        BufferGeometryUtils.mergeBufferGeometries(sphere),
        metrial
      );
      meshGroup.add(earthMapPoints);
    }

    createMapPoints();
    screenRender();
  }

  render() {
    return (
      <div id="box" style={{ width: "100%", height: "100%" }}>
        <canvas id="canvas" style={{ width: "100%", height: "100%" }}></canvas>
      </div>
    );
  }
}

export default Earth;
