/* lesson.js — 번호 네비 표시 + 모든 프롬프트 상자에 복사 버튼 (10월 교안과 같은 동작) */
(function(){
  var links=[].slice.call(document.querySelectorAll('.jump a'));
  var secs=links.map(function(a){return document.querySelector(a.getAttribute('href'));});
  function mark(){var i=0;for(var k=0;k<secs.length;k++){if(secs[k]&&secs[k].getBoundingClientRect().top<=140)i=k;}
    links.forEach(function(a,k){a.classList.toggle('on',k===i);});}
  window.addEventListener('scroll',mark,{passive:true});mark();
})();
document.querySelectorAll('.box').forEach(function(box){
  var bar=box.querySelector('.bar');if(!bar||bar.querySelector('button'))return;
  var b=document.createElement('button');b.className='cp';b.type='button';b.textContent='복사';bar.appendChild(b);
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
