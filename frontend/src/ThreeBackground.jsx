import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { useStore } from './store';

const ThreeBackground = ({ theme = 'dark' }) => {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const particleGeometryRef = useRef(null);
  const waveMeshesRef = useRef([]);
  const sceneRef = useRef(null);
  const hasExplodedRef = useRef(false);
  const setHasExploded = useStore((state) => state.setHasExploded);
  const backgroundVisible = useStore((state) => state.backgroundVisible ?? true);

  // Effect to update theme
  useEffect(() => {
    console.log('ThreeBackground theme effect running, theme:', theme);
    // Update renderer clear color for background
    if (rendererRef.current) {
      rendererRef.current.setClearColor(theme === 'dark' ? 0x000000 : 0xffffff, 0);
    }
    // Update wave colors based on theme
    if (waveMeshesRef.current && sceneRef.current) {
      waveMeshesRef.current.forEach((waveMesh) => {
        const waveMaterial = waveMesh.material;
        if (waveMaterial) {
          if (theme === 'dark') {
            waveMaterial.color.setHex(0x8a2be2); // Neon violet
            waveMaterial.emissive.setHex(0x8a2be2);
            waveMaterial.opacity = 0.3; // More transparent
          } else {
            waveMaterial.color.setHex(0xffffff);
            waveMaterial.emissive.setHex(0x000000);
            waveMaterial.opacity = 0.0;
          }
          waveMaterial.needsUpdate = true;
        }
      });
    }
  }, [theme]);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const borderWidth = 5;
    const innerWidth = width - 2 * borderWidth;
    const innerHeight = height - 2 * borderWidth;
    renderer.setSize(innerWidth, innerHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    rendererRef.current = renderer;
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '50%';
    renderer.domElement.style.left = '50%';
    renderer.domElement.style.transform = 'translate(-50%, -50%)';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.style.background = 'transparent';
    mountRef.current.appendChild(renderer.domElement);

    // Create multiple wave-like backgrounds for ocean effect with enhanced gradient and realism
    const waveMeshes = [];
    const numWaves = 12;
    // Define wave parameters with multiple harmonics for highly realistic ocean effect
    const waveParams = [
      // Layer 0: Long swell waves
      [
        { dir: new THREE.Vector2(1, 0.1), amplitude: 3.0, frequency: 0.02, speed: 0.8 },
        { dir: new THREE.Vector2(0.9, 0.2), amplitude: 1.5, frequency: 0.04, speed: 1.0 },
        { dir: new THREE.Vector2(0.8, -0.1), amplitude: 1.0, frequency: 0.06, speed: 1.2 },
        { dir: new THREE.Vector2(0.7, 0.3), amplitude: 0.8, frequency: 0.08, speed: 0.9 }
      ],
      // Layer 1: Medium waves
      [
        { dir: new THREE.Vector2(0.8, 0.2), amplitude: 2.5, frequency: 0.03, speed: 1.1 },
        { dir: new THREE.Vector2(0.6, 0.4), amplitude: 1.2, frequency: 0.05, speed: 0.9 },
        { dir: new THREE.Vector2(0.5, -0.2), amplitude: 0.9, frequency: 0.07, speed: 1.3 },
        { dir: new THREE.Vector2(0.4, 0.5), amplitude: 0.7, frequency: 0.09, speed: 1.0 }
      ],
      // Layer 2: Shorter choppy waves
      [
        { dir: new THREE.Vector2(0.6, 0.4), amplitude: 2.0, frequency: 0.04, speed: 1.2 },
        { dir: new THREE.Vector2(0.4, 0.6), amplitude: 1.0, frequency: 0.06, speed: 0.8 },
        { dir: new THREE.Vector2(0.3, -0.3), amplitude: 0.8, frequency: 0.08, speed: 1.4 },
        { dir: new THREE.Vector2(0.2, 0.7), amplitude: 0.6, frequency: 0.1, speed: 1.1 }
      ],
      // Layer 3: Wind waves
      [
        { dir: new THREE.Vector2(0.4, 0.6), amplitude: 1.8, frequency: 0.05, speed: 1.3 },
        { dir: new THREE.Vector2(0.2, 0.8), amplitude: 0.9, frequency: 0.07, speed: 0.9 },
        { dir: new THREE.Vector2(0.1, -0.4), amplitude: 0.7, frequency: 0.09, speed: 1.5 },
        { dir: new THREE.Vector2(0, 0.9), amplitude: 0.5, frequency: 0.11, speed: 1.2 }
      ],
      // Layer 4: Ripple effects
      [
        { dir: new THREE.Vector2(0.2, 0.8), amplitude: 1.5, frequency: 0.06, speed: 1.4 },
        { dir: new THREE.Vector2(0, 1), amplitude: 0.8, frequency: 0.08, speed: 1.0 },
        { dir: new THREE.Vector2(-0.1, 0.8), amplitude: 0.6, frequency: 0.1, speed: 1.6 },
        { dir: new THREE.Vector2(-0.2, 0.6), amplitude: 0.4, frequency: 0.12, speed: 1.3 }
      ],
      // Layer 5: Cross-waves
      [
        { dir: new THREE.Vector2(0, 1), amplitude: 1.3, frequency: 0.07, speed: 1.5 },
        { dir: new THREE.Vector2(-0.2, 0.8), amplitude: 0.7, frequency: 0.09, speed: 1.1 },
        { dir: new THREE.Vector2(-0.4, 0.6), amplitude: 0.5, frequency: 0.11, speed: 1.7 },
        { dir: new THREE.Vector2(-0.6, 0.4), amplitude: 0.3, frequency: 0.13, speed: 1.4 }
      ],
      // Layer 6: Secondary swells
      [
        { dir: new THREE.Vector2(-0.2, 0.8), amplitude: 1.2, frequency: 0.08, speed: 1.6 },
        { dir: new THREE.Vector2(-0.4, 0.6), amplitude: 0.6, frequency: 0.1, speed: 1.2 },
        { dir: new THREE.Vector2(-0.6, 0.2), amplitude: 0.4, frequency: 0.12, speed: 1.8 },
        { dir: new THREE.Vector2(-0.8, 0), amplitude: 0.2, frequency: 0.14, speed: 1.5 }
      ],
      // Layer 7: Fine chop
      [
        { dir: new THREE.Vector2(-0.4, 0.6), amplitude: 1.0, frequency: 0.09, speed: 1.7 },
        { dir: new THREE.Vector2(-0.6, 0.2), amplitude: 0.5, frequency: 0.11, speed: 1.3 },
        { dir: new THREE.Vector2(-0.8, -0.2), amplitude: 0.3, frequency: 0.13, speed: 1.9 },
        { dir: new THREE.Vector2(-1, 0), amplitude: 0.1, frequency: 0.15, speed: 1.6 }
      ],
      // Layer 8: Turbulent waves
      [
        { dir: new THREE.Vector2(0.9, -0.1), amplitude: 2.2, frequency: 0.03, speed: 0.7 },
        { dir: new THREE.Vector2(0.7, -0.3), amplitude: 1.1, frequency: 0.05, speed: 1.1 },
        { dir: new THREE.Vector2(0.5, -0.5), amplitude: 0.8, frequency: 0.07, speed: 1.5 },
        { dir: new THREE.Vector2(0.3, -0.7), amplitude: 0.6, frequency: 0.09, speed: 1.0 }
      ],
      // Layer 9: Diagonal swells
      [
        { dir: new THREE.Vector2(0.5, -0.5), amplitude: 1.8, frequency: 0.04, speed: 1.2 },
        { dir: new THREE.Vector2(0.3, -0.7), amplitude: 0.9, frequency: 0.06, speed: 0.8 },
        { dir: new THREE.Vector2(0.1, -0.9), amplitude: 0.7, frequency: 0.08, speed: 1.4 },
        { dir: new THREE.Vector2(-0.1, -0.8), amplitude: 0.5, frequency: 0.1, speed: 1.1 }
      ],
      // Layer 10: Reverse flow
      [
        { dir: new THREE.Vector2(-0.6, 0.2), amplitude: 1.6, frequency: 0.05, speed: 1.3 },
        { dir: new THREE.Vector2(-0.8, -0.2), amplitude: 0.8, frequency: 0.07, speed: 0.9 },
        { dir: new THREE.Vector2(-1, 0), amplitude: 0.6, frequency: 0.09, speed: 1.5 },
        { dir: new THREE.Vector2(-0.9, 0.1), amplitude: 0.4, frequency: 0.11, speed: 1.2 }
      ],
      // Layer 11: Complex interference
      [
        { dir: new THREE.Vector2(-0.8, -0.2), amplitude: 1.4, frequency: 0.06, speed: 1.4 },
        { dir: new THREE.Vector2(-0.6, -0.4), amplitude: 0.7, frequency: 0.08, speed: 1.0 },
        { dir: new THREE.Vector2(-0.4, -0.6), amplitude: 0.5, frequency: 0.1, speed: 1.6 },
        { dir: new THREE.Vector2(-0.2, -0.8), amplitude: 0.3, frequency: 0.12, speed: 1.3 }
      ]
    ];
    for (let i = 0; i < numWaves; i++) {
      const waveGeometry = new THREE.PlaneGeometry(120, 120, 250, 250); // Even larger for more detail
      // Add color attribute for gradient
      const colors = [];
      const positions = waveGeometry.attributes.position.array;
      for (let j = 0; j < positions.length; j += 3) {
        const x = positions[j];
        const y = positions[j + 1];
        const distance = Math.sqrt(x * x + y * y) / 50; // Softer normalization for more prominent gradient coverage
        const colorFactor = Math.max(0, 1 - distance * 1.2); // Softer gradient falloff for better visibility
        const r = colorFactor * 2.8 + (1 - colorFactor) * 0.0; // Vibrant purple like React's front page
        const g = colorFactor * 0.3 + (1 - colorFactor) * 0.0; // Minimal green for true purple
        const b = colorFactor * 3.5 + (1 - colorFactor) * 0.0;
        colors.push(r, g, b);
      }
      waveGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      const waveMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff, // Base color for vertex colors
        vertexColors: true,
        transparent: true, // Enable transparency for layered effect
        opacity: 0.8 - i * 0.05, // Further increased opacity for more prominence: 0.8 to 0.15
        side: THREE.DoubleSide,
        emissive: new THREE.Color(0x2a0055), // Enhanced emissive for more vibrant glow
        emissiveIntensity: 0.8
      });
      const waveMesh = new THREE.Mesh(waveGeometry, waveMaterial);
      waveMesh.rotation.x = -Math.PI / 2; // Lay flat
      waveMesh.position.z = -i * 0.4; // In front of camera for visibility
      waveMesh.position.x = (i - numWaves / 2) * 3; // Adjusted offset
      scene.add(waveMesh);
      waveMeshes.push(waveMesh);
    }
    waveMeshesRef.current = waveMeshes;

    // Add lighting for MeshStandardMaterial - darker theme
    const ambientLight = new THREE.AmbientLight(0x222222, 0.1); // Much darker ambient light
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0x444444, 0.3); // Darker directional light
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    camera.position.z = 3;

    // Animation loop for wave movement
    let time = 0;
    const flowDirection = new THREE.Vector2(1, 0.2); // Flow from left to right with slight upward bias
    const flowSpeed = 4.0; // Much faster speed of the flow
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.08; // Much faster time increment for rapid animation

      // Calculate flow offset for directional movement
      const flowOffset = flowDirection.clone().multiplyScalar(flowSpeed * time);

      // Animate each wave with Gerstner-like realistic ocean movement and directional flow
      waveMeshes.forEach((waveMesh, index) => {
        const positions = waveMesh.geometry.attributes.position.array;
        const harmonics = waveParams[index];
        const phaseOffset = index * 0.5;
        for (let i = 0; i < positions.length; i += 3) {
          const x = positions[i];
          const y = positions[i + 1];
          // Adjust position for flow
          const flowX = x - flowOffset.x;
          const flowY = y - flowOffset.y;
          // Sum contributions from all harmonics in this layer
          let totalWaveHeight = 0;
          harmonics.forEach((params, harmonicIndex) => {
            const dotProduct = params.dir.x * flowX + params.dir.y * flowY;
            const harmonicPhase = phaseOffset + harmonicIndex * 0.3;
            const waveHeight = params.amplitude * Math.sin(dotProduct * params.frequency + time * params.speed + harmonicPhase);
            totalWaveHeight += waveHeight;
          });
          // Add some vertical variation for more realism
          const verticalWave = 0.3 * Math.sin(totalWaveHeight * 0.02 + time * 0.5 + phaseOffset) * Math.cos(flowY * 0.03 + time * 0.3 + phaseOffset);
          positions[i + 2] = totalWaveHeight + verticalWave;
        }
        waveMesh.geometry.attributes.position.needsUpdate = true;
      });

      renderer.render(scene, camera);
    };
    animate();

    // GSAP animations for waves
    waveMeshes.forEach((waveMesh, index) => {
      gsap.to(waveMesh.rotation, {
        z: Math.PI * 2,
        duration: 120 + index * 20, // Different rotation speeds
        repeat: -1,
        ease: 'none',
      });
    });

    // Animate camera
    gsap.to(camera.position, {
      z: 15,
      duration: 15,
      yoyo: true,
      repeat: -1,
      ease: 'power1.inOut',
    });

    // Handle resize with debouncing to prevent ResizeObserver loop
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        const borderWidth = 5; // Match the border width
        const innerWidth = width - 2 * borderWidth;
        const innerHeight = height - 2 * borderWidth;
        camera.aspect = innerWidth / innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(innerWidth, innerHeight);
      }, 100);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  if (!backgroundVisible) return null;

  return <div ref={mountRef} className="absolute top-0 left-0 right-0 z-0 three-background" style={{ bottom: '120px', border: '5px solid #8a2be2', borderRadius: '15px' }} />;
};

export default ThreeBackground;
