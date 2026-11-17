(() => {
  const STORAGE_KEY = 'linux-to-soc-roadmap-v1';
  const state = { done: new Set(), activePhase: 'all', status: 'all', instructor: 'all', query: '' };
  const $ = (id) => document.getElementById(id);
  const load = () => {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) state.done = new Set(JSON.parse(raw)); }
    catch { state.done = new Set(); }
  };
  const save = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.done])); } catch {} };
  const esc = (v='') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const phaseMap = new Map(PHASES.map(p => [p.id,p]));
  const requiredLessons = CURRICULUM.filter(x => x.required);
  const pct = (n,d) => d ? Math.round(n/d*100) : 0;
  const showToast = (message) => { const t=$('toast'); t.textContent=message; t.classList.add('show'); clearTimeout(showToast.timer); showToast.timer=setTimeout(()=>t.classList.remove('show'),2600); };
  const progressFor = (phaseId) => { const a=CURRICULUM.filter(x=>x.phase===phaseId && x.required); const n=a.filter(x=>state.done.has(x.id)).length; return {n,total:a.length,p:pct(n,a.length)}; };

  function renderNav(){
    $('phaseNav').innerHTML = PHASES.map((p,i)=>{const pr=progressFor(p.id);return `<button class="nav-item ${state.activePhase===p.id?'active':''}" data-phase="${p.id}"><span class="nav-num">${String(i+1).padStart(2,'0')}</span><span class="nav-label">${esc(p.ar)}</span><small>${pr.n}/${pr.total}</small></button>`}).join('');
    $('phaseNav').querySelectorAll('[data-phase]').forEach(btn=>btn.addEventListener('click',()=>{state.activePhase=btn.dataset.phase;render();$('sidebar').classList.remove('open');document.getElementById(btn.dataset.phase)?.scrollIntoView({behavior:'smooth',block:'start'});}));
  }
  function renderStats(){
    const total=requiredLessons.length,done=requiredLessons.filter(x=>state.done.has(x.id)).length,p=pct(done,total);
    $('totalLessons').textContent=total;$('completedLessons').textContent=done;$('remainingLessons').textContent=`باقي ${total-done} خطوة`;
    $('mainPercent').textContent=p+'%';$('sidePercent').textContent=p+'%';$('completeCount').textContent=`${done} / ${total}`;$('sideCount').textContent=`${done} من ${total} درس مكتمل`;
    $('mainBar').style.width=p+'%';$('sideBar').style.width=p+'%';
    $('progressMessage').textContent=p===100?'اكتمل المسار! راجع مشروعك النهائي واحتفظ بالأدلة.':p>0?'استمر بنفس التسلسل، وطبّق قبل الانتقال للخطوة التالية.':'ابدأ بأول درس في المسار';
    const next=requiredLessons.find(x=>!state.done.has(x.id));
    $('nextUp').innerHTML=next?`<span class="next-label">الخطوة التالية · ${esc(next.sourceNo)}</span><strong>${esc(next.ar||next.title)}</strong><small>${esc(next.instructor)} · ${esc(next.duration==='غير مسجلة'?(next.studyTime||'تطبيق عملي'):next.duration)}</small>`:`<span class="next-label">مبروك</span><strong>اكتمل المسار الأساسي</strong><small>راجع المشروع الختامي وحدّث ملف أعمالك</small>`;
  }
  function renderFilters(){
    const names=[...new Set(CURRICULUM.map(x=>x.instructor))].sort((a,b)=>a.localeCompare(b,'ar'));
    const sel=$('instructorFilter'); const current=state.instructor;
    sel.innerHTML='<option value="all">كل المحاضرين</option>'+names.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join(''); sel.value=current;
  }
  function matches(item){
    if(state.activePhase!=='all' && item.phase!==state.activePhase) return false;
    const isDone=state.done.has(item.id);
    if(state.status==='todo'&&isDone) return false;
    if(state.status==='done'&&!isDone) return false;
    if(state.status==='required'&&!item.required) return false;
    if(state.status==='optional'&&item.required) return false;
    if(state.instructor!=='all'&&item.instructor!==state.instructor) return false;
    if(state.query){const hay=[item.title,item.ar,item.course,item.instructor,item.sourceNo,item.desc,item.goal].join(' ').toLowerCase();if(!hay.includes(state.query.toLowerCase()))return false;}
    return true;
  }
  function lessonCard(x){
    const done=state.done.has(x.id), optional=!x.required;
    const durationLabel = (x.duration==='غير موثقة'||x.duration==='افتح المصدر للتحقق'||x.duration==='غير مسجلة') ? `وقت مقترح: ${x.studyTime||x.duration}` : (x.duration||'—');
    const idx=String(x.seq).padStart(3,'0');
    return `<article class="lesson-card ${done?'is-done':''}" id="lesson-${x.id}">
      <div class="lesson-index">${idx}</div>
      <div class="lesson-main">
        <div class="lesson-meta"><span class="source-tag">${esc(x.course)} · ${esc(x.sourceNo)}</span><span class="priority-tag ${optional?'optional':''}">${optional?'اختياري / مراجعة':'مطلوب'}</span><span class="type-tag ${x.type==='lab'?'lab':''}">${x.type==='video'?'فيديو':x.type==='reading'?'قراءة':'لاب عملي'}</span></div>
        <h4 class="lesson-title">${esc(x.ar||x.title)}</h4><div class="lesson-subtitle">${esc(x.title)}</div>
        <div class="instructor-line"><b>المحاضر: ${esc(x.instructor)}</b><span>${esc(x.profile||'')}</span></div>
        <p class="lesson-desc">${esc(x.desc||'')}</p><p class="lesson-goal"><b>ناتج الدرس:</b> ${esc(x.goal||'')}</p>
      </div>
      <div class="lesson-side"><span class="duration">${esc(durationLabel)}</span><div class="lesson-actions"><a class="watch-link" href="${esc(x.url)}" target="_blank" rel="noopener">${x.type==='reading'?'افتح المرجع':'افتح الدرس'} ↗</a><label class="done-label"><input type="checkbox" data-done="${x.id}" ${done?'checked':''}><span>${done?'مكتمل':'أنجزت'}</span></label></div></div>
    </article>`;
  }
  function renderCurriculum(){
    const visible=CURRICULUM.filter(matches);
    $('phaseSummary').innerHTML='<button class="phase-chip '+(state.activePhase==='all'?'active':'')+'" data-phase-chip="all">كل المراحل</button>'+PHASES.map(p=>{const pr=progressFor(p.id);return `<button class="phase-chip ${state.activePhase===p.id?'active':''}" data-phase-chip="${p.id}">${esc(p.ar)} <span class="chip-count">${pr.n}/${pr.total}</span></button>`}).join('');
    $('phaseSummary').querySelectorAll('[data-phase-chip]').forEach(b=>b.addEventListener('click',()=>{state.activePhase=b.dataset.phaseChip;renderCurriculum();renderNav();}));
    if(!visible.length){$('lessonList').innerHTML='<div class="empty-state">لا توجد دروس تطابق البحث أو عوامل التصفية.</div>';return;}
    const activePhases=state.activePhase==='all'?PHASES:PHASES.filter(p=>p.id===state.activePhase);
    $('lessonList').innerHTML=activePhases.map((p,i)=>{
      const list=visible.filter(x=>x.phase===p.id); if(!list.length)return '';
      const pr=progressFor(p.id);
      return `<section class="phase-block" id="${p.id}"><header class="phase-header"><div class="phase-heading"><span class="phase-index">${String(PHASES.indexOf(p)+1).padStart(2,'0')}</span><div><h3>${esc(p.ar)}</h3><p>${esc(p.goal)}</p></div></div><span class="phase-estimate">${esc(p.estimate)} · ${pr.n}/${pr.total} مكتمل</span></header><div class="phase-note">${esc(p.note)}</div>${list.map(lessonCard).join('')}</section>`;
    }).join('');
    $('lessonList').querySelectorAll('[data-done]').forEach(input=>input.addEventListener('change',()=>{if(input.checked)state.done.add(input.dataset.done);else state.done.delete(input.dataset.done);save();render();showToast(input.checked?'تم تسجيل الدرس كمكتمل':'تم إلغاء علامة الإنجاز');}));
  }
  function renderResources(){ $('resourcesList').innerHTML=OPTIONAL_RESOURCES.map(r=>`<article class="resource-card"><h4>${esc(r.title)}</h4><div class="resource-meta">${esc(r.instructor)} · ${esc(r.duration)} · ${esc(r.decision)}</div><p>${esc(r.reason)}</p><a href="${esc(r.url)}" target="_blank" rel="noopener">فتح المصدر ↗</a></article>`).join(''); }
  function render(){renderNav();renderStats();renderCurriculum();}
  $('searchInput').addEventListener('input',e=>{state.query=e.target.value.trim();renderCurriculum();});
  $('statusFilter').addEventListener('change',e=>{state.status=e.target.value;renderCurriculum();});
  $('instructorFilter').addEventListener('change',e=>{state.instructor=e.target.value;renderCurriculum();});
  $('toggleResources').addEventListener('click',()=>{$('resourcesList').classList.toggle('hidden');$('toggleResources').textContent=$('resourcesList').classList.contains('hidden')?'عرض المصادر':'إخفاء المصادر';});
  $('exportBtn').addEventListener('click',()=>{const payload={version:1,exportedAt:new Date().toISOString(),done:[...state.done]};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='linux-to-soc-progress.json';a.click();URL.revokeObjectURL(a.href);showToast('تم تصدير ملف التقدم');});
  $('importInput').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{const data=JSON.parse(await f.text());if(!Array.isArray(data.done))throw new Error('invalid');state.done=new Set(data.done.filter(id=>CURRICULUM.some(x=>x.id===id)));save();render();showToast('تم استيراد التقدم بنجاح');}catch{showToast('ملف التقدم غير صالح');}e.target.value='';});
  $('resetBtn').addEventListener('click',()=>{if(confirm('هل تريد حذف جميع علامات الإنجاز من هذا المتصفح؟ يمكنك تصدير تقدمك أولًا.')){state.done.clear();save();render();showToast('تمت إعادة ضبط التقدم');}});
  $('menuBtn').addEventListener('click',()=>$('sidebar').classList.toggle('open'));
  load();renderFilters();renderResources();render();
})();
