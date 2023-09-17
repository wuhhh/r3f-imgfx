uniform sampler2D uTexture;
uniform sampler2D uTexture1;
uniform float uMix;
varying vec2 vUv;

// ripple effect 
vec2 ripple(vec2 uv) {
	vec2 cPos = -1.0 + 2.0 * uv;
	float cLength = length(cPos);
	uv += (cPos/cLength) * sin(cLength + (uMix * 0.01) * 40.0 - uMix) * pow(uMix, 2.0) / -2.0;
	return uv;
}

float triSDF(in vec2 st) {
    st -= 0.5;
    st *= 5.0;
    // float angle = 0.866025; // equilateral triangle
    float angle = 0.358; // squished
    return max(abs(st.x) * angle + st.y * 0.5, -st.y * 0.5);
}

float rhombSDF(in vec2 st) {
    float offset = 1.0;
    return max(triSDF(st), triSDF(vec2(st.x, offset-st.y)));
}

void main() {
	// Ripple vUv
	vec2 rippleUv = ripple(vUv);

	float sdf = rhombSDF(vUv);
	float fill = smoothstep(uMix * 1.6, uMix * 1.75, sdf);
	vec4 tex1 = texture2D(uTexture, rippleUv);
	vec4 tex2 = texture2D(uTexture1, vUv);
	vec4 color = mix(tex2, tex1, fill);
 
  gl_FragColor = color;
}