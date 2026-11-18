(() => {
  'use strict';
  const STORAGE_KEY = 'linux-to-soc-reference-design-v2';
  const LEGACY_KEYS = ['linux-to-soc-roadmap-v1', 'socp'];
  const state = {
    done: new Set(), tab: 'path', type: 'all', source: 'all', instructor: 'all', status: 'all', query: '', hideDone: false
  };
  const $ = (id) => document.getElementById(id);
  const esc = (v = '') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pct = (n, d) => d ? Math.round(n / d * 100) : 0;
  const requiredLessons = CURRICULUM.filter(x => x.required);
  const phaseColors = ['#6b7a99','#1c6dd0','#0f8a6b','#7b3fc4','#e8590c','#b8860b','#b0306a','#2c6a91','#9a6830','#496c9c','#0f8a6b','#1c6dd0','#7b3fc4','#b0306a','#0f8a6b','#2d5a8f'];
  const phaseMap = new Map(PHASES.map(p => [p.id, p]));
  let toastTimer;

  function showToast(message) {
    const el = $('toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2300);
  }

  function loadProgress() {
    for (const key of [STORAGE_KEY, ...LEGACY_KEYS]) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        const values = Array.isArray(parsed) ? parsed : parsed.done;
        if (Array.isArray(values)) {
          state.done = new Set(values.filter(id => CURRICULUM.some(x => x.id === id)));
          break;
        }
      } catch { /* ignore a damaged local backup */ }
    }
  }

  function saveProgress() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.done])); }
    catch { showToast('تعذر حفظ التقدم في المتصفح'); }
  }

  function sourceKey(item) {
    const v = `${item.instructor || ''} ${item.course || ''}`.toLowerCase();
    if (v.includes('tanany')) return 'tanany';
    if (v.includes('abdallah') || v.includes('al-nuaimy') || v.includes('النعيمي')) return 'abdallah';
    if (v.includes('security jordan')) return 'security';
    if (v.includes('صحيح')) return 'sahih';
    if (v.includes('ahmed eid') || v.includes('أحمد عيد')) return 'ahmed';
    if (v.includes('boot2root')) return 'boot2root';
    return 'soc';
  }

  const sourceLabels = {
    all: 'كل المصادر', tanany: 'محمد الطناني', abdallah: 'عبدالله النعيمي', security: 'Security Jordan',
    sahih: 'قناة صحيح', ahmed: 'أحمد عيد', boot2root: 'Boot2Root', soc: 'مصادر SOC واللابات'
  };
  const sourceColors = {tanany:'tanany',abdallah:'abdallah',security:'security',sahih:'sahih',ahmed:'soc',boot2root:'soc',soc:'soc'};

  function itemKind(item) {
    if (item.required) return 'required';
    if (['Abdallah Al-Nuaimy','Ahmed Eid'].includes(item.instructor)) return 'support';
    return 'optional';
  }

  function kindLabel(item) {
    const k = itemKind(item);
    return k === 'required' ? 'أساسي' : k === 'support' ? 'دعم / مراجعة' : 'اختياري';
  }

  function itemType(item) {
    if (item.type === 'lab') return 'لاب عملي';
    if (item.type === 'reading') return 'قراءة';
    return 'فيديو';
  }

  function durationLabel(item) {
    const d = item.duration || '';
    if (d && !/غير موثقة|غير مسجلة|افتح المصدر للتحقق/i.test(d)) return `المدة: ${d}`;
    if (item.studyTime) return `وقت مقترح: ${item.studyTime}`;
    return 'المدة: غير موثقة';
  }

  function courseLabel(item) {
    const c = item.course || '';
    if (c.includes('Linux Administration')) return 'Linux Administration · الطناني';
    if (c.includes('Linux Course in Cyber')) return 'Linux for CyberSecurity';
    if (c.includes('Bash Scripting')) return 'Bash Scripting';
    if (c.includes('Ethical')) return 'Ethical Hacking';
    if (c.includes('SOC') || c.includes('SIEM') || c.includes('EDR') || c.includes('Windows')) return c;
    return c || 'تطبيق عملي';
  }

  function progressForPhase(phaseId) {
    const list = CURRICULUM.filter(x => x.phase === phaseId && x.required);
    const done = list.filter(x => state.done.has(x.id)).length;
    return {done, total:list.length, percent:pct(done,list.length)};
  }

  function renderProgress() {
    const done = requiredLessons.filter(x => state.done.has(x.id)).length;
    const total = requiredLessons.length;
    const percent = pct(done,total);
    const next = requiredLessons.find(x => !state.done.has(x.id));
    $('ring').style.setProperty('--p', percent);
    $('pc').textContent = `${percent}%`;
    $('progressSummary').textContent = `${done} من ${total} درسًا مطلوبًا مكتملًا`;
    if (next) {
      $('nextTitle').textContent = `التالي: ${next.ar || next.title}`;
      $('nextMeta').textContent = `${next.instructor} · ${next.sourceNo} · ${durationLabel(next)}`;
      $('nextBtn').disabled = false;
    } else {
      $('nextTitle').textContent = 'اكتمل المسار الأساسي';
      $('nextMeta').textContent = 'راجع التحقيقات النهائية وحدّث ملف أعمالك';
      $('nextBtn').disabled = true;
    }
  }

  function renderInstructorFilter() {
    const names = [...new Set(CURRICULUM.map(x => x.instructor))].sort((a,b) => a.localeCompare(b,'ar'));
    const el = $('instructorFilter');
    el.innerHTML = '<option value="all">كل المحاضرين</option>' + names.map(n => `<option value="${esc(n)}">${esc(n)}</option>`).join('');
    el.value = state.instructor;
  }

  function renderSourceFilters() {
    const order = ['all','tanany','abdallah','security','sahih','ahmed','boot2root','soc'];
    $('courseFilters').innerHTML = order.map(k => `<button class="chip" data-source="${k}" aria-pressed="${state.source === k}">${sourceLabels[k]}</button>`).join('');
    $('courseFilters').querySelectorAll('[data-source]').forEach(btn => btn.addEventListener('click', () => {
      state.source = btn.dataset.source;
      renderSourceFilters();
      renderPhases();
    }));
  }

  function matches(item) {
    const kind = itemKind(item);
    const done = state.done.has(item.id);
    if (state.type !== 'all' && state.type !== kind) return false;
    if (state.source !== 'all' && sourceKey(item) !== state.source) return false;
    if (state.instructor !== 'all' && item.instructor !== state.instructor) return false;
    if (state.status === 'todo' && done) return false;
    if (state.status === 'done' && !done) return false;
    if (state.status === 'required' && !item.required) return false;
    if (state.status === 'optional' && item.required) return false;
    if (state.hideDone && done) return false;
    if (state.query) {
      const q = state.query.toLocaleLowerCase('ar');
      const hay = [item.ar,item.title,item.course,item.instructor,item.sourceNo,item.desc,item.goal,item.profile].join(' ').toLocaleLowerCase('ar');
      if (!hay.includes(q)) return false;
    }
    return true;
  }

  function renderLesson(item) {
    const done = state.done.has(item.id);
    const kind = itemKind(item);
    const source = sourceKey(item);
    const idx = String(item.seq).padStart(3,'0');
    const label = kindLabel(item);
    return `<li class="stop ${kind} ${done?'done':''}" id="stop-${esc(item.id)}">
      <button class="dot" data-done="${esc(item.id)}" aria-pressed="${done}" aria-label="${done?'إلغاء إكمال الدرس':'تحديد الدرس كمكتمل'}">${done?'✓':''}</button>
      <div class="row">
        <div class="lesson-head">
          <span class="lesson-title">${esc(item.ar || item.title)}</span>
          <span class="source-tag ${sourceColors[source] || 'soc'}">${esc(courseLabel(item))}</span>
          <span class="lesson-no">${item.sourceNo ? `درس #${esc(item.sourceNo)}` : 'درس'}</span>
          <span class="priority-tag ${kind}">${label}</span>
          <span class="type-tag">${itemType(item)}</span>
        </div>
        <div class="english-title">${esc(item.title || '')}</div>
        <div class="lesson-meta-row">
          <span class="instructor">المحاضر: ${esc(item.instructor || 'تطبيق ذاتي')}</span>
          <span class="duration">${esc(durationLabel(item))}</span>
          <a class="watch-link" href="${esc(item.url || '#')}" target="_blank" rel="noopener noreferrer">${item.type === 'reading' ? 'افتح المرجع' : item.type === 'lab' ? 'افتح تعليمات اللاب' : 'افتح المحاضرة'} ↗</a>
        </div>
        ${(item.desc || item.goal || item.profile) ? `<details class="lesson-details"><summary>نبذة عن الدرس والتطبيق المطلوب</summary>${item.profile ? `<p><b>عن المحاضر / المصدر:</b> ${esc(item.profile)}</p>` : ''}${item.desc ? `<p><b>محتوى الدرس:</b> ${esc(item.desc)}</p>` : ''}${item.goal ? `<p><b>المطلوب بعد الدرس:</b> ${esc(item.goal)}</p>` : ''}</details>` : ''}
      </div>
    </li>`;
  }

  function renderPhases() {
    const visible = CURRICULUM.filter(matches);
    if (!visible.length) {
      $('phases').innerHTML = '<div class="empty">لا توجد دروس تطابق البحث أو عوامل التصفية. غيّر الاختيارات أو امسح البحث.</div>';
      return;
    }
    $('phases').innerHTML = PHASES.map((phase,i) => {
      const list = visible.filter(x => x.phase === phase.id).sort((a,b) => a.seq-b.seq);
      if (!list.length) return '';
      const p = progressForPhase(phase.id);
      const color = phaseColors[i % phaseColors.length];
      const totalItems = CURRICULUM.filter(x => x.phase === phase.id).length;
      return `<section class="phase" id="${esc(phase.id)}" style="--pc:${color}">
        <div class="ph"><h2>${i+1}. ${esc(phase.ar)}</h2><span>${esc(phase.goal)} · ${p.done}/${p.total} أساسي مكتمل</span></div>
        <div class="phase-desc">المدة المقترحة: ${esc(phase.estimate)} · ${totalItems} درسًا/خطوة ظاهرة في المرحلة</div>
        <div class="bar"><i style="width:${p.percent}%"></i></div>
        <ol class="stops">${list.map(renderLesson).join('')}</ol>
      </section>`;
    }).join('');
    $('phases').querySelectorAll('[data-done]').forEach(btn => btn.addEventListener('click', () => {
      const id = btn.dataset.done;
      if (state.done.has(id)) state.done.delete(id); else state.done.add(id);
      saveProgress();
      renderAll();
      showToast(state.done.has(id) ? 'تم تسجيل الدرس كمكتمل' : 'تم إلغاء علامة الإنجاز');
    }));
  }

  function renderSources() {
    const sources = [
      {key:'tanany',name:'محمد الطناني – TananyAcademy',role:'Linux Administration / Systems',bio:'المصدر الأساسي لإدارة Linux عمليًا على Debian وRocky Linux. نستخدم دروسه في المستخدمين والصلاحيات والخدمات والشبكات والسجلات وBash وإدارة الخوادم.',scope:'المسار الأساسي: 72 فيديو مرقّمًا، مع انتقاء ما يخدم SOC وتأجيل تعمّق التخزين والخدمات غير الضروري.',url:'https://www.youtube.com/playlist?list=PLsWFuR2EEv1uIV2vzqAhSa8gI6IG9dMpc'},
      {key:'abdallah',name:'عبدالله النعيمي – Abdallah Al-Nuaimy',role:'Linux Course in CyberSecurity',bio:'مصدر تكميلي من منظور الأمن السيبراني. ندمج محاضرات الشبكة والمنافذ والفحص ومراقبة النظام والسجلات واستكشاف الأعطال في مواضعها بعد أساسيات إدارة Linux.',scope:'قائمة من 28 فيديو؛ نستخدم الدروس المكملة فقط ولا نعيد دروس المقدمة والأوامر والصلاحيات.',url:'https://www.youtube.com/playlist?list=PLtlmgvQV7sDtKQUPF6i6rNA3mIiieeuWp'},
      {key:'security',name:'Security Jordan',role:'Bash Scripting · Linux for Cybersecurity · Blue Team/SOC',bio:'مصدر لإضافات Bash العملية ومعالجة النصوص باستخدام AWK وSED وCUT وTR، وتحديات Bandit ومقدمة Blue Team وSOC.',scope:'نشاهد الإضافات التي لا يكررها الطناني، لا الدورة كاملة من البداية.',url:'https://www.youtube.com/@securityjordan6081/playlists'},
      {key:'sahih',name:'قناة صحيح',role:'Ethical Hacking – مقاطع مختارة',bio:'نستفيد من أجزاء Nmap وMITM وARP/DNS Poisoning وWireshark لفهم الهجمات الشبكية ومؤشرات اكتشافها من منظور دفاعي.',scope:'فصول منتقاة فقط؛ لا ندرس Payloads وMeterpreter كجزء من مسار SOC L1.',url:'https://www.youtube.com/watch?v=qaNZKH5NohQ'},
      {key:'ahmed',name:'أحمد عيد – TechShots',role:'Windows Logging / Linux Fundamentals',bio:'مصدر تكميلي لأساسيات Windows Logs وActive Directory Monitoring. دورة Linux العامة مرجع لفهم نقطة غير واضحة، وليست مطلوبة كاملة بعد الطناني.',scope:'محاضرات Windows/SOC منتقاة؛ دورة Linux العامة للمراجعة فقط.',url:'https://www.youtube.com/watch?v=8f2Zsb89uoM'},
      {key:'boot2root',name:'Boot2Root',role:'SOC Fundamentals · SIEM · EDR',bio:'مصدر شروحات عملية لمفاهيم SIEM وSplunk وElastic وAlert Triage وEDR ضمن الانتقال إلى SOC.',scope:'نستخدم محاضرات SOC المضافة إلى المنهج.',url:'https://www.youtube.com/@Boot2Root'},
      {key:'soc',name:'المراجع الرسمية واللابات',role:'MITRE · Microsoft Learn · Wazuh · CISA · Sigma',bio:'المراجع الرسمية التي نستخدمها لتأكيد المفاهيم، والتدريب العملي، وربط السجلات بالتحقيقات والاستجابة.',scope:'قراءات قصيرة وتمارين تطبيقية ومشروع نهائي.',url:'https://attack.mitre.org/'}
    ];
    $('sourceCards').innerHTML = sources.map(s => `<article class="source-card"><span class="source-tag ${sourceColors[s.key] || 'soc'}">${esc(s.role)}</span><h3>${esc(s.name)}</h3><p>${esc(s.bio)}</p><small>${esc(s.scope)}</small><div class="source-bottom"><a href="${esc(s.url)}" target="_blank" rel="noopener">فتح المصدر ↗</a><button class="chip" data-source-jump="${s.key}">اعرض دروسه في المسار</button></div></article>`).join('');
    $('sourceCards').querySelectorAll('[data-source-jump]').forEach(btn => btn.addEventListener('click', () => {
      state.source = btn.dataset.sourceJump;
      state.tab = 'path';
      setTab('path');
      renderSourceFilters();
      renderPhases();
      $('view-path').scrollIntoView({behavior:'smooth',block:'start'});
    }));
    $('optionalResources').innerHTML = OPTIONAL_RESOURCES.map(r => `<article class="resource-card"><h4>${esc(r.title)}</h4><div class="resource-meta">${esc(r.instructor)} · ${esc(r.duration)} · ${esc(r.decision)}</div><p>${esc(r.reason)}</p><a href="${esc(r.url)}" target="_blank" rel="noopener">فتح المصدر ↗</a></article>`).join('');
  }

  function setTab(tab) {
    state.tab = tab;
    for (const name of ['path','sources','soc','guide']) {
      $(`view-${name}`).classList.toggle('hidden', name !== tab);
      const button = document.querySelector(`[data-tab="${name}"]`);
      if (button) button.setAttribute('aria-selected', String(name === tab));
    }
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function renderAll() {
    renderProgress();
    renderPhases();
  }

  $('tabs').addEventListener('click', e => {
    const btn = e.target.closest('[data-tab]');
    if (btn) setTab(btn.dataset.tab);
  });

  $('typeFilters').addEventListener('click', e => {
    const btn = e.target.closest('[data-value]');
    if (!btn) return;
    state.type = btn.dataset.value;
    $('typeFilters').querySelectorAll('[data-value]').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    renderPhases();
  });

  $('searchInput').addEventListener('input', e => { state.query = e.target.value.trim(); renderPhases(); });
  $('instructorFilter').addEventListener('change', e => { state.instructor = e.target.value; renderPhases(); });
  $('statusFilter').addEventListener('change', e => { state.status = e.target.value; renderPhases(); });
  $('hideDone').addEventListener('click', () => {
    state.hideDone = !state.hideDone;
    $('hideDone').setAttribute('aria-pressed', String(state.hideDone));
    $('hideDone').textContent = state.hideDone ? 'إظهار المكتمل' : 'إخفاء المكتمل';
    renderPhases();
  });

  $('nextBtn').addEventListener('click', () => {
    const next = requiredLessons.find(x => !state.done.has(x.id));
    if (!next) return;
    state.type = 'all'; state.source = 'all'; state.instructor = 'all'; state.status = 'all'; state.query = ''; state.hideDone = false;
    $('searchInput').value = '';
    $('instructorFilter').value = 'all';
    $('statusFilter').value = 'all';
    $('hideDone').setAttribute('aria-pressed','false'); $('hideDone').textContent = 'إخفاء المكتمل';
    $('typeFilters').querySelectorAll('[data-value]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.value === 'all')));
    renderSourceFilters();
    setTab('path');
    renderAll();
    const el = $(`stop-${next.id}`);
    if (el) {
      el.scrollIntoView({behavior:'smooth',block:'center'});
      el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
    }
  });

  $('exportBtn').addEventListener('click', () => {
    const payload = {version:2, exportedAt:new Date().toISOString(), done:[...state.done]};
    const blob = new Blob([JSON.stringify(payload,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='linux-to-soc-progress.json'; a.click(); URL.revokeObjectURL(url);
    showToast('تم تصدير تقدمك في ملف JSON');
  });

  $('importInput').addEventListener('change', async e => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const payload = JSON.parse(await file.text());
      if (!Array.isArray(payload.done)) throw new Error('invalid');
      state.done = new Set(payload.done.filter(id => CURRICULUM.some(x => x.id === id)));
      saveProgress(); renderAll(); showToast('تم استيراد التقدم بنجاح');
    } catch { showToast('ملف التقدم غير صالح'); }
    e.target.value = '';
  });

  $('resetBtn').addEventListener('click', () => {
    if (!confirm('هل تريد حذف جميع علامات الإنجاز من هذا المتصفح؟ يمكنك تصدير التقدم أولًا.')) return;
    state.done.clear(); saveProgress(); renderAll(); showToast('تمت إعادة ضبط التقدم');
  });

  loadProgress();
  renderInstructorFilter();
  renderSourceFilters();
  renderSources();
  renderAll();
})();
