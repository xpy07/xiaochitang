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
uniform vec3 u_shallowColor;
uniform vec3 u_deepColor;
uniform float u_waveStrength;
uniform vec3 u_tint;
uniform float u_brightness;
uniform vec2 u_clipCenter;
uniform vec2 u_clipSize;
uniform float u_clipShape;
uniform float u_aspect;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.07;
    a *= 0.5;
  }
  return v;
}

float sdEllipse(vec2 p, vec2 r) {
  float k = length(p / r);
  return (k - 1.0) * min(r.x, r.y);
}

float sdRoundedRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float getSD(vec2 clipP) {
  if (u_clipShape < 1.5) return sdEllipse(clipP, u_clipSize);
  if (u_clipShape < 2.5) return sdRoundedRect(clipP, u_clipSize, 0.04);
  float angle = atan(clipP.y, clipP.x);
  float wobble = 1.0 + 0.15 * sin(angle * 3.0) + 0.08 * sin(angle * 7.0);
  return sdEllipse(clipP / wobble, u_clipSize) * wobble;
}

// Simulated pond bottom texture (visible through water)
vec3 pondBottom(vec2 p, float depth) {
  // Sandy/pebbly bottom
  float grain = fbm(p * 12.0) * 0.5 + 0.5;
  vec3 sand = vec3(0.25, 0.2, 0.12) * grain;

  // Pebbles
  float pebble = smoothstep(0.7, 0.75, fbm(p * 25.0));
  sand = mix(sand, vec3(0.3, 0.28, 0.22), pebble * 0.5);

  // Depth darkening (deeper = darker bottom)
  sand *= (0.4 + 0.6 * (1.0 - depth));
  return sand;
}

void main() {
  vec2 uv = v_uv;
  float t = u_time;

  // Scene clip
  float sd = 1.0;
  if (u_clipShape > 0.5) {
    vec2 clipP = (uv - u_clipCenter) * vec2(u_aspect, 1.0);
    sd = getSD(clipP);
    if (sd > 0.01) discard;
  }

  // Multi-layer wave distortion (organic, slow)
  float w1 = sin(uv.x * 18.0 + t * 0.3) * 0.003 * u_waveStrength;
  float w2 = sin(uv.y * 14.0 + t * 0.25) * 0.003 * u_waveStrength;
  float w3 = sin((uv.x + uv.y) * 10.0 + t * 0.2) * 0.002 * u_waveStrength;
  float n1 = (fbm(uv * 6.0 + t * 0.03) - 0.5) * 0.008 * u_waveStrength;
  float n2 = (fbm(uv * 10.0 - t * 0.02) - 0.5) * 0.005 * u_waveStrength;
  vec2 distortedUV = uv + vec2(w1 + n1, w2 + w3 + n2);

  // Depth: center deep, edge shallow
  float dist = length(distortedUV - 0.5);
  float depth = 1.0 - smoothstep(0.05, 0.55, dist);
  depth = clamp(depth, 0.0, 1.0);

  // Wave normal approximation (for refraction and fresnel)
  float dx = w1 + n1;
  float dy = w2 + w3 + n2;
  vec3 normal = normalize(vec3(-dx * 30.0, -dy * 30.0, 1.0));

  // Fresnel: edge more reflective, center more transparent
  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);

  // Refraction: offset UV for bottom lookup
  vec2 refractUV = distortedUV + normal.xy * 0.02;

  // Visible bottom through water (3D depth illusion)
  vec3 bottomColor = pondBottom(refractUV, depth);

  // Water body color (light absorption with depth)
  float depthMod = depth + (fbm(distortedUV * 3.0 + t * 0.03) - 0.5) * 0.1;
  vec3 waterBody = mix(u_shallowColor, u_deepColor, clamp(depthMod, 0.0, 1.0));

  // Mix bottom (transparent) with water body (opaque) based on depth
  // Shallow water = see more bottom; deep = more opaque
  float opacity = mix(0.5, 0.92, depth);
  vec3 color = mix(bottomColor, waterBody, opacity);

  // Caustics (light patterns on bottom, visible in shallow)
  float c1 = sin(refractUV.x * 35.0 + t * 0.4 + fbm(refractUV * 3.0) * 4.0);
  float c2 = sin(refractUV.y * 32.0 + t * 0.35 + fbm(refractUV * 3.5) * 4.0);
  float c3 = sin((refractUV.x - refractUV.y) * 28.0 + t * 0.3);
  float caustic = c1 * c2 + c3 * 0.5;
  caustic = smoothstep(0.3, 0.9, caustic * 0.5 + 0.5);
  caustic *= (1.0 - depth * 0.6); // Stronger in shallow (on bottom)
  color += caustic * 0.1 * vec3(0.8, 0.9, 1.0);

  // Specular highlight from waves (fresnel + sun-like)
  float specular = pow(max(dot(normal, normalize(vec3(0.3, 0.5, 0.8))), 0.0), 40.0);
  color += specular * 0.15 * vec3(1.0, 0.95, 0.8);

  // Fresnel rim: bright edge where water meets shore
  color += fresnel * 0.12 * vec3(0.5, 0.8, 0.9);

  // Surface shimmer (tiny sparkles)
  float sparkle = noise(distortedUV * 60.0 + t * 0.6);
  sparkle = smoothstep(0.9, 0.97, sparkle) * 0.1;
  color += sparkle;

  // Subtle depth fog
  float fog = depth * 0.08;
  color = mix(color, vec3(0.05, 0.1, 0.15), fog);

  // Clip edge foam/glow
  if (u_clipShape > 0.5) {
    float edge = smoothstep(0.0, 0.04, -sd);
    color += (1.0 - edge) * 0.2 * vec3(0.4, 0.7, 0.6);
  }

  // Time-of-day tint and brightness
  color *= u_tint * u_brightness;

  // Alpha: shallow is more transparent (see through), edges slightly more opaque
  float alpha = mix(0.6, 0.9, depth);
  alpha = mix(alpha, 0.95, fresnel * 0.3);
  if (u_clipShape > 0.5) {
    float edge = smoothstep(0.0, 0.02, -sd);
    alpha = mix(0.3, alpha, edge);
  }

  gl_FragColor = vec4(color, alpha);
}
`;
