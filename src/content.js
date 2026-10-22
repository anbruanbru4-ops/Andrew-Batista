import content from './content.json';
import './content.css';
const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = (n) => '$' + n.toLocaleString('en-US');
const featuredServices = {};
const picks=[content.services[4],content.services[8],content.services[9]];
['conversations','systems','automation'].forEach((key,i)=>{
  const s=picks[i];
  featuredServices[key]={category:s.category,title:s.name,copy:s.description,items:[`${money(s.price)} USD · ${s.period}`,'Diagnóstico previo requerido'],symbol:['⌁','▤','✳'][i],id:s.id};
});
export {content, featuredServices, escape, money};
