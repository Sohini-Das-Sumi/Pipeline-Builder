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
    // Update wave colors based on theme - with emissive glow
    const darkThemeColors = [0x8a2be2, 0x8a2be2, 0x8a2be2, 0x8a2be2]; // Neon violet for dark theme (4 colors for 4 waves)
    const lightThemeColors = [0xFF1493, 0xFF1493, 0xFF1493, 0xFF1493]; // Neon pink for light theme (4 colors for 4 waves)
    const colors = theme === 'dark' ? darkThemeColors : lightThemeColors;
    
    if (waveMeshesRef.current && sceneRef.current && waveMeshesRef.current.length > 0) {
      waveMeshesRef.current.forEach((waveMesh, index) => {
        // Skip if waveMesh or material is undefined
        if (!waveMesh || !waveMesh.material) return;
        
        const waveMaterial = waveMesh.material;
        const colorIndex = index; // Direct index for the 4 colors
        
        if (colors[colorIndex]) {
          waveMaterial.color.setHex(colors[colorIndex]);
          // Only set emissive if the material has emissive property (MeshStandardMaterial)
          if (waveMaterial.emissive) {
            waveMaterial.emissive.setHex(colors[colorIndex]);
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
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
      xr: false,
      failIfMajorPerformanceCaveat: false
    });
    
    // Limit pixel ratio to prevent texture allocation issues
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

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

    // CLEAN & PROFESSIONAL: Simplified wave animation with vibrant neon colors and glow
    const waveMeshes = [];
    const numWaves = 4; // Increased from 2 to 4 for more curly layers
    
    // Curly wave parameters - MUCH MORE CURLY with 12 harmonics per wave, higher frequencies
    const waveParams = [
      // Layer 0: Main curly wave - 12 harmonics for very curly effect
      [
        { dir: new THREE.Vector2(1, 0), amplitude: 3.0, frequency: 0.03, speed: 0.4 },
        { dir: new THREE.Vector2(0.95, 0.05), amplitude: 2.8, frequency: 0.04, speed: 0.45 },
        { dir: new THREE.Vector2(0.85, 0.15), amplitude: 2.5, frequency: 0.055, speed: 0.5 },
        { dir: new THREE.Vector2(0.75, 0.25), amplitude: 2.2, frequency: 0.07, speed: 0.55 },
        { dir: new THREE.Vector2(0.65, 0.35), amplitude: 2.0, frequency: 0.085, speed: 0.6 },
        { dir: new THREE.Vector2(0.55, 0.45), amplitude: 1.7, frequency: 0.1, speed: 0.65 },
        { dir: new THREE.Vector2(0.45, 0.55), amplitude: 1.5, frequency: 0.115, speed: 0.7 },
        { dir: new THREE.Vector2(0.35, 0.65), amplitude: 1.2, frequency: 0.13, speed: 0.75 },
        { dir: new THREE.Vector2(0.25, 0.75), amplitude: 1.0, frequency: 0.145, speed: 0.8 },
        { dir: new THREE.Vector2(0.15, 0.85), amplitude: 0.7, frequency: 0.16, speed: 0.85 },
        { dir: new THREE.Vector2(0.05, 0.95), amplitude: 0.4, frequency: 0.175, speed: 0.9 },
        { dir: new THREE.Vector2(-0.05, 1), amplitude: 0.2, frequency: 0.19, speed: 0.95 }
      ],
      // Layer 1: Secondary curly wave - offset for more curl (12 harmonics)
      [
        { dir: new THREE.Vector2(0.95, 0.05), amplitude: 2.8, frequency: 0.035, speed: 0.38 },
        { dir: new THREE.Vector2(0.9, 0.1), amplitude: 2.6, frequency: 0.045, speed: 0.43 },
        { dir: new THREE.Vector2(0.8, 0.2), amplitude: 2.3, frequency: 0.06, speed: 0.48 },
        { dir: new THREE.Vector2(0.7, 0.3), amplitude: 2.0, frequency: 0.075, speed: 0.53 },
        { dir: new THREE.Vector2(0.6, 0.4), amplitude: 1.8, frequency: 0.09, speed: 0.58 },
        { dir: new THREE.Vector2(0.5, 0.5), amplitude: 1.5, frequency: 0.105, speed: 0.63 },
        { dir: new THREE.Vector2(0.4, 0.6), amplitude: 1.3, frequency: 0.12, speed: 0.68 },
        { dir: new THREE.Vector2(0.3, 0.7), amplitude: 1.1, frequency: 0.135, speed: 0.73 },
        { dir: new THREE.Vector2(0.2, 0.8), amplitude: 0.9, frequency: 0.15, speed: 0.78 },
        { dir: new THREE.Vector2(0.1, 0.9), amplitude: 0.6, frequency: 0.165, speed: 0.83 },
        { dir: new THREE.Vector2(0, 1), amplitude: 0.35, frequency: 0.18, speed: 0.88 },
        { dir: new THREE.Vector2(-0.1, 0.98), amplitude: 0.18, frequency: 0.195, speed: 0.93 }
      ],
      // Layer 2: Third curly wave - more cross-directional for extra curl (12 harmonics)
      [
        { dir: new THREE.Vector2(0.9, 0.1), amplitude: 2.5, frequency: 0.038, speed: 0.42 },
        { dir: new THREE.Vector2(0.82, 0.18), amplitude: 2.3, frequency: 0.05, speed: 0.47 },
        { dir: new THREE.Vector2(0.72, 0.28), amplitude: 2.0, frequency: 0.065, speed: 0.52 },
        { dir: new THREE.Vector2(0.62, 0.38), amplitude: 1.7, frequency: 0.08, speed: 0.57 },
        { dir: new THREE.Vector2(0.52, 0.48), amplitude: 1.5, frequency: 0.095, speed: 0.62 },
        { dir: new THREE.Vector2(0.42, 0.58), amplitude: 1.3, frequency: 0.11, speed: 0.67 },
        { dir: new THREE.Vector2(0.32, 0.68), amplitude: 1.1, frequency: 0.125, speed: 0.72 },
        { dir: new THREE.Vector2(0.22, 0.78), amplitude: 0.9, frequency: 0.14, speed: 0.77 },
        { dir: new THREE.Vector2(0.12, 0.88), amplitude: 0.7, frequency: 0.155, speed: 0.82 },
        { dir: new THREE.Vector2(0.02, 0.95), amplitude: 0.5, frequency: 0.17, speed: 0.87 },
        { dir: new THREE.Vector2(-0.08, 0.97), amplitude: 0.3, frequency: 0.185, speed: 0.92 },
        { dir: new THREE.Vector2(-0.15, 0.95), amplitude: 0.15, frequency: 0.2, speed: 0.97 }
      ],
      // Layer 3: Fourth curly wave - highest frequencies for tightest curls (12 harmonics)
      [
        { dir: new THREE.Vector2(0.88, 0.12), amplitude: 2.2, frequency: 0.042, speed: 0.36 },
        { dir: new THREE.Vector2(0.78, 0.22), amplitude: 2.0, frequency: 0.055, speed: 0.41 },
        { dir: new THREE.Vector2(0.68, 0.32), amplitude: 1.8, frequency: 0.07, speed: 0.46 },
        { dir: new THREE.Vector2(0.58, 0.42), amplitude: 1.5, frequency: 0.085, speed: 0.51 },
        { dir: new THREE.Vector2(0.48, 0.52), amplitude: 1.3, frequency: 0.1, speed: 0.56 },
        { dir: new THREE.Vector2(0.38, 0.62), amplitude: 1.1, frequency: 0.115, speed: 0.61 },
        { dir: new THREE.Vector2(0.28, 0.72), amplitude: 0.9, frequency: 0.13, speed: 0.66 },
        { dir: new THREE.Vector2(0.18, 0.82), amplitude: 0.7, frequency: 0.145, speed: 0.71 },
        { dir: new THREE.Vector2(0.08, 0.92), amplitude: 0.5, frequency: 0.16, speed: 0.76 },
        { dir: new THREE.Vector2(-0.02, 0.98), amplitude: 0.35, frequency: 0.175, speed: 0.81 },
        { dir: new THREE.Vector2(-0.12, 0.96), amplitude: 0.2, frequency: 0.19, speed: 0.86 },
        { dir: new THREE.Vector2(-0.2, 0.93), amplitude: 0.1, frequency: 0.205, speed: 0.91 }
      ]
    ];
    
    // Original vibrant neon colors with glow - 4 variations for 4 waves
    const darkThemeColors = [0x8a2be2, 0x9b4dca, 0x7a1fb2, 0x6a1fa2]; // Neon violet variations for dark theme
    const lightThemeColors = [0xFF1493, 0xFF69B4, 0xFF85C1, 0xE91E63]; // Neon pink variations for light theme
    
    for (let i = 0; i < numWaves; i++) {
      // 3D BoxGeometry for volumetric waves
      //const waveGeometry = new THREE.BoxGeometry(100, 100, 10, 48, 48, 4);
      const waveGeometry = new THREE.PlaneGeometry(100, 100, 48, 48);

      
      // Use MeshStandardMaterial with emissive for glow effect
      const waveMaterial = new THREE.MeshStandardMaterial({
        color: theme === 'dark' ? darkThemeColors[i] : lightThemeColors[i],
        emissive: theme === 'dark' ? darkThemeColors[i] : lightThemeColors[i],
        emissiveIntensity: 0.5, // Glow intensity
        transparent: true,
        opacity: 0.4 - i * 0.1, // Moderate opacity for visibility with glow
        side: THREE.DoubleSide,
      });
      
      const waveMesh = new THREE.Mesh(waveGeometry, waveMaterial);
      waveMesh.rotation.x = -Math.PI / 2;
      waveMesh.position.z = -i * 0.3;
      waveMesh.position.x = (i - numWaves / 2) * 3;
      scene.add(waveMesh);
      waveMeshes.push(waveMesh);
    }
    waveMeshesRef.current = waveMeshes;

    // Lighting for MeshStandardMaterial
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    camera.position.z = 5;

    // CLEAN ANIMATION: Slow, subtle wave movement
    let time = 0;
    let lastGeometryUpdate = 0;
    const GEOMETRY_UPDATE_INTERVAL = 50; // Slower updates for smoother, less jittery animation
    const flowDirection = new THREE.Vector2(1, 0); // Simple horizontal flow for 3D waves
    const flowSpeed = 0.8; // Slower for professional, subtle movement
    
    const animate = () => {
      requestAnimationFrame(animate);
      const now = performance.now();
      time += 0.02; // Slower time increment

      // Calculate flow offset
      const flowOffset = flowDirection.clone().multiplyScalar(flowSpeed * time);

      // Update geometry at reduced framerate
      if (now - lastGeometryUpdate > GEOMETRY_UPDATE_INTERVAL) {
        lastGeometryUpdate = now;
        
        // Animate waves with simplified, gentle calculations
        waveMeshes.forEach((waveMesh, index) => {
          const positions = waveMesh.geometry.attributes.position.array;
          const harmonics = waveParams[index];
          const phaseOffset = index * Math.PI / 4;
          
          for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            
            // Simple, clean wave calculation
            const flowX = x - flowOffset.x;
            const flowY = y - flowOffset.y;
            
            let totalWaveHeight = 0;
            harmonics.forEach((params) => {
              const dotProduct = params.dir.x * flowX + params.dir.y * flowY;
              totalWaveHeight += params.amplitude * Math.sin(dotProduct * params.frequency + time * params.speed + phaseOffset);
            });
            
            positions[i + 2] = totalWaveHeight;
          }
          waveMesh.geometry.attributes.position.needsUpdate = true;
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    // REMOVED: GSAP rotation animations - they added unnecessary movement
    // REMOVED: Camera animation - keeping it static for cleaner look
    
    // Optional: Very subtle camera breathing (only if needed)
    // gsap.to(camera.position, {
    //   z: 5.5,
    //   duration: 8,
    //   yoyo: true,
    //   repeat: -1,
    //   ease: 'sine.inOut',
    // });

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

  const borderColor = theme === 'dark' ? '#8a2be2' : '#FF1493';
  const boxShadow = theme === 'light' ? '0 0 25px rgba(255, 20, 147, 0.6), inset 0 0 20px rgba(255, 20, 147, 0.1)' : 'none';

  return <div ref={mountRef} className="absolute top-0 left-0 right-0 z-0 three-background" style={{ bottom: '120px', border: `5px solid ${borderColor}`, borderRadius: '15px', boxShadow: boxShadow }} />;
};

export default ThreeBackground;
