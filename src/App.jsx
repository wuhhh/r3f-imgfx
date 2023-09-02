import React, { useRef } from "react";
import { Canvas, extend } from "@react-three/fiber";
import { Circle, OrbitControls, shaderMaterial, useTexture } from "@react-three/drei";
import { useControls } from 'leva';

const FxMaterial = new shaderMaterial(
	{
		uTexture: undefined,
		uTime: 0.0,
		// uTwirlDistortion: 0.0,
		// uTwirlPower: 0.0,
		// uLensDistortion: 0.0,
		// uLensPower: 0.0,
		uDistortion: 0.0,
		uPower: 0.0,
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
		// uniform float uTwirlDistortion;
		// uniform float uTwirlPower;
		// uniform float uLensDistortion;
		// uniform float uLensPower;
		uniform float uDistortion;
		uniform float uPower;
		varying vec2 vUv;

		void main() {
			// Scale uv down as distortion increases
			

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

			vec4 color = texture2D(uTexture, lensUv);
			gl_FragColor = color;
		}
	`
)

extend({ FxMaterial });

const Scene = () => {
	const circ = useRef();
	const mat = useRef();

	// Load texture
	const [texture] = useTexture(["/michael-dziedzic-nc11Hg2ja-s-unsplash.jpg"]);

	/* const twirlProps = useControls("Twirl", {
		distortion: {
			value: 5.0,
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
	});

	const lensProps = useControls("Lens", {
		distortion: {
			value: 1.0,
			min: 0.0,
			max: 5.0,
			step: 0.001,
		},
		power: {
			value: 1.0,
			min: 0.0,
			max: 16.0,
			step: 0.001,
		},
	}); */

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
	});


  return (
    <>
			<Circle ref={circ} args={[1, 64]}>
				<fxMaterial ref={mat} uTexture={texture} uDistortion={fxProps.distortion} uPower={fxProps.power} />
			</Circle>
    </>
  );
};

const App = () => {
  return (
    <Canvas flat linear camera={{ fov: 70, position: [0, 0, 3] }}>
      <OrbitControls />
      <Scene />
    </Canvas>
  );
};

export default App;
