uniform sampler2D uTexture;
uniform sampler2D uTexture1;
uniform float uMix;
varying vec2 vUv;

vec2 twirl(vec2 uv, float distort, float power) {
	vec2 twirlUv = uv - 0.5;
	float a = atan(twirlUv.y, twirlUv.x);
	float r = length(twirlUv);
	a -= pow(r * distort, power);
	twirlUv = vec2(cos(a), sin(a)) * r;
	twirlUv += 0.5;
	return twirlUv;
}

// barrel distortion
vec2 distort(vec2 p, float power) {
	p = -1.0 + 2.0 * p;
	float theta  = atan(p.y, p.x);
	float radius = length(p);
	radius = pow(radius, power);
	p.x = radius * cos(theta);
	p.y = radius * sin(theta);
	return 0.5 * (p + 1.0);
}

// ripple effect 
vec2 ripple(vec2 uv) {
	vec2 cPos = -1.0 + 2.0 * uv;
	float cLength = length(cPos);
	uv += (cPos/cLength) * sin(cLength * 24.0 - uMix) * pow(uMix, 3.0) / 18.0;
	return uv;
}

// map range 
float map(float value, float min1, float max1, float min2, float max2) {
	return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

// rotate
vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

void main() {
	// Define a scaling factor for tex1
	float scaleFactor = (uMix * 0.5) + 0.5; // 0.5 to 1.0

	// Ripple vUv
	vec2 rippleUv = ripple(vUv);

	// Barrel distort rippleUv
	vec2 distortRippleUv = distort(rippleUv, pow(uMix * uMix * uMix + 1.0, 4.0));

	// Calculate the scaled texture coordinates with recentering
	vec2 scaledCoordinates = rotate(vUv - 0.5, (1.0 - uMix) * 0.5) / scaleFactor + 0.5;
	vec2 twirlUv = twirl(scaledCoordinates, (1.0 - uMix) * 5.0, 7.0);

	vec4 tex1 = texture2D(uTexture, distortRippleUv);
	vec4 tex2 = texture2D(uTexture1, twirlUv);

	float feather = 0.1;
	float paddedMix = map(uMix, 0.0, 1.0, -feather, 1.0); // Start from < 0 so tex1 isn't visible at the start

	gl_FragColor = mix(tex2, tex1, smoothstep(paddedMix * 0.5, (paddedMix + feather) * 0.5, length(vUv - 0.5)));
}