/* lesson.js — 번호 네비 표시 + 프롬프트 상자 단추
 * 기본: 모든 프롬프트 상자에 복사 단추 (ready.html · skills.html 등)
 * <body class="type-only"> 차시 교안: 10월 5·6차시 교안과 같은 방식 (1~4차시)
 *   - 강사 화면(?t=비밀번호, live.js와 같은 열쇠) → 🔍 크게 보기 + 복사
 *   - 수강생 화면 → 단추 없음, 드래그·복사 막음 (보고 직접 쳐 보기)
 *     단, <div class="box cp-ok"> (긴 프롬프트·나열형)은 수강생도 복사 단추
 */
(function(){
  var links=[].slice.call(document.querySelectorAll('.jump a'));
  var secs=links.map(function(a){return document.querySelector(a.getAttribute('href'));});
  function mark(){var i=0;for(var k=0;k<secs.length;k++){if(secs[k]&&secs[k].getBoundingClientRect().top<=140)i=k;}
    links.forEach(function(a,k){a.classList.toggle('on',k===i);});}
  window.addEventListener('scroll',mark,{passive:true});mark();
})();
var TEACH=false;
try{var q=new URLSearchParams(location.search);
  TEACH=!!(q.get('t')||(!q.has('student')&&localStorage.getItem('liveKey')));}catch(e){}
var LOCK=document.body.classList.contains('type-only');
if(LOCK)document.body.classList.add(TEACH?'t-copy':'s-type');
document.querySelectorAll('.box').forEach(function(box){
  var bar=box.querySelector('.bar');if(!bar||bar.querySelector('button'))return;
  function mk(c,t){var b=document.createElement('button');b.type='button';b.className=c;b.textContent=t;return b;}
  if(!LOCK){bar.appendChild(mk('cp','복사'));return;}
  if(!TEACH){if(box.classList.contains('cp-ok'))bar.appendChild(mk('cp','복사'));return;}
  var w=document.createElement('div');w.className='btns';
  w.appendChild(mk('zm','🔍 크게 보기'));w.appendChild(mk('cp','복사'));bar.appendChild(w);
});
// 강사 화면: 프롬프트를 화면 가득 크게 (가− 가+ / Esc 닫기)
(function(){
  if(!LOCK||!TEACH)return;
  var z=document.createElement('div');z.id='zoom';
  z.innerHTML='<div class="zbar"><b></b><button type="button" class="m">가−</button>'+
    '<button type="button" class="p">가+</button><button type="button" class="x">닫기 ✕</button></div><div class="ztxt"></div>';
  document.body.appendChild(z);
  var zt=z.querySelector('.ztxt'),size=40;
  function set(n){size=Math.max(20,Math.min(80,n));zt.style.fontSize=size+'px';}
  function close(){z.classList.remove('on');document.body.style.overflow='';}
  z.querySelector('.m').onclick=function(){set(size-6);};
  z.querySelector('.p').onclick=function(){set(size+6);};
  z.querySelector('.x').onclick=close;
  document.addEventListener('keydown',function(e){if(!z.classList.contains('on'))return;
    if(e.key==='Escape')close();else if(e.key==='+'||e.key==='=')set(size+6);else if(e.key==='-')set(size-6);});
  document.querySelectorAll('button.zm').forEach(function(b){
    b.addEventListener('click',function(){
      var box=b.closest('.box');
      z.querySelector('.zbar b').textContent=box.querySelector('.bar span').textContent;
      zt.innerHTML=box.querySelector('.txt').innerHTML;zt.scrollTop=0;
      z.classList.add('on');document.body.style.overflow='hidden';
    });
  });
})();
// 수강생 화면: 드래그·복사·오른쪽 클릭 막기
if(LOCK&&!TEACH)document.querySelectorAll('.box:not(.cp-ok) .txt').forEach(function(el){
  ['copy','cut','contextmenu','selectstart','dragstart'].forEach(function(ev){
    el.addEventListener(ev,function(e){e.preventDefault();});
  });
});
function fb(t,ok){var a=document.createElement('textarea');a.value=t;a.style.position='fixed';a.style.opacity='0';
  document.body.appendChild(a);a.select();
  try{document.execCommand('copy');ok();}catch(e){alert('직접 드래그해서 복사해 주세요.');}
  document.body.removeChild(a);}
document.querySelectorAll('button.cp').forEach(function(b){
  b.addEventListener('click',function(){
    var t=b.closest('.box').querySelector('.txt').innerText;
    var ok=function(){b.textContent='복사됨!';b.classList.add('copied');
      setTimeout(function(){b.textContent='복사';b.classList.remove('copied');},1500);};
    if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(t).then(ok,function(){fb(t,ok);});}
    else{fb(t,ok);}
  });
});
