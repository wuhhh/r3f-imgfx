import React, { useEffect, useRef } from "react";
import { Canvas, extend } from "@react-three/fiber";
import { Circle, Float, shaderMaterial, useTexture } from "@react-three/drei";
import { useControls } from "leva";
import { gsap } from "gsap";
import { Perf } from "r3f-perf";
import * as THREE from "three";

import vert from "./shaders/vert.glsl";
import fragZesnullen from "./shaders/fragZesnullen.glsl";
import fragZesnullen2 from "./shaders/fragZesnullen2.glsl";
import fragRhomb from "./shaders/fragRhomb.glsl";

const FxMaterial = new shaderMaterial(
  {
    uTexture: undefined,
    uTexture1: undefined,
    uMix: 0.0,
  },
  vert,
  fragZesnullen
);

extend({ FxMaterial });

const Scene = () => {
  const circ = useRef(); // Circle mesh
  const mat = useRef(); // Circle material
  const lastCycle = useRef(); // 1 for fwd, -1 for bwd

  useControls({
    shader: {
      value: "rhomb",
      options: ["zesnullen", "zesnullen2", "rhomb"],
      onChange: val => {
        if (val === "zesnullen") {
          mat.current.fragmentShader = fragZesnullen;
        } else if (val === "zesnullen2") {
					mat.current.fragmentShader = fragZesnullen2;
				} else if (val === "rhomb") {
          mat.current.fragmentShader = fragRhomb;
        }

        // mark needsUpdate true
        mat.current.needsUpdate = true;
      },
    },
  });

  const textureMap = {
    tex1: "/img1.jpg", // orange abstract
    tex2: "/img4.jpg", // girl
    tex3: "/img3.jpg", // night sky
    tex4: "/img2.jpg", // pink abstract
    tex5: "/img5.jpg", // pyramid
    tex6: "/img6.jpg", // checkerboard
  };

  const textures = useTexture(textureMap);
  const currTexture = useRef("tex2");

  const tl = gsap.timeline({ repeat: -1, yoyo: true, paused: true });

  /**
   * Returns the index of the texture in the textureMap
   * @param {string} key - The key of the texture in the textureMap
   */
  const textureIndex = key => Object.keys(textureMap).indexOf(key);

  /**
   * Returns true if the direction of the cycle changed
   * @param {number} dir - The direction of the cycle (1 for fwd, -1 for bwd)
   */
  const changedDirection = dir => lastCycle.current !== dir;

  /**
   * Returns the next texture index
   */
  const nextIndex = () => (textureIndex(currTexture.current) + 1) % Object.keys(textureMap).length;

  /**
   * Returns the previous texture index
   */
  const prevIndex = () => (textureIndex(currTexture.current) - 1 + Object.keys(textureMap).length) % Object.keys(textureMap).length;

  // Cycle texture fwd
  const cycleFwd = () => {
    if (changedDirection(1)) {
      currTexture.current = Object.keys(textureMap)[nextIndex()];
    }

    currTexture.current = Object.keys(textureMap)[nextIndex()];

    mat.current.uniforms.uTexture.value = mat.current.uniforms.uTexture1.value;
    mat.current.uniforms.uTexture1.value = textures[currTexture.current];

    lastCycle.current = 1;
    tl.progress(0);
  };

  // Cycle texture bwd
  const cycleBwd = () => {
    if (changedDirection(-1)) {
      currTexture.current = Object.keys(textureMap)[prevIndex()];
    }

    currTexture.current = Object.keys(textureMap)[prevIndex()];

    mat.current.uniforms.uTexture1.value = mat.current.uniforms.uTexture.value;
    mat.current.uniforms.uTexture.value = textures[currTexture.current];

    lastCycle.current = -1;
    tl.progress(1);
  };

  useEffect(() => {
    tl.to(
      mat.current.uniforms.uMix,
      {
        value: 1.0,
        duration: 1.0,
        ease: "linear",
      },
      0
    );
  }, []);

  /**
   * Handles mouse wheel events
   */
  const handleMouseWheel = e => {
    // Reached end of timeline and scrolling down
    if (tl.progress() === 1 && e.wheelDeltaY < 0) {
      cycleFwd();
    }
    // Reached beginning of timeline and scrolling up
    else if (tl.progress() === 0 && e.wheelDeltaY > 0) {
      cycleBwd();
    }
    tl.progress(THREE.MathUtils.clamp(tl.progress() - e.wheelDeltaY / 20000, 0, 1));
    // console.log(tl.progress());
  };

  // Negative delta is scroll down
  window.addEventListener("wheel", handleMouseWheel, false);

  return (
    <>
      <Float>
        <Circle ref={circ} args={[1, 64]}>
          <fxMaterial ref={mat} key={FxMaterial.key} uTexture={textures.tex1} uTexture1={textures.tex2} uMix={0.0} />
        </Circle>
      </Float>
    </>
  );
};

const App = () => {
  return (
    <Canvas flat linear camera={{ fov: 70, position: [0, 0, 3] }}>
      <Perf position='top-left' minimal />
      <Scene />
    </Canvas>
  );
};

export default App;
