/**
 * One shared WebGL context that paints every thermal gradient and 3D object,
 * then copies each frame into that element's own 2D canvas. Keeps us well under
 * the browser's context limit and lets off-screen items cost nothing.
 */
export type ThermalShape = "umbrella" | "coin" | "servers" | "flame" | "lifebuoy";
const SHAPES: ThermalShape[] = ["umbrella", "coin", "servers", "flame", "lifebuoy"];

interface Item {
  canvas: HTMLCanvasElement;
  shape: ThermalShape | null; // null = gradient field
  visible: boolean;
  dirty: boolean;
}

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`;

const COMMON = `
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform int uShape;
vec3 ramp(float t){
  t = clamp(t,0.,1.);
  vec3 c = vec3(.035,.045,.19);
  c = mix(c, vec3(.20,.11,.70), smoothstep(.06,.30,t));
  c = mix(c, vec3(.83,.14,.50), smoothstep(.28,.52,t));
  c = mix(c, vec3(1.,.34,.11), smoothstep(.48,.70,t));
  c = mix(c, vec3(1.,.77,.25), smoothstep(.68,.87,t));
  return mix(c, vec3(1.,.97,.86), smoothstep(.87,1.,t));
}
float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p){ float v=0.,a=.5; for(int i=0;i<4;i++){ v+=a*noise(p); p=p*2.03+7.1; a*=.5; } return v; }
`;

const FIELD = COMMON + `
void main(){
  vec2 uv = gl_FragCoord.xy/uRes;
  vec2 q = vec2(uv.x*uRes.x/uRes.y, uv.y)*1.35;
  float t = uTime*.07;
  vec2 w = vec2(fbm(q+t), fbm(q+vec2(5.2,1.3)-t));
  float n = fbm(q*.9 + w*1.9 - vec2(t*.6,0.));
  // Copy sits on the cool side: left when wide, top when tall.
  bool tall = uRes.y > uRes.x;
  float along = tall ? 1.-uv.y : uv.x;
  float heat = smoothstep(tall ? .50 : .31, tall ? 1.02 : .92, along + (n-.5)*(tall ? .30 : .55));
  heat *= .45 + .95*n;
  heat += .10*exp(-6.*length(uv-(uMouse*.5+.5)));
  vec3 c = ramp(min(heat*.80 + n*.08, .84));
  c += (hash(gl_FragCoord.xy+fract(uTime))-.5)*.05;
  gl_FragColor = vec4(c,1.);
}`;

const OBJECT = COMMON + `
mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }
float smin(float a,float b,float k){ float h=clamp(.5+.5*(b-a)/k,0.,1.); return mix(b,a,h)-k*h*(1.-h); }
float box(vec3 p,vec3 b,float r){ vec3 q=abs(p)-b+r; return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-r; }
float cyl(vec3 p,float r,float h,float e){ vec2 d=abs(vec2(length(p.xz),p.y))-vec2(r,h)+e; return min(max(d.x,d.y),0.)+length(max(d,0.))-e; }
float caps(vec3 p,float a,float b,float r){ p.y-=clamp(p.y,a,b); return length(p)-r; }
// Scene functions return (distance, material).
// 1 fabric  2 black metal  3 gold  4 server case  5-5.9 green light  6-6.9 blue light
// 7 fire  8 orange  9 white  10 water
vec2 pick(vec2 a,vec2 b){ return a.x<b.x?a:b; }
vec2 umbrella(vec3 p){
  p.y-=.15;
  float a=atan(p.z,p.x);
  float sc=abs(sin(a*4.));
  vec3 q=p; q.y*=1.12;
  float shell=abs(length(q)-1.18+.045*(1.-sc))-.035;
  float cut=(.12+.13*sc*smoothstep(.4,1.2,length(p.xz)))-p.y;
  vec2 d=vec2(max(shell,cut),1.);
  d=pick(d,vec2(caps(p,-1.15,1.2,.05),2.));
  vec3 h=p-vec3(.2,-1.15,0.);
  d=pick(d,vec2(max(length(vec2(length(h.xy)-.2,h.z))-.065,h.y),2.));
  for(int i=0;i<4;i++){
    float f=float(i);
    float fall=fract(uTime*.28+f*.27);
    vec3 b=p-vec3(sin(f*2.4)*.75, 1.46-fall*.36, cos(f*2.4)*.55);
    d=pick(d,vec2(length(b)-.10*smoothstep(0.,.25,fall)*(1.-smoothstep(.8,1.,fall)),10.));
  }
  return d;
}
float coin(vec3 p){
  float d=cyl(p,.72,.12,.04);
  d=max(d,-cyl(vec3(p.x,abs(p.y)-.12,p.z),.56,.035,.015));
  vec3 q=vec3(p.x,abs(p.y)-.09,p.z); q.xz=rot(.785)*q.xz;
  return min(d,box(q,vec3(.2,.045,.2),.03));
}
vec2 coins(vec3 p){
  vec3 a=p-vec3(-.28,.32,.35); a.xy=rot(.12)*a.xy; a.yz=rot(1.35)*a.yz;
  vec3 b=p-vec3(.55,.02,-.2); b.xy=rot(-.35)*b.xy; b.yz=rot(1.15)*b.yz;
  vec3 c=p-vec3(.05,-.82,.15); c.xy=rot(.08)*c.xy;
  return vec2(min(coin(a),min(coin(b),coin(c))),3.);
}
vec2 servers(vec3 p){
  vec2 d=vec2(9.,4.);
  for(int i=0;i<3;i++){
    float f=float(i);
    vec3 q=p-vec3(0.,(f-1.)*.70,0.);
    float b=box(q,vec3(1.02,.30,.8),.07);
    b=max(b,-box(q-vec3(0.,0.,.82),vec3(.93,.21,.06),.03));
    vec3 v=q-vec3(-.46,0.,.79); v.x-=clamp(floor(v.x/.11+.5),-3.,3.)*.11;
    b=max(b,-box(v,vec3(.025,.13,.07),.01));
    d=pick(d,vec2(b,4.));
    for(int k=0;k<4;k++){
      float g=float(k);
      float on=step(.38,hash(vec2(floor(uTime*(1.6+g*.5)+f*3.1),g+f*7.)));
      d=pick(d,vec2(length(q-vec3(.17+g*.19,.0,.78))-.06,(k==3?6.:5.)+on*.9));
    }
  }
  return d;
}
// One lick of fire: rooted at the base, whipping and stretching toward the tip.
float tongue(vec3 p,float s,float ph){
  p/=s;
  float T=uTime*1.15+ph;
  float st=1.+.07*sin(T*5.3)+.05*sin(T*8.9+1.);
  p.y=(p.y+1.05)/st-1.05;
  float k=smoothstep(-.7,1.2,p.y);
  p.x+=(sin(p.y*3.-T*5.2)*.17+sin(p.y*6.3-T*8.6)*.07)*k;
  p.z+=sin(p.y*3.7-T*6.1+2.)*.12*k;
  float h=clamp((p.y+1.05)/2.3,.001,.999);
  float r=.66*sin(3.14159*pow(h,.55))*(1.-.25*h);
  r*=1.+(.09*sin(p.y*7.-T*9.)+.05*sin(atan(p.z,p.x)*3.+p.y*4.-T*6.))*k;
  float d=(length(p.xz)-r)*.36;
  return max(d,abs(p.y-.1)-1.15)*s;
}
vec2 flame(vec3 p){
  float d=tongue(p-vec3(0.,-.08,0.),.88,0.);
  d=smin(d,tongue(p-vec3(.56,-.36,.0),.62,2.1),.04);
  d=smin(d,tongue(p-vec3(-.54,-.44,.05),.54,4.4),.04);
  for(int i=0;i<3;i++){
    float f=float(i);
    float up=fract(uTime*(.42+f*.07)+f*.37);
    vec3 q=p-vec3((f-1.)*.48+sin(uTime*3.+f*2.)*.10,-.1+up*1.5,.35);
    d=min(d,length(q)-.055*smoothstep(0.,.2,up)*(1.-up));
  }
  return vec2(d,7.);
}
vec2 lifebuoy(vec3 p){
  p.yz=rot(.15)*p.yz;
  float a=atan(p.y,p.x);
  float ring=length(vec2(length(p.xy)-.86,p.z))-.34;
  float band=abs(mod(a+.785,1.5708)-.785);
  vec2 d=vec2(ring,band<.24?9.:8.);
  float sag=1.235+.045*cos(a*4.+3.14159);
  d=pick(d,vec2((length(vec2(length(p.xy)-sag,p.z))-.04)*.8,9.));
  return d;
}
vec2 map(vec3 p){
  vec2 d;
  if(uShape==0) d=umbrella(p);
  else if(uShape==1) d=coins(p);
  else if(uShape==2) d=servers(p);
  else if(uShape==3) d=flame(p);
  else d=lifebuoy(p);
  d.x*=.82;
  return d;
}
// Soft studio reflection for shiny materials.
float studio(vec3 r){
  return .18+.55*smoothstep(-.2,.9,r.y)+.5*smoothstep(.55,.8,r.x*.6+r.y*.5+r.z*.3)-.12*smoothstep(0.,.5,-r.y);
}
void main(){
  vec2 uv=(gl_FragCoord.xy*2.-uRes)/min(uRes.x,uRes.y);
  vec3 ro=vec3(0.,0.,5.4), rd=normalize(vec3(uv,-3.05));
  float ax=.34, ay=.20; // fixed view: objects never turn
  if(uShape==4) ax*=.4;
  ro.yz=rot(ax)*ro.yz; rd.yz=rot(ax)*rd.yz;
  ro.xz=rot(ay)*ro.xz; rd.xz=rot(ay)*rd.xz;
  float t=2.8,d=0.,near=9.,tn=2.8; bool hit=false;
  float px=2./(min(uRes.x,uRes.y)*3.05);
  for(int i=0;i<80;i++){
    d=map(ro+rd*t).x;
    if(d<.003){hit=true;break;}
    if(d/t<near){near=d/t;tn=t;}
    t+=d; if(t>8.5) break;
  }
  float cover=1.;
  if(!hit){
    cover=1.-smoothstep(0.,px*1.6,near);
    if(cover<.01){ gl_FragColor=vec4(0.); return; }
    t=tn;
  }
  vec3 p=ro+rd*t; vec2 e=vec2(.004,0.);
  vec3 n=normalize(vec3(map(p+e.xyy).x-map(p-e.xyy).x,map(p+e.yxy).x-map(p-e.yxy).x,map(p+e.yyx).x-map(p-e.yyx).x));
  float m=map(p).y;
  vec3 l=normalize(vec3(.5,.9,.6));
  l.yz=rot(ax)*l.yz; l.xz=rot(ay)*l.xz; // light stays with the camera
  float wrap=dot(n,l)*.5+.5;
  float dif=wrap*wrap;
  float fr=pow(1.-max(dot(n,-rd),0.),3.);
  vec3 r=reflect(rd,n);
  float spec=pow(max(dot(r,l),0.),40.);
  float env=studio(r);
  vec3 c;
  if(m<1.5){
    // Matte cloth: no highlight at all.
    c=vec3(.085,.135,.46)*(.38+.95*dif)+vec3(.20,.30,.75)*fr*.45;
  } else if(m<2.5){
    c=vec3(.035,.037,.05)+vec3(.50,.52,.60)*env*env*.55+spec*.5;
  } else if(m<3.5){
    c=mix(vec3(.80,.48,.05),vec3(1.,.82,.26),clamp(env*.75+dif*.50,0.,1.));
    c+=vec3(1.,.90,.55)*(spec*.8+fr*.25);
  } else if(m<4.5){
    c=vec3(.075,.080,.10)*(.6+1.1*dif)+vec3(.20,.22,.29)*env*.35+fr*.10+spec*.15;
  } else if(m<6.95){
    bool blue=m>=6.;
    float on=fract(m);
    vec3 lit=blue?vec3(.25,.62,1.):vec3(.22,1.,.50);
    c=mix(lit*.14,lit+max(dot(n,-rd),0.)*.35,on);
  } else if(m<7.5){
    float h=clamp((p.y+1.1)/2.3,0.,1.);
    float core=pow(max(dot(n,-rd),0.),1.5);
    c=mix(vec3(1.,.62,.06),vec3(.93,.16,.03),smoothstep(.1,.85,h+(fbm(p.xy*2.4-vec2(0.,uTime*2.2))-.5)*.65));
    c=mix(c*.88,vec3(1.,.90,.38),core*(1.-smoothstep(.0,.65,h))*.85);
  } else if(m<8.5){
    c=vec3(1.,.35,.04)*(.45+.75*dif)+spec*.35+vec3(1.,.55,.2)*fr*.3;
  } else if(m<9.5){
    c=vec3(.95,.95,.98)*(.45+.60*dif)+spec*.25;
  } else {
    c=mix(vec3(.62,.80,1.),vec3(1.),env)+spec*.6;
  }
  gl_FragColor=vec4(clamp(c,0.,1.)*cover,cover);
}`;

let gl: WebGLRenderingContext | null = null;
let surface: HTMLCanvasElement | null = null;
let programs: { field: WebGLProgram; object: WebGLProgram } | null = null;
let failed = false;
let raf = 0;
let last = 0;
const items = new Set<Item>();
const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
let reduced = false;

function build(frag: string): WebGLProgram {
  const g = gl!;
  const prog = g.createProgram()!;
  for (const [type, src] of [[g.VERTEX_SHADER, VERT], [g.FRAGMENT_SHADER, frag]] as const) {
    const s = g.createShader(type)!;
    g.shaderSource(s, src);
    g.compileShader(s);
    if (!g.getShaderParameter(s, g.COMPILE_STATUS)) throw new Error(g.getShaderInfoLog(s) ?? "shader");
    g.attachShader(prog, s);
  }
  g.bindAttribLocation(prog, 0, "p");
  g.linkProgram(prog);
  if (!g.getProgramParameter(prog, g.LINK_STATUS)) throw new Error(g.getProgramInfoLog(prog) ?? "link");
  return prog;
}

function setup(): boolean {
  if (programs) return true;
  if (failed) return false;
  try {
    surface = document.createElement("canvas");
    gl = surface.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true });
    if (!gl) throw new Error("WebGL unavailable");
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    programs = { field: build(FIELD), object: build(OBJECT) };
    surface.addEventListener("webglcontextlost", () => {
      failed = true;
      programs = null;
      cancelAnimationFrame(raf);
    });
    reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    addEventListener("pointermove", (e) => {
      mouse.tx = (e.clientX / innerWidth) * 2 - 1;
      mouse.ty = 1 - (e.clientY / innerHeight) * 2;
    }, { passive: true });
    return true;
  } catch (err) {
    console.warn("[thermal] falling back to CSS gradients:", err);
    failed = true;
    return false;
  }
}

function paint(item: Item, time: number) {
  const g = gl!;
  const { canvas } = item;
  const dpr = Math.min(devicePixelRatio || 1, 1.75);
  const scale = item.shape ? dpr : 0.5;
  const w = Math.min(900, Math.round(canvas.clientWidth * scale));
  const h = Math.min(900, Math.round(canvas.clientHeight * scale));
  if (!w || !h) return;
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  if (surface!.width < w) surface!.width = w;
  if (surface!.height < h) surface!.height = h;
  const prog = item.shape ? programs!.object : programs!.field;
  g.useProgram(prog);
  g.viewport(0, 0, w, h);
  g.uniform2f(g.getUniformLocation(prog, "uRes"), w, h);
  g.uniform1f(g.getUniformLocation(prog, "uTime"), time);
  g.uniform2f(g.getUniformLocation(prog, "uMouse"), mouse.x, mouse.y);
  if (item.shape) g.uniform1i(g.getUniformLocation(prog, "uShape"), SHAPES.indexOf(item.shape));
  g.clearColor(0, 0, 0, 0);
  g.clear(g.COLOR_BUFFER_BIT);
  g.drawArrays(g.TRIANGLES, 0, 3);
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(surface!, 0, surface!.height - h, w, h, 0, 0, w, h);
  canvas.dataset.ready = "true";
}

function frame(now: number) {
  raf = requestAnimationFrame(frame);
  if (now - last < 33) return;
  last = now;
  mouse.x += (mouse.tx - mouse.x) * 0.08;
  mouse.y += (mouse.ty - mouse.y) * 0.08;
  for (const item of items) {
    if (!item.visible) continue;
    if (reduced && !item.dirty) continue;
    paint(item, reduced ? 3 : now / 1000);
    item.dirty = false;
  }
}

export function mountThermal(canvas: HTMLCanvasElement, shape: ThermalShape | null): () => void {
  if (!setup()) return () => {};
  const item: Item = { canvas, shape, visible: false, dirty: true };
  items.add(item);
  const io = new IntersectionObserver(([e]) => { item.visible = e.isIntersecting; }, { rootMargin: "80px" });
  const ro = new ResizeObserver(() => { item.dirty = true; });
  io.observe(canvas);
  ro.observe(canvas);
  if (items.size === 1) raf = requestAnimationFrame(frame);
  return () => {
    io.disconnect();
    ro.disconnect();
    items.delete(item);
    if (!items.size) cancelAnimationFrame(raf);
  };
}
