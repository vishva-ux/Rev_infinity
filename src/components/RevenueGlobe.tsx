'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export interface RevenueNodeData {
  id: string;
  type: 'risk' | 'recovery' | 'success' | 'normal';
  label: string;
  amount: number;
  transactions: number;
  risk: 'HIGH' | 'MEDIUM' | 'LOW' | 'NORMAL';
  latitude: number;
  longitude: number;
}

export function latLongToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

// Seeded deterministic revenue nodes
export const SEEDED_REVENUE_NODES: RevenueNodeData[] = [
  { id: 'node_1', type: 'risk', label: 'Payment Failures — Bank XYZ', amount: 128000, transactions: 232, risk: 'HIGH', latitude: 20.5937, longitude: 78.9629 }, // India
  { id: 'node_2', type: 'risk', label: 'Card Declines — ICICI', amount: 98600, transactions: 142, risk: 'MEDIUM', latitude: 19.0760, longitude: 72.8777 }, // Mumbai
  { id: 'node_3', type: 'risk', label: 'Checkout Drop-off Cluster', amount: 74200, transactions: 98, risk: 'MEDIUM', latitude: 12.9716, longitude: 77.5946 }, // Bengaluru
  { id: 'node_4', type: 'recovery', label: 'Smart Link Recovery', amount: 421000, transactions: 413, risk: 'LOW', latitude: 40.7128, longitude: -74.0060 }, // New York
  { id: 'node_5', type: 'success', label: 'Recovered UPI Batch', amount: 99990, transactions: 10, risk: 'NORMAL', latitude: 51.5074, longitude: -0.1278 }, // London
  { id: 'node_6', type: 'normal', label: 'Standard Gateway Traffic', amount: 154000, transactions: 310, risk: 'NORMAL', latitude: 35.6762, longitude: 139.6503 }, // Tokyo
  { id: 'node_7', type: 'risk', label: 'Subscription Expiry Drop', amount: 63100, transactions: 85, risk: 'LOW', latitude: 1.3521, longitude: 103.8198 }, // Singapore
  { id: 'node_8', type: 'recovery', label: 'Auto-Retry Pipeline', amount: 281000, transactions: 190, risk: 'LOW', latitude: 25.2048, longitude: 55.2708 }, // Dubai
  { id: 'node_9', type: 'success', label: 'High Value VIP Recovery', amount: 149990, transactions: 15, risk: 'NORMAL', latitude: 48.8566, longitude: 2.3522 }, // Paris
  { id: 'node_10', type: 'normal', label: 'Netbanking Failover Pool', amount: 52700, transactions: 64, risk: 'LOW', latitude: -33.8688, longitude: 151.2093 }, // Sydney
  { id: 'node_11', type: 'risk', label: 'Recurring Mandate Failure', amount: 89000, transactions: 112, risk: 'HIGH', latitude: -23.5505, longitude: -46.6333 }, // Sao Paulo
  { id: 'node_12', type: 'recovery', label: 'AI Prompted Checkout', amount: 175000, transactions: 140, risk: 'LOW', latitude: 37.7749, longitude: -122.4194 }, // San Francisco
  { id: 'node_13', type: 'success', label: 'Instant Pay Link Settlement', amount: 312000, transactions: 280, risk: 'NORMAL', latitude: 52.5200, longitude: 13.4050 }, // Berlin
  { id: 'node_14', type: 'normal', label: 'Card Tokenization Sync', amount: 67000, transactions: 95, risk: 'NORMAL', latitude: 22.3193, longitude: 114.1694 }, // Hong Kong
  { id: 'node_15', type: 'risk', label: 'Cross-Border Decline Cluster', amount: 115000, transactions: 130, risk: 'HIGH', latitude: -1.2921, longitude: 36.8219 }, // Nairobi
  { id: 'node_16', type: 'recovery', label: 'Smart Failover Route', amount: 205000, transactions: 175, risk: 'LOW', latitude: 55.7558, longitude: 37.6173 }, // Moscow
  { id: 'node_17', type: 'success', label: 'Alternate Method Conversion', amount: 184000, transactions: 160, risk: 'NORMAL', latitude: 31.2304, longitude: 121.4737 }, // Shanghai
  { id: 'node_18', type: 'normal', label: 'Merchant Settlement Hub', amount: 290000, transactions: 240, risk: 'NORMAL', latitude: 19.4326, longitude: -99.1332 }, // Mexico City
  { id: 'node_19', type: 'risk', label: 'OTP Gateway Timeout Spike', amount: 78000, transactions: 88, risk: 'MEDIUM', latitude: 28.6139, longitude: 77.2090 }, // New Delhi
  { id: 'node_20', type: 'recovery', label: 'WhatsApp Reminder Conversion', amount: 142000, transactions: 125, risk: 'LOW', latitude: 17.3850, longitude: 78.4867 }, // Hyderabad
];

const NODE_COLOR_MAP: Record<string, THREE.Color> = {
  risk: new THREE.Color('#ef4444'),
  recovery: new THREE.Color('#8b5cf6'),
  success: new THREE.Color('#10b981'),
  normal: new THREE.Color('#0066ff')
};

export default function RevenueGlobe({
  nodes = SEEDED_REVENUE_NODES,
  onNodeClick
}: {
  nodes?: RevenueNodeData[];
  onNodeClick?: (node: RevenueNodeData) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<RevenueNodeData | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    // 1. Scene, Camera, Renderer Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const GLOBE_RADIUS = 1.9;

    // --------------------------------------------------
    // 1. PARTICLE SPHERE (6,000 Tiny Particles wrapping 3D sphere)
    // --------------------------------------------------
    const particleCount = 6000;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const baseColor1 = new THREE.Color('#4f46e5'); // Indigo
    const baseColor2 = new THREE.Color('#0066ff'); // Blue
    const accentColor = new THREE.Color('#8b5cf6'); // Purple

    for (let i = 0; i < particleCount; i++) {
      // Golden Ratio spherical distribution
      const phi = Math.acos(1 - 2 * (i + 0.5) / particleCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const x = GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta);
      const y = GLOBE_RADIUS * Math.cos(phi);
      const z = GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta);

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      // Color variation
      const mixedColor = baseColor1.clone().lerp(
        (i % 3 === 0) ? accentColor : baseColor2,
        Math.random()
      );

      particleColors[i * 3] = mixedColor.r;
      particleColors[i * 3 + 1] = mixedColor.g;
      particleColors[i * 3 + 2] = mixedColor.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    const particleSphere = new THREE.Points(particleGeometry, particleMaterial);
    globeGroup.add(particleSphere);

    // --------------------------------------------------
    // 2. ATMOSPHERIC GLOW
    // --------------------------------------------------
    const atmosphereGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.04, 32, 32);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#3b82f6'),
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    globeGroup.add(atmosphereMesh);

    // --------------------------------------------------
    // 3. REVENUE NODES (Interactive glowing points)
    // --------------------------------------------------
    const nodeMeshes: THREE.Mesh[] = [];
    const nodeMap = new Map<THREE.Object3D, RevenueNodeData>();

    nodes.forEach(nodeData => {
      const pos = latLongToVector3(nodeData.latitude, nodeData.longitude, GLOBE_RADIUS);
      const color = NODE_COLOR_MAP[nodeData.type] || NODE_COLOR_MAP.normal;

      const nodeGeom = new THREE.SphereGeometry(0.045, 16, 16);
      const nodeMat = new THREE.MeshBasicMaterial({ color });
      const nodeMesh = new THREE.Mesh(nodeGeom, nodeMat);
      nodeMesh.position.copy(pos);

      // Add small outer ring halo
      const haloGeom = new THREE.RingGeometry(0.06, 0.08, 16);
      const haloMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
      const haloMesh = new THREE.Mesh(haloGeom, haloMat);
      haloMesh.position.copy(pos);
      haloMesh.lookAt(0, 0, 0);

      globeGroup.add(nodeMesh);
      globeGroup.add(haloMesh);

      nodeMeshes.push(nodeMesh);
      nodeMap.set(nodeMesh, nodeData);
    });

    // --------------------------------------------------
    // 4. CONNECTION ARCS & 5. PULSE ANIMATION
    // --------------------------------------------------
    const pulses: { curve: THREE.CatmullRomCurve3; mesh: THREE.Mesh; progress: number; speed: number }[] = [];

    // Connect node pairs with 3D CatmullRom curves elevated above sphere
    for (let i = 0; i < nodes.length; i += 2) {
      const n1 = nodes[i];
      const n2 = nodes[(i + 1) % nodes.length];

      const v1 = latLongToVector3(n1.latitude, n1.longitude, GLOBE_RADIUS);
      const v2 = latLongToVector3(n2.latitude, n2.longitude, GLOBE_RADIUS);

      // Elevated midpoint curve calculation
      const mid = v1.clone().add(v2).multiplyScalar(0.5);
      const distance = v1.distanceTo(v2);
      mid.normalize().multiplyScalar(GLOBE_RADIUS + distance * 0.25);

      const curve = new THREE.CatmullRomCurve3([v1, mid, v2]);
      const points = curve.getPoints(50);
      const arcGeom = new THREE.BufferGeometry().setFromPoints(points);

      const arcColor = NODE_COLOR_MAP[n1.type] || NODE_COLOR_MAP.normal;
      const arcMat = new THREE.LineBasicMaterial({
        color: arcColor,
        transparent: true,
        opacity: 0.35
      });

      const arcLine = new THREE.Line(arcGeom, arcMat);
      globeGroup.add(arcLine);

      // Pulse Particle traveling on arc
      const pulseGeom = new THREE.SphereGeometry(0.025, 8, 8);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color('#ffffff'),
        transparent: true,
        opacity: 0.9
      });
      const pulseMesh = new THREE.Mesh(pulseGeom, pulseMat);
      globeGroup.add(pulseMesh);

      pulses.push({
        curve,
        mesh: pulseMesh,
        progress: (i * 0.15) % 1.0,
        speed: 0.003 + (i % 3) * 0.001
      });
    }

    // --------------------------------------------------
    // 7. REVENUE ACTIVITY BARS (Subtle vertical bars at lower region)
    // --------------------------------------------------
    const barCount = 18;
    for (let i = 0; i < barCount; i++) {
      const lat = -35 + Math.sin(i) * 15;
      const lng = -170 + i * 20;

      const basePos = latLongToVector3(lat, lng, GLOBE_RADIUS);
      const barHeight = 0.1 + (i % 5) * 0.05;

      const barGeom = new THREE.CylinderGeometry(0.012, 0.012, barHeight, 8);
      const barMat = new THREE.MeshBasicMaterial({
        color: (i % 2 === 0) ? new THREE.Color('#8b5cf6') : new THREE.Color('#0066ff'),
        transparent: true,
        opacity: 0.65
      });

      const barMesh = new THREE.Mesh(barGeom, barMat);
      barMesh.position.copy(basePos);
      barMesh.lookAt(0, 0, 0);
      barMesh.rotateX(Math.PI / 2);

      globeGroup.add(barMesh);
    }

    // --------------------------------------------------
    // 8. INTERACTION & RAYCASTING
    // --------------------------------------------------
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let isMouseDown = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      mouse.x = (x / width) * 2 - 1;
      mouse.y = -(y / height) * 2 + 1;

      // Handle drag rotation
      if (isMouseDown) {
        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;

        globeGroup.rotation.y += deltaX * 0.005;
        globeGroup.rotation.x += deltaY * 0.005;

        previousMousePosition = { x: event.clientX, y: event.clientY };
      }

      // Raycasting for node hover
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const data = nodeMap.get(hit);
        if (data) {
          setHoveredNode(data);
          setTooltipPos({ x: x + 10, y: y - 10 });
          container.style.cursor = 'pointer';
        }
      } else {
        setHoveredNode(null);
        container.style.cursor = 'default';
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      isMouseDown = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    const handleClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const data = nodeMap.get(hit);
        if (data && onNodeClick) {
          onNodeClick(data);
        }
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousemove', handleMouseMove);
    domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    domElement.addEventListener('click', handleClick);

    // --------------------------------------------------
    // 6. ANIMATION LOOP & ROTATION (0.04 rad/sec)
    // --------------------------------------------------
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Slow Y-axis rotation when not dragging
      if (!isMouseDown) {
        globeGroup.rotation.y += 0.0015; // ~0.04 rad/sec
      }

      // Animate arc pulses
      pulses.forEach(pulse => {
        pulse.progress += pulse.speed;
        if (pulse.progress > 1) pulse.progress = 0;

        const point = pulse.curve.getPoint(pulse.progress);
        pulse.mesh.position.copy(point);
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || width;
      const newH = container.clientHeight || height;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (domElement) {
        domElement.removeEventListener('mousemove', handleMouseMove);
        domElement.removeEventListener('mousedown', handleMouseDown);
        domElement.removeEventListener('click', handleClick);
        if (container && container.contains(domElement)) {
          try { container.removeChild(domElement); } catch (e) {}
        }
      }
      window.removeEventListener('mouseup', handleMouseUp);
      try {
        particleGeometry.dispose();
        particleMaterial.dispose();
        atmosphereGeometry.dispose();
        atmosphereMaterial.dispose();
        renderer.dispose();
      } catch (e) {}
    };
  }, [nodes, onNodeClick]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: 320, position: 'relative', overflow: 'hidden' }}>
      {/* Interactive Tooltip Overlay */}
      {hoveredNode && (
        <div
          style={{
            position: 'absolute',
            left: Math.min(tooltipPos.x, 200),
            top: Math.max(10, tooltipPos.y - 60),
            pointerEvents: 'none',
            background: 'rgba(17, 24, 39, 0.92)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '8px 12px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            color: '#ffffff',
            minWidth: 160
          }}
          className="animate-in"
        >
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
            Revenue Cluster
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, margin: '2px 0 4px', color: '#f3f4f6' }}>
            {hoveredNode.label}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
            <span style={{ color: 'var(--text-muted)' }}>Amount:</span>
            <span style={{ fontWeight: 700, color: '#10b981' }}>₹{hoveredNode.amount.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
            <span style={{ color: 'var(--text-muted)' }}>Volume:</span>
            <span style={{ fontWeight: 600 }}>{hoveredNode.transactions} txns</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <span style={{ color: 'var(--text-muted)' }}>Risk Level:</span>
            <span
              style={{
                fontWeight: 700,
                color: hoveredNode.risk === 'HIGH' ? '#ef4444' : hoveredNode.risk === 'MEDIUM' ? '#f59e0b' : '#10b981'
              }}
            >
              {hoveredNode.risk}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
