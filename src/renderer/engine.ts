export interface RenderUniforms {
  time: number;
  shallowColor: [number, number, number];
  deepColor: [number, number, number];
  waveStrength: number;
  tint: { r: number; g: number; b: number };
  brightness: number;
}

export class RenderEngine {
  private gl: WebGLRenderingContext;
  private program!: WebGLProgram;
  private positionBuffer!: WebGLBuffer;
  private uniforms: Record<string, WebGLUniformLocation | null> = {};

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true,
    });
    if (!gl) throw new Error("WebGL not supported");
    this.gl = gl;
  }

  init(vertexSrc: string, fragmentSrc: string): void {
    const gl = this.gl;
    this.program = this.createProgram(vertexSrc, fragmentSrc);
    gl.useProgram(this.program);

    // Full-screen quad
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    this.positionBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(this.program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Cache uniform locations
    const names = ["u_time", "u_shallowColor", "u_deepColor", "u_waveStrength", "u_tint", "u_brightness"];
    for (const name of names) {
      this.uniforms[name] = gl.getUniformLocation(this.program, name);
    }
  }

  render(uniforms: RenderUniforms, width: number, height: number): void {
    const gl = this.gl;
    gl.viewport(0, 0, width, height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.program);
    gl.uniform1f(this.uniforms.u_time, uniforms.time);
    gl.uniform3f(this.uniforms.u_shallowColor, ...uniforms.shallowColor);
    gl.uniform3f(this.uniforms.u_deepColor, ...uniforms.deepColor);
    gl.uniform1f(this.uniforms.u_waveStrength, uniforms.waveStrength);
    gl.uniform3f(this.uniforms.u_tint, uniforms.tint.r, uniforms.tint.g, uniforms.tint.b);
    gl.uniform1f(this.uniforms.u_brightness, uniforms.brightness);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  private createProgram(vertSrc: string, fragSrc: string): WebGLProgram {
    const gl = this.gl;
    const vert = this.compileShader(gl.VERTEX_SHADER, vertSrc);
    const frag = this.compileShader(gl.FRAGMENT_SHADER, fragSrc);
    const program = gl.createProgram()!;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error("Program link failed: " + gl.getProgramInfoLog(program));
    }
    return program;
  }

  private compileShader(type: number, source: string): WebGLShader {
    const gl = this.gl;
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error("Shader compile failed: " + gl.getShaderInfoLog(shader));
    }
    return shader;
  }
}
