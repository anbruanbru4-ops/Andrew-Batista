import {content, escape, money} from './content';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const crossfade = (element) => {if (!reduced) element.animate([{opacity:.2,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:350,easing:'ease-out'});};
document.querySelectorAll('[data-filter]').forEach((button)=>button.addEventListener('click',()=>{
  let count=0;
  document.querySelectorAll('[data-filter]').forEach((b)=>b.setAttribute('aria-pressed',String(b===button)));
  document.querySelectorAll('.catalog-card').forEach((card)=>{card.hidden=button.dataset.filter!=='Todos'&&card.dataset.category!==button.dataset.filter;if(!card.hidden)count++;});
  document.querySelector('.filter-status').textContent=`${count} sistemas disponibles`;
  crossfade(document.querySelector('.catalog-grid'));
}));

// Arrow keys follow the WAI-ARIA tabs pattern, alongside click and touch.
function tabs(buttons, select) {
  buttons.forEach((button,i)=>{
    button.addEventListener('click',()=>select(i));
    button.addEventListener('keydown',(e)=>{
      const index=e.key==='ArrowRight'?(i+1)%buttons.length:e.key==='ArrowLeft'?(i+buttons.length-1)%buttons.length:e.key==='Home'?0:e.key==='End'?buttons.length-1:null;
      if(index!==null){e.preventDefault();buttons[index].focus();select(index);}
    });
  });
}
const industryTabs=[...document.querySelectorAll('.industry-tabs [role="tab"]')];
function selectIndustry(i){
  const s=content.industries[i];
  industryTabs.forEach((b,j)=>{b.setAttribute('aria-selected',String(i===j));b.tabIndex=i===j?0:-1;});
  const panel=document.querySelector('#industry-panel');panel.setAttribute('aria-labelledby',`industry-tab-${i}`);
  document.querySelector('#industry-problem').textContent=s.bottleneck;
  document.querySelector('#industry-systems').innerHTML=s.ecosystem.map(s=>`<li>${escape(s)}</li>`).join('');
  document.querySelector('#industry-flow').innerHTML=s.flow.map(s=>`<li>${escape(s)}</li>`).join('');
  document.querySelector('#industry-flow-label').textContent=`EJEMPLO DE FLUJO · ${s.label.toUpperCase()}`;
  document.querySelector('#industry-contact').dataset.industry=s.label;
  crossfade(panel);
}
tabs(industryTabs,selectIndustry);selectIndustry(0);
const demoTabs=[...document.querySelectorAll('.demo-tabs [role=tab]')];
function selectDemo(i){
  demoTabs.forEach((b,j)=>{b.setAttribute('aria-selected',String(i===j));b.tabIndex=i===j?0:-1;document.getElementById(b.getAttribute('aria-controls')).hidden=i!==j;});
  crossfade(document.querySelector('.demo-stage'));
}
tabs(demoTabs,selectDemo);
function selectShowcase(i){
  document.querySelector('#showcase-title').textContent=content.showcase[i].name;
  document.querySelector('#showcase-metric').textContent=content.showcase[i].metric;
  document.querySelectorAll('[data-showcase]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.showcase===i)));
  crossfade(document.querySelector('.showcase-art'));
}
document.querySelectorAll('[data-showcase]').forEach(b=>b.addEventListener('click',()=>selectShowcase(+b.dataset.showcase)));selectShowcase(0);
function calculate(){
  const leads=+document.querySelector('#leads').value,ticket=+document.querySelector('#ticket').value,rate=+document.querySelector('#response-time').value;
  const loss=leads*.12*rate*ticket;
  document.querySelector('#leads-value').textContent=leads.toLocaleString('en-US');
  document.querySelector('#ticket-value').textContent=`${money(ticket)} USD`;
  document.querySelector('#loss-value').innerHTML=`${money(Math.round(loss))} <small>USD / mes</small>`;
  document.querySelector('#recovery-value').innerHTML=`${money(Math.round(loss*.72))} <small>USD / mes</small>`;
}
['leads','ticket','response-time'].forEach(id=>document.getElementById(id).addEventListener('input',calculate));calculate();
const reviews=document.querySelector('.review-track');
document.querySelector('#reviews-prev').addEventListener('click',()=>reviews.scrollBy({left:-reviews.clientWidth,behavior:reduced?'instant':'smooth'}));
document.querySelector('#reviews-next').addEventListener('click',()=>reviews.scrollBy({left:reviews.clientWidth,behavior:reduced?'instant':'smooth'}));

// Open WhatsApp only on the visitor's explicit submit. Nothing is sent automatically.
export function prepareRequest(event){
  event.preventDefault();
  const f=new FormData(event.currentTarget),service=content.services.find(s=>s.id===f.get('service'));
  const message=`Hola Veliux Agency / Andréw Vende IA. Deseo solicitar el Diagnóstico Operativo:\n\n- Empresa: ${f.get('company')}\n- Industria / Sector: ${f.get('industry')}\n- Solicitante: ${f.get('name')}\n- WhatsApp: ${f.get('phone')}\n- Servicio de interés: ${service.name}\n- Valor referencial: ${service.price} USD\n- Presupuesto estimado: ${f.get('budget')}\n- Cuello de botella actual: ${f.get('message')}`;
  const url=`https://wa.me/18296168651?text=${encodeURIComponent(message)}`;
  window.open(url,'_blank','noopener,noreferrer');
  const output=document.querySelector('#form-status');
  output.replaceChildren(document.createTextNode('Revise el mensaje en WhatsApp y pulse Enviar para completar la solicitud. Si no se abrió, '));
  const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.textContent='abrir WhatsApp';output.append(link);
}
