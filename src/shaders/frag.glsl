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
	// Define a scaling factor
	float scaleFactor = (uMix * 0.5) + 0.5; // 0.5 to 1.0

	// Twirl effect

	vec2 twirlUv = vUv - 0.5;
	float a = atan(twirlUv.y, twirlUv.x);
	float r = length(twirlUv);
	a -= pow(r * uDistortion, uPower);
	twirlUv = vec2(cos(a), sin(a)) * r;
	twirlUv += 0.5;

	// Fish eye lens effect

	// Offset uv so 0,0 is in the centre
	// vec2 lensUv = vec2(clamp(twirlUv.x, 0.0, 1.0), clamp(twirlUv.y, 0.0, 1.0)) - 0.5;
	vec2 lensUv = twirlUv - 0.5;
	lensUv *= 1.0 - pow(length(lensUv) * uDistortion, uPower);
	lensUv += 0.5;

	// Calculate the scaled texture coordinates with recentering
	vec2 scaledCoordinates = (lensUv - 0.5) / scaleFactor + 0.5;

	// mix between textures 
	vec4 color = mix(texture2D(uTexture, lensUv), texture2D(uTexture1, scaledCoordinates), uMix);

	// vec4 color = texture2D(uTexture, lensUv);
	gl_FragColor = color;
}