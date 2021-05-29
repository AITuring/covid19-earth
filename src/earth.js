import React from "react";
import * as THREE from "three";
import * as d3 from "d3";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils";
import mapPoints from "./mapPoints.js";
import "./earth.css";
import data from "./data.js";

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

    const globeWidth = 4098 / 2;
    const globeHeight = 1968 / 2;
    const globeRadius = 100;
    const globeSegments = 64;

    // 渲染柱状图颜色和节点
    const colors = [
      "#ffdfe0",
      "#ffc0c0",
      "#FF0000",
      "#ee7070",
      "#c80200",
      "#900000",
      "#510000",
      "#290000"
    ];
    const domain = [1000, 3000, 10000, 50000, 100000, 500000, 1000000, 1000000];
    
    // 创建渲染器
    glRender = new THREE.WebGLRenderer({ canvas, alpha: true });
    glRender.setSize(canvas.clientWidth, canvas.clientHeight, false);
    // 创建场景
    scene = new THREE.Scene();
    meshGroup = new THREE.Group();
    scene.add(meshGroup);
    // 创建相机
    function createCamera() {
      const fov = 45;
      const aspect = canvas.clientWidth / canvas.clientHeight;
      const near = 1;
      const far = 4000;
      camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
      camera.position.z = 400;
    }
    // 创建地球
    function createEarth() {
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
    }
    // 创建control
    function createControl() {
      controls = new OrbitControls(camera, canvas);
      controls.target.set(0, 0, 0);
    }

    createCamera()
    createEarth()
    createControl()

    // 渲染地球
    function screenRender() {
      glRender.render(scene, camera);
      controls.update();
      // requestAnimationFrame(screenRender);
    }

    // 将平面二维点转化为三维
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
    // 给圆球上铺点
    function createMapPoints() {
      const metrial = new THREE.MeshBasicMaterial({ color: "#f5f5f5" });
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

    // 经纬度转化为球坐标
    function convertLatLngToSphereCoords(latitude, longitude, radius) {
      const phi = (latitude * Math.PI) / 180;
      const theta = ((longitude - 180) * Math.PI) / 180;
      const dx = -(radius - 1) * Math.cos(phi) * Math.cos(theta);
      const dy = (radius - 1) * Math.sin(phi);
      const dz = (radius - 1) * Math.cos(phi) * Math.sin(theta);
      return { dx, dy, dz };
    }

    // 创建柱状图
    function createBar() {
      if (!data || data.length === 0) return;

      let color;
      const scale = d3.scaleLinear().domain(domain).range(colors);

      data.forEach(({ lat, lng, value: size }) => {
        color = scale(size);
        const pos = convertLatLngToSphereCoords(lat, lng, globeRadius);
        if (pos.dx && pos.dy && pos.dz) {
          const geometry = new THREE.BoxGeometry(2, 2, 1);
          geometry.applyMatrix4(
            new THREE.Matrix4().makeTranslation(0, 0, -0.5)
          );

          const barMesh = new THREE.Mesh(
            geometry,
            new THREE.MeshBasicMaterial({ color })
          );
          barMesh.position.set(pos.dx, pos.dy, pos.dz);
          barMesh.lookAt(earthMesh.position);

          barMesh.scale.z = Math.max(size / 60000, 0.1);
          barMesh.updateMatrix();

          meshGroup.add(barMesh);
        }
      });
    }

    // 动画
    function animate() {
      requestAnimationFrame(animate);
      screenRender();
      // 每次旋转角速度0.04弧度
      meshGroup.rotateY(0.04)
    }

    // 创建点阵图
    createMapPoints();
    // 创建柱状统计图
    createBar();
    // 动画
    animate()
  }

  render() {
    return (
      <div id="box" style={{ width: "100vw", height: "100vh" }}>
        {/* <h2 style={{textAlign: 'center'}}>Covid-19 Earth</h2> */}
        <canvas id="canvas" style={{ width: "100%", height: "100%" }}></canvas>
      </div>
    );
  }
}

export default Earth;
