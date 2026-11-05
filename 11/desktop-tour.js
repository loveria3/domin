/* desktop-tour.js — 1차시 2번 「화면 지도」 그림 화면 (실제 첫 화면 배치를 본뜸)
 * ① 번호 눌러 보기: 번호를 누르면 그 자리에 동그라미 + 설명
 * ② 폴더 연결 따라 보기: 마우스 화살표가 누를 곳을 차례로 보여 줌 (자동 재생 · 이전/다음)
 */
(function(){
  var root=document.getElementById('tour');if(!root)return;
  var W=820,H=488;
  var fit=root.querySelector('.tour-fit'),stage=root.querySelector('.stage');
  var cur=root.querySelector('.cur'),ring=root.querySelector('.ring');
  var capN=root.querySelector('.cap-n'),capT=root.querySelector('.cap-t');
  var ctl=root.querySelector('.tour-ctl'),dots=root.querySelector('.dots');
  var playBtn=ctl.querySelector('.pp');
  function $(s){return stage.querySelector(s);}
  var scale=1;
  // 휴대폰처럼 좁으면 너무 작아지지 않게 0.6배까지만 줄이고 상자 안에서 옆으로 밀어 보기
  var sizer=document.createElement('div');sizer.className='sizer';fit.appendChild(sizer);sizer.appendChild(stage);
  function resize(){scale=Math.max(.6,Math.min(1,fit.clientWidth/W));stage.style.transform='scale('+scale+')';
    sizer.style.width=(W*scale)+'px';sizer.style.height=(H*scale)+'px';place();}
  function box(el){var r=el.getBoundingClientRect(),s=stage.getBoundingClientRect();
    return {x:(r.left-s.left)/scale,y:(r.top-s.top)/scale,w:r.width/scale,h:r.height/scale};}
  function ringOn(el){if(!el){ring.style.opacity=0;return;}var b=box(el);
    ring.style.left=(b.x-6)+'px';ring.style.top=(b.y-6)+'px';ring.style.width=(b.w+12)+'px';ring.style.height=(b.h+12)+'px';ring.style.opacity=1;}

  /* ---------- ① 번호 눌러 보기 ---------- */
  var MAP=[
    ['.sb-new','새로 만들기','<b>새 작업</b>을 시작하는 곳. 주제가 바뀌면 여기서 새로 시작합니다.'],
    ['.mode','채팅 | Cowork','입력창 안의 단추. 오늘은 <b>Cowork</b>를 눌러 내 폴더에서 일하게 합니다.'],
    ['.ib-t','입력창','클로드에게 <b>할 일을 적는 곳</b>. Enter로 보냅니다.'],
    ['.plus','＋','파일 붙이기 · <b>커넥터</b> 켜고 끄기 (2차시).'],
    ['.fold','📁 폴더','클로드가 일할 <b>내 컴퓨터 폴더</b>. 오늘은 <b>내작업실</b>을 맡깁니다.'],
    ['.perm','자동 (승인 방식)','파일을 바꿀 때 <b>묻고 할지</b> 정하는 곳. 오늘은 <b>직접 승인</b>으로 바꿉니다.'],
    ['.model','모델 · 생각 정도','오늘은 <b>기본값 그대로</b> 둡니다.'],
    ['.sb-sched','예약됨','정해진 시간에 저절로 하는 <b>예약 작업</b> (2차시).'],
    ['.sb-cust','사용자 지정','<b>스킬 · 커넥터</b>를 넣고 켜는 곳 (2차시).'],
    ['.sb-me','내 이름 · Pro','<b>Pro</b>(또는 Max)가 보여야 코워크를 쓸 수 있어요.']
  ];
  var hsWrap=root.querySelector('.hs-wrap');
  MAP.forEach(function(m,i){var b=document.createElement('button');b.type='button';b.className='hs';b.textContent=i+1;
    b.setAttribute('aria-label',(i+1)+'번 '+m[1]);b.onclick=function(){pick(i);};hsWrap.appendChild(b);});
  function place(){[].forEach.call(hsWrap.children,function(b,i){var el=$(MAP[i][0]);if(!el)return;var r=box(el);
      b.style.left=(r.x+r.w-14)+'px';b.style.top=(r.y-12)+'px';});}
  function pick(i){[].forEach.call(hsWrap.children,function(b,k){b.classList.toggle('on',k===i);});
    ringOn($(MAP[i][0]));capN.textContent=(i+1)+'. '+MAP[i][1];capT.innerHTML=MAP[i][2];}

  /* ---------- ② 폴더 연결 따라 보기 ---------- */
  var PROMPT='이 폴더에 있는 파일을 하나씩 열어 보고, 무슨 서류인지 표로 정리해줘.';
  // [누를 곳, 설명, 누른 뒤 화면]
  var STEPS=[
    ['.sb-new','왼쪽 위 <b>＋ 새로 만들기</b>를 누릅니다.',{}],
    ['[data-v=cowork]','입력창 안의 <b>Cowork</b>를 누릅니다.',{cowork:1}],
    ['.fold','입력창 아래 <b>📁 폴더</b> 칸을 누릅니다.',{cowork:1,menu:1}],
    ['[data-r=other]','맨 아래 <b>폴더 열기...</b>를 누르면',{cowork:1,pick:1}],
    ['[data-r=docs]','폴더 고르는 창이 뜹니다. <b>문서</b>를 누르고',{cowork:1,pick:1,docs:1}],
    ['[data-r=work]','<b>내작업실</b>을 고른 뒤',{cowork:1,pick:1,docs:1,work:1}],
    ['[data-r=ok]','<b>폴더 선택</b> — 연결 끝! 폴더 칸에 <b>내작업실</b>이 보여요.',{cowork:1,folder:1}],
    ['.perm','폴더 옆 <b>자동</b>을 누르고',{cowork:1,folder:1,pmenu:1}],
    ['[data-r=manual]','<b>직접 승인</b>을 고릅니다 — 클로드가 할 때마다 물어봐요.',{cowork:1,folder:1,manual:1}],
    ['.ib-t','입력창에 <b>프롬프트 1</b>을 보고 직접 칩니다.',{cowork:1,folder:1,manual:1,typed:1}],
    ['.ib','<b>Enter</b>로 보내기',{cowork:1,folder:1,manual:1,typed:1,ask:1}],
    ['[data-r=allow]','클로드가 물어보면 <b>읽어 보고 허용</b>. 아래 진행 중에 작업이 생겨요 🎉',{cowork:1,folder:1,manual:1,done:1}]
  ];
  STEPS.forEach(function(s,i){var d=document.createElement('button');d.type='button';d.setAttribute('aria-label',(i+1)+'단계');
    d.onclick=function(){stop();go(i);};dots.appendChild(d);});
  function apply(st){
    $('[data-v=chat]').classList.toggle('on',!st.cowork);$('[data-v=cowork]').classList.toggle('on',!!st.cowork);
    $('.fmenu').classList.toggle('show',!!st.menu);
    $('.pick').classList.toggle('show',!!st.pick);
    $('[data-r=docs]').classList.toggle('sel',!!st.docs&&!st.work);$('[data-r=work]').classList.toggle('show',!!st.docs);
    $('[data-r=work]').classList.toggle('sel',!!st.work);
    $('.fold em').textContent=st.folder?'내작업실':'폴더';$('.fold').classList.toggle('set',!!st.folder);
    $('.pmenu').classList.toggle('show',!!st.pmenu);$('.perm em').textContent=st.manual?'직접 승인':'자동';
    $('.typed').textContent=st.typed?PROMPT:'';$('.ph-t').style.display=st.typed?'none':'';
    $('.ask').classList.toggle('show',!!st.ask);$('.reply').classList.toggle('show',!!st.done);
  }
  var i=-1,timer=null,tm2=null;
  function go(n){i=n;clearTimeout(tm2);
    apply(n>0?STEPS[n-1][2]:{});
    var el=$(STEPS[n][0]);ringOn(null);
    var b=box(el);cur.style.opacity=1;cur.style.left=(b.x+Math.min(b.w/2,60))+'px';cur.style.top=(b.y+b.h/2)+'px';
    capN.textContent=(n+1)+' / '+STEPS.length;capT.innerHTML=STEPS[n][1];
    [].forEach.call(dots.children,function(d,k){d.classList.toggle('on',k===n);});
    tm2=setTimeout(function(){ringOn(el);cur.classList.add('click');
      setTimeout(function(){cur.classList.remove('click');apply(STEPS[n][2]);ringOn($(STEPS[n][0]));},350);},800);
  }
  function next(){if(i<STEPS.length-1)go(i+1);else stop();}
  function play(){stop();if(i>=STEPS.length-1)i=-1;playBtn.textContent='⏸ 멈춤';next();timer=setInterval(function(){if(i>=STEPS.length-1){stop();return;}next();},3000);}
  function stop(){clearInterval(timer);timer=null;playBtn.textContent=i>=STEPS.length-1?'↺ 다시 보기':'▶ 재생';}
  ctl.querySelector('.pv').onclick=function(){stop();if(i>0)go(i-1);};
  ctl.querySelector('.nx').onclick=function(){stop();next();};
  playBtn.onclick=function(){timer?stop():play();};

  function setMode(m){root.classList.toggle('m-play',m==='play');
    [].forEach.call(root.querySelectorAll('.tour-tabs button'),function(b){b.classList.toggle('on',b.getAttribute('data-m')===m);});
    stop();clearTimeout(tm2);cur.style.opacity=0;ringOn(null);apply({});i=-1;
    if(m==='map'){capN.textContent='번호를 눌러 보세요';capT.innerHTML='누르면 그 자리에 동그라미가 생기고 설명이 나옵니다.';[].forEach.call(hsWrap.children,function(b){b.classList.remove('on');});}
    else{capN.textContent='폴더 연결 따라 보기';capT.innerHTML='<b>▶ 재생</b>을 누르면 마우스가 누를 곳을 차례로 보여 줍니다.';[].forEach.call(dots.children,function(d){d.classList.remove('on');});playBtn.textContent='▶ 재생';}
  }
  [].forEach.call(root.querySelectorAll('.tour-tabs button'),function(b){b.onclick=function(){setMode(b.getAttribute('data-m'));};});
  window.addEventListener('resize',resize);resize();setMode('map');
})();
