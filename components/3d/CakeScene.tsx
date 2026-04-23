"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";

interface CakeSceneProps {
  height?: number | string;
  autoRotate?: boolean;
  tier?: 1 | 2 | 3;
}

export default function CakeScene({ height = 420, autoRotate = true, tier = 3 }: CakeSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Renderer ──────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    // ── Scene & Camera ────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      40,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 2.5, 7);
    camera.lookAt(0, 0.5, 0);

    // ── Lights ────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight(0xfff8f0, 0.7);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffeedd, 1.4);
    key.position.set(3, 6, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xc8956c, 0.5);
    fill.position.set(-4, 2, -2);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffffff, 0.3);
    rim.position.set(0, -3, -5);
    scene.add(rim);

    // ── Materials ─────────────────────────────────────────────
    const frosting = new THREE.MeshStandardMaterial({
      color: 0xfff8f0,
      roughness: 0.15,
      metalness: 0.0,
    });

    const sponge = new THREE.MeshStandardMaterial({
      color: 0xd4936a,
      roughness: 0.8,
    });

    const chocolate = new THREE.MeshStandardMaterial({
      color: 0x5c3317,
      roughness: 0.4,
      metalness: 0.1,
    });

    const accentMat = new THREE.MeshStandardMaterial({
      color: 0xd4af6a,
      roughness: 0.2,
      metalness: 0.6,
    });

    const roseMat = new THREE.MeshStandardMaterial({
      color: 0xe8a598,
      roughness: 0.6,
    });

    // ── Helpers ───────────────────────────────────────────────
    const group = new THREE.Group();
    scene.add(group);

    const addTier = (
      radius: number,
      height: number,
      yPos: number,
      mat: THREE.Material
    ) => {
      const geo = new THREE.CylinderGeometry(radius, radius * 1.03, height, 64);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = yPos;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);

      // frosting drip ring
      const dripGeo = new THREE.CylinderGeometry(
        radius + 0.04,
        radius + 0.04,
        0.08,
        64
      );
      const drip = new THREE.Mesh(dripGeo, frosting);
      drip.position.y = yPos + height / 2 - 0.02;
      group.add(drip);

      // top disc
      const topGeo = new THREE.CylinderGeometry(radius + 0.02, radius + 0.02, 0.05, 64);
      const top = new THREE.Mesh(topGeo, frosting);
      top.position.y = yPos + height / 2 + 0.025;
      group.add(top);
    };

    const addCandle = (x: number, z: number, yBase: number) => {
      const cGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 16);
      const candle = new THREE.Mesh(cGeo, roseMat);
      candle.position.set(x, yBase + 0.2, z);
      group.add(candle);

      // flame
      const fGeo = new THREE.SphereGeometry(0.04, 8, 8);
      fGeo.scale(0.6, 1.4, 0.6);
      const flameMat = new THREE.MeshStandardMaterial({
        color: 0xffaa33,
        emissive: 0xff6600,
        emissiveIntensity: 1.5,
      });
      const flame = new THREE.Mesh(fGeo, flameMat);
      flame.position.set(x, yBase + 0.48, z);
      group.add(flame);
    };

    const addRose = (x: number, z: number, yBase: number, scale = 1) => {
      const petalCount = 8;
      for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2;
        const r = 0.12 * scale;
        const pGeo = new THREE.SphereGeometry(0.06 * scale, 8, 8);
        pGeo.scale(1.2, 0.5, 0.8);
        const petal = new THREE.Mesh(pGeo, roseMat);
        petal.position.set(
          x + Math.cos(angle) * r,
          yBase,
          z + Math.sin(angle) * r
        );
        petal.rotation.y = angle;
        group.add(petal);
      }
      // center
      const cGeo = new THREE.SphereGeometry(0.055 * scale, 8, 8);
      const center = new THREE.Mesh(cGeo, roseMat);
      center.position.set(x, yBase + 0.03 * scale, z);
      group.add(center);
    };

    // ── Build Tiers ───────────────────────────────────────────
    if (tier >= 1) {
      // Bottom tier
      addTier(1.5, 1.0, 0.5, sponge);
    }
    if (tier >= 2) {
      // Middle tier
      addTier(1.1, 0.85, 1.575, chocolate);
    }
    if (tier >= 3) {
      // Top tier
      addTier(0.72, 0.7, 2.5, sponge);

      // Roses on top
      const topY = 2.5 + 0.35 + 0.055;
      addRose(0, 0, topY, 1);
      addRose(0.22, 0.15, topY, 0.75);
      addRose(-0.18, 0.12, topY, 0.65);

      // Candles
      addCandle(0.38, 0.2, topY);
      addCandle(-0.35, -0.1, topY);
      addCandle(0.1, -0.38, topY);
    }

    // Gold accent ribbon on bottom tier
    const ribbonGeo = new THREE.TorusGeometry(1.52, 0.04, 8, 64);
    const ribbon = new THREE.Mesh(ribbonGeo, accentMat);
    ribbon.position.y = 0.5;
    ribbon.rotation.x = Math.PI / 2;
    group.add(ribbon);

    if (tier >= 2) {
      const r2 = new THREE.Mesh(
        new THREE.TorusGeometry(1.12, 0.035, 8, 64),
        accentMat
      );
      r2.position.y = 1.575;
      r2.rotation.x = Math.PI / 2;
      group.add(r2);
    }

    // Plate / base
    const plateGeo = new THREE.CylinderGeometry(1.75, 1.6, 0.12, 64);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0xe8ddd0,
      roughness: 0.1,
      metalness: 0.3,
    });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.y = -0.06;
    plate.receiveShadow = true;
    group.add(plate);

    // Ground shadow
    const shadowGeo = new THREE.CircleGeometry(2, 64);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x3d2b1f,
      transparent: true,
      opacity: 0.08,
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -0.12;
    group.add(shadow);

    group.position.y = -1;

    // ── Mouse interaction ─────────────────────────────────────
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    mount.addEventListener("mousemove", onMouseMove);

    // ── Resize ────────────────────────────────────────────────
    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // ── Animate ───────────────────────────────────────────────
    let frame: number;
    const clock = new THREE.Clock();

    const animate = () => {
      frame = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      if (autoRotate) {
        group.rotation.y += 0.004;
      } else {
        group.rotation.y += (mouseX * 0.6 - group.rotation.y) * 0.05;
        group.rotation.x += (mouseY * 0.15 - group.rotation.x) * 0.05;
      }

      // Gentle float
      group.position.y = -1 + Math.sin(t * 0.8) * 0.06;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      mount.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [autoRotate, tier, theme]);

  return (
    <Box
      ref={mountRef}
      sx={{
        width: "100%",
        height,
        cursor: autoRotate ? "default" : "grab",
        "&:active": { cursor: autoRotate ? "default" : "grabbing" },
      }}
    />
  );
}