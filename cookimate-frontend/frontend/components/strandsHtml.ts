export interface StrandsConfig {
  colors?: string[];
  count?: number;
  speed?: number;
  introDurationMs?: number;
  amplitude?: number;
  waviness?: number;
  thickness?: number;
  glow?: number;
  taper?: number;
  spread?: number;
  hueShift?: number;
  intensity?: number;
  saturation?: number;
  opacity?: number;
  scale?: number;
  glass?: boolean;
  refraction?: number;
  dispersion?: number;
  glassSize?: number;
  rim?: number;
  energy?: number;
  interactive?: boolean;
  clickPulse?: boolean;
  intro?: boolean;
  lightMode?: boolean;
}

const DEFAULT_COLORS = ['#d95b56', '#ba5046', '#ffa24c', '#ffe0b3', '#93f1ff', '#3569fa', '#193d9b'];

export function buildStrandsHtml(config: StrandsConfig = {}): string {
  const cfg: Required<StrandsConfig> = {
    colors: config.colors ?? DEFAULT_COLORS,
    count: config.count ?? 3,
    speed: config.speed ?? 1,
    amplitude: config.amplitude ?? 1,
    waviness: config.waviness ?? 1,
    thickness: config.thickness ?? 1,
    glow: config.glow ?? 1,
    taper: config.taper ?? 1,
    spread: config.spread ?? 1,
    hueShift: config.hueShift ?? 0,
    intensity: config.intensity ?? 1,
    saturation: config.saturation ?? 1,
    opacity: config.opacity ?? 1,
    scale: config.scale ?? 1,
    glass: config.glass ?? true,
    introDurationMs: config.introDurationMs ?? 1400,
    refraction: config.refraction ?? 1,
    dispersion: config.dispersion ?? 1,
    glassSize: config.glassSize ?? 1,
    rim: config.rim ?? 1,
    energy: config.energy ?? 0.65,
    interactive: config.interactive ?? false,
    clickPulse: config.clickPulse ?? false,
    intro: config.intro ?? true,
    lightMode: config.lightMode ?? false,
  };

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<style>
  html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: transparent; overflow: hidden; }
  #strands-root { position: relative; width: 100%; height: 100%; background: transparent; }
  canvas { display: block; width: 100%; height: 100%; }
</style>
</head>
<body>
<div id="strands-root"></div>
<script>
(function () {
  var CONFIG = ${JSON.stringify(cfg)};

  var VERT = "#version 300 es\\nin vec2 position;\\nvoid main() {\\n  gl_Position = vec4(position, 0.0, 1.0);\\n}\\n";

  var FRAG = "#version 300 es\\nprecision highp float;\\n\\nuniform vec2 uResolution;\\nuniform vec3 uMotion;\\nuniform float uLevel;\\nuniform vec3 uColors[8];\\nuniform int uCount;\\nuniform float uAmplitude;\\nuniform float uWaviness;\\nuniform float uThickness;\\nuniform float uGlow;\\nuniform float uTaper;\\nuniform float uSpread;\\nuniform float uHueShift;\\nuniform float uIntensity;\\nuniform float uSaturation;\\nuniform float uScale;\\nuniform float uGlass;\\nuniform float uRadius;\\nuniform float uRefraction;\\nuniform float uDispersion;\\nuniform float uRim;\\nuniform vec2 uLean;\\nuniform float uIntro;\\nuniform float uPulse;\\nuniform float uLight;\\nuniform float uOpacity;\\n\\nout vec4 fragColor;\\n\\nconst int NB = 10;\\nconst float PI = 3.14159265;\\n\\nvec3 hueRotate(vec3 c, float a) {\\n  const mat3 toYiq = mat3(0.299, 0.596, 0.211, 0.587, -0.274, -0.523, 0.114, -0.322, 0.312);\\n  const mat3 toRgb = mat3(1.0, 1.0, 1.0, 0.956, -0.272, -1.106, 0.621, -0.647, 1.703);\\n  vec3 yiq = toYiq * c;\\n  float ca = cos(a);\\n  float sa = sin(a);\\n  yiq.yz = mat2(ca, sa, -sa, ca) * yiq.yz;\\n  return max(toRgb * yiq, 0.0);\\n}\\n\\nvec3 grade(vec3 c) {\\n  float g = dot(c, vec3(0.2126, 0.7152, 0.0722));\\n  c = clamp(mix(vec3(g), c, 1.5 * uSaturation), 0.0, 1.0);\\n  return hueRotate(c, uHueShift * 6.2831853);\\n}\\n\\nvec3 lightInk(vec3 L, float halo, vec3 body) {\\n  vec3 Lg = grade(L);\\n  float lum = dot(Lg, vec3(0.2126, 0.7152, 0.0722));\\n  float cov = 1.0 - exp(-lum * 2.6);\\n  vec3 hue = Lg / max(max(Lg.r, max(Lg.g, Lg.b)), 1e-4);\\n  float white = pow(clamp(min(hue.r, min(hue.g, hue.b)), 0.0, 1.0), 1.4);\\n  vec3 ink = pow(hue, vec3(2.2)) * 0.88;\\n  float coreAmt = white * smoothstep(0.05, 2.2, lum) * 0.92;\\n  vec3 cream = mix(mix(uColors[3], vec3(1.0), 0.3), vec3(1.0, 0.985, 0.95), smoothstep(1.2, 3.5, lum));\\n  vec3 c = mix(body, vec3(0.66, 0.69, 0.76), halo * 0.32);\\n  c = mix(c, ink, cov * (1.0 - white));\\n  return mix(c, cream, clamp(coreAmt, 0.0, 1.0));\\n}\\n\\nfloat sstep(float a, float b, float x) {\\n  float t = clamp((x - a) / (b - a), 0.0, 1.0);\\n  return t * t * (3.0 - 2.0 * t);\\n}\\n\\nfloat erfa(float x) {\\n  float a = abs(x);\\n  float t = 1.0 / (1.0 + 0.3275911 * a);\\n  float y = 1.0 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * exp(-a * a);\\n  return x < 0.0 ? -y : y;\\n}\\n\\nvec3 grad4(vec3 c0, vec3 c1, vec3 c2, vec3 c3, float p1, float p2, float f) {\\n  vec3 c = mix(c0, c1, sstep(0.0, p1, f));\\n  c = mix(c, c2, sstep(p1, p2, f));\\n  return mix(c, c3, sstep(p2, 1.0, f));\\n}\\n\\nfloat smaxk(float a, float b, float k) {\\n  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);\\n  return mix(a, b, h) + k * h * (1.0 - h);\\n}\\n\\nvec2 sheetW(float tt, float H, float sig, float sigB, float ridges) {\\n  float ew = 0.04 * uThickness;\\n  float res0;\\n  float res1;\\n  for (int pass = 0; pass < 2; pass++) {\\n    float sg = pass == 0 ? sig : sigB;\\n    float fill = 0.5 * (erfa(tt / sg) - erfa((tt - H) / sg)) / H;\\n    float se = sqrt(sg * sg + 0.25 * ew * ew * H * H);\\n    float de = (tt - H + 0.5 * ew * H) / se;\\n    float eg = exp(-de * de) / (se * 1.7724539);\\n    float rgw = sqrt(sg * sg + 0.0025 * H * H);\\n    float d1 = (tt - 0.45 * H) / rgw;\\n    float d2 = (tt - 0.241 * H) / rgw;\\n    float rid = 0.04 * (exp(-d1 * d1) * step(1.5, ridges) + 0.7 * exp(-d2 * d2) * step(2.5, ridges)) / (rgw * 1.7724539);\\n    float v = 0.6 * fill * (1.0 - 0.55 * uLight) + (1.6 * ew * 0.886 * eg + rid) * (1.0 + 1.3 * uLight);\\n    if (pass == 0) res0 = v;\\n    else res1 = v;\\n  }\\n  return vec2(res0, res1);\\n}\\n\\nfloat axis(float x) {\\n  float a = uAmplitude;\\n  return -0.2318 + uLean.y * 0.06 + (-0.2394 + uLean.x * 0.1) * x + 0.2815 * a * x * x + 0.3368 * a * x * x * x;\\n}\\n\\nfloat softp(float z) {\\n  return 0.03 * log(1.0 + exp(clamp(z / 0.03, -60.0, 60.0)));\\n}\\n\\nvec3 light(vec2 u, float fp, float bend, float level, out float halo) {\\n  float amp = level < 0.65 ? mix(0.25, 1.0, sstep(0.0, 0.65, level)) : mix(1.0, 1.12, (level - 0.65) / 0.35);\\n  float grow = clamp((amp - 0.25) / 0.75, 0.0, 1.25);\\n  float x = u.x / uScale;\\n  float uy = u.y;\\n  float ya = axis(x);\\n  float taper = max(uTaper, 0.05);\\n  float bx = 0.0437 + uMotion.z + uLean.x * 0.08;\\n  float bump = exp(-pow((x - bx) / (0.6879 * taper), 2.0));\\n  float hW = 0.02 + softp(-0.12 + 0.5324 * uAmplitude * grow * uMotion.y * bump - 0.02);\\n  float k = 1.0 * uWaviness;\\n  float cphi = cos(0.5 * PI + k * (x + 0.0664) + uMotion.x);\\n  float envC = (0.0886 + 0.3 * exp(-pow((x - 0.0634) / 0.6873, 2.0))) * uSpread * grow;\\n  float hC = -envC * tanh(cphi / 0.6);\\n  float th = 0.051 * uThickness * exp(-pow(cphi / 0.5, 2.0));\\n  float sig = sqrt(pow(0.005 + 0.05 * bend, 2.0) + fp * fp + th * th);\\n  float sigB = sqrt(0.0064 * max(uGlow, 0.05) * max(uGlow, 0.05) + fp * fp + th * th);\\n  float mend = exp(-pow(abs((x + 0.0421) / (0.4235 * taper)), 2.2689));\\n  vec3 red = uColors[0];\\n  vec3 orange = uColors[1];\\n  vec3 amber = uColors[2];\\n  vec3 warmWhite = uColors[3];\\n  vec3 cyan = uColors[4];\\n  vec3 blue = uColors[5];\\n  vec3 deep = uColors[6];\\n  vec3 orangeEdge = orange * vec3(1.0, 0.85, 0.77);\\n  vec3 coolCore = mix(warmWhite, vec3(1.0, 1.0, 0.7), 0.6);\\n  vec3 mint = clamp(mix(cyan, warmWhite, 0.35) * vec3(0.92, 1.05, 0.95), 0.0, 1.0);\\n  float ridges = float(uCount);\\n  float glow = max(uGlow, 0.0);\\n  vec3 L = vec3(0.0);\\n  vec3 Lb = vec3(0.0);\\n  {\\n    float H = max(abs(hW), 1e-4);\\n    float tt = uy - ya;\\n    vec2 w = sheetW(tt, H, sig, sigB, ridges);\\n    float f = clamp(tt / H, 0.0, 1.0);\\n    vec3 c = grad4(warmWhite, amber, orange, orangeEdge, 0.2351, 0.5643, f);\\n    c = mix(c, red, sstep(0.75, 1.0, f) * sstep(0.196, 0.3376, hW));\\n    vec3 mean = (grad4(warmWhite, amber, orange, orangeEdge, 0.2351, 0.5643, 0.1) + grad4(warmWhite, amber, orange, orangeEdge, 0.2351, 0.5643, 0.35) + grad4(warmWhite, amber, orange, orangeEdge, 0.2351, 0.5643, 0.6) + grad4(warmWhite, amber, orange, orangeEdge, 0.2351, 0.5643, 0.9)) * 0.25;\\n    L += mix(c, mean, sstep(0.3, 1.2, sig / H)) * (w.x * 0.2101 * mend);\\n    Lb += mix(c, mean, sstep(0.3, 1.2, sigB / H)) * (w.y * 0.2101 * mend);\\n  }\\n  {\\n    float H = max(abs(hC), 1e-4);\\n    float tt = (uy - ya) * (hC >= 0.0 ? 1.0 : -1.0);\\n    vec2 w = sheetW(tt, H, sig, sigB, 1.0);\\n    float f = clamp(tt / H, 0.0, 1.0);\\n    vec3 c = grad4(coolCore, cyan, blue, deep, 0.15, 0.7931, f);\\n    vec3 mean = (grad4(coolCore, cyan, blue, deep, 0.15, 0.7931, 0.1) + grad4(coolCore, cyan, blue, deep, 0.15, 0.7931, 0.35) + grad4(coolCore, cyan, blue, deep, 0.15, 0.7931, 0.6) + grad4(coolCore, cyan, blue, deep, 0.15, 0.7931, 0.9)) * 0.25;\\n    L += mix(c, mean, sstep(0.3, 1.2, sig / H)) * (w.x * 0.28 * mend);\\n    Lb += mix(c, mean, sstep(0.3, 1.2, sigB / H)) * (w.y * 0.28 * mend);\\n  }\\n  vec3 G = vec3(0.0);\\n  float wh = sqrt(0.0256 + envC * envC * cphi * cphi);\\n  float dg = (uy - ya) / wh;\\n  G += vec3(1.0, 0.97, 0.92) * (exp(-dg * dg) * 0.0315 / wh * mend * glow);\\n  float nx = -0.0664 - uMotion.x / k + 0.2168;\\n  float bxx = (x - nx) / 0.1849;\\n  float byy = (uy - axis(nx) - 0.0333) / (0.0544 * mix(0.7, 1.0, min(amp, 1.0)));\\n  G += mint * (exp(-bxx * bxx - byy * byy) * 1.4 * glow * sstep(0.0, 0.6, amp));\\n  float hb = (uy - ya - 0.3 * hW) / (0.07 + 0.45 * hW + 0.3 * envC);\\n  halo = exp(-hb * hb) * mend * smoothstep(0.0, 0.3, uIntro);\\n  vec3 total = L + 0.16 * glow * Lb + 1.16 * G;\\n  return total * 2.4 * uIntensity * smoothstep(0.0, 0.3, uIntro) * sstep(uIntro * 1.6, uIntro * 1.6 - 0.5, abs(x));\\n}\\n\\nvec2 remap(vec2 p, float f, out float r, out float bend) {\\n  r = min(length(p), 0.9995);\\n  bend = pow(r, 5.17);\\n  float k = clamp(uRefraction, 0.0, 1.8);\\n  float sc = (1.0 - 0.278 * k * (1.0 - bend)) * (1.0 - 0.632 * k * bend) / (1.0 - 0.278 * k);\\n  return p * sc * f;\\n}\\n\\nvoid main() {\\n  vec2 res = uResolution;\\n  vec2 p = (gl_FragCoord.xy - 0.5 * res) / min(res.x, res.y);\\n  float level = clamp(uLevel, 0.0, 1.0);\\n  float appear = smoothstep(0.0, 0.35, uIntro);\\n\\n  if (uGlass > 0.5) {\\n    float R = uRadius * mix(0.94, 1.0, uIntro) * (1.0 + 0.03 * uPulse);\\n    float px = 1.0 / (min(res.x, res.y) * R);\\n    vec2 pc = p / R;\\n    float rho = length(pc);\\n    if (rho > 1.0 + 2.0 * px) {\\n      float sh = uLight * 0.07 * exp(-pow((rho - 0.985) / 0.07, 2.0)) * smoothstep(-0.6, 0.4, -pc.y) * appear * uOpacity;\\n      fragColor = vec4(0.0, 0.0, 0.0, sh);\\n      return;\\n    }\\n    float r;\\n    float bend;\\n    vec2 u = remap(pc, 1.0, r, bend);\\n    float fp = 0.5 * max(length(dFdx(u)), length(dFdy(u)));\\n    float halo;\\n    float skip;\\n    vec3 L = light(u, fp, bend, level, halo);\\n    float ca = 0.02 * uDispersion * bend;\\n    if (ca > 0.0015) {\\n      float r2;\\n      float b2;\\n      L.r = light(remap(pc, 1.0 - ca, r2, b2), fp, bend, level, skip).r;\\n      L.b = light(remap(pc, 1.0 + ca, r2, b2), fp, bend, level, skip).b;\\n    }\\n    vec3 col = 1.0 - exp(-L);\\n    vec2 d = pc / max(rho, 1e-6);\\n    float key = 0.4 * pow(max(0.0, d.x * 0.94 - d.y * 0.34), 6.0) + 0.2 * pow(max(0.0, -d.x * 0.5 + d.y * 0.87), 6.0);\\n    float ring = exp(-pow((r - 0.985) / 0.011, 2.0));\\n    float hzk = 0.25 + 0.7 * pow(max(0.0, -d.x * 0.6 + d.y * 0.8), 2.0) + pow(max(0.0, d.x * 0.8 - d.y * 0.6), 2.0);\\n    float haze = exp(-pow((1.0 - r) / 0.09, 2.0)) * hzk * 0.13 * uRim;\\n    vec3 orb;\\n    if (uLight > 0.5) {\\n      float lz = dot(d * r, vec2(-0.55, 0.83));\\n      vec3 body = mix(vec3(0.885, 0.893, 0.915), vec3(0.972, 0.975, 0.983), 0.5 + 0.5 * lz);\\n      float fres = smoothstep(0.8, 1.0, r);\\n      body = mix(body, vec3(0.82, 0.83, 0.86), fres * fres * 0.5);\\n      orb = lightInk(L, halo, body);\\n      float spec = exp(-pow((r - 0.955) / 0.03, 2.0)) * pow(max(0.0, dot(d, vec2(-0.55, 0.83))), 3.0);\\n      orb = mix(orb, vec3(1.0), clamp(spec * 0.85 * uRim + haze * 0.6, 0.0, 1.0));\\n      float edge = exp(-pow((1.0 - r) / (0.01 + 1.2 * px), 2.0));\\n      orb *= 1.0 - 0.12 * edge;\\n    } else {\\n      orb = vec3(0.04) + col * (1.0 + 0.1 * bend * uRim) + ring * key * uRim * (1.0 + 0.4 * level) + haze * vec3(1.0, 1.02, 1.04);\\n      orb = grade(clamp(orb, 0.0, 1.0));\\n    }\\n    float inside = clamp((1.0 - rho) / px + 0.5, 0.0, 1.0) * appear;\\n    vec3 rgb = orb * inside;\\n    fragColor = vec4(rgb, max(inside * mix(0.92, 1.0, uLight), max(max(rgb.r, rgb.g), rgb.b))) * uOpacity;\\n  } else {\\n    float span = 0.5 * res.x / min(res.x, res.y);\\n    vec2 u = p * (0.78 / span) + vec2(0.0, -0.15);\\n    float fp = 0.5 * max(length(dFdx(u)), length(dFdy(u)));\\n    float halo;\\n    float fade = sstep(0.82, 0.55, abs(u.x));\\n    vec3 L = light(u, fp, 0.0, level, halo) * fade;\\n    vec3 col = grade(1.0 - exp(-L)) * appear;\\n    if (uLight > 0.5) {\\n      vec3 c = lightInk(L, halo * fade * 0.6, vec3(1.0));\\n      float a = clamp(1.0 - min(c.r, min(c.g, c.b)), 0.0, 1.0) * appear;\\n      fragColor = vec4((c - (1.0 - a)) * appear, a) * uOpacity;\\n    } else {\\n      fragColor = vec4(col, max(max(col.r, col.g), col.b)) * uOpacity;\\n    }\\n  }\\n}\\n";

  function hexToRgb(hex) {
    var h = String(hex).replace('#', '').trim();
    if (h.length === 3) h = h.replace(/(.)/g, '$1$1');
    var v = parseInt(h.slice(0, 6), 16);
    if (!isFinite(v)) return [1, 1, 1];
    return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
  }

  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }

  function compile(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }

  function createProgram(gl) {
    var program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.bindAttribLocation(program, 0, 'position');
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
    return program;
  }

  var root = document.getElementById('strands-root');
  var canvas = document.createElement('canvas');
  canvas.style.display = 'block';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  var gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });
  if (!gl) { return; }
  root.appendChild(canvas);

  var program = null;
  var buffer = null;
  var loc = {};
  var names = ['uResolution','uMotion','uLevel','uColors','uCount','uAmplitude','uWaviness','uThickness','uGlow','uTaper','uSpread','uHueShift','uIntensity','uSaturation','uScale','uGlass','uRadius','uRefraction','uDispersion','uRim','uLean','uIntro','uPulse','uLight','uOpacity'];

  function setup() {
    var next = createProgram(gl);
    if (!next) return false;
    program = next;
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.useProgram(next);
    loc = {};
    for (var i = 0; i < names.length; i++) loc[names[i]] = gl.getUniformLocation(next, names[i]);
    gl.disable(gl.BLEND);
    gl.clearColor(0, 0, 0, 0);
    return true;
  }
  if (!setup()) { return; }

  var MAX_COLORS = 8, ROLES = 7;
  var st = {
    clock: 0, pace: 0, activity: 0, hover: 0, hoverTarget: 0, burst: 0,
    lean: [0, 0], leanTarget: [0, 0], pulse: 0, pulseV: 0,
    introStart: -1, intro: CONFIG.intro ? 0 : 1,
    visible: true, lost: false, raf: 0, last: 0, width: 0, height: 0,
    paletteKey: '', palette: { flat: new Float32Array(MAX_COLORS * 3), count: 1 }
  };

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(1, Math.round(window.innerWidth * dpr));
    var h = Math.max(1, Math.round(window.innerHeight * dpr));
    if (w !== st.width || h !== st.height) {
      st.width = w; st.height = h;
      canvas.width = w; canvas.height = h;
    }
  }

  function updatePalette(list) {
    var key = list.join(',');
    if (key === st.paletteKey) return;
    st.paletteKey = key;
    var rgb = (list.length ? list : ${JSON.stringify(DEFAULT_COLORS)}).slice(0, MAX_COLORS).map(hexToRgb);
    var flat = new Float32Array(MAX_COLORS * 3);
    for (var i = 0; i < ROLES; i++) {
      var t = rgb.length > 1 ? (i / (ROLES - 1)) * (rgb.length - 1) : 0;
      var a = Math.floor(t);
      var b = Math.min(a + 1, rgb.length - 1);
      var f = t - a;
      var mixed = rgb[a].map(function (c, k) { return c + (rgb[b][k] - c) * f; });
      flat.set(mixed, i * 3);
    }
    st.palette = { flat: flat, count: ROLES };
  }

  function draw() {
    if (st.lost || !program) return;
    updatePalette(CONFIG.colors);
    if (!st.reported) {
      st.reported = true;
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage('ready');
      }
    }
    gl.viewport(0, 0, st.width, st.height);
    gl.uniform2f(loc.uResolution, st.width, st.height);
    var c = st.clock;
    var sway = 0.75 + 0.45 * st.pace;
    gl.uniform3f(loc.uMotion,
      (0.26 * Math.sin(0.53 * c) + 0.1 * Math.sin(1.19 * c + 1.3)) * sway,
      1 + (0.06 * Math.sin(0.71 * c) + 0.035 * Math.sin(1.37 * c + 0.4)) * sway,
      0.06 * Math.sin(0.41 * c + 2) * sway
    );
    gl.uniform1f(loc.uLevel, clamp(st.activity, 0, 1));
    gl.uniform3fv(loc.uColors, st.palette.flat);
    gl.uniform1i(loc.uCount, clamp(Math.round(CONFIG.count), 1, 3));
    gl.uniform1f(loc.uAmplitude, CONFIG.amplitude);
    gl.uniform1f(loc.uWaviness, CONFIG.waviness);
    gl.uniform1f(loc.uThickness, CONFIG.thickness);
    gl.uniform1f(loc.uGlow, CONFIG.glow);
    gl.uniform1f(loc.uTaper, Math.max(0.05, CONFIG.taper));
    gl.uniform1f(loc.uSpread, CONFIG.spread);
    gl.uniform1f(loc.uHueShift, CONFIG.hueShift);
    gl.uniform1f(loc.uIntensity, CONFIG.intensity);
    gl.uniform1f(loc.uSaturation, CONFIG.saturation);
    gl.uniform1f(loc.uScale, Math.max(0.05, CONFIG.scale));
    gl.uniform1f(loc.uGlass, CONFIG.glass ? 1 : 0);
    gl.uniform1f(loc.uRadius, 0.42 * CONFIG.glassSize);
    gl.uniform1f(loc.uRefraction, CONFIG.refraction);
    gl.uniform1f(loc.uDispersion, CONFIG.dispersion);
    gl.uniform1f(loc.uRim, CONFIG.rim);
    gl.uniform2f(loc.uLean, st.lean[0], st.lean[1]);
    gl.uniform1f(loc.uIntro, st.intro);
    gl.uniform1f(loc.uPulse, st.pulse);
    gl.uniform1f(loc.uLight, CONFIG.lightMode ? 1 : 0);
    gl.uniform1f(loc.uOpacity, CONFIG.opacity);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function frame(now) {
    st.raf = 0;
    var dt = st.last ? clamp((now - st.last) / 1000, 0, 0.05) : 0;
    st.last = now;
    if (st.introStart < 0 && st.visible) st.introStart = now;
    if (CONFIG.intro && st.introStart >= 0) {
      var t = clamp((now - st.introStart) / CONFIG.introDurationMs, 0, 1);
      st.intro = 1 - Math.pow(1 - t, 3);
    } else {
      st.intro = 1;
    }
    st.hover += (st.hoverTarget - st.hover) * (1 - Math.exp(-dt / (st.hoverTarget > st.hover ? 0.25 : 0.6)));
    for (var i = 0; i < 2; i++) st.lean[i] += (st.leanTarget[i] - st.lean[i]) * (1 - Math.exp(-dt / 0.35));
    st.pulseV += (-170 * st.pulse - 14 * st.pulseV) * dt;
    st.pulse += st.pulseV * dt;
    st.burst *= Math.exp(-dt / 0.45);
    var target = Math.min(1.2, clamp(CONFIG.energy, 0, 1) + st.hover * 0.18 + st.burst);
    st.activity += (target - st.activity) * (1 - Math.exp(-dt / (target > st.activity ? 0.12 : 0.4)));
    st.pace += (Math.min(1, st.activity) - st.pace) * (1 - Math.exp(-dt / 0.8));
    st.clock += dt * CONFIG.speed * (0.6 + 1.6 * st.pace);
    draw();
    if (st.visible && !document.hidden && !st.lost) st.raf = requestAnimationFrame(frame);
  }

  function wake() {
    if (!st.raf && st.visible && !st.lost) {
      st.last = 0;
      st.raf = requestAnimationFrame(frame);
    }
  }

  function localFromTouch(e) {
    var t = e.touches && e.touches[0] ? e.touches[0] : e;
    var r = root.getBoundingClientRect();
    var m = Math.min(r.width, r.height) || 1;
    return [(t.clientX - r.left - r.width / 2) / (m / 2), (t.clientY - r.top - r.height / 2) / (m / 2)];
  }

  if (CONFIG.interactive) {
    root.addEventListener('touchmove', function (e) {
      var xy = localFromTouch(e);
      st.hoverTarget = clamp(1.6 - Math.hypot(xy[0], xy[1]), 0, 1);
      st.leanTarget = [clamp(xy[0], -1.2, 1.2) * 0.8, clamp(-xy[1], -1.2, 1.2) * 0.8];
      wake();
    }, { passive: true });
    root.addEventListener('touchend', function () {
      st.hoverTarget = 0;
      st.leanTarget = [0, 0];
      wake();
    });
  }
  if (CONFIG.clickPulse) {
    root.addEventListener('touchstart', function () {
      st.pulseV += 5;
      st.burst = Math.min(1.2, st.burst + 0.9);
      wake();
    }, { passive: true });
  }

  window.addEventListener('resize', function () { resize(); draw(); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) wake(); });

  resize();
  wake();
})();
</script>
</body>
</html>`;
}