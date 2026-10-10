/* live.js — 수업 진행 위치 실시간 표시 (도민대학 교안용)
 * 11월 과정용 (10월 live.js에서 COURSE·PREFIX만 바꿈)
 * 사용: 교안 HTML의 </body> 바로 위에 <script src="live.js"></script> 한 줄 추가
 * 강사 모드: 주소 뒤에 ?t=강사비밀번호  (예: 1.html?t=jeju2026)
 *   - 블록 클릭 → 그 블록이 '지금 여기'
 *   - 키보드 J(다음) / K(이전), 또는 왼쪽 아래 ◀ ▶ 버튼
 */
(function () {
  // ===== 설정 =====
  var FIREBASE_URL = 'https://domin-10-live-default-rtdb.asia-southeast1.firebasedatabase.app';          // 예: 'https://domin-live-default-rtdb.asia-southeast1.firebasedatabase.app'
  var COURSE = '클로드가 내 컴퓨터로 들어옵니다';
  var PREFIX = 'nov-';   // 10월 교안과 진행 위치가 섞이지 않도록 11월 차시 앞에 붙는 이름
  // ================

  var LESSON = PREFIX + (location.pathname.split('/').pop() || 'index').replace(/\.html?$/, '').replace(/[^\w-]/g, '_') || 'index';
  var qs = new URLSearchParams(location.search);
  var key = qs.get('t');
  try { if (key) localStorage.setItem('liveKey', key); else if (qs.has('student')) localStorage.removeItem('liveKey'); key = key || localStorage.getItem('liveKey'); } catch (e) {}
  var TEACHER = !!key;

  // ---- 블록(진행 단위) 수집 ----
  var units = [];
  function add(el) { if (el && units.indexOf(el) < 0) units.push(el); }
  add(document.querySelector('.hook'));
  document.querySelectorAll('section').forEach(function (s) {
    [].forEach.call(s.children, function (c) { if (c.tagName !== 'SCRIPT') add(c); });
  });
  add(document.querySelector('.end'));
  units = units.filter(Boolean);
  units.forEach(function (u, i) { u.classList.add('lv-u'); u.dataset.lv = i; });
  var N = units.length, cur = -1;

  // ---- 스타일 ----
  var css = document.createElement('style');
  css.textContent = [
    ':root{--lv-red:#e5484d;--lv-bar:46px}',
    'body{padding-top:var(--lv-bar)}',
    '.jump{top:var(--lv-bar)!important}',
    'section,.hook,.end{scroll-margin-top:calc(var(--lv-bar) + 70px)!important}',
    '#lv-top{position:fixed;top:0;left:0;right:0;height:var(--lv-bar);z-index:50;background:#fff;border-bottom:1px solid #e3e6ea;display:flex;align-items:center;gap:10px;padding:0 14px;font-family:inherit}',
    '#lv-top .t{font-weight:800;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;color:#1f2328}',
    '#lv-pill{font-size:13px;font-weight:700;border-radius:20px;padding:4px 12px;background:#f0f1f3;color:#5f6873;white-space:nowrap}',
    '#lv-pill.on{background:#fde8e8;color:var(--lv-red)}',
    '#lv-pill.on::before{content:"● ";animation:lvb 1.4s infinite}',
    '@keyframes lvb{50%{opacity:.3}}',
    '#lv-top button{background:none;border:0;font:inherit;font-size:14px;font-weight:700;color:#1f2328;cursor:pointer;padding:6px 8px;white-space:nowrap}',
    '#lv-prog{position:absolute;left:0;bottom:-1px;height:3px;background:var(--lv-red);width:0;transition:width .4s}',
    '#lv-toc{position:fixed;top:calc(var(--lv-bar) + 6px);right:12px;z-index:60;background:#fff;border:1px solid #e3e6ea;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.12);padding:8px;max-height:70vh;overflow:auto;width:min(320px,calc(100vw - 24px));display:none}',
    '#lv-toc.open{display:block}',
    '#lv-toc a{display:block;padding:8px 10px;border-radius:6px;color:#1f2328;text-decoration:none;font-size:14px}',
    '#lv-toc a:hover{background:#f3f4f6}',
    '#lv-toc a.here{color:var(--lv-red);font-weight:800}',
    '#lv-toc a.here::after{content:"  ← 지금 여기";font-size:11px}',
    '.lv-u.lv-now{position:relative;box-shadow:-5px 0 0 0 var(--lv-red);background-color:#fff9f5;border-radius:4px}',
    '.lv-u.lv-now::before{content:"지금 여기";position:absolute;top:-11px;right:-6px;background:var(--lv-red);color:#fff;font-size:11px;font-weight:800;padding:1px 8px;border-radius:10px;z-index:2;white-space:nowrap}',
    'section:has(.lv-now){border-color:var(--lv-red)!important}',
    '#lv-go{position:fixed;right:18px;bottom:22px;z-index:55;background:var(--lv-red);color:#fff;border:0;border-radius:30px;padding:12px 20px;font:inherit;font-size:15px;font-weight:800;box-shadow:0 6px 18px rgba(229,72,77,.35);cursor:pointer;display:none}',
    '#lv-go.show{display:block}',
    '#lv-tc{position:fixed;left:14px;bottom:20px;z-index:55;display:flex;gap:6px;align-items:center;background:#1f3864;color:#fff;border-radius:30px;padding:6px 8px;font-size:13px;font-weight:700;box-shadow:0 6px 18px rgba(0,0,0,.2)}',
    '#lv-tc button{background:#fff;color:#1f3864;border:0;border-radius:20px;padding:6px 14px;font:inherit;font-weight:800;cursor:pointer}',
    'body.lv-teacher .lv-u{cursor:pointer}',
    'body.lv-teacher .lv-u:hover{outline:2px dashed #f2a3a5;outline-offset:3px}',
    '@media(max-width:600px){#lv-top .t{font-size:13px}#lv-top button{padding:6px 4px;font-size:13px}#lv-go{right:12px;bottom:14px;padding:10px 16px;font-size:14px}}',
    '@media print{#lv-top,#lv-go,#lv-tc,#lv-toc{display:none!important}body{padding-top:0}}'
  ].join('\n');
  document.head.appendChild(css);

  // ---- 상단 바 ----
  var kicker = document.querySelector('.kicker');
  var top = document.createElement('div');
  top.id = 'lv-top';
  top.innerHTML = '<div class="t"></div><span id="lv-pill">대기 중</span>' +
    '<button type="button" id="lv-zoom">확대·축소</button><button type="button" id="lv-tocb">목차</button><div id="lv-prog"></div>';
  top.querySelector('.t').textContent = COURSE + (kicker ? ' · ' + kicker.textContent.split('·')[0].trim() : '');
  document.body.prepend(top);

  // 확대·축소 (100 → 115 → 130 → 90 → 100)
  var zooms = [1, 1.15, 1.3, 0.9], zi = 0;
  try { zi = +localStorage.getItem('lvZoom') || 0; } catch (e) {}
  var wrap = document.querySelector('.wrap') || document.body;
  function applyZoom() { wrap.style.zoom = zooms[zi]; document.getElementById('lv-zoom').textContent = zi ? '글자 ' + Math.round(zooms[zi] * 100) + '%' : '확대·축소'; }
  document.getElementById('lv-zoom').onclick = function () { zi = (zi + 1) % zooms.length; try { localStorage.setItem('lvZoom', zi); } catch (e) {} applyZoom(); };
  applyZoom();

  // 목차
  var toc = document.createElement('div'); toc.id = 'lv-toc';
  var heads = [].slice.call(document.querySelectorAll('section'));
  heads.forEach(function (s) {
    var h = s.querySelector('h2'); if (!h) return;
    var a = document.createElement('a'); a.href = '#' + s.id; a.textContent = h.textContent; a._sec = s;
    a.onclick = function () { toc.classList.remove('open'); };
    toc.appendChild(a);
  });
  document.body.appendChild(toc);
  document.getElementById('lv-tocb').onclick = function (e) { e.stopPropagation(); toc.classList.toggle('open'); };
  document.addEventListener('click', function (e) { if (!toc.contains(e.target)) toc.classList.remove('open'); });

  // 현재 진행 위치로 버튼
  var go = document.createElement('button'); go.id = 'lv-go'; go.type = 'button';
  document.body.appendChild(go);
  go.onclick = function () { if (cur >= 0) units[cur].scrollIntoView({ behavior: 'smooth', block: 'center' }); };
  function updGo() {
    if (cur < 0 || TEACHER) { go.classList.remove('show'); return; }
    var r = units[cur].getBoundingClientRect(), vh = window.innerHeight;
    if (r.bottom < 60) { go.textContent = '↑ 현재 진행 위치로'; go.classList.add('show'); }
    else if (r.top > vh - 40) { go.textContent = '↓ 현재 진행 위치로'; go.classList.add('show'); }
    else go.classList.remove('show');
  }
  window.addEventListener('scroll', updGo, { passive: true });
  window.addEventListener('resize', updGo);

  // ---- 화면 반영 ----
  function show(i) {
    if (typeof i !== 'number' || i < 0 || i >= N) { i = -1; }
    if (cur >= 0 && units[cur]) units[cur].classList.remove('lv-now');
    cur = i;
    var pill = document.getElementById('lv-pill');
    if (cur < 0) { pill.textContent = '대기 중'; pill.classList.remove('on'); document.getElementById('lv-prog').style.width = '0'; updGo(); return; }
    units[cur].classList.add('lv-now');
    pill.textContent = '진행 중 ' + (cur + 1) + '/' + N; pill.classList.add('on');
    document.getElementById('lv-prog').style.width = ((cur + 1) / N * 100) + '%';
    var sec = units[cur].closest('section');
    [].forEach.call(toc.children, function (a) { a.classList.toggle('here', a._sec === sec); });
    if (tcLabel) tcLabel.textContent = (cur + 1) + '/' + N;
    updGo();
  }

  // ---- 동기화 ----
  var bc = null; try { bc = new BroadcastChannel('lv-' + LESSON); } catch (e) {}
  function send(i) {
    show(i);
    if (FIREBASE_URL) {
      fetch(FIREBASE_URL.replace(/\/$/, '') + '/live/' + LESSON + '.json', { method: 'PUT', body: JSON.stringify({ p: i, k: key }) })
        .then(function (r) { if (!r.ok) alert('저장 실패 — 강사 비밀번호(?t=)를 확인하세요.'); })
        .catch(function () { alert('인터넷 연결을 확인하세요.'); });
    } else {
      try { localStorage.setItem('lv-' + LESSON, i); } catch (e) {}
      if (bc) bc.postMessage(i);
    }
  }
  if (FIREBASE_URL) {
    var es = new EventSource(FIREBASE_URL.replace(/\/$/, '') + '/live/' + LESSON + '/p.json');
    es.addEventListener('put', function (e) { try { var d = JSON.parse(e.data); if (d.path === '/') show(d.data); } catch (x) {} });
  } else {
    // 시험 모드: 같은 컴퓨터·같은 브라우저의 다른 탭끼리만 연동
    try { var s = localStorage.getItem('lv-' + LESSON); if (s !== null) show(+s); } catch (e) {}
    if (bc) bc.onmessage = function (e) { show(e.data); };
    window.addEventListener('storage', function (e) { if (e.key === 'lv-' + LESSON) show(+e.newValue); });
  }

  // ---- 강사 모드 ----
  var tcLabel = null;
  if (TEACHER) {
    document.body.classList.add('lv-teacher');
    var tc = document.createElement('div'); tc.id = 'lv-tc';
    tc.innerHTML = '<span>강사</span><button type="button">◀</button><span class="n">-</span><button type="button">▶</button>';
    document.body.appendChild(tc);
    tcLabel = tc.querySelector('.n');
    var bs = tc.querySelectorAll('button');
    function step(d) { var n = Math.max(0, Math.min(N - 1, (cur < 0 ? -1 : cur) + d)); send(n); units[n].scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    bs[0].onclick = function () { step(-1); };
    bs[1].onclick = function () { step(1); };
    document.addEventListener('keydown', function (e) {
      if (/INPUT|TEXTAREA/.test(e.target.tagName)) return;
      if (e.key === 'j' || e.key === 'J' || e.key === 'ㅓ') step(1);
      if (e.key === 'k' || e.key === 'K' || e.key === 'ㅏ') step(-1);
    });
    document.addEventListener('click', function (e) {
      if (e.target.closest('a,button,input,textarea,#lv-top,#lv-toc,#lv-tc')) return;
      var u = e.target.closest('.lv-u'); if (u) send(+u.dataset.lv);
    });
    if (cur >= 0) tcLabel.textContent = (cur + 1) + '/' + N;
  }
})();
