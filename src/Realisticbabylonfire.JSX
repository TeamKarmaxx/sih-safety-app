import { useEffect, useRef } from 'react';
import * as BABYLON from 'babylonjs';

function RealisticBabylonFire({ size = 140 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const engine = new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      alpha: true,
    });

    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 0); // transparent background

    const camera = new BABYLON.FreeCamera('cam', new BABYLON.Vector3(0, 0.5, -3), scene);
    camera.setTarget(BABYLON.Vector3.Zero());

    // ===== CREATE REALISTIC TEXTURES =====
    
    // Flame texture - bright, hot colors
    const flameTexture = new BABYLON.DynamicTexture('flameTex', 128, scene, false);
    let ctx = flameTexture.getContext();
    const flameGrad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    flameGrad.addColorStop(0, 'rgba(255,255,200,1)');
    flameGrad.addColorStop(0.3, 'rgba(255,150,0,0.9)');
    flameGrad.addColorStop(0.6, 'rgba(255,50,0,0.6)');
    flameGrad.addColorStop(1, 'rgba(100,0,0,0)');
    ctx.fillStyle = flameGrad;
    ctx.fillRect(0, 0, 128, 128);
    flameTexture.update();

    // Smoke texture - grayish
    const smokeTexture = new BABYLON.DynamicTexture('smokeTex', 128, scene, false);
    ctx = smokeTexture.getContext();
    const smokeGrad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    smokeGrad.addColorStop(0, 'rgba(200,200,200,0.8)');
    smokeGrad.addColorStop(0.4, 'rgba(150,150,150,0.5)');
    smokeGrad.addColorStop(0.7, 'rgba(100,100,100,0.2)');
    smokeGrad.addColorStop(1, 'rgba(50,50,50,0)');
    ctx.fillStyle = smokeGrad;
    ctx.fillRect(0, 0, 128, 128);
    smokeTexture.update();

    // Ember texture - small bright dots
    const emberTexture = new BABYLON.DynamicTexture('emberTex', 64, scene, false);
    ctx = emberTexture.getContext();
    const emberGrad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    emberGrad.addColorStop(0, 'rgba(255,200,50,1)');
    emberGrad.addColorStop(0.5, 'rgba(255,100,0,0.7)');
    emberGrad.addColorStop(1, 'rgba(100,0,0,0)');
    ctx.fillStyle = emberGrad;
    ctx.fillRect(0, 0, 64, 64);
    emberTexture.update();

    // ===== LAYER 1: BRIGHT CORE FLAMES =====
    const coreFlames = new BABYLON.ParticleSystem('coreFlames', 150, scene);
    coreFlames.particleTexture = flameTexture;
    coreFlames.emitter = new BABYLON.Vector3(0, -0.5, 0);
    coreFlames.minEmitBox = new BABYLON.Vector3(-0.1, -0.05, -0.05);
    coreFlames.maxEmitBox = new BABYLON.Vector3(0.1, 0.05, 0.05);

    coreFlames.color1 = new BABYLON.Color4(1, 1, 0.5, 1); // bright yellow
    coreFlames.color2 = new BABYLON.Color4(1, 0.6, 0.2, 1); // orange
    coreFlames.colorDead = new BABYLON.Color4(0.5, 0.1, 0, 0); // dark red to transparent

    coreFlames.minSize = 0.3;
    coreFlames.maxSize = 0.7;
    coreFlames.minLifeTime = 0.5;
    coreFlames.maxLifeTime = 1.2;
    coreFlames.emitRate = 180;

    coreFlames.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD; // additive blend = realistic glow
    coreFlames.gravity = new BABYLON.Vector3(0, 4.5, 0); // strong upward
    coreFlames.direction1 = new BABYLON.Vector3(-0.4, 1.5, -0.2);
    coreFlames.direction2 = new BABYLON.Vector3(0.4, 1.5, 0.2);
    coreFlames.minEmitPower = 0.8;
    coreFlames.maxEmitPower = 1.5;
    coreFlames.updateSpeed = 0.016;

    // Add turbulence for flickering effect
    coreFlames.noiseTexture = new BABYLON.DynamicTexture('noise', 256, scene);
    coreFlames.noiseStrength = 0.2;

    coreFlames.start();

    // ===== LAYER 2: OUTER FLAMES (ORANGE/RED) =====
    const outerFlames = new BABYLON.ParticleSystem('outerFlames', 120, scene);
    outerFlames.particleTexture = flameTexture;
    outerFlames.emitter = new BABYLON.Vector3(0, -0.4, 0);
    outerFlames.minEmitBox = new BABYLON.Vector3(-0.2, -0.08, -0.08);
    outerFlames.maxEmitBox = new BABYLON.Vector3(0.2, 0.08, 0.08);

    outerFlames.color1 = new BABYLON.Color4(1, 0.5, 0, 1); // orange
    outerFlames.color2 = new BABYLON.Color4(1, 0.2, 0, 1); // red
    outerFlames.colorDead = new BABYLON.Color4(0.2, 0, 0, 0);

    outerFlames.minSize = 0.4;
    outerFlames.maxSize = 1.0;
    outerFlames.minLifeTime = 0.6;
    outerFlames.maxLifeTime = 1.5;
    outerFlames.emitRate = 140;

    outerFlames.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    outerFlames.gravity = new BABYLON.Vector3(0, 3.8, 0);
    outerFlames.direction1 = new BABYLON.Vector3(-0.6, 1.2, -0.3);
    outerFlames.direction2 = new BABYLON.Vector3(0.6, 1.2, 0.3);
    outerFlames.minEmitPower = 0.6;
    outerFlames.maxEmitPower = 1.2;
    outerFlames.updateSpeed = 0.016;

    outerFlames.start();

    // ===== LAYER 3: SMOKE =====
    const smoke = new BABYLON.ParticleSystem('smoke', 100, scene);
    smoke.particleTexture = smokeTexture;
    smoke.emitter = new BABYLON.Vector3(0, 0.2, 0);
    smoke.minEmitBox = new BABYLON.Vector3(-0.25, -0.05, -0.1);
    smoke.maxEmitBox = new BABYLON.Vector3(0.25, 0.05, 0.1);

    smoke.color1 = new BABYLON.Color4(0.7, 0.7, 0.7, 0.6);
    smoke.color2 = new BABYLON.Color4(0.9, 0.9, 0.9, 0.4);
    smoke.colorDead = new BABYLON.Color4(0.5, 0.5, 0.5, 0);

    smoke.minSize = 0.3;
    smoke.maxSize = 1.2;
    smoke.minLifeTime = 1.0;
    smoke.maxLifeTime = 2.5;
    smoke.emitRate = 80;

    smoke.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD; // normal blend for smoke
    smoke.gravity = new BABYLON.Vector3(0, 2.5, 0); // slower upward
    smoke.direction1 = new BABYLON.Vector3(-0.5, 0.8, -0.3);
    smoke.direction2 = new BABYLON.Vector3(0.5, 0.8, 0.3);
    smoke.minEmitPower = 0.4;
    smoke.maxEmitPower = 0.8;
    smoke.updateSpeed = 0.016;

    smoke.start();

    // ===== LAYER 4: EMBERS (SPARKS) =====
    const embers = new BABYLON.ParticleSystem('embers', 80, scene);
    embers.particleTexture = emberTexture;
    embers.emitter = new BABYLON.Vector3(0, -0.3, 0);
    embers.minEmitBox = new BABYLON.Vector3(-0.15, -0.05, -0.05);
    embers.maxEmitBox = new BABYLON.Vector3(0.15, 0.05, 0.05);

    embers.color1 = new BABYLON.Color4(1, 0.8, 0.2, 1); // bright yellow
    embers.color2 = new BABYLON.Color4(1, 0.4, 0, 1); // orange
    embers.colorDead = new BABYLON.Color4(0.5, 0.1, 0, 0);

    embers.minSize = 0.05;
    embers.maxSize = 0.15;
    embers.minLifeTime = 0.8;
    embers.maxLifeTime = 1.8;
    embers.emitRate = 100;

    embers.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    embers.gravity = new BABYLON.Vector3(0, -1.5, 0); // falling down
    embers.direction1 = new BABYLON.Vector3(-0.8, 2, -0.5);
    embers.direction2 = new BABYLON.Vector3(0.8, 2, 0.5);
    embers.minEmitPower = 1.0;
    embers.maxEmitPower = 2.0;
    embers.updateSpeed = 0.016;

    embers.start();

    // ===== RENDER LOOP =====
    engine.runRenderLoop(() => {
      scene.render();
    });

    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      coreFlames.dispose();
      outerFlames.dispose();
      smoke.dispose();
      embers.dispose();
      flameTexture.dispose();
      smokeTexture.dispose();
      emberTexture.dispose();
      scene.dispose();
      engine.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: size,
        height: size,
        pointerEvents: 'none',
        display: 'block',
        opacity: 0.85, // Slightly transparent as you wanted
      }}
    />
  );
}

export default RealisticBabylonFire;