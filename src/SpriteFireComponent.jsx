import { useEffect, useRef } from 'react';
import * as BABYLON from 'babylonjs';

const FIRE_TEXTURES = [
  'https://raw.githubusercontent.com/PatrickRyanMS/BabylonJStextures/master/ParticleSystems/Fire/Fire_SpriteSheet1_8x8.png',
  'https://raw.githubusercontent.com/PatrickRyanMS/BabylonJStextures/master/ParticleSystems/Fire/Fire_SpriteSheet2_8x8.png',
  'https://raw.githubusercontent.com/PatrickRyanMS/BabylonJStextures/master/ParticleSystems/Fire/Fire_SpriteSheet3_8x8.png',
];

const SPARK_TEXTURE =
  'https://raw.githubusercontent.com/PatrickRyanMS/BabylonJStextures/master/ParticleSystems/Sparks/sparks.png';

function SpriteFireComponent({
  active = false,
  size = 140,
  intensity = 1.5,
  extinguishing = false,
  onReady,
  onError,
  onExtinguishComplete,
}) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const sceneRef = useRef(null);
  const fireSystemsRef = useRef([]);
  const sparksRef = useRef(null);
  const lightRef = useRef(null);

  function setupAnimationSheet(
    system,
    textureUrl,
    animationSpeed,
    isRandom,
    loop,
    scene
  ) {
    system.isAnimationSheetEnabled = true;

    system.particleTexture = new BABYLON.Texture(
      textureUrl,
      scene,
      false,
      false
    );

    system.spriteCellWidth = 1024 / 8;
    system.spriteCellHeight = 1024 / 8;
    system.startSpriteCellID = 0;
    system.endSpriteCellID = 63;
    system.spriteCellChangeSpeed = animationSpeed;
    system.spriteRandomStartCell = isRandom;
    system.spriteCellLoop = loop;
    system.updateSpeed = 1 / 60;
  }

  function setupFireColors(system) {
    system.addColorGradient(
      0,
      new BABYLON.Color4(1, 1, 1, 0)
    );

    system.addColorGradient(
      0.1,
      new BABYLON.Color4(1, 1, 1, 0.6)
    );

    system.addColorGradient(
      0.9,
      new BABYLON.Color4(1, 1, 1, 0.6)
    );

    system.addColorGradient(
      1,
      new BABYLON.Color4(1, 1, 1, 0)
    );

    system.addRampGradient(
      0,
      new BABYLON.Color3(1, 1, 1)
    );

    system.addRampGradient(
      1,
      new BABYLON.Color3(0.7968, 0.3685, 0.1105)
    );

    system.useRampGradients = true;

    system.addColorRemapGradient(0, 0.2, 1);
    system.addColorRemapGradient(1, 0.2, 1);
  }

  function setupSparkColors(system) {
    system.addColorGradient(
      0,
      new BABYLON.Color4(0.9245, 0.654, 0.0915, 0)
    );

    system.addColorGradient(
      0.04,
      new BABYLON.Color4(0.9062, 0.6132, 0.0942, 0.1)
    );

    system.addColorGradient(
      0.4,
      new BABYLON.Color4(0.7968, 0.3685, 0.1105, 1)
    );

    system.addColorGradient(
      0.7,
      new BABYLON.Color4(0.6886, 0.1266, 0.1266, 1)
    );

    system.addColorGradient(
      0.9,
      new BABYLON.Color4(0.3113, 0.0367, 0.0367, 0.6)
    );

    system.addColorGradient(
      1,
      new BABYLON.Color4(0.3113, 0.0367, 0.0367, 0)
    );

    system.addRampGradient(
      0,
      new BABYLON.Color3(1, 1, 1)
    );

    system.addRampGradient(
      1,
      new BABYLON.Color3(0.7968, 0.63685, 0.4105)
    );

    system.useRampGradients = true;

    system.addColorRemapGradient(0, 0, 0.1);
    system.addColorRemapGradient(0.2, 0.1, 0.8);
    system.addColorRemapGradient(0.3, 0.2, 0.85);
    system.addColorRemapGradient(0.35, 0.4, 0.85);
    system.addColorRemapGradient(0.4, 0.5, 0.9);
    system.addColorRemapGradient(0.5, 0.95, 1);
    system.addColorRemapGradient(1, 0.95, 1);
  }

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return undefined;
    }

    let engine;
    let scene;
    let resizeHandler;

    try {
      engine = new BABYLON.Engine(canvas, true, {
        preserveDrawingBuffer: true,
        stencil: true,
        alpha: true,
      });

      scene = new BABYLON.Scene(engine);
      scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

      /*
       * FIRE_SIZE is 280 in FireModule.jsx.
       * The default reference size is 140.
       * Therefore, 280 creates a visual scale of 2.
       */
      const visualScale = Math.max(1, size / 140);

      const camera = new BABYLON.FreeCamera(
        'fireCamera',
        new BABYLON.Vector3(0, 0, -5),
        scene
      );

      camera.setTarget(BABYLON.Vector3.Zero());

      const light = new BABYLON.PointLight(
        'fireLight',
        new BABYLON.Vector3(0, 0, 0),
        scene
      );

      light.intensity = 0;
      light.range = 50;

      const noiseTexture =
        new BABYLON.NoiseProceduralTexture(
          'fireNoise',
          256,
          scene
        );

      noiseTexture.animationSpeedFactor = 3;
      noiseTexture.persistence = 1;
      noiseTexture.brightness = 0.5;
      noiseTexture.octaves = 8;

      const fireSystems = [];

      const fireSettings = [
        {
          position: new BABYLON.Vector3(0, 1, 0),
          capacity: 5,
          sizeMin: 0.8,
          sizeMax: 1.2,
          texture: FIRE_TEXTURES[0],
          speed: 1,
        },
        {
          position: new BABYLON.Vector3(0, 0.6, 0),
          capacity: 3,
          sizeMin: 0.7,
          sizeMax: 1,
          texture: FIRE_TEXTURES[1],
          speed: 0.9,
        },
        {
          position: new BABYLON.Vector3(0, 0.6, 0),
          capacity: 3,
          sizeMin: 0.7,
          sizeMax: 1,
          texture: FIRE_TEXTURES[2],
          speed: 0.9,
        },
      ];

      fireSettings.forEach((settings, index) => {
        const fire = BABYLON.ParticleHelper.CreateDefault(
          settings.position,
          settings.capacity
        );

        fire.name = `fireLayer${index}`;

        const emitterSize = 0.3 * visualScale;

        fire.createBoxEmitter(
          new BABYLON.Vector3(0, 1, 0),
          new BABYLON.Vector3(0, 1, 0),
          new BABYLON.Vector3(
            -emitterSize,
            0,
            -emitterSize
          ),
          new BABYLON.Vector3(
            emitterSize,
            0,
            emitterSize
          )
        );

        setupAnimationSheet(
          fire,
          settings.texture,
          settings.speed,
          true,
          true,
          scene
        );

        fire.minLifeTime = 1.5;
        fire.maxLifeTime = 2.5;
        fire.emitRate = 3;

        fire.minSize = settings.sizeMin * visualScale;
        fire.maxSize = settings.sizeMax * visualScale;

        fire.minInitialRotation = -0.1;
        fire.maxInitialRotation = 0.1;
        fire.minEmitPower = 0;
        fire.maxEmitPower = 0;

        fire.blendMode =
          BABYLON.ParticleSystem.BLENDMODE_MULTIPLYADD;

        fire.billboardMode =
          BABYLON.AbstractMesh.BILLBOARDMODE_Y;

        setupFireColors(fire);
        fireSystems.push(fire);
      });

      const sparks = BABYLON.ParticleHelper.CreateDefault(
        new BABYLON.Vector3(0, 0.2, 0),
        20
      );

      sparks.name = 'fireSparks';

      sparks.createConeEmitter(
        0.8 * visualScale,
        0.6 * visualScale
      );

      sparks.particleTexture = new BABYLON.Texture(
        SPARK_TEXTURE,
        scene,
        false,
        false
      );

      sparks.minLifeTime = 1;
      sparks.maxLifeTime = 2;

      sparks.minSize = 0.1 * visualScale;
      sparks.maxSize = 0.2 * visualScale;

      sparks.emitRate = 25;
      sparks.minEmitPower = 12 * visualScale;
      sparks.maxEmitPower = 18 * visualScale;

      sparks.addLimitVelocityGradient(0, 5);
      sparks.addLimitVelocityGradient(1, 0.5);
      sparks.limitVelocityDamping = 0.5;

      sparks.noiseTexture = noiseTexture;
      sparks.noiseStrength = new BABYLON.Vector3(
        1.5 * visualScale,
        0.8 * visualScale,
        0.8 * visualScale
      );

      sparks.blendMode =
        BABYLON.ParticleSystem.BLENDMODE_ADD;

      setupSparkColors(sparks);

      engineRef.current = engine;
      sceneRef.current = scene;
      fireSystemsRef.current = fireSystems;
      sparksRef.current = sparks;
      lightRef.current = light;

      engine.runRenderLoop(() => {
        if (scene && !scene.isDisposed) {
          scene.render();
        }
      });

      resizeHandler = () => {
        if (engine) {
          engine.resize();
        }
      };

      window.addEventListener('resize', resizeHandler);
      engine.resize();

      onReady?.();

      return () => {
        if (resizeHandler) {
          window.removeEventListener(
            'resize',
            resizeHandler
          );
        }

        if (scene && !scene.isDisposed) {
          scene.dispose();
        }

        if (engine) {
          engine.stopRenderLoop();
          engine.dispose();
        }

        engineRef.current = null;
        sceneRef.current = null;
        fireSystemsRef.current = [];
        sparksRef.current = null;
        lightRef.current = null;
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      onError?.(message);

      return undefined;
    }
  }, [size]);

  useEffect(() => {
    const fireSystems = fireSystemsRef.current;
    const sparks = sparksRef.current;
    const light = lightRef.current;

    if (!fireSystems.length) {
      return undefined;
    }

    if (active && !extinguishing) {
      fireSystems.forEach((system) => {
        system.start();
        system.emitRate = 3;
      });

      sparks?.start();

      if (light) {
        light.intensity = intensity;

        const flickerTimer = window.setInterval(() => {
          if (light && active && !extinguishing) {
            light.intensity =
              intensity * (0.8 + Math.random() * 0.5);
          }
        }, 100);

        return () => {
          window.clearInterval(flickerTimer);
        };
      }
    }

    if (!active && !extinguishing) {
      fireSystems.forEach((system) => {
        system.stop();
      });

      sparks?.stop();

      if (light) {
        light.intensity = 0;
      }
    }

    return undefined;
  }, [active, extinguishing, intensity]);

  useEffect(() => {
    if (!extinguishing) {
      return undefined;
    }

    const scene = sceneRef.current;
    const fireSystems = fireSystemsRef.current;
    const sparks = sparksRef.current;
    const light = lightRef.current;

    if (!scene || !fireSystems.length) {
      return undefined;
    }

    const extinguishAnimation = new BABYLON.Animation(
      'extinguishFire',
      'emitRate',
      60,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    extinguishAnimation.setKeys([
      {
        frame: 0,
        value: 3,
      },
      {
        frame: 35,
        value: 1,
      },
      {
        frame: 60,
        value: 0,
      },
    ]);

    fireSystems.forEach((system) => {
      scene.beginDirectAnimation(
        system,
        [extinguishAnimation],
        0,
        60,
        false
      );
    });

    let sparkTimer;

    if (sparks) {
      sparks.emitRate = 8;

      sparkTimer = window.setTimeout(() => {
        sparks.stop();
      }, 850);
    }

    let completionCalled = false;

    const completeExtinguishing = () => {
      if (completionCalled) {
        return;
      }

      completionCalled = true;
      onExtinguishComplete?.();
    };

    if (light) {
      const lightAnimation = new BABYLON.Animation(
        'fadeFireLight',
        'intensity',
        60,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
      );

      lightAnimation.setKeys([
        {
          frame: 0,
          value: intensity,
        },
        {
          frame: 30,
          value: intensity * 0.4,
        },
        {
          frame: 60,
          value: 0,
        },
      ]);

      scene.beginDirectAnimation(
        light,
        [lightAnimation],
        0,
        60,
        false,
        1,
        completeExtinguishing
      );
    } else {
      const completionTimer = window.setTimeout(
        completeExtinguishing,
        1000
      );

      return () => {
        window.clearTimeout(completionTimer);

        if (sparkTimer) {
          window.clearTimeout(sparkTimer);
        }
      };
    }

    return () => {
      if (sparkTimer) {
        window.clearTimeout(sparkTimer);
      }
    };
  }, [extinguishing, intensity, onExtinguishComplete]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="babylon-fire"
      style={{
        width: size,
        height: size,
        opacity: 0.9,
      }}
    />
  );
}

export default SpriteFireComponent;