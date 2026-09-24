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
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.1;
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

void main() {
  vec2 uv = v_uv;
  float t = u_time;

  // Scene clip
  if (u_clipShape > 0.5) {
    vec2 clipP = (uv - u_clipCenter) * vec2(u_aspect, 1.0);
    float sd;
    if (u_clipShape < 1.5) {
      sd = sdEllipse(clipP, u_clipSize);
    } else if (u_clipShape < 2.5) {
      sd = sdRoundedRect(clipP, u_clipSize, 0.04);
    } else {
      float angle = atan(clipP.y, clipP.x);
      float wobble = 1.0 + 0.15 * sin(angle * 3.0) + 0.08 * sin(angle * 7.0);
      sd = sdEllipse(clipP / wobble, u_clipSize) * wobble;
    }
    if (sd > 0.01) discard;
  }

  // Wave distortion
  float w1 = sin(uv.x * 18.0 + t * 1.2) * 0.004 * u_waveStrength;
  float w2 = sin(uv.y * 14.0 + t * 0.9) * 0.004 * u_waveStrength;
  float w3 = sin((uv.x + uv.y) * 10.0 + t * 0.7) * 0.003 * u_waveStrength;
  float n1 = (fbm(uv * 8.0 + t * 0.15) - 0.5) * 0.01 * u_waveStrength;
  float n2 = (fbm(uv * 12.0 - t * 0.1) - 0.5) * 0.006 * u_waveStrength;
  vec2 distortedUV = uv + vec2(w1 + n1, w2 + w3 + n2);

  // Depth gradient
  float dist = length(distortedUV - 0.5);
  float depth = 1.0 - smoothstep(0.1, 0.65, dist);
  depth = clamp(depth, 0.0, 1.0);

  // Base water color
  float depthMod = depth + (fbm(distortedUV * 4.0 + t * 0.05) - 0.5) * 0.15;
  vec3 color = mix(u_shallowColor, u_deepColor, clamp(depthMod, 0.0, 1.0));

  // Caustics
  float c1 = sin(distortedUV.x * 35.0 + t * 1.8 + fbm(distortedUV * 3.0) * 4.0);
  float c2 = sin(distortedUV.y * 32.0 + t * 1.5 + fbm(distortedUV * 3.5) * 4.0);
  float c3 = sin((distortedUV.x - distortedUV.y) * 28.0 + t * 1.2);
  float caustic = c1 * c2 + c3 * 0.5;
  caustic = smoothstep(0.2, 0.9, caustic * 0.5 + 0.5);
  caustic *= (1.0 - depth * 0.4);
  color += caustic * 0.12;

  // Sparkle
  float sparkle = noise(distortedUV * 80.0 + t * 3.0);
  sparkle = smoothstep(0.85, 0.95, sparkle) * 0.15;
  color += sparkle;

  // Shore glow
  float shore = smoothstep(0.45, 0.55, dist);
  color += shore * 0.03 * vec3(0.3, 0.5, 0.4);

  // Atmospheric haze
  float haze = fbm(uv * 2.0 + t * 0.02) * 0.04;
  color += haze * vec3(0.6, 0.7, 0.8);

  // Clip edge glow for pond mode
  if (u_clipShape > 0.5) {
    vec2 clipP = (uv - u_clipCenter) * vec2(u_aspect, 1.0);
    float sd;
    if (u_clipShape < 1.5) {
      sd = sdEllipse(clipP, u_clipSize);
    } else if (u_clipShape < 2.5) {
      sd = sdRoundedRect(clipP, u_clipSize, 0.04);
    } else {
      float angle = atan(clipP.y, clipP.x);
      float wobble = 1.0 + 0.15 * sin(angle * 3.0) + 0.08 * sin(angle * 7.0);
      sd = sdEllipse(clipP / wobble, u_clipSize) * wobble;
    }
    float edge = smoothstep(0.0, 0.03, -sd);
    color += (1.0 - edge) * 0.15 * vec3(0.3, 0.6, 0.5);
  }

  // Time-of-day tint and brightness
  color *= u_tint * u_brightness;

  gl_FragColor = vec4(color, 0.85);
}
`;
