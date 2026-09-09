const KEY="aymanAccounting_v12";
const defaultData={ops:[],customers:[],suppliers:[]};
let db=JSON.parse(localStorage.getItem(KEY)||JSON.stringify(defaultData));
function save(){localStorage.setItem(KEY,JSON.stringify(db));render()}
function money(v){return Number(v||0).toFixed(3)+" د.ك"}
function route(){return location.hash.replace("#","")||"dashboard"}
function setActive(){document.querySelectorAll("#nav a").forEach(a=>a.classList.toggle("active",a.dataset.route===route()))}
function page(title,body){return `<section><h1 class="title">${title}</h1>${body}</section>`}
function dashboard(){
 const s=sum("sale"),p=sum("purchase"),r=sum("receipt"),x=sum("payment");
 return page("لوحة التحكم",`<div class="cards">
 <div class="card"><div class="label">إجمالي المبيعات</div><div class="value">${money(s)}</div></div>
 <div class="card"><div class="label">إجمالي المشتريات</div><div class="value">${money(p)}</div></div>
 <div class="card"><div class="label">المقبوضات</div><div class="value">${money(r)}</div></div>
 <div class="card"><div class="label">المدفوعات</div><div class="value">${money(x)}</div></div></div>
 <div class="grid"><div class="panel"><h3>آخر العمليات</h3>${opsTable(db.ops.slice(0,8))}</div>
 <div class="panel"><h3>اختصارات</h3><div class="actions">
 <a class="btn" href="#sales">فاتورة بيع</a><a class="btn" href="#purchases">فاتورة شراء</a>
 <a class="btn" href="#receipts">سند قبض</a><a class="btn" href="#payments">سند صرف</a></div></div></div>`)
}
function sum(t){return db.ops.filter(o=>o.type===t).reduce((a,o)=>a+Number(o.amount),0)}
function opsTable(arr){if(!arr.length)return `<div class="empty">لا توجد عمليات بعد</div>`;return `<div class="table-wrap"><table><thead><tr><th>التاريخ</th><th>النوع</th><th>الطرف</th><th>المبلغ</th></tr></thead><tbody>${arr.map(o=>`<tr><td>${o.date}</td><td>${o.label}</td><td>${esc(o.party)}</td><td>${money(o.amount)}</td></tr>`).join("")}</tbody></table></div>`}
function formPage(type,title,partyLabel){
 return page(title,`<div class="panel"><div class="form"><div class="field"><label>${partyLabel}</label><input id="party" placeholder="${partyLabel}"></div><div class="field"><label>المبلغ</label><input id="amount" type="number" min="0" step="0.001" placeholder="0.000"></div></div><div class="actions" style="margin-top:14px"><button class="btn" id="saveOp">حفظ</button><button class="btn secondary" onclick="location.hash='dashboard'">إلغاء</button></div></div>`)
}
function people(type,title,label){
 const arr=type==="customers"?db.customers:db.suppliers;
 return page(title,`<div class="panel"><div class="form"><div class="field"><label>${label}</label><input id="pname"></div><div class="field"><label>الهاتف</label><input id="phone"></div></div><div class="actions" style="margin-top:14px"><button class="btn" id="savePerson">إضافة</button></div><div style="margin-top:18px">${arr.length?`<div class="table-wrap"><table><thead><tr><th>الاسم</th><th>الهاتف</th></tr></thead><tbody>${arr.map(p=>`<tr><td>${esc(p.name)}</td><td>${esc(p.phone||"-")}</td></tr>`).join("")}</tbody></table></div>`:`<div class="empty">لا توجد بيانات</div>`}</div></div>`)
}
function render(){
 setActive(); const r=route(); let html="";
 if(r==="dashboard")html=dashboard();
 else if(r==="sales")html=formPage("sale","فاتورة مبيعات","اسم العميل");
 else if(r==="purchases")html=formPage("purchase","فاتورة مشتريات","اسم المورد");
 else if(r==="receipts")html=formPage("receipt","سند قبض","من العميل / الطرف");
 else if(r==="payments")html=formPage("payment","سند صرف","إلى المورد / الطرف");
 else if(r==="customers")html=people("customers","العملاء","اسم العميل");
 else if(r==="suppliers")html=people("suppliers","الموردون","اسم المورد");
 else if(r==="accounts")html=page("دليل الحسابات",`<div class="panel">${accountsTable()}</div>`);
 else if(r==="journal")html=page("القيود اليومية",`<div class="panel">${journalTable()}</div>`);
 else if(r==="reports")html=page("التقارير",`<div class="cards"><div class="card"><div class="label">صافي الحركة</div><div class="value">${money(sum("sale")+sum("receipt")-sum("purchase")-sum("payment"))}</div></div><div class="card"><div class="label">عدد العمليات</div><div class="value">${db.ops.length}</div></div></div><div class="panel" style="margin-top:16px">${opsTable(db.ops)}</div>`);
 else html=dashboard();
 document.getElementById("app").innerHTML=html;
 bind();
}
function bind(){
 const r=route();
 const b=document.getElementById("saveOp");
 if(b)b.onclick=()=>{let party=document.getElementById("party").value.trim(),amount=Number(document.getElementById("amount").value);if(!party||!amount)return alert("أدخل الطرف والمبلغ");const labels={sale:"فاتورة بيع",purchase:"فاتورة شراء",receipt:"سند قبض",payment:"سند صرف"};db.ops.unshift({type:r,label:labels[r],party,amount,date:new Date().toLocaleString("ar-KW")});save();alert("تم الحفظ بنجاح");location.hash="dashboard"};
 const bp=document.getElementById("savePerson");
 if(bp)bp.onclick=()=>{let name=document.getElementById("pname").value.trim(),phone=document.getElementById("phone").value.trim();if(!name)return alert("أدخل الاسم");db[r].push({name,phone});save()};
}
function accountsTable(){let a=[["1000","الصندوق","أصل"],["1100","البنك","أصل"],["1200","العملاء","أصل"],["2000","الموردون","التزام"],["4000","المبيعات","إيراد"],["5000","المشتريات","تكلفة"],["6000","المصروفات","مصروف"]];return `<div class="table-wrap"><table><thead><tr><th>الكود</th><th>الحساب</th><th>النوع</th></tr></thead><tbody>${a.map(x=>`<tr><td>${x[0]}</td><td>${x[1]}</td><td>${x[2]}</td></tr>`).join("")}</tbody></table></div>`}
function journalTable(){if(!db.ops.length)return `<div class="empty">لا توجد قيود حتى الآن. عند حفظ العمليات سيتم تسجيلها في سجل العمليات، والربط المحاسبي الكامل سيكون في الإصدار الإنتاجي.</div>`;return opsTable(db.ops)}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
window.addEventListener("hashchange",render);window.addEventListener("DOMContentLoaded",render);