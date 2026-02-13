import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { useStore } from './store';

const ThreeBackground = ({ theme = 'dark' }) => {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const particleGeometryRef = useRef(null);
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
    // Update particle colors and opacity based on theme
    if (particleGeometryRef.current && sceneRef.current) {
      const particleColors = particleGeometryRef.current.attributes.color.array;
      const colors = theme === 'dark'
        ? [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xffa500, 0x800080, 0x008000, 0x000080] // Vibrant colors for dark
        : [0xffcccc, 0xccffcc, 0xccccff, 0xffffcc, 0xffccff, 0xccffff, 0xffcc99, 0xcc99ff, 0x99ffcc, 0x99ccff]; // Lighter colors for light
      for (let i = 0; i < particleColors.length / 3; i++) {
        const i3 = i * 3;
        const color = colors[Math.floor(Math.random() * colors.length)];
        particleColors[i3] = ((color >> 16) & 0xff) / 255;
        particleColors[i3 + 1] = ((color >> 8) & 0xff) / 255;
        particleColors[i3 + 2] = (color & 0xff) / 255;
      }
      particleGeometryRef.current.attributes.color.needsUpdate = true;

      // Update particle opacity for better background visibility in light mode
      const particles = sceneRef.current.children.find(child => child.type === 'Points');
      if (particles && particles.material) {
        particles.material.opacity = theme === 'dark' ? 0.3 : 0.0; // Invisible particles for light theme
        particles.material.needsUpdate = true;
      }
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
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0); // Transparent background
    rendererRef.current = renderer;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.style.background = 'transparent';
    mountRef.current.appendChild(renderer.domElement);

    // Create galaxy background with swirling paint-like particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 500; // Reduced from 2000 to improve performance
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleVelocities = [];
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xffa500, 0x800080, 0x008000, 0x000080]; // More vibrant colors for paints

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Position particles in a galaxy-like spiral
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 100 + 20;
      particlePositions[i3] = Math.cos(angle) * radius;
      particlePositions[i3 + 1] = Math.sin(angle) * radius;
      particlePositions[i3 + 2] = (Math.random() - 0.5) * 50;

      const color = colors[Math.floor(Math.random() * colors.length)];
      particleColors[i3] = ((color >> 16) & 0xff) / 255;
      particleColors[i3 + 1] = ((color >> 8) & 0xff) / 255;
      particleColors[i3 + 2] = (color & 0xff) / 255;

      // Velocities for swirling motion
      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.01,
        angle: angle,
        radius: radius
      });
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    particleGeometryRef.current = particleGeometry;
    const particleMaterial = new THREE.PointsMaterial({ size: 0.3, vertexColors: true, transparent: true, opacity: 0.3 });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    camera.position.z = 5;

    // Animation loop with particle movement
    const animate = () => {
      requestAnimationFrame(animate);

      // Update particle positions for swirling motion
      const positions = particleGeometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const velocity = particleVelocities[i];

        // Update angle for swirling
        velocity.angle += 0.005;
        positions[i3] = Math.cos(velocity.angle) * velocity.radius + velocity.x;
        positions[i3 + 1] = Math.sin(velocity.angle) * velocity.radius + velocity.y;
        positions[i3 + 2] += velocity.z;

        // Reset particles that go too far
        if (positions[i3 + 2] > 25 || positions[i3 + 2] < -25) {
          velocity.z *= -1;
        }
      }
      particleGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();

    // GSAP animations for particles
    gsap.to(particles.rotation, {
      y: Math.PI * 2,
      duration: 60,
      repeat: -1,
      ease: 'none',
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
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
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

  return <div ref={mountRef} className="absolute inset-0 z-0 three-background" />;
};

export default ThreeBackground;
