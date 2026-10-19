'use strict';
const $=s=>document.querySelector(s),esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ar=Object.fromEntries(`Overview|نظرة عامة
Conversations|المحادثات
Agent analytics|أداء الموظفين
Review queue|قائمة المراجعة
Evaluation rules|قواعد التقييم
Settings|الإعدادات
Admin workspace|مساحة الإدارة
WORKSPACE|مساحة العمل
Private workspace|مساحة خاصة
Administrator|مسؤول
Sign out|تسجيل الخروج
Language|اللغة
Search|بحث
Search conversations|بحث في المحادثات
Your team, at a glance.|فريقك، بنظرة واحدة.
Understand the work. Recognize good service. Review what needs attention.|افهم الشغل، قدّر الخدمة الجيدة، وراجع ما يحتاج متابعة.
Live Chatwoot data|بيانات حقيقية من Chatwoot
AI not configured|الذكاء الاصطناعي غير مُعدّ
AI configured|الذكاء الاصطناعي مُعدّ
Last 7 days|آخر ٧ أيام
Last 30 days|آخر ٣٠ يومًا
Last 90 days|آخر ٩٠ يومًا
Export CSV|تصدير CSV
Resolved conversations|المحادثات المحلولة
Open conversations|المحادثات المفتوحة
Human agents|الموظفون البشريون
AI evaluations|تقييمات الذكاء الاصطناعي
Resolution transitions|انتقالات إغلاق المحادثات
Currently resolved, grouped by latest status transition|مغلقة حاليًا حسب آخر وقت لتغيير الحالة
Current workload|ضغط العمل الحالي
Open conversations observed now|المحادثات المفتوحة المرصودة حاليًا
Agent activity|نشاط الموظفين
Bot ID 2 is excluded|البوت صاحب المعرّف ٢ مستبعد
View all agents|عرض كل الموظفين
Agent|الموظف
Current owner|الإسناد الحالي
Replied in|محادثات رد فيها
Quality|الجودة
Unavailable|غير متاح
No AI evaluation yet|لا يوجد تقييم بالذكاء الاصطناعي بعد
Historical workload starts with this service; earlier pressure is unknown.|يبدأ تسجيل ضغط العمل من تشغيل الخدمة؛ الضغط السابق غير معروف.
Current assignee does not establish who resolved the conversation.|الإسناد الحالي لا يثبت من أغلق المحادثة.
Workload collection started|بدء تسجيل ضغط العمل
All agents|كل الموظفين
All labels|كل التصنيفات
Reset|إعادة ضبط
Customer|العميل
Labels|التصنيفات
Review|المراجعة
Previous|السابق
Next|التالي
of|من
No records found.|لا توجد نتائج.
Search ID, name, or phone|ابحث بالرقم أو الاسم أو الهاتف
Unassigned|غير مسندة
View conversations|عرض المحادثات
Inbox 11 at capacity|وصل لسقف الصندوق ١١
Observed open load|حمل المحادثات المفتوحة المرصود
Conversation review|مراجعة المحادثة
Assessment|التقييم
Conversation|المحادثة
Media evidence|أدلة الوسائط
Admin feedback|ملاحظات الإدارة
Close|إغلاق
Open full conversation in Chatwoot|فتح المحادثة كاملة في Chatwoot
Resolved|مغلقة
Queue evaluation|طلب تقييم
Waiting for the Groq key.|في انتظار مفتاح Groq.
Evaluation queued.|تم إدراج طلب التقييم.
No score or finding is assumed before evaluation.|لا نفترض درجات أو أخطاء قبل تنفيذ التقييم.
Original AI evaluation|التقييم الأصلي للذكاء الاصطناعي
Private note|ملاحظة داخلية
System|النظام
AI bot · Bakr|البوت · حساب بكر
Only the latest 500 messages are shown.|تظهر أحدث ٥٠٠ رسالة فقط.
Saved observations have provisional attachment identity.|هوية المرفق في التحليلات المحفوظة مبدئية.
No saved analysis for these messages. Attachments may still exist in Chatwoot.|لا يوجد تحليل محفوظ لهذه الرسائل. قد توجد مرفقات في Chatwoot.
Internal feedback. Nothing is sent to the customer.|ملاحظات داخلية. لا يُرسل شيء للعميل.
Explain a correction or add a missed issue…|اشرح التصحيح أو أضف مشكلة لم تُرصد…
Comment|تعليق
Confirm finding|تأكيد الملاحظة
Reject finding|رفض الملاحظة
Add missed issue|إضافة مشكلة لم تُرصد
Request review|طلب مراجعة
Save|حفظ
Saved on the server.|تم الحفظ على السيرفر.
No admin feedback yet.|لا توجد ملاحظات إدارية بعد.
Evaluation jobs|طلبات التقييم
Status|الحالة
Attempts|المحاولات
AI is off until the Groq key is configured. Jobs can still be queued.|التقييم متوقف حتى إضافة مفتاح Groq. يمكنك إدراج الطلبات.
New rule|قاعدة جديدة
Title|العنوان
Rule details|تفاصيل القاعدة
Draft|مسودة
Active|مفعّلة
Archived|مؤرشفة
Activate|تفعيل
Archive|أرشفة
Version|الإصدار
History / restore|الإصدارات والاسترجاع
Restore as draft|استرجاع كمسودة
No previous versions.|لا توجد إصدارات سابقة.
Rule saved with history.|حُفظت القاعدة مع سجل الإصدارات.
Chatwoot|Chatwoot
Connected|متصل
Authentication|تسجيل الدخول
Groq model|نموذج Groq
Evidence retention|الاحتفاظ بالأدلة
30 days|٣٠ يومًا
Private server storage|تخزين خاص على السيرفر
Admin activity|نشاط الإدارة
Sign in to Azazy|تسجيل الدخول للعزازي
Use your Chatwoot administrator credentials. Your password is checked by Chatwoot and is not stored here.|استخدم بيانات مسؤول Chatwoot. يتحقق Chatwoot من كلمة المرور ولا نحتفظ بها هنا.
Email|البريد الإلكتروني
Password|كلمة المرور
Sign in|دخول
Use a Chatwoot API token instead|استخدام مفتاح Chatwoot بدلًا من كلمة المرور
Use email and password|استخدام البريد وكلمة المرور
Chatwoot API token|مفتاح API الخاص بـ Chatwoot
Verification code|رمز التحقق
Verify|تحقق
Loading…|جارٍ التحميل…
Refresh|تحديث
Sign-in failed. Check your credentials.|تعذر الدخول. تحقق من بياناتك.
Administrators of account 2 only.|الدخول لمسؤولي الحساب رقم ٢ فقط.
Your session expired. Sign in again.|انتهت الجلسة. سجّل الدخول مجددًا.
Too many attempts. Wait 15 minutes.|محاولات كثيرة. انتظر ١٥ دقيقة.
Something went wrong. Please retry.|حدث خطأ. حاول مرة أخرى.
Exported current page.|تم تصدير الصفحة الحالية.
Times shown in Cairo|التوقيت المعروض: القاهرة
Attachments could not be loaded. Open Chatwoot to view them.|تعذر تحميل المرفقات. افتح Chatwoot لعرضها.
Attachment unavailable|المرفق غير متاح
Data refresh|تحديث البيانات
Every 30 minutes|كل ٣٠ دقيقة
Chatwoot data · 30-minute refresh|بيانات Chatwoot · تحديث كل ٣٠ دقيقة
AI issues|أخطاء الذكاء الاصطناعي
AI replies|ردود الذكاء الاصطناعي
Human agents|الموظفون
Whole conversation|المحادثة كاملة
Feedback target|الملاحظات تخص
AI answer review is separate from human scores.|تقييم ردود الذكاء الاصطناعي منفصل عن درجات الموظفين.
No AI review yet. Configure Groq and run an evaluation.|لا يوجد تقييم للذكاء الاصطناعي بعد. أضف مفتاح Groq ثم اطلب التقييم.
No AI replies in the available transcript.|لا توجد ردود للذكاء الاصطناعي في المحادثة المتاحة.
AI messages|رسائل الذكاء الاصطناعي
Improvement suggestions|اقتراحات التحسين
Strengths|نقاط القوة
Limitations|حدود التقييم
No supported AI issues reported.|لم يرصد التقييم أخطاء مدعومة بأدلة للذكاء الاصطناعي.
AI improvement|تحسين الذكاء الاصطناعي
Learning examples|أمثلة التعلّم
Responsibility|المسؤولية
Waiting and workload|الانتظار وضغط العمل
Only evaluated conversations are counted. Trends do not prove a fix caused improvement.|نحسب المحادثات المقيّمة فقط. الاتجاهات لا تثبت أن التحسين سبّب النتيجة.
Reviewed AI conversations|محادثات الذكاء الاصطناعي المقيّمة
Conversations with AI issues|محادثات بها أخطاء للذكاء الاصطناعي
AI issue rate|نسبة محادثات الأخطاء
Recurring AI issues|أخطاء الذكاء الاصطناعي المتكررة
Weekly AI trends|الاتجاهات الأسبوعية
Week|الأسبوع
Recent AI issues|أحدث أخطاء الذكاء الاصطناعي
AI improvement milestones|محطات التحسين
Approved examples are used in later reviews. Production bot changes are not automatic.|الأمثلة المعتمدة تُستخدم في التقييمات اللاحقة. لا نغيّر بوت الإنتاج تلقائيًا.
No evaluated AI issues yet.|لا توجد أخطاء مقيّمة بعد.
Promote a correction from Review queue, edit it, then activate it. Only active examples guide future reviews.|حوّل تصحيحًا من قائمة المراجعة إلى مثال، عدّله ثم فعّله. الأمثلة النشطة فقط تُستخدم لاحقًا.
Example details|تفاصيل المثال
No approved examples yet.|لا توجد أمثلة معتمدة بعد.
Create learning draft|إنشاء مثال كمسودة
Learning draft created.|تم إنشاء مسودة المثال.
Last human reply|آخر رد بشري
Previous observed assignee|الموظف المكلّف السابق المرصود
Resolver evidence|دليل إغلاق المحادثة
Unknown|غير معروف
Evidence|الدليل
Name matches are activity evidence, not a verified actor ID. Unknown responsibility is never assigned by assumption.|تطابق الاسم دليل من سجل النشاط وليس معرّف منفّذ موثّق. لا نفترض مسؤولية مجهولة.
Human participants|الموظفون المشاركون
Replies in available transcript|ردود في السجل المتاح
Seen information|معلومات المشاهدة
Assignee last seen|آخر مشاهدة للمكلّف
Any agent last seen|آخر مشاهدة لأي موظف
Seen timestamps do not identify the person who viewed a conversation.|توقيت المشاهدة لا يحدّد هوية من شاهد المحادثة.
30-minute snapshots cannot prove continuous overload. Waits may include the AI phase; no timing penalty is applied.|عينات كل ٣٠ دقيقة لا تثبت ضغطًا مستمرًا. الانتظار قد يشمل مرحلة الذكاء الاصطناعي، ولا تُخصم درجات للتوقيت.
Customer wait|انتظار العميل
Human reply|الرد البشري
Coverage|التغطية
minutes|دقائق
Snapshot only|عينة فقط
No measurable human reply intervals in the available transcript.|لا توجد فترات انتظار قابلة للقياس في السجل المتاح.
Evidence is outside the available transcript.|الدليل خارج السجل المتاح.
current_assignment|التكليف الحالي
public_reply|رد علني
activity_name_match|تطابق اسم في سجل النشاط
activity_actor_unknown|منفّذ النشاط غير معروف
observed_snapshot|عينة مرصودة
Coverage and backups|التغطية والنسخ الاحتياطية
Last workload sample|آخر عينة لضغط العمل
Detected sampling gaps|فجوات العينات المرصودة
Encrypted backups|نسخ احتياطية مشفّرة
Daily backup, last 7 copies. Sessions are excluded.|نسخ يومية مع الاحتفاظ بآخر ٧ نسخ. جلسات الدخول غير مشمولة.
Backups are on this server. Keep a separate copy of backup.key and backup archives for server-loss recovery.|النسخ على هذا الخادم. احتفظ بمفتاح النسخ ونسخ الأرشيف منفصلًا للتعافي عند فقدان الخادم.
Create and verify backup|إنشاء نسخة والتحقّق منها
Backup created and restore integrity verified.|تم النسخ والتحقّق من سلامة الاستعادة.
low|منخفض
medium|متوسط
high|عالٍ
incorrect_information|معلومات غير صحيحة
unsupported_claim|ادّعاء غير مدعوم
missed_requirement|متطلب فائت
context_loss|فقدان السياق
media_misunderstanding|سوء فهم الوسائط
payment_handling|معالجة الدفع
handoff|التسليم للفريق
repetition|التكرار
tone|أسلوب الرد
other|أخرى
Evaluated conversations|محادثات مقيّمة
A learning draft already exists for this feedback.|توجد مسودة مثال لهذا التصحيح بالفعل.
Bot change log|سجل تغييرات البوت
Log a change already applied to your bot. This does not change the bot.|سجّل تعديلًا نُفّذ بالفعل على البوت. التسجيل هنا لا يغيّر البوت.
Change title|عنوان التعديل
Issue category|نوع الخطأ
Applied at (your local time)|وقت التنفيذ بتوقيت جهازك
Change details|تفاصيل التعديل
Log change|تسجيل التعديل
Compares 14 days before and after. At least 5 assessed conversations per period are needed; this is not proof of causation.|مقارنة ١٤ يومًا قبل وبعد. نحتاج ٥ محادثات مقيّمة لكل فترة على الأقل؛ المقارنة لا تثبت السببية.
Before|قبل
After|بعد
Descriptive comparison|مقارنة وصفية
Insufficient samples|عينات غير كافية
No bot changes logged yet.|لا توجد تغييرات مسجلة بعد.
all|كل الأنواع
Last known assignment|آخر تكليف معروف
Current assignment|التكليف الحالي
Public reply|رد علني
Name matched in activity log|اسم مطابق في سجل النشاط
Unknown activity actor|منفّذ النشاط غير معروف
Observed snapshot|عينة مرصودة
Saved media evidence is temporarily unavailable.|تحليلات الوسائط المحفوظة غير متاحة مؤقتًا.
Evidence last synced|آخر مزامنة لتحليلات الوسائط
online|متصل
offline|غير متصل
busy|مشغول
Back to sign in|العودة لتسجيل الدخول
Chatwoot connection is read-only|اتصال Chatwoot للقراءة فقط`.split('\n').map(line=>line.split('|')));
let lang=localStorage.getItem('azazy-language')||'en',user=null,csrf='',route='overview',days=30,page=1,search='',agent='',label='',current=null,tab='Assessment',mfa=null,loading=false,previousFocus=null,currentRows=[],openRequest=0;
const t=s=>lang==='ar'?(ar[s]||s):s,num=n=>Number(n||0).toLocaleString(lang==='ar'?'ar-EG':'en-US'),date=x=>x?new Date(x).toLocaleString(lang==='ar'?'ar-EG':'en-GB',{timeZone:'Africa/Cairo',dateStyle:'short',timeStyle:'short'}):t('Unavailable');
const badge=(s,kind='gray')=>`<span class="badge ${kind}">${esc(s)}</span>`,empty=(s='No records found.')=>`<div class="empty">${esc(t(s))}</div>`;
function toast(s){$('#toast').textContent=s;$('#toast').classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('visible'),3500)}
function errorText(e){return t(({CHATWOOT_AUTH_FAILED:'Sign-in failed. Check your credentials.',ADMIN_ONLY:'Administrators of account 2 only.',LOGIN_REQUIRED:'Your session expired. Sign in again.',SESSION_EXPIRED:'Your session expired. Sign in again.',LOGIN_RATE_LIMIT:'Too many attempts. Wait 15 minutes.',EXAMPLE_EXISTS:'A learning draft already exists for this feedback.'})[e.message]||'Something went wrong. Please retry.')}
async function api(url,data){const r=await fetch(url,{credentials:'same-origin',method:data?'POST':'GET',headers:data?{'Content-Type':'application/json','X-CSRF-Token':csrf}:{},body:data?JSON.stringify(data):undefined});const result=await r.json();if(!r.ok){if(r.status===401&&user){user=null;csrf='';closeDrawer();login()}throw Error(result.error||'SERVICE_ERROR')}return result}
function languageSelect(){return `<select id="language-select" class="language-select" aria-label="${t('Language')}"><option value="en" ${lang==='en'?'selected':''}>English</option><option value="ar" ${lang==='ar'?'selected':''}>العربية</option></select>`}
function language(value){lang=value;localStorage.setItem('azazy-language',lang);document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';if(user){shell();render();if(current)drawDrawer()}else login()}
function login(){document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';$('.sidebar').hidden=true;$('.shell').hidden=true;$('#login-screen').hidden=false;$('#login-screen').innerHTML=`<div class="login-card"><div class="login-top"><span class="brand-mark">a.</span>${languageSelect()}</div><div class="eyebrow">AZAZY INTELLIGENCE</div><h1>${t('Sign in to Azazy')}</h1><p>${t('Use your Chatwoot administrator credentials. Your password is checked by Chatwoot and is not stored here.')}</p><form id="login-form">${mfa?`<label>${t('Verification code')}<input id="otp" autocomplete="one-time-code" inputmode="numeric" required></label>`:`<label>${t('Email')}<input id="email" type="email" autocomplete="username" required></label><label>${t('Password')}<input id="password" type="password" autocomplete="current-password" required></label>`}<div id="login-error" role="alert"></div><button class="button dark" id="sign-in">${t(mfa?'Verify':'Sign in')}</button></form>${mfa?`<button class="text-link" id="login-back">${t('Back to sign in')}</button>`:''}</div>`;if($('#login-back'))$('#login-back').onclick=()=>{mfa=null;login()};$('#language-select').onchange=e=>language(e.target.value);$('#login-form').onsubmit=async e=>{e.preventDefault();$('#sign-in').disabled=true;try{const data=await api('/api/login',mfa?{mfa_token:mfa,otp_code:$('#otp').value}:{email:$('#email').value,password:$('#password').value});if(data.mfa_required){mfa=data.mfa_token;login();return}user=data.user;csrf=data.csrf;mfa=null;shell();render()}catch(e){$('#login-error').textContent=errorText(e);$('#sign-in').disabled=false}}}
const routes={overview:'Overview',conversations:'Conversations',agents:'Agent analytics',reviews:'Review queue',ai_insights:'AI improvement',learning:'Learning examples',rules:'Evaluation rules',settings:'Settings'},glyph={overview:'▦',conversations:'☷',agents:'♙',reviews:'✓',ai_insights:'◇',learning:'◈',rules:'≡',settings:'⚙'};
function shell(){$('.sidebar').hidden=false;$('.shell').hidden=false;$('#login-screen').hidden=true;$('.brand-sub').textContent=lang==='ar'?'متابعة جودة الفريق':'AGENT INTELLIGENCE';$('.workspace div').innerHTML='El Azazy<span>'+t('Admin workspace')+'</span>';$('.nav-caption').textContent=t('WORKSPACE');$('.private').innerHTML=`<span class="status-dot"></span>${t('Private workspace')}<span>${t('Administrators of account 2 only.')}</span>`;$('#profile').innerHTML=`<span class="avatar">${esc(user.name.slice(0,2))}</span><span>${esc(user.name)}<small>${t('Administrator')}</small></span>`;$('.top-actions').innerHTML=`<button class="search-trigger" id="search-trigger">⌕ ${t('Search conversations')} <kbd>Ctrl K</kbd></button>${languageSelect()}<button class="button" id="logout">${t('Sign out')}</button>`;$('#language-select').onchange=e=>language(e.target.value);$('#logout').onclick=async()=>{try{await api('/api/logout',{});user=null;csrf='';closeDrawer();login()}catch(e){toast(errorText(e))}};$('#search-trigger').onclick=()=>{location.hash='conversations';setTimeout(()=>$('#conversation-search')?.focus(),120)};$('#profile').onclick=()=>location.hash='settings';$('#export-button').textContent='↗ '+t('Export CSV');$('#period').innerHTML=[7,30,90].map(d=>`<option value="${d}" ${d===days?'selected':''}>${t('Last '+d+' days')}</option>`).join('');$('footer').innerHTML=`Azazy Intelligence <span>${t('Times shown in Cairo')} · ${t('Chatwoot connection is read-only')}</span>`}
const person=name=>`<div class="person"><span class="avatar">${esc(String(name||'?').split(' ').slice(0,2).map(s=>s[0]).join(''))}</span><b>${esc(name||t('Unassigned'))}</b></div>`;
async function render(){if(!user)return;if(loading){render.pending=true;return}loading=true;route=Object.hasOwn(routes,location.hash.slice(1))?location.hash.slice(1):'overview';$('#nav').innerHTML=Object.entries(routes).map(([k,v])=>`<a class="nav-link ${k===route?'active':''}" href="#${k}" ${k===route?'aria-current="page"':''}><span class="nav-icon">${glyph[k]}</span>${t(v)}</a>`).join('');$('#breadcrumb').textContent=t('Admin workspace')+' / '+t(routes[route]);$('#eyebrow').textContent='AZAZY INTELLIGENCE';$('#page-title').textContent=t(route==='overview'?'Your team, at a glance.':routes[route]);$('#page-subtitle').textContent=t('Understand the work. Recognize good service. Review what needs attention.');$('#period').hidden=!['overview','conversations','agents','ai_insights'].includes(route);$('#export-button').hidden=!['agents','conversations'].includes(route);$('#content').innerHTML=empty('Loading…');$('.sidebar').classList.remove('open');try{const s=await api('/api/settings');$('.preview-banner').innerHTML=`<span><span class="status-dot"></span>${t('Chatwoot data · 30-minute refresh')}</span><span>${t(s.groq_configured?'AI configured':'AI not configured')}</span>`;await ({overview,conversations,agents,reviews,ai_insights:aiInsights,learning,rules,settings:()=>settings(s)})[route]();bindRows()}catch(e){$('#content').innerHTML=`<div class="notice" role="alert">${esc(errorText(e))} <button class="button" id="retry">${t('Refresh')}</button></div>`;$('#retry').onclick=render}finally{loading=false;if(render.pending){render.pending=false;render()}}}
function agentTable(rows){return `<div class="table-wrap"><table><thead><tr>${['Agent','Current owner','Replied in','Open conversations','Quality'].map(s=>`<th>${t(s)}</th>`).join('')}</tr></thead><tbody>${rows.map(a=>`<tr data-agent="${a.id}" tabindex="0"><td>${person(a.name)}</td><td>${num(a.resolved_owned)}</td><td>${num(a.participated)}</td><td>${num(a.open_count)}</td><td>${a.quality===null?'—':num(a.quality)}</td></tr>`).join('')}</tbody></table></div>`}
async function overview(){const s=await api('/api/summary?days='+days),max=Math.max(1,...s.daily.map(d=>d.count)),points=s.daily.map((d,i)=>`${30+i*660/Math.max(1,s.daily.length-1)},${160-d.count/max*130}`).join(' ');const maxLoad=Math.max(1,...s.agents.map(a=>a.open_count));$('#content').innerHTML=`<section class="stats">${[['Resolved conversations',s.resolved],['Open conversations',s.open],['Human agents',s.agents.length],['AI evaluations',s.evaluated]].map((m,i)=>`<article class="stat ${i===0?'dark':''}"><div class="stat-top"><span class="stat-icon">${['▤','☷','♙','◎'][i]}</span>${t(m[0])}</div><div class="stat-value">${num(m[1])}</div><div class="stat-foot">${t(i===3?'No AI evaluation yet':'Live Chatwoot data')}</div></article>`).join('')}</section><section class="chart-row"><article class="panel"><div class="panel-header"><div><h2>${t('Resolution transitions')}</h2><p>${t('Currently resolved, grouped by latest status transition')}</p></div>${badge(t('Last '+days+' days'))}</div><div class="chart"><svg viewBox="0 0 700 185" role="img" aria-label="${t('Resolution transitions')}"><g class="chart-grid">${[30,75,120,165].map(y=>`<line x1="30" x2="695" y1="${y}" y2="${y}"/>`).join('')}</g><polyline points="${points}" fill="none" stroke="#48544e" stroke-width="2"/></svg><div class="chart-labels"><span>${esc(s.daily[0]?.day||'—')}</span><span>${esc(s.daily.at(-1)?.day||'—')}</span></div></div></article><article class="panel"><h2>${t('Current workload')}</h2><p>${t('Open conversations observed now')}</p>${s.agents.filter(a=>a.open_count).sort((a,b)=>b.open_count-a.open_count).slice(0,5).map(a=>`<div class="workload-row"><div><span>${esc(a.name)}</span><b>${num(a.open_count)}</b></div><div class="workload-track"><i style="width:${100*a.open_count/maxLoad}%"></i></div></div>`).join('')||empty()}</article></section><section class="lower-row"><article class="panel"><div class="panel-header"><div><h2>${t('Agent activity')}</h2><p>${t('Bot ID 2 is excluded')}</p></div><a class="text-link" href="#agents">${t('View all agents')} ↗</a></div>${agentTable(s.agents.slice(0,8))}</article><article class="panel"><h2>${t('Workload collection started')}</h2><p style="margin:16px 0">${date(s.workload_started)}</p><div class="notice">${t('Historical workload starts with this service; earlier pressure is unknown.')}</div><p>${t('Current assignee does not establish who resolved the conversation.')}</p></article></section>`}
async function agents(){const a=await api('/api/agents?days='+days),w=await api('/api/workloads');$('#content').innerHTML=`<div class="notice">${t('Current assignee does not establish who resolved the conversation.')} ${t('Historical workload starts with this service; earlier pressure is unknown.')}</div><div class="agents-grid">${a.rows.map(x=>{const load=w.rows.find(r=>Number(r.agent_id)===Number(x.id)&&Number(r.inbox_id)===11&&Date.now()-new Date(r.observed_at).getTime()<=35*60000);return `<article class="panel agent-card">${person(x.name)}<div class="agent-metrics">${[['Quality',x.quality===null?'—':x.quality],['Current owner',x.resolved_owned],['Replied in',x.participated],['Open conversations',x.open_count]].map(m=>`<div><b>${m[1]==='—'?'—':num(m[1])}</b><small>${t(m[0])}</small></div>`).join('')}</div>${badge(t(load&&load.open_count>=10?'Inbox 11 at capacity':'Observed open load'),load&&load.open_count>=10?'amber':'gray')}<p class="sub">${t(x.availability||'Unknown')}${load?' · '+date(load.observed_at):''}</p><p class="sub">${num(x.evaluated_count)} ${t('Evaluated conversations')}</p><button class="button" data-agent="${x.id}">${t('View conversations')} ↗</button></article>`}).join('')}</div>`}
async function conversations(){const [c,a,l]=await Promise.all([api('/api/conversations?'+new URLSearchParams({days,page,agent,label,search})),api('/api/agents?days='+days),api('/api/labels')]);currentRows=c.rows;$('#content').innerHTML=`<div class="toolbar"><form id="search-form"><input class="search-input" id="conversation-search" aria-label="${t('Search conversations')}" placeholder="${t('Search ID, name, or phone')}" value="${esc(search)}"><button class="button">${t('Search')}</button></form><select id="agent-filter" aria-label="${t('Agent')}"><option value="">${t('All agents')}</option><option value="unassigned" ${agent==='unassigned'?'selected':''}>${t('Unassigned')}</option>${a.rows.map(x=>`<option value="${x.id}" ${String(x.id)===agent?'selected':''}>${esc(x.name)}</option>`).join('')}</select><select id="label-filter" aria-label="${t('Labels')}"><option value="">${t('All labels')}</option>${l.rows.map(x=>`<option ${x.name===label?'selected':''}>${esc(x.name)}</option>`).join('')}</select><button class="button" id="reset-filters">${t('Reset')}</button></div><article class="panel"><div class="table-wrap"><table><thead><tr>${['Conversation','Customer','Current owner','Last human reply','Labels','Review'].map(x=>`<th>${t(x)}</th>`).join('')}</tr></thead><tbody>${c.rows.map(x=>`<tr data-open="${x.id}" tabindex="0" aria-label="#${x.display_id}"><td><b>#${x.display_id}</b><span class="sub" style="display:block">${date(x.status_changed_at)}</span></td><td>${esc(x.customer_name||'—')}</td><td>${esc(x.assignee_name||t('Unassigned'))}</td><td>${esc(x.last_responder_name||t('Unknown'))}</td><td>${(x.labels||[]).map(v=>badge(v)).join(' ')}</td><td>${badge(t(x.evaluation?'Original AI evaluation':'No AI evaluation yet'),x.evaluation?'green':'gray')}${x.feedback_count?` <span class="sub">${num(x.feedback_count)} ${t('Admin feedback')}</span>`:''}</td></tr>`).join('')}</tbody></table></div>${!c.rows.length?empty():''}<div class="pagination"><button class="button" id="prev" ${c.page<=1?'disabled':''}>${t('Previous')}</button><span>${num(c.page)} ${t('of')} ${num(c.pages)} · ${num(c.total)}</span><button class="button" id="next" ${c.page>=c.pages?'disabled':''}>${t('Next')}</button></div></article>`;$('#search-form').onsubmit=e=>{e.preventDefault();search=$('#conversation-search').value;page=1;render()};$('#agent-filter').onchange=e=>{agent=e.target.value;page=1;render()};$('#label-filter').onchange=e=>{label=e.target.value;page=1;render()};$('#reset-filters').onclick=()=>{agent=label=search='';page=1;render()};$('#prev').onclick=()=>{page--;render()};$('#next').onclick=()=>{page++;render()}}
const decisions={comment:'Comment',confirmed:'Confirm finding',rejected:'Reject finding',missing_issue:'Add missed issue',needs_review:'Request review'};
async function reviews(){const d=await api('/api/reviews');$('#content').innerHTML=`<div class="notice">${t('AI is off until the Groq key is configured. Jobs can still be queued.')}</div><article class="panel section-gap"><h2>${t('Admin feedback')}</h2>${d.feedback.map(f=>`<div class="review-card" data-open="${f.conversation_id}" tabindex="0"><div class="review-card-top"><b>${esc(f.author_name)}</b>${badge(t(decisions[f.decision]))}</div><p class="preserve">${esc(f.text)}</p><div class="sub">${date(f.created_at)}</div><button class="button" data-promote="${f.id}">${t('Create learning draft')}</button></div>`).join('')||empty('No admin feedback yet.')}</article><article class="panel"><h2>${t('Evaluation jobs')}</h2><div class="table-wrap"><table><thead><tr><th>${t('Conversation')}</th><th>${t('Status')}</th><th>${t('Attempts')}</th></tr></thead><tbody>${d.jobs.map(j=>`<tr data-open="${j.conversation_id}" tabindex="0"><td>#${j.conversation_id}</td><td>${badge(j.status==='awaiting_key'?t('AI not configured'):esc(j.status))}</td><td>${num(j.attempts)}</td></tr>`).join('')}</tbody></table></div>${!d.jobs.length?empty():''}</article>`}
async function rules(){const d=await api('/api/rules');$('#content').innerHTML=`<article class="panel section-gap"><h2>${t('New rule')}</h2><form id="rule-form"><div class="toolbar" style="margin-top:16px"><input class="search-input" id="rule-title" aria-label="${t('Title')}" placeholder="${t('Title')}" required maxlength="150"><select id="rule-status" aria-label="${t('Status')}"><option value="draft">${t('Draft')}</option><option value="active">${t('Active')}</option></select></div><textarea id="rule-body" aria-label="${t('Rule details')}" placeholder="${t('Rule details')}" required maxlength="5000"></textarea><button class="button dark">${t('Save')}</button></form></article><article class="panel">${d.rows.map(r=>`<div class="rule-row"><div><h3>${esc(r.title)}</h3><p class="preserve">${esc(r.body)}</p><span class="sub">${t('Version')} ${num(r.version)} · ${date(r.updated_at)}</span></div><div>${badge(t(({draft:'Draft',active:'Active',archived:'Archived'})[r.status]),r.status==='active'?'green':'gray')}<button class="button" data-rule-toggle="${r.id}">${t(r.status==='active'?'Archive':'Activate')}</button><button class="text-link" data-history="${r.id}">${t('History / restore')}</button></div></div>`).join('')||empty()}</article>`;$('#rule-form').onsubmit=async e=>{e.preventDefault();try{await api('/api/rules',{title:$('#rule-title').value,body:$('#rule-body').value,status:$('#rule-status').value});toast(t('Rule saved with history.'));render()}catch(e){toast(errorText(e))}};document.querySelectorAll('[data-rule-toggle]').forEach(b=>b.onclick=async()=>{try{const r=d.rows.find(x=>x.id===Number(b.dataset.ruleToggle));await api('/api/rules',{...r,status:r.status==='active'?'archived':'active'});toast(t('Rule saved with history.'));render()}catch(e){toast(errorText(e))}});document.querySelectorAll('[data-history]').forEach(b=>b.onclick=async()=>{try{const h=await api('/api/rules/'+b.dataset.history+'/history'),box=document.createElement('article');box.className='panel section-gap';box.innerHTML=`<h2>${t('History / restore')}</h2>${h.rows.map(x=>{const r=JSON.parse(x.payload);return `<div class="rule-row"><div><h3>${esc(r.title)} · ${t('Version')} ${num(r.version)}</h3><p>${esc(r.body)}</p></div><button class="button" data-restore="${x.id}">${t('Restore as draft')}</button></div>`}).join('')||empty('No previous versions.')}`;$('#content').prepend(box);box.querySelectorAll('[data-restore]').forEach(b=>b.onclick=async()=>{try{await api('/api/rules/restore',{history_id:Number(b.dataset.restore)});toast(t('Saved on the server.'));render()}catch(e){toast(errorText(e))}})}catch(e){toast(errorText(e))}})}
async function settings(s){const w=await api('/api/workloads');$('#content').innerHTML=`<article class="panel section-gap"><h2>${t('Coverage and backups')}</h2><div class="notice">${t('30-minute snapshots cannot prove continuous overload. Waits may include the AI phase; no timing penalty is applied.')}</div><p>${t('Last workload sample')} · ${date(s.coverage?.last_sample)}</p><p>${t('Detected sampling gaps')} · ${num(s.coverage?.gaps)}</p><p>${t('Encrypted backups')} · ${num(s.backups?.retained)} · ${date(s.backups?.last_created)}</p><p>${t('Daily backup, last 7 copies. Sessions are excluded.')}</p><div class="notice">${t('Backups are on this server. Keep a separate copy of backup.key and backup archives for server-loss recovery.')}</div><button class="button dark" id="backup-now">${t('Create and verify backup')}</button></article><article class="panel section-gap"><h2>${t('Settings')}</h2>${[['Data refresh','Every 30 minutes'],['Chatwoot',s.chatwoot_url],['Authentication','Chatwoot · '+t('Administrator')],['Groq model',s.groq_model],['Status',t(s.groq_configured?'AI configured':'AI not configured')],['Evidence retention',t('30 days')],['Private server storage',t('Connected')],['Current workload',date(w.last_success)]].map(x=>`<div class="rule-row"><h3>${t(x[0])}</h3><p>${esc(x[1])}</p></div>`).join('')}</article><article class="panel"><h2>${t('Admin activity')}</h2>${s.events.map(e=>`<div class="rule-row"><span>${esc(e.action)}</span><span class="sub">${date(e.created_at)}</span></div>`).join('')||empty()}</article>`;$('#backup-now').onclick=async()=>{const b=$('#backup-now');b.disabled=true;try{await api('/api/backups',{});toast(t('Backup created and restore integrity verified.'));render()}catch(e){toast(errorText(e));b.disabled=false}}}
function bindRows(){document.querySelectorAll('[data-promote]').forEach(b=>b.onclick=async event=>{event.stopPropagation();try{await api('/api/learning',{feedback_id:Number(b.dataset.promote)});toast(t('Learning draft created.'));location.hash='learning'}catch(e){toast(errorText(e))}});document.querySelectorAll('[data-open]').forEach(e=>{e.onclick=()=>openConversation(Number(e.dataset.open));e.onkeydown=k=>{if(k.key==='Enter'&&k.target===e&&e.tagName!=='BUTTON'){k.preventDefault();e.click()}}});document.querySelectorAll('[data-agent]').forEach(e=>{e.onclick=()=>{agent=String(e.dataset.agent);page=1;if(location.hash==='#conversations')render();else location.hash='conversations'};e.onkeydown=k=>{if(k.key==='Enter')e.click()}})}
async function openConversation(id){const request=++openRequest;previousFocus=document.activeElement;current=null;$('#drawer').innerHTML='<button class="close-button" id="close-drawer" aria-label="'+t('Close')+'">×</button>'+empty('Loading…');$('#scrim').hidden=false;$('#drawer').hidden=false;document.body.style.overflow='hidden';$('#close-drawer').onclick=closeDrawer;$('#close-drawer').focus();try{const result=await api('/api/conversations/'+id);if(request!==openRequest)return;current=result;tab='Assessment';drawDrawer();$('#close-drawer').focus()}catch(e){if(request===openRequest){closeDrawer();toast(errorText(e))}}}
function closeDrawer(){openRequest++;current=null;$('#drawer').hidden=true;$('#scrim').hidden=true;document.body.style.overflow='';previousFocus?.focus()}
function drawDrawer(){if(!current)return;const c=current;$('#drawer').innerHTML=`<div class="drawer-head"><div><div class="eyebrow">${t('Conversation review')}</div><h1>#${c.display_id}</h1><p>${esc(c.customer_name||'—')} · ${esc(c.phone_number||'')}</p></div><button class="close-button" id="close-drawer" aria-label="${t('Close')}">×</button></div><div class="drawer-meta">${badge(t('Resolved'),'green')}${badge(c.assignee_name||t('Unassigned'))}</div><a class="button" href="${esc(c.chatwoot_url)}" target="_blank" rel="noopener noreferrer">${t('Open full conversation in Chatwoot')} ↗</a><div class="tabs">${['Assessment','Responsibility','Waiting and workload','AI issues','Conversation','Media evidence','Admin feedback'].map(key=>`<button class="tab ${tab===key?'active':''}" data-tab="${key}">${t(key)}</button>`).join('')}</div>${tab==='Assessment'?assessment(c):tab==='Responsibility'?responsibilityPanel(c):tab==='Waiting and workload'?workloadPanel(c):tab==='AI issues'?aiReview(c):tab==='Conversation'?transcript(c):tab==='Media evidence'?media(c):feedback(c)}`;$('#close-drawer').onclick=closeDrawer;bindManagementDrawer();document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;drawDrawer()});if($('#queue-evaluation'))$('#queue-evaluation').onclick=async()=>{try{const r=await api('/api/evaluate',{conversation_id:c.id});toast(t(r.configured?'Evaluation queued.':'Waiting for the Groq key.'))}catch(e){toast(errorText(e))}};if($('#feedback-form'))$('#feedback-form').onsubmit=async e=>{e.preventDefault();try{await api('/api/feedback',{conversation_id:c.id,text:$('#feedback-text').value,decision:$('#feedback-decision').value,scope:$('#feedback-scope').value});current=await api('/api/conversations/'+c.id);drawDrawer();toast(t('Saved on the server.'))}catch(e){toast(errorText(e))}}}
function aiReview(c){
  const ai=c.messages.filter(m=>m.sender_type==='User'&&Number(m.sender_id)===2&&m.message_type===1&&!m.private);
  const evaluation=c.evaluations.find(e=>e.payload.ai_review),review=evaluation?.payload.ai_review;
  return `<article class="panel section-gap"><h2>${t('AI issues')} · Bakr</h2><div class="notice">${t('AI answer review is separate from human scores.')}</div><p>${num(ai.length)} ${t('AI messages')}</p>${review?`<div class="sub">${date(evaluation.created_at)} · ${esc(review.status)}</div><p class="preserve">${esc(review.summary_ar)}</p>${review.issues.map(i=>`<div class="issue"><h3>${esc(i.title)} ${badge(t(i.severity),'amber')}</h3><p class="preserve">${esc(i.explanation)}</p>${i.evidence.map(e=>`<blockquote>#${e.message_id} · ${esc(e.quote)}</blockquote>`).join('')}<p class="preserve"><b>${t('Improvement suggestions')}</b> · ${esc(i.recommended_action)}</p></div>`).join('')||empty('No supported AI issues reported.')}${[['Strengths',review.strengths],['Improvement suggestions',review.improvement_suggestions],['Limitations',review.limitations]].map(([title,rows])=>rows.length?`<h3>${t(title)}</h3><ul>${rows.map(row=>`<li class="preserve">${esc(row)}</li>`).join('')}</ul>`:'').join('')}`:empty(ai.length?'No AI review yet. Configure Groq and run an evaluation.':'No AI replies in the available transcript.')}<button class="button dark" id="queue-evaluation">${t('Queue evaluation')}</button></article>${feedback(c,'ai')}`;
}

function assessment(c){return `<article class="panel"><h2>${t('Assessment')}</h2><div class="category">${t('Current owner')}<b>${esc(c.assignee_name||t('Unassigned'))}</b></div><div class="notice">${t('Current assignee does not establish who resolved the conversation.')}</div>${c.evaluations.length?c.evaluations.map(e=>`<h3>${t('Original AI evaluation')} · ${date(e.created_at)}</h3><p class="preserve">${esc(e.payload.summary_ar)}</p>${e.payload.issues.map(i=>`<div class="issue"><h3>${esc(i.title)}</h3><p>${esc(i.explanation)}</p>${i.evidence.map(v=>`<blockquote>#${v.message_id} · ${esc(v.quote)}</blockquote>`).join('')}</div>`).join('')}`).join(''):`<p style="margin:20px 0;line-height:1.9">${t('No score or finding is assumed before evaluation.')}</p>`}<button class="button dark" id="queue-evaluation">${t('Queue evaluation')}</button></article>`}

function messageText(value){return String(value||'').split(/(https?:\/\/[^\s<>]+)/g).map(part=>{if(!/^https?:\/\//.test(part))return esc(part);try{const u=new URL(part);if(!['https:','http:'].includes(u.protocol))return esc(part);return '<a href="'+esc(u.href)+'" target="_blank" rel="noopener noreferrer">'+esc(part)+'</a>'}catch(_){return esc(part)}}).join('')}
function mediaUrl(value){try{const u=new URL(value,location.origin);return u.protocol==='https:'||(u.protocol==='http:'&&u.origin===location.origin)?u.href:''}catch(_){return ''}}
function attachment(a){const url=mediaUrl(a.data_url);if(!url)return '<div class="notice">'+t('Attachment unavailable')+'</div>';let name=new URL(url).pathname.split('/').pop()||t('Attachment');try{name=decodeURIComponent(name)}catch(_){}const ext=(a.extension||name.split('.').pop()||'').toLowerCase(),type=/^(png|jpe?g|gif|webp|avif|bmp)$/.test(ext)?'image':/^(mp3|wav|ogg|m4a|aac|opus)$/.test(ext)?'audio':/^(mp4|webm|mov)$/.test(ext)?'video':a.file_type;const link='<a class="attachment-link" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(name)+' ↗</a>';let view='';if(type==='image')view='<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer"><img class="attachment-image" src="'+esc(url)+'" alt="'+esc(name)+'" loading="lazy" referrerpolicy="no-referrer"></a>';else if(type==='audio')view='<audio controls preload="none" src="'+esc(url)+'"></audio>';else if(type==='video')view='<video controls preload="metadata" src="'+esc(url)+'"></video>';return '<div class="message-attachment">'+view+link+'</div>'}

function transcript(c){return `${c.attachment_error?`<div class="notice">${t("Attachments could not be loaded. Open Chatwoot to view them.")}</div>`:""}${c.truncated?`<div class="notice">${t('Only the latest 500 messages are shown.')}</div>`:''}${c.messages.map(m=>{const actor=m.message_type===2?t('System'):m.sender_type==='User'?(Number(m.sender_id)===2?t('AI bot · Bakr'):m.sender_name||t('Agent')):t('Customer');return `<div id="message-${m.id}" tabindex="-1" class="bubble ${m.sender_type==='User'?'agent':''}" dir="auto">${m.private?badge(t('Private note'),'amber'):''}<div class="preserve">${messageText(m.content)}</div>${(m.attachments||[]).map(attachment).join('')}<small>#${m.id} · ${esc(actor)} · ${date(m.created_at)}</small></div>`}).join('')}`}
function media(c){return `${c.evidence_error?`<div class="notice">${t('Saved media evidence is temporarily unavailable.')}</div>`:''}<p class="sub">${t('Evidence last synced')} · ${date(c.evidence_synced_at)}</p><div class="notice">${t('Saved observations have provisional attachment identity.')}</div>${c.media.map(m=>`<article class="panel"><div class="sub">#${esc(m.message_id)} · ${date(m.observed_at)}</div><p class="preserve" style="margin-top:14px">${esc(m.existing_analysis?.description||'')}</p>${(m.observations||[]).map(o=>`<div class="issue"><p class="preserve">${esc(o.value?.visible_summary_ar||'')}</p><div class="category">${t('Status')}<b>${esc(o.value?.receipt_status||'—')}</b></div><p>${esc(o.value?.amount||'')} ${esc(o.value?.currency||'')}</p><p>${esc((o.value?.limitations||[]).join(' · '))}</p></div>`).join('')}<div class="panel-note">${esc(JSON.stringify(m.coverage||{}))}</div></article>`).join('')||empty('No saved analysis for these messages. Attachments may still exist in Chatwoot.')}`}
function feedback(c,scope){return `<article class="panel"><h2>${t('Admin feedback')}</h2><p>${t('Internal feedback. Nothing is sent to the customer.')}</p>${c.feedback.filter(f=>!scope||(f.scope||'conversation')===scope).map(f=>`<div class="thread-entry"><b>${esc(f.author_name)} · ${date(f.created_at)}</b>${badge(t(decisions[f.decision]))} ${badge(t(f.scope==='ai'?'AI replies':f.scope==='human'?'Human agents':'Whole conversation'))}<div class="preserve">${esc(f.text)}</div></div>`).join('')||empty('No admin feedback yet.')}<form id="feedback-form"><label>${t('Feedback target')}<select id="feedback-scope" aria-label="${t('Feedback target')}">${[['conversation','Whole conversation'],['human','Human agents'],['ai','AI replies']].map(([key,title])=>`<option value="${key}" ${key===(scope||'conversation')?'selected':''}>${t(title)}</option>`).join('')}</select></label><textarea id="feedback-text" aria-label="${t('Admin feedback')}" placeholder="${t('Explain a correction or add a missed issue…')}" maxlength="4000" required></textarea><select id="feedback-decision" aria-label="${t('Review')}">${Object.entries(decisions).map(([k,v])=>`<option value="${k}">${t(v)}</option>`).join('')}</select><button class="button dark">${t('Save')}</button></form></article>`}
$('#period').onchange=e=>{days=Number(e.target.value);page=1;render()};$('#scrim').onclick=closeDrawer;$('#mobile-menu').onclick=()=>$('.sidebar').classList.toggle('open');$('#export-button').onclick=async()=>{try{const rows=route==='agents'?(await api('/api/agents?days='+days)).rows:currentRows,keys=Object.keys(rows[0]||{}).filter(k=>!['evaluation','labels'].includes(k)),safe=v=>{let s=String(v??'');if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'},csv='\uFEFF'+[keys,...rows.map(r=>keys.map(k=>r[k]))].map(r=>r.map(safe).join(',')).join('\r\n'),url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='azazy-'+route+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast(t('Exported current page.'))}catch(e){toast(errorText(e))}};
window.addEventListener('hashchange',()=>{page=1;render()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#drawer').hidden)closeDrawer();if((e.ctrlKey||e.metaKey)&&e.key==='k'&&user){e.preventDefault();location.hash='conversations';setTimeout(()=>$('#conversation-search')?.focus(),150)}if(e.key==='Tab'&&!$('#drawer').hidden){const controls=[...$('#drawer').querySelectorAll('button,select,textarea,input,a[href]')].filter(x=>!x.disabled);if(e.shiftKey&&document.activeElement===controls[0]){e.preventDefault();controls.at(-1).focus()}else if(!e.shiftKey&&document.activeElement===controls.at(-1)){e.preventDefault();controls[0].focus()}}});
async function aiInsights(){
  const d=await api('/api/ai-trends?days='+days);
  $('#content').innerHTML=`<div class="notice">${t('Only evaluated conversations are counted. Trends do not prove a fix caused improvement.')}</div><section class="stats-grid">${[['Reviewed AI conversations',d.reviewed_conversations],['Conversations with AI issues',d.conversations_with_issues],['AI issue rate',d.issue_rate===null?'—':d.issue_rate+'%']].map(([title,value])=>`<article class="stat-card"><span>${t(title)}</span><h2>${esc(value)}</h2></article>`).join('')}</section><section class="two-col section-gap"><article class="panel"><h2>${t('Recurring AI issues')}</h2>${d.categories.map(c=>`<div class="rule-row"><b>${t(c.category)}</b><span>${num(c.count)} · ${num(c.high)} ${t('high')}</span></div>`).join('')||empty('No evaluated AI issues yet.')}</article><article class="panel"><h2>${t('Weekly AI trends')}</h2>${d.weekly.length?`<div class="table-wrap"><table><thead><tr><th>${t('Week')}</th><th>${t('Reviewed AI conversations')}</th><th>${t('AI issues')}</th></tr></thead><tbody>${d.weekly.map(w=>`<tr><td>${esc(w.week)}</td><td>${num(w.reviewed)}</td><td>${num(w.issues)}</td></tr>`).join('')}</tbody></table></div>`:empty('No evaluated AI issues yet.')}</article></section><article class="panel section-gap"><h2>${t('Recent AI issues')}</h2>${d.recent_issues.map(i=>`<div class="issue"><button class="text-link" data-open="${i.conversation_id}">#${i.conversation_id} · ${esc(i.title)}</button>${badge(t(i.severity),'amber')}<p>${esc(i.recommended_action)}</p><small>${date(i.evaluated_at)}</small></div>`).join('')||empty('No evaluated AI issues yet.')}</article><article class="panel"><h2>${t('AI improvement milestones')}</h2><p>${t('Approved examples are used in later reviews. Production bot changes are not automatic.')}</p>${d.learning.map(e=>`<div class="rule-row"><div><h3>${esc(e.title)}</h3><span>${t('Version')} ${num(e.version)} · ${date(e.effective_at)}</span></div>${badge(t(({draft:'Draft',active:'Active',archived:'Archived'})[e.status]))}</div>`).join('')||empty()}</article>${botChangePanel(d)}`;$('#change-form').onsubmit=async event=>{event.preventDefault();try{await api('/api/ai-changes',{title:$('#change-title').value,description:$('#change-description').value,category:$('#change-category').value,effective_at:new Date($('#change-date').value).toISOString()});toast(t('Saved on the server.'));render()}catch(e){toast(errorText(e))}};
}
function botChangePanel(d){return `<article class="panel section-gap"><h2>${t('Bot change log')}</h2><p>${t('Log a change already applied to your bot. This does not change the bot.')}</p><form id="change-form"><div class="toolbar"><input class="search-input" id="change-title" aria-label="${t('Change title')}" placeholder="${t('Change title')}" required maxlength="150"><select id="change-category" aria-label="${t('Issue category')}">${['all','incorrect_information','unsupported_claim','missed_requirement','context_loss','media_misunderstanding','payment_handling','handoff','repetition','tone','other'].map(k=>`<option value="${k}">${t(k)}</option>`).join('')}</select></div><label>${t('Applied at (your local time)')}<input id="change-date" type="datetime-local" aria-label="${t('Applied at (your local time)')}" required></label><textarea id="change-description" aria-label="${t('Change details')}" placeholder="${t('Change details')}" maxlength="2000" required></textarea><button class="button dark">${t('Log change')}</button></form><div class="notice">${t('Compares 14 days before and after. At least 5 assessed conversations per period are needed; this is not proof of causation.')}</div>${(d.changes||[]).map(c=>`<div class="rule-row"><div><h3>${esc(c.title)}</h3><p>${esc(c.description)}</p><small>${date(c.effective_at)} · ${t(c.category)}</small></div><div><span>${t('Before')} · ${c.before.rate===null?'—':num(c.before.rate)+'%'} (${num(c.before.reviewed)})</span><span>${t('After')} · ${c.after.rate===null?'—':num(c.after.rate)+'%'} (${num(c.after.reviewed)})</span>${badge(t(c.sufficient_samples?'Descriptive comparison':'Insufficient samples'))}</div></div>`).join('')||empty('No bot changes logged yet.')}</article>`}

async function learning(){
  const d=await api('/api/learning');
  $('#content').innerHTML=`<div class="notice">${t('Promote a correction from Review queue, edit it, then activate it. Only active examples guide future reviews.')}</div><div id="learning-history"></div>${d.rows.map(e=>`<article class="panel section-gap"><form data-example="${e.id}"><div class="toolbar"><input class="search-input" name="title" aria-label="${t('Title')}" maxlength="150" required value="${esc(e.title)}"><select name="status" aria-label="${t('Status')}">${['draft','active','archived'].map(k=>`<option value="${k}" ${k===e.status?'selected':''}>${t(({draft:'Draft',active:'Active',archived:'Archived'})[k])}</option>`).join('')}</select></div><textarea name="body" aria-label="${t('Example details')}" maxlength="5000" required>${esc(e.body)}</textarea><div class="toolbar"><button class="button dark">${t('Save')}</button><button type="button" class="button" data-example-history="${e.id}">${t('History / restore')}</button><button type="button" class="text-link" data-open="${e.conversation_id}">${t('Conversation')} #${e.conversation_id}</button><span class="sub">${t('Version')} ${num(e.version)} · ${t(e.scope==='ai'?'AI replies':e.scope==='human'?'Human agents':'Whole conversation')}</span></div></form></article>`).join('')||empty('No approved examples yet.')}`;
  document.querySelectorAll('[data-example]').forEach(form=>form.onsubmit=async event=>{event.preventDefault();try{await api('/api/learning',{id:Number(form.dataset.example),title:form.elements.title.value,body:form.elements.body.value,status:form.elements.status.value});toast(t('Saved on the server.'));render()}catch(e){toast(errorText(e))}});
  document.querySelectorAll('[data-example-history]').forEach(button=>button.onclick=async()=>{try{const history=await api('/api/learning/'+button.dataset.exampleHistory+'/history');$('#learning-history').innerHTML=`<article class="panel section-gap"><h2>${t('History / restore')}</h2>${history.rows.map(h=>{const e=JSON.parse(h.payload);return `<div class="rule-row"><div><h3>${esc(e.title)} · ${t('Version')} ${num(e.version)}</h3><p>${esc(e.body)}</p></div><button class="button" data-example-restore="${h.id}">${t('Restore as draft')}</button></div>`}).join('')||empty('No previous versions.')}</article>`;document.querySelectorAll('[data-example-restore]').forEach(b=>b.onclick=async()=>{try{await api('/api/learning/restore',{history_id:Number(b.dataset.exampleRestore)});toast(t('Saved on the server.'));render()}catch(e){toast(errorText(e))}})}catch(e){toast(errorText(e))}});
}
function responsibilityPanel(c){
  const r=c.responsibility||{},items=[['Current owner',r.current_owner],['Last human reply',r.last_human_reply],['Last known assignment',r.last_observed_assignee],['Resolver evidence',r.resolver]];
  return `<article class="panel section-gap"><h2>${t('Responsibility')}</h2>${items.map(([title,item])=>`<div class="rule-row"><div><h3>${t(title)}</h3><p>${esc(item?.agent_id===2?t('AI bot · Bakr'):item?.name||t('Unknown'))}</p>${item?`<span class="sub">${t(({current_assignment:'Current assignment',public_reply:'Public reply',activity_name_match:'Name matched in activity log',activity_actor_unknown:'Unknown activity actor',observed_snapshot:'Observed snapshot'})[item.basis]||'Unknown')}${item.at?' · '+date(item.at):''}</span>`:''}</div>${item?.message_id?`<button class="button" data-jump="${item.message_id}">${t('Evidence')} #${item.message_id}</button>`:''}</div>`).join('')}<div class="notice">${t('Name matches are activity evidence, not a verified actor ID. Unknown responsibility is never assigned by assumption.')}</div><h3>${t('Human participants')}</h3>${r.participants?.map(a=>`<div class="rule-row"><b>${esc(a.name||'#'+a.agent_id)}</b><span>${num(a.replies)} ${t('Replies in available transcript')}</span></div>`).join('')||empty()}<h3>${t('Seen information')}</h3><p>${t('Assignee last seen')} · ${date(r.seen?.assignee_last_seen_at)}</p><p>${t('Any agent last seen')} · ${date(r.seen?.agent_last_seen_at)}</p><div class="notice">${t('Seen timestamps do not identify the person who viewed a conversation.')}</div>${c.truncated?`<p>${t('Only the latest 500 messages are shown.')}</p>`:''}</article>`;
}
function workloadPanel(c){
  const w=c.waiting||{intervals:[]};
  return `<article class="panel"><h2>${t('Waiting and workload')}</h2><div class="notice">${t('30-minute snapshots cannot prove continuous overload. Waits may include the AI phase; no timing penalty is applied.')}</div>${w.intervals.length?`<div class="table-wrap"><table><thead><tr>${['Customer wait','Human reply','Observed open load','Coverage'].map(x=>`<th>${t(x)}</th>`).join('')}</tr></thead><tbody>${w.intervals.map(i=>`<tr><td>${num(Math.round(i.seconds/60))} ${t('minutes')}<span class="sub">${date(i.start)}</span></td><td><button class="text-link" data-jump="${i.reply_message_id}">#${i.reply_message_id}</button><span class="sub">${esc(c.responsibility?.participants.find(a=>Number(a.agent_id)===Number(i.agent_id))?.name||'#'+i.agent_id)}</span></td><td>${i.pressure.coverage==='unknown'?t('Unknown'):num(i.pressure.open_count)}${i.pressure.at_capacity===true?badge(t('Inbox 11 at capacity'),'amber'):''}</td><td>${t(i.pressure.coverage==='unknown'?'Unknown':'Snapshot only')}<span class="sub">${date(i.pressure.sampled_at)}</span></td></tr>`).join('')}</tbody></table></div>`:empty('No measurable human reply intervals in the available transcript.')}</article>`;
}
function bindManagementDrawer(){document.querySelectorAll('[data-jump]').forEach(b=>b.onclick=()=>{const id=b.dataset.jump;tab='Conversation';drawDrawer();const target=document.getElementById('message-'+id);if(target){target.scrollIntoView({block:'center'});target.focus()}else toast(t('Evidence is outside the available transcript.'))})}

language(lang);(async()=>{try{const s=await api('/api/me');user=s.user;csrf=s.csrf;shell();render()}catch(_){login()}})();setInterval(()=>{if(user&&!current&&!loading&&document.visibilityState==='visible')render()},1800000);
