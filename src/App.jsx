import React, { useEffect, useRef } from "react";
import { Canvas, extend } from "@react-three/fiber";
import { Circle, Float, shaderMaterial, useTexture } from "@react-three/drei";
import { useControls } from 'leva';
import { gsap } from "gsap";
import * as THREE from "three";

const FxMaterial = new shaderMaterial(
	{
		uTexture: undefined,
		uTexture1: undefined,
		uTime: 0.0,
		// uTwirlDistortion: 0.0,
		// uTwirlPower: 0.0,
		// uLensDistortion: 0.0,
		// uLensPower: 0.0,
		uDistortion: 0.0,
		uPower: 0.0,
		uMix: 0.0,
	},
	/*glsl*/ `
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
	`,
	/*glsl*/ `
		uniform sampler2D uTexture;
		uniform sampler2D uTexture1;
		// uniform float uTwirlDistortion;
		// uniform float uTwirlPower;
		// uniform float uLensDistortion;
		// uniform float uLensPower;
		uniform float uDistortion;
		uniform float uPower;
		uniform float uMix;
		varying vec2 vUv;

		void main() {
			// Twirl effect

			vec2 twirlUv = vUv - 0.5;
			float a = atan(twirlUv.y, twirlUv.x);
			float r = length(twirlUv);
			// a -= pow(r * uLensDistortion, uLensPower);
			a -= pow(r * uDistortion, uPower);
			twirlUv = vec2(cos(a), sin(a)) * r;
			twirlUv += 0.5;

			// Fish eye lens effect

			// Offset uv so 0,0 is in the centre
			vec2 lensUv = vec2(clamp(twirlUv.x, 0.0, 1.0), clamp(twirlUv.y, 0.0, 1.0)) - 0.5;
			// vec2 lensUv = vUv - 0.5;
			
			// lensUv *= 1.0 - pow(length(lensUv * uLensDistortion), uLensPower);
			lensUv *= 1.0 - pow(length(lensUv * uDistortion), uPower);
			lensUv += 0.5;

			// mix between textures 
			vec4 color = mix(texture2D(uTexture, lensUv), texture2D(uTexture1, lensUv), uMix);

			// vec4 color = texture2D(uTexture, lensUv);
			gl_FragColor = color;
		}
	`
)

extend({ FxMaterial });

const Scene = () => {
	console.log("Scene");

	const circ = useRef(); // Circle mesh
	const mat = useRef(); // Circle material 
	
	const texUniforms = [
		"uTexture",
		"uTexture1",
	];

	const textureMap = {
		tex1: "/img1.jpg", // orange abstract
		tex2: "/img2.jpg", // pink abstract
		tex3: "/img3.jpg", // night sky 
		tex4: "/img4.jpg", // girl
		tex5: "/img5.jpg", // pyramid
	};

	const textures = useTexture(textureMap);
	const currTexture = useRef('tex2');

	const tl = gsap.timeline({ repeat: -1, yoyo: true, paused: true, ease: "power2.inOut" });

	const textureIndex = key => Object.keys(textureMap).indexOf(key);

	// Cycle texture fwd
	const flipNext = () => {
		const nextIndex = (textureIndex(currTexture.current) + 1) % Object.keys(textureMap).length;
		currTexture.current = Object.keys(textureMap)[nextIndex];
	
		mat.current.uniforms[texUniforms[0]].value = mat.current.uniforms[texUniforms[1]].value;
		mat.current.uniforms[texUniforms[1]].value = textures[currTexture.current];
		
		tl.progress(0);
	};
	
	// Cycle texture bwd
	const flipPrev = () => {
		const prevIndex = (textureIndex(currTexture.current) - 1 + Object.keys(textureMap).length) % Object.keys(textureMap).length;
		currTexture.current = Object.keys(textureMap)[prevIndex];
	
		mat.current.uniforms[texUniforms[1]].value = mat.current.uniforms[texUniforms[0]].value;
		mat.current.uniforms[texUniforms[0]].value = textures[currTexture.current];
		
		tl.progress(1);
	};

	useEffect(() => {
		tl.fromTo(mat.current.uniforms.uDistortion, {
			value: 2.5,
			duration: 1.5,
			ease: "linear"
		}, {
			value: 1.0,
			duration: 1.5,
			ease: "linear"
		});

		tl.to(mat.current.uniforms.uMix, {
			value: 1.0,
			duration: 1.0,
			ease: "linear",
		}, "<");

		/* tl.from(circ.current.scale, {
			x: 0.75,
			y: 0.75,
			duration: 1.0,
			ease: "linear",
		}, "<"); */

		/* tl.from(circ.current.rotation, {
			z: Math.PI * 0.1,
			duration: 1.0,
			ease: "linear",
		}, "<"); */
	}, []);

	// Negative delta is scroll down
	window.addEventListener("mousewheel", (e) => {
		// Reached end of timeline and scrolling down
		if(tl.progress() === 1 && e.wheelDeltaY < 0) {
			flipNext();
			
		}
		// Reached beginning of timeline and scrolling up
		else if(tl.progress() === 0 && e.wheelDeltaY > 0) {
			flipPrev();
		}
		tl.progress(THREE.MathUtils.clamp(tl.progress() - e.wheelDeltaY / 10000, 0, 1));
	});

	const fxProps = useControls("FX", {
		distortion: {
			value: 0.0,
			min: 0.0,
			max: 5.0,
			step: 0.001,
		},
		power: {
			value: 8.0,
			min: 0.0,
			max: 16.0,
			step: 0.001,
		},
		mix: {
			value: 0.0,
			min: 0.0,
			max: 1.0,
			step: 0.001,
		},
	});


  return (
    <>
			<Float>
				<Circle ref={circ} args={[1, 64]}>
					<fxMaterial ref={mat} uTexture={textures.tex1} uTexture1={textures.tex2} uDistortion={fxProps.distortion} uPower={fxProps.power} uMix={fxProps.mix} />
				</Circle>
			</Float>
    </>
  );
};

const App = () => {
  return (
    <Canvas flat linear camera={{ fov: 70, position: [0, 0, 3] }}>
      <Scene />
    </Canvas>
  );
};

export default App;
