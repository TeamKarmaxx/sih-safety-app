import { useEffect, useRef } from 'react';
import * as BABYLON from 'babylonjs';

function RealisticBabylonGas({ size = 140 }) {
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

    const camera = new BABYLON.FreeCamera('cam', new BABYLON.Vector3(0, 0, -3), scene);
    camera.setTarget(BABYLON.Vector3.Zero());

    // ===== CREATE REALISTIC GAS TEXTURES =====

    // Main gas texture - greenish/yellowish toxic color
    const gasTexture = new BABYLON.DynamicTexture('gasTex', 128, scene, false);
    let ctx = gasTexture.getContext();
    const gasGrad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gasGrad.addColorStop(0, 'rgba(150,255,100,0.9)'); // bright lime green
    gasGrad.addColorStop(0.3, 'rgba(100,200,80,0.7)');
    gasGrad.addColorStop(0.6, 'rgba(80,150,60,0.4)');
    gasGrad.addColorStop(1, 'rgba(50,100,40,0)');
    ctx.fillStyle = gasGrad;
    ctx.fillRect(0, 0, 128, 128);
    gasTexture.update();

    // Vapor texture - whitish for drifting vapor clouds
    const vaporTexture = new BABYLON.DynamicTexture('vaporTex', 128, scene, false);
    ctx = vaporTexture.getContext();
    const vaporGrad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    vaporGrad.addColorStop(0, 'rgba(200,255,200,0.8)');
    vaporGrad.addColorStop(0.4, 'rgba(150,200,150,0.5)');
    vaporGrad.addColorStop(0.7, 'rgba(100,150,100,0.2)');
    vaporGrad.addColorStop(1, 'rgba(50,100,50,0)');
    ctx.fillStyle = vaporGrad;
    ctx.fillRect(0, 0, 128, 128);
    vaporTexture.update();

    // Warning particles - bright red dots for hazard indicator
    const warningTexture = new BABYLON.DynamicTexture('warningTex', 64, scene, false);
    ctx = warningTexture.getContext();
    const warningGrad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    warningGrad.addColorStop(0, 'rgba(255,100,100,1)');
    warningGrad.addColorStop(0.5, 'rgba(200,50,50,0.7)');
    warningGrad.addColorStop(1, 'rgba(100,0,0,0)');
    ctx.fillStyle = warningGrad;
    ctx.fillRect(0, 0, 64, 64);
    warningTexture.update();

    // ===== LAYER 1: DENSE GAS CLOUD (CENTER) =====
    const denseGas = new BABYLON.ParticleSystem('denseGas', 200, scene);
    denseGas.particleTexture = gasTexture;
    denseGas.emitter = new BABYLON.Vector3(0, 0, 0);
    denseGas.minEmitBox = new BABYLON.Vector3(-0.15, -0.15, -0.1);
    denseGas.maxEmitBox = new BABYLON.Vector3(0.15, 0.15, 0.1);

    denseGas.color1 = new BABYLON.Color4(0.6, 1, 0.4, 0.9); // lime green
    denseGas.color2 = new BABYLON.Color4(0.4, 0.8, 0.3, 0.8); // darker green
    denseGas.colorDead = new BABYLON.Color4(0.2, 0.4, 0.1, 0); // fading to black

    denseGas.minSize = 0.4;
    denseGas.maxSize = 1.0;
    denseGas.minLifeTime = 1.5;
    denseGas.maxLifeTime = 3.0;
    denseGas.emitRate = 120;

    denseGas.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
    denseGas.gravity = new BABYLON.Vector3(0, 0.3, 0); // very slight upward drift
    denseGas.direction1 = new BABYLON.Vector3(-0.5, -0.2, -0.4);
    denseGas.direction2 = new BABYLON.Vector3(0.5, 0.3, 0.4);
    denseGas.minEmitPower = 0.3;
    denseGas.maxEmitPower = 0.8;
    denseGas.updateSpeed = 0.016;

    denseGas.start();

    // ===== LAYER 2: SWIRLING VAPOR CLOUDS =====
    const vaporClouds = new BABYLON.ParticleSystem('vaporClouds', 150, scene);
    vaporClouds.particleTexture = vaporTexture;
    vaporClouds.emitter = new BABYLON.Vector3(0, 0.2, 0);
    vaporClouds.minEmitBox = new BABYLON.Vector3(-0.3, -0.1, -0.15);
    vaporClouds.maxEmitBox = new BABYLON.Vector3(0.3, 0.1, 0.15);

    vaporClouds.color1 = new BABYLON.Color4(0.8, 0.95, 0.8, 0.6);
    vaporClouds.color2 = new BABYLON.Color4(0.7, 0.9, 0.7, 0.4);
    vaporClouds.colorDead = new BABYLON.Color4(0.5, 0.7, 0.5, 0);

    vaporClouds.minSize = 0.5;
    vaporClouds.maxSize = 1.5;
    vaporClouds.minLifeTime = 2.0;
    vaporClouds.maxLifeTime = 4.0;
    vaporClouds.emitRate = 80;

    vaporClouds.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
    vaporClouds.gravity = new BABYLON.Vector3(0, 0.5, 0); // drifts upward
    vaporClouds.direction1 = new BABYLON.Vector3(-0.8, 0.5, -0.5);
    vaporClouds.direction2 = new BABYLON.Vector3(0.8, 0.8, 0.5);
    vaporClouds.minEmitPower = 0.2;
    vaporClouds.maxEmitPower = 0.6;
    vaporClouds.updateSpeed = 0.016;

    vaporClouds.start();

    // ===== LAYER 3: SPREADING GAS (WIDER RADIUS) =====
    const spreadingGas = new BABYLON.ParticleSystem('spreadingGas', 180, scene);
    spreadingGas.particleTexture = gasTexture;
    spreadingGas.emitter = new BABYLON.Vector3(0, -0.1, 0);
    spreadingGas.minEmitBox = new BABYLON.Vector3(-0.4, -0.1, -0.2);
    spreadingGas.maxEmitBox = new BABYLON.Vector3(0.4, 0.1, 0.2);

    spreadingGas.color1 = new BABYLON.Color4(0.5, 0.9, 0.3, 0.7);
    spreadingGas.color2 = new BABYLON.Color4(0.35, 0.7, 0.2, 0.5);
    spreadingGas.colorDead = new BABYLON.Color4(0.15, 0.3, 0.1, 0);

    spreadingGas.minSize = 0.3;
    spreadingGas.maxSize = 1.2;
    spreadingGas.minLifeTime = 1.8;
    spreadingGas.maxLifeTime = 3.5;
    spreadingGas.emitRate = 100;

    spreadingGas.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
    spreadingGas.gravity = new BABYLON.Vector3(0, 0.1, 0);
    spreadingGas.direction1 = new BABYLON.Vector3(-1.0, 0.2, -0.7);
    spreadingGas.direction2 = new BABYLON.Vector3(1.0, 0.6, 0.7);
    spreadingGas.minEmitPower = 0.4;
    spreadingGas.maxEmitPower = 1.0;
    spreadingGas.updateSpeed = 0.016;

    spreadingGas.start();

    // ===== LAYER 4: WARNING HAZARD PARTICLES (RED FLICKERS) =====
    const hazardWarning = new BABYLON.ParticleSystem('hazardWarning', 60, scene);
    hazardWarning.particleTexture = warningTexture;
    hazardWarning.emitter = new BABYLON.Vector3(0, 0, 0);
    hazardWarning.minEmitBox = new BABYLON.Vector3(-0.2, -0.2, -0.1);
    hazardWarning.maxEmitBox = new BABYLON.Vector3(0.2, 0.2, 0.1);

    hazardWarning.color1 = new BABYLON.Color4(1, 0.4, 0.4, 0.8); 
    hazardWarning.color2 = new BABYLON.Color4(1, 0.2, 0.2, 0.6);
    hazardWarning.colorDead = new BABYLON.Color4(0.5, 0, 0, 0);

    hazardWarning.minSize = 0.08;
    hazardWarning.maxSize = 0.2;
    hazardWarning.minLifeTime = 0.6;
    hazardWarning.maxLifeTime = 1.2;
    hazardWarning.emitRate = 50;

    hazardWarning.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    hazardWarning.gravity = new BABYLON.Vector3(0, 0.2, 0);
    hazardWarning.direction1 = new BABYLON.Vector3(-0.6, 0.5, -0.4);
    hazardWarning.direction2 = new BABYLON.Vector3(0.6, 0.9, 0.4);
    hazardWarning.minEmitPower = 0.5;
    hazardWarning.maxEmitPower = 1.2;
    hazardWarning.updateSpeed = 0.016;

    hazardWarning.start();

    // ===== RENDER LOOP =====
    engine.runRenderLoop(() => {
      scene.render();
    });

    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      denseGas.dispose();
      vaporClouds.dispose();
      spreadingGas.dispose();
      hazardWarning.dispose();
      gasTexture.dispose();
      vaporTexture.dispose();
      warningTexture.dispose();
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
        opacity: 0.8, 
      }}
    />
  );
}

export default RealisticBabylonGas;