/* Wrist Mode - live watch + "the dial opens" scroll effect.
   Load AFTER your hero HTML/CSS. Needs assets/wrist-mode-hero-clean.jpg (same photo, hands removed). */
(function(){
"use strict";
const CLEAN=window.WM_CLEAN_SRC||"assets/wrist-mode-hero-clean.jpg";
const hero=document.querySelector(".hero"),media=hero&&hero.querySelector(".hero-media"),img=media&&media.querySelector("img");
if(!img)return;
const $=id=>document.getElementById(id),NS="http://www.w3.org/2000/svg";
const IW=1774,IH=887,DX=1197,DY=406,DR=185,HM=[[1.1979386193312955, 0.5589586801592981, 1201.9919810126994], [0.3538126018123421, 1.3715384717444559, 407.0244184076511], [4.934528560224444e-05, 0.000604922166743398, 1.0]];
const cl=(v,a,b)=>Math.min(b,Math.max(a,v)),ease=t=>1-Math.pow(1-t,3),sm=t=>t*t*(3-2*t);
const calm=matchMedia("(prefers-reduced-motion:reduce)").matches;
const box=(tag,cls,p)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(p)p.appendChild(e);return e};
/* 1. structure: hero is pinned inside a tall "journey"; movement sits behind it */
const journey=box("div","wm-journey"),pin=box("div","wm-pin",journey);
hero.parentNode.insertBefore(journey,hero);
const stageWrap=box("div","wm-stage",pin);pin.appendChild(hero);
const zoom=box("div","wm-zoom");hero.insertBefore(zoom,media);zoom.appendChild(media);
const fit=box("div","wm-fit",media),canvas=box("div","wm-canvas",fit);
img.classList.add("wm-src");
const pic=box("img",null,canvas);pic.src=CLEAN;pic.alt="";pic.width=IW;pic.height=IH;
canvas.insertAdjacentHTML("beforeend",'<svg id="wm-hands" viewBox="0 0 1774 887" aria-hidden="true"><defs><filter id="wm-hsh" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.4"/></filter><radialGradient id="wm-hcap" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff0b8"/><stop offset=".6" stop-color="#c9973a"/><stop offset="1" stop-color="#7a5516"/></radialGradient></defs><g id="wm-hg"></g></svg>');
document.documentElement.classList.add("wm-on");
/* 2. the movement */
stageWrap.innerHTML=`<svg viewBox="-315 -315 630 630" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><defs>
      <linearGradient id="wm-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3dc92"/><stop offset=".55" stop-color="#c79a45"/><stop offset="1" stop-color="#8f6a27"/></linearGradient>
      <radialGradient id="wm-plate" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#16392e"/><stop offset="1" stop-color="#0a1915"/></radialGradient>
    
      <radialGradient id="wm-ruby" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ff7a7a"/><stop offset=".6" stop-color="#c2182b"/><stop offset="1" stop-color="#5e0612"/></radialGradient>
      <linearGradient id="wm-blued" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6b97ee"/><stop offset="1" stop-color="#1a3672"/></linearGradient>
      <radialGradient id="wm-pl"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".6" stop-color="#fff" stop-opacity=".04"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></radialGradient>
      <pattern id="wm-perlage" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="6" fill="url(#wm-pl)"/><circle cx="10.5" cy="10.5" r="6" fill="url(#wm-pl)"/></pattern>
      <linearGradient id="wm-sg"><stop offset="0" stop-color="#7d5a1f"/><stop offset=".5" stop-color="#ffe9a8"/><stop offset="1" stop-color="#7d5a1f"/></linearGradient>
      <pattern id="wm-stripes" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><rect width="7" height="7" fill="url(#wm-sg)"/></pattern>
      <filter id="wm-bevel" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1.6" result="b"/>
        <feSpecularLighting in="b" surfaceScale="6" specularConstant="1.3" specularExponent="26" lighting-color="#fff4cf" result="sp"><fePointLight x="-260" y="-320" z="240"/></feSpecularLighting>
        <feComposite in="sp" in2="SourceAlpha" operator="in" result="sp2"/>
        <feComposite in="SourceGraphic" in2="sp2" operator="arithmetic" k1="0" k2="1" k3=".9" k4="0" result="lit"/>
        <feOffset in="b" dx="4" dy="7" result="o"/><feFlood flood-color="#000" flood-opacity=".6"/><feComposite in2="o" operator="in" result="sh"/>
        <feMerge><feMergeNode in="sh"/><feMergeNode in="lit"/></feMerge>
      </filter>
    <linearGradient id="wm-steel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fafcff"/><stop offset=".3" stop-color="#b7c0ca"/><stop offset=".55" stop-color="#7f8994"/><stop offset=".8" stop-color="#dfe5eb"/><stop offset="1" stop-color="#98a2ad"/></linearGradient></defs><g id="wm-cam"><g id="wm-world"></g></g></svg>`;
// ---------- geometry helpers
const circ=(r)=>`M${r} 0a${r} ${r} 0 1 0 ${-2*r} 0a${r} ${r} 0 1 0 ${2*r} 0Z`;
function gearPath(r,n,holes,hubR,rim){
  const h=r*.13,p=2*Math.PI/n,P=[];
  for(let i=0;i<n;i++){const a=i*p;[[r-h,0],[r+h*.8,.17],[r+h*.8,.43],[r-h,.6]].forEach(([q,o])=>P.push([q*Math.cos(a+o*p),q*Math.sin(a+o*p)]))}
  let d="M"+P.map(q=>q.join(" ")).join("L")+"Z";
  if(rim){d+=circ(rim)}
  else{const hr=r*.17,hd=r*.55;for(let i=0;i<holes;i++){const a=i*2*Math.PI/holes;d+=`M${hd*Math.cos(a)+hr} ${hd*Math.sin(a)}a${hr} ${hr} 0 1 0 ${-2*hr} 0a${hr} ${hr} 0 1 0 ${2*hr} 0Z`}}
  return d+circ(hubR||r*.12);
}
const spiral=(r0,r1,turns)=>{let d="",N=turns*40;for(let i=0;i<=N;i++){const a=i/40*2*Math.PI,r=r0+(r1-r0)*i/N;d+=(i?"L":"M")+(r*Math.cos(a)).toFixed(1)+" "+(r*Math.sin(a)).toFixed(1)}return d};
const el=(t,a,parent)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);parent&&parent.appendChild(e);return e};
// ---------- build layers (0 plate,1 barrel,2 gears,3 escapement,4 balance,5 jewels)
const world=$("wm-world"),L=[],I=[];
for(let i=0;i<6;i++){const g=el("g",{},world);L.push(g);I.push(el("g",i?{filter:"url(#wm-bevel)"}:{},g))}
const off=t=>`scale(1.12) translate(-20 28) ${t||""}`;
const screw=(p,x,y,r,s=9)=>{const g=el("g",{transform:`translate(${x} ${y})`},p);
  el("circle",{r:s,fill:"url(#wm-blued)",stroke:"#081226","stroke-width":1},g);
  el("line",{x1:-s*.75,x2:s*.75,stroke:"#050a14","stroke-width":s*.26,transform:`rotate(${r})`},g);
  el("circle",{cx:-s*.3,cy:-s*.35,r:s*.25,fill:"#fff",opacity:.35},g)};
const jewel=(x,y,k=1)=>{const j=el("g",{transform:off(`translate(${x} ${y}) scale(${k})`)},I[5]);
  el("circle",{r:12,fill:"url(#wm-gold)",stroke:"#6b4a12","stroke-width":.8},j);el("circle",{r:8,fill:"url(#wm-ruby)"},j);
  el("circle",{r:2.4,fill:"#1a0508"},j);el("circle",{cx:-3,cy:-3.5,r:2,fill:"#fff",opacity:.6},j)};
// 0 plate: perlage finish, engraved rings, screws
{const g=I[0];
 el("circle",{r:300,fill:"url(#wm-plate)"},g);el("circle",{r:300,fill:"url(#wm-perlage)"},g);
 el("circle",{r:300,fill:"none",stroke:"#d9b86a","stroke-opacity":.6,"stroke-width":2.5},g);
 el("circle",{r:284,fill:"none",stroke:"#d9b86a","stroke-opacity":.25},g);
 el("circle",{r:258,fill:"none",stroke:"#d9b86a","stroke-opacity":.2,"stroke-dasharray":"2 6"},g);
 for(let i=0;i<60;i++)el("line",{y1:-278,y2:i%5?-283:-293,stroke:"#d9b86a","stroke-opacity":.5,transform:`rotate(${i*6})`},g);
 [35,145,215,325].forEach((a,i)=>screw(g,250*Math.cos(a*Math.PI/180),250*Math.sin(a*Math.PI/180),i*47+10,10));
 el("text",{y:236,"text-anchor":"middle","font-size":12,"letter-spacing":6,fill:"#d9b86a","fill-opacity":.65,"font-family":"IBM Plex Sans,sans-serif"},g).textContent="WRIST MODE · WM-01"}
// gears: spoked wheels, fine teeth, raised hubs, meshing pinions, steel bridge
const goldR=(id,r)=>{const g=el("radialGradient",{id,gradientUnits:"userSpaceOnUse",cx:0,cy:0,r:r*1.05},stageWrap.querySelector("defs"));
  [[0,"#9c6f22"],[.35,"#e9c76f"],[.55,"#ffeaa6"],[.78,"#c99a3e"],[1,"#f4dc92"]].forEach(([o,c])=>el("stop",{offset:o,"stop-color":c},g))};
const f1=v=>v.toFixed(1);
function ringPath(r,n,rin){const h=Math.max(2.4,r*.09),p=2*Math.PI/n,P=[];
  for(let i=0;i<n;i++){const a=i*p;[[r-h,0],[r+h*.6,.14],[r+h*.6,.42],[r-h,.58]].forEach(([q,o])=>P.push([q*Math.cos(a+o*p),q*Math.sin(a+o*p)]))}
  return "M"+P.map(q=>q.map(f1).join(" ")).join("L")+"Z"+circ(rin)}
function spokes(k,rh,rr,w1,w2){let d="";for(let i=0;i<k;i++){const a=i*2*Math.PI/k,c=Math.cos(a),s=Math.sin(a),nx=-s,ny=c;
  const P=[[rh*c+nx*w1,rh*s+ny*w1],[rr*c+nx*w2,rr*s+ny*w2],[rr*c-nx*w2,rr*s-ny*w2],[rh*c-nx*w1,rh*s-ny*w1]];
  d+="M"+P.map(q=>q.map(f1).join(" ")).join("L")+"Z"}return d}
function buildGear(rot,q,id){
  goldR(id,q.r);const f=`url(#${id})`,r=q.r,rin=q.rim||(q.k?r*.8:r*.16);
  if(q.rim)el("path",{d:spiral(16,68,7),fill:"none",stroke:"#9fb6c8","stroke-width":3,opacity:.95},rot);
  el("path",{d:ringPath(r,q.n,rin),"fill-rule":"evenodd",fill:f,stroke:"#6b4a12","stroke-width":.6},rot);
  if(q.rim)for(let i=0;i<6;i++){const a=i*Math.PI/3;el("circle",{cx:79*Math.cos(a),cy:79*Math.sin(a),r:2.2,fill:"#7a5516"},rot)}
  if(q.k){el("path",{d:spokes(q.k,r*.12,rin+2,r*.045,r*.075),fill:f,stroke:"#6b4a12","stroke-width":.6},rot);
    el("circle",{r:rin,fill:"none",stroke:"#fff2c0","stroke-width":.9,opacity:.6},rot);
    el("circle",{r:rin-1.6,fill:"none",stroke:"#5a3c0e","stroke-width":.9,opacity:.55},rot)}
  el("circle",{r:r*(q.k?.2:.26),fill:f,stroke:"#6b4a12","stroke-width":.7},rot);
  el("circle",{r:r*(q.k?.14:.19),fill:"none",stroke:"#fff2c0","stroke-width":.8,opacity:.55},rot)}
const main=[{c:[-120,-60],r:90,n:30,L:1,t:30,s:1,rim:76},{c:[17.2,-10.1],r:56,n:20,L:2,t:20,s:-1,k:5},{c:[65.2,73],r:40,n:14,L:2,t:14,s:1,k:4},{c:[138.9,79.4],r:34,n:12,L:3,t:12,s:-1,k:5}];
const sat=(pi,ang,r,n)=>{const P=main[pi],d=P.r+r,a=ang*Math.PI/180;return{c:[P.c[0]+d*Math.cos(a),P.c[1]+d*Math.sin(a)],r,n,L:P.L,t:n,s:-P.s,k:0}};
const G=[...main,sat(0,110,22,8),sat(1,-70,22,8),sat(2,150,28,10),sat(3,60,16,6)];
G.forEach((q,i)=>{const gg=el("g",{transform:off(`translate(${q.c})`)},I[q.L]);q.rot=el("g",{},gg);buildGear(q.rot,q,"wm-gr"+i)});
// silver bridge across the gear train, with slots and screws
{const br="M-28 -38Q-5 -30 17.2 -10.1C35 8 38 45 65.2 73L92 98",bgp=el("g",{transform:off("")},I[2]);
 [["#5d656e",24,1],["url(#wm-steel)",21,1],["#ffffff",5,.5]].forEach(([c,w,o],i)=>el("path",{d:br,fill:"none",stroke:c,"stroke-width":w,"stroke-linecap":"round","stroke-linejoin":"round",opacity:o,transform:i==2?"translate(-2 -3)":""},bgp));
 el("path",{d:br,fill:"none",stroke:"#2b3138","stroke-width":6,"stroke-linecap":"round","stroke-dasharray":"14 72","stroke-dashoffset":-34,opacity:.8},bgp);
 [[-28,-38,20],[92,98,70],[40,30,110]].forEach(([x,y,r])=>screw(bgp,x,y,r,6))}
// pallet fork with ruby pallets (pivot 139,8)
const forkG=el("g",{transform:off("translate(139 8)")},I[3]),fork=el("g",{},forkG);
el("path",{d:"M0 0L-18 42L-12 46L0 14L12 46L18 42ZM0 0L29 -30L33 -26L4 4Z",fill:"url(#wm-gold)"},fork);
[-15,15].forEach(x=>el("circle",{cx:x,cy:45,r:4,fill:"url(#wm-ruby)"},fork));
el("circle",{r:6,fill:"#0a1915",stroke:"#d9b86a"},fork);
// balance wheel, blued hairspring, striped balance cock
const bg=el("g",{transform:off("translate(175 -95)")},I[4]),bal=el("g",{},bg);
el("circle",{r:72,fill:"none",stroke:"url(#wm-gold)","stroke-width":9},bal);
for(let i=0;i<3;i++)el("line",{x2:70,stroke:"#c79a45","stroke-width":5,transform:`rotate(${i*120+30})`},bal);
for(let i=0;i<8;i++)el("circle",{cx:72,r:5.5,fill:"#ffe9a8",stroke:"#8f6a27",transform:`rotate(${i*45})`},bal);
el("path",{d:spiral(8,36,8),fill:"none",stroke:"#4a7be0","stroke-width":1.4},bal);
el("circle",{r:9,fill:"url(#wm-gold)"},bal);
const cock="M0 0Q34 -48 70 -66";
el("path",{d:cock,fill:"none",stroke:"#6a4a14","stroke-width":31,"stroke-linecap":"round"},bg);
el("path",{d:cock,fill:"none",stroke:"url(#wm-gold)","stroke-width":28,"stroke-linecap":"round"},bg);
el("path",{d:cock,fill:"none",stroke:"url(#wm-stripes)","stroke-width":22,"stroke-linecap":"round"},bg);
screw(bg,70,-66,25,7);
// ruby jewels at every pivot
[[-120,-60],[17.2,-10.1],[65.2,73],[138.9,79.4],[175,-95],[139,8]].forEach(([x,y])=>jewel(x,y));
G.slice(4).forEach(q=>jewel(q.c[0],q.c[1],.55));


const cam=$("wm-cam");
/* 3. live hands, mapped onto the photographed dial */
const ap=(x,y)=>{const w=HM[2][0]*x+HM[2][1]*y+HM[2][2];return[(HM[0][0]*x+HM[0][1]*y+HM[0][2])/w,(HM[1][0]*x+HM[1][1]*y+HM[1][2])/w]};
const poly=(P,ang,dx=0,dy=0)=>{const a=ang*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return P.map(([x,y])=>{const p=ap(x*c-y*s,x*s+y*c);return(p[0]+dx).toFixed(1)+","+(p[1]+dy).toFixed(1)}).join(" ")};
const mk=(L_,w0,wm,w1,t)=>({l:[[0,t],[-w0,t],[-wm,-18],[-w1,-L_],[0,-L_]],r:[[0,t],[w0,t],[wm,-18],[w1,-L_],[0,-L_]],f:[[-w0,t],[w0,t],[wm,-18],[w1,-L_],[-w1,-L_],[-wm,-18]]});
const HH=mk(98,4,3,.9,14),MM=mk(132,3.4,2.4,.8,16),SS=mk(150,1.1,.9,.5,36),CW=Array.from({length:12},(_,i)=>[6*Math.cos(i*Math.PI/6),26+6*Math.sin(i*Math.PI/6)]);
$("wm-hg").innerHTML='<g filter="url(#wm-hsh)" fill="rgba(40,24,6,.34)"><polygon id="wms1"/><polygon id="wms2"/><polygon id="wms3"/></g><polygon id="wma1" fill="#f7de92"/><polygon id="wma2" fill="#b3832b"/><polygon id="wmb1" fill="#f7de92"/><polygon id="wmb2" fill="#b3832b"/><polygon id="wmc1" fill="#d6892f"/><polygon id="wmc2" fill="#d6892f"/><circle id="wmcap" r="10" fill="url(#wm-hcap)"/><circle id="wmcp2" r="2.8" fill="#3a2608"/>';
const sp=(id,P,a,dx,dy)=>$(id).setAttribute("points",poly(P,a,dx,dy));
const hands=$("wm-hands"),fadeEls=[".hero-copy",".hero-index",".scroll-cue"].map(q=>hero.querySelector(q)).filter(Boolean),dialLines=hero.querySelector(".dial-lines");
/* 4. chapters, power reserve, tactile ticks */
const ch=box("div","wm-ch",pin);
const CH=[["The Movement","Open it up.","Beneath every dial is a world that never stops moving. Keep scrolling. You are the one winding it."],["01 · Energy","The Mainspring","A coiled ribbon of steel stores the energy. Wound tight, it releases slowly, enough for about forty hours."],["02 · Motion","The Gear Train","Each wheel turns slower and stronger than the last, dividing one slow unwinding into seconds, minutes and hours."],["03 · Time","Escapement & Balance","A tiny anchor releases the power one tooth at a time, the tick you feel. The balance wheel swings 28,800 times an hour to keep it honest."]].map(c=>{const d=box("div","wm-card",ch);d.innerHTML='<p class="wm-eye">'+c[0]+'</p><h2>'+c[1]+'</h2><p>'+c[2]+'</p>';return d});
const pr=box("div","wm-pr",pin);pr.innerHTML='<b>POWER RESERVE</b><div class="wm-trk"><i></i></div>';const prf=pr.querySelector("i");
const sbtn=box("button","wm-snd",pin);sbtn.textContent="Tactile ticks: off";
const exitLink=box("a","wm-exit",pin);exitLink.href="#collections";exitLink.textContent="Discover the collection";
let sndOn=false,actx=null,lastNs=0,lastClick=0;
sbtn.onclick=()=>{sndOn=!sndOn;if(sndOn&&!actx)actx=new(window.AudioContext||window.webkitAudioContext)();sbtn.textContent="Tactile ticks: "+(sndOn?"on":"off")};
function tick(){if(actx){const t=actx.currentTime,o=actx.createOscillator(),g=actx.createGain();o.type="square";o.frequency.setValueAtTime(2200,t);o.frequency.exponentialRampToValueAtTime(700,t+.02);g.gain.setValueAtTime(.05,t);g.gain.exponentialRampToValueAtTime(.0001,t+.03);o.connect(g);g.connect(actx.destination);o.start(t);o.stop(t+.035)}if(navigator.vibrate)navigator.vibrate(6)}
/* 5. geometry of the photo inside your .hero-media (honours your object-position, incl. the mobile 62%) */
let LY;
function layout(){
  const mw=media.offsetWidth,mh=media.offsetHeight,op=(getComputedStyle(img).objectPosition||"50% 50%").split(" ");
  const fx=op[0].indexOf("%")>0?parseFloat(op[0])/100:.5,fy=(op[1]||"").indexOf("%")>0?parseFloat(op[1])/100:.5;
  const k=Math.max(mw/IW,mh/IH),ox=(mw-IW*k)*fx,oy=(mh-IH*k)*fy;
  canvas.style.transform="translate("+ox+"px,"+oy+"px) scale("+k+")";
  LY={k,ox,oy,mw,mh,ml:media.offsetLeft,mt:media.offsetTop};
}
const fitScale=()=>{const t=getComputedStyle(fit).transform;return t&&t!=="none"?new DOMMatrix(t).a:1};
/* 6. phase one: push into the dial, then open it like an iris (h: 0 to 1) */
function heroPhase(h){
  const W=hero.clientWidth,H=hero.clientHeight,pt=W<H*.9,mn=Math.min(W,H),a=fitScale();
  const cx=LY.ml+LY.mw/2,cy=LY.mt+LY.mh/2,rx=LY.ml+LY.ox+DX*LY.k,ry=LY.mt+LY.oy+DY*LY.k;
  const D=[cx+a*(rx-cx),cy+a*(ry-cy)],ra=DR*LY.k*a,u2=mn/630*1.05,T=[W/2+(pt?0:170*u2),H/2+(pt?-136*u2:0)];
  const Ke=300*u2*.93/ra,z=ease(cl(h/.5,0,1)),K=1+(Ke-1)*z,px=D[0]+(T[0]-D[0])*z,py=D[1]+(T[1]-D[1])*z;
  zoom.style.transform="translate("+(px-K*D[0])+"px,"+(py-K*D[1])+"px) scale("+K+")";
  const dr=ra*K*.97,Rf=Math.hypot(W,H);let hr=0;if(h>=.5)hr=h<.68?dr*ease((h-.5)/.18):dr+(Rf-dr)*ease((h-.68)/.32);
  hero.style.setProperty("--mx",px+"px");hero.style.setProperty("--my",py+"px");hero.style.setProperty("--hr",hr+"px");
  const f=1-cl(h/.25,0,1);fadeEls.forEach(e=>{e.style.opacity=f;e.style.pointerEvents=f<.3?"none":""});if(dialLines)dialLines.style.opacity=.25*f;
  hero.style.visibility=h>=.999?"hidden":"visible";if(h>=.999)return;
  hands.style.opacity=1-cl((h-.3)/.15,0,1);
  const d=new Date(),sc=d.getSeconds()+(calm?0:d.getMilliseconds()/1000),mi=d.getMinutes()+sc/60,ha=(d.getHours()%12+mi/60)*30,ma=mi*6,sa=sc*6;
  sp("wms1",HH.f,ha,4,7);sp("wms2",MM.f,ma,4,7);sp("wms3",SS.f,sa,5,8);
  sp("wma1",HH.l,ha);sp("wma2",HH.r,ha);sp("wmb1",MM.l,ma);sp("wmb2",MM.r,ma);sp("wmc1",SS.f,sa);sp("wmc2",CW,sa);
  const c=ap(0,0);["wmcap","wmcp2"].forEach(i=>{$(i).setAttribute("cx",c[0]);$(i).setAttribute("cy",c[1])});
}
/* 7. phase two: the camera travels through the movement */
const S=[{s:1.05,c:[0,0],o:[170,0],vis:0,expl:1,f:null,dim:1},{s:1.05,c:[0,0],o:[170,0],vis:1,expl:0,f:null,dim:1},{s:1.9,c:[-157,-36],o:[190,0],vis:1,expl:0,f:[1],dim:1},{s:1.9,c:[22,65],o:[190,0],vis:1,expl:0,f:[2],dim:1},{s:1.8,c:[153,-13],o:[190,0],vis:1,expl:0,f:[3,4],dim:1}];
const KN=[0,.17,.42,.68,.94],cur=[1,0,0,0,0,0];
let visible=true,vel=0,lastY=scrollY;
function frame(now){
  requestAnimationFrame(frame);if(!visible)return;
  const r=journey.getBoundingClientRect(),P=cl(-r.top/(journey.offsetHeight-innerHeight),0,1),y=scrollY;
  vel+=(Math.abs(y-lastY)-vel)*.1;lastY=y;
  heroPhase(sm(cl(P/KN[1],0,1)));
  let i=0;while(i<3&&P>=KN[i+1])i++;
  const u=sm(cl((P-KN[i])/(KN[i+1]-KN[i]),0,1)),A=S[i],B=S[i+1],m=k=>A[k]+(B[k]-A[k])*u,mv=(k,j)=>A[k][j]+(B[k][j]-A[k][j])*u;
  let ox=mv("o",0),oy=mv("o",1);if(innerWidth<innerHeight*.9){oy-=ox*.8;ox=0}
  cam.setAttribute("transform","translate("+ox+" "+oy+") scale("+m("s")+") translate("+(-mv("c",0))+" "+(-mv("c",1))+")");
  const f=(u<.5?A:B).f,ex=m("expl"),vs=m("vis"),dim=m("dim");
  L.forEach((g,k)=>{
    const tg=k?vs*dim*(f?(f.includes(k)?1:k===5?.6:.28):1):dim*(f?.6:1);
    cur[k]+=(tg-cur[k])*.15;g.setAttribute("opacity",cur[k].toFixed(3));
    g.setAttribute("transform",k?"translate(0 "+(-k*55*ex).toFixed(1)+")":"");
    g.classList.toggle("lit",!!f&&f.includes(k));
  });
  let act=-1;if(P>=KN[1]-.03){let b=9;for(let j=1;j<5;j++){const dd=Math.abs(P-KN[j]);if(dd<b){b=dd;act=j-1}}}
  CH.forEach((c,j)=>c.classList.toggle("on",j===act));
  exitLink.classList.toggle("on",P>.92);
  sbtn.classList.toggle("is-hidden",P>.88);
  pr.style.opacity=cl((P-.05)/.1,0,1);prf.style.transform="scaleY("+P+")";
  const ns=Math.floor(y*.35/6);if(ns!==lastNs){if(sndOn&&now-lastClick>60){tick();lastClick=now}lastNs=ns}
  const raw=(y*.35+(calm?0:now/1000*24))/6,n=Math.floor(raw),fr=raw-n,st=fr<.35?ease(fr/.35):1,Ag=6*(n+st);
  G.forEach(q=>q.rot.setAttribute("transform","rotate("+(q.s*Ag*30/q.t).toFixed(2)+")"));
  const kk=Math.cos(Math.PI*(n+st));
  bal.setAttribute("transform","rotate("+((150+Math.min(40,vel*2))*kk).toFixed(1)+")");fork.setAttribute("transform","rotate("+(9*kk).toFixed(2)+")");
}
layout();addEventListener("resize",layout);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(layout);
new IntersectionObserver(e=>{visible=e[0].isIntersecting}).observe(journey);
requestAnimationFrame(frame);
})();
