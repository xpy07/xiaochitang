export const VERT_SRC = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const FRAG_SRC = `
precision mediump float;
varying vec2 v_uv;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_shallowColor;
uniform vec3 u_deepColor;
uniform float u_waveStrength;

void main() {
  vec2 uv = v_uv;

  // Wave distortion
  float wave1 = sin(uv.x * 20.0 + u_time * 1.5) * 0.003 * u_waveStrength;
  float wave2 = sin(uv.y * 15.0 + u_time * 1.2) * 0.003 * u_waveStrength;
  vec2 distortedUV = uv + vec2(wave1, wave2);

  // Depth gradient (center = deep, edge = shallow)
  float depth = 1.0 - length(uv - 0.5) * 1.4;
  depth = clamp(depth, 0.0, 1.0);

  // Base water color
  vec3 color = mix(u_shallowColor, u_deepColor, depth);

  // Caustics pattern
  float caustic = sin(distortedUV.x * 40.0 + u_time * 2.0) *
                   sin(distortedUV.y * 40.0 + u_time * 1.8);
  caustic = smoothstep(0.0, 1.0, caustic * 0.5 + 0.5);
  color += caustic * 0.08;

  // Surface shimmer
  float shimmer = sin((uv.x + uv.y) * 60.0 + u_time * 3.0) * 0.02;
  color += shimmer;

  gl_FragColor = vec4(color, 0.85);
}
`;
