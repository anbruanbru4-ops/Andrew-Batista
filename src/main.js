import './fonts.css';
import './style.css';
import './refinements.css';
import {featuredServices, content} from './content';
import {prepareRequest} from './interactions';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) if (entry.isIntersecting) {
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  }
}, {threshold: 0.08});
if (!reducedMotion) document.documentElement.classList.add('js-motion');
document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const menu = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu() {
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Abrir menú');
  mobileNav.hidden = true;
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  mobileNav.hidden = !open;
});
mobileNav.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));

const serviceDialog = document.querySelector('#service-dialog');
const contactDialog = document.querySelector('#contact-dialog');
let activeVisual = null;
let transitionBusy = false;
const services = featuredServices;
function transition(update) {
  if (!reducedMotion && document.startViewTransition) return document.startViewTransition(update).finished.catch(() => {});
  update();
  return Promise.resolve();
}
document.querySelectorAll('[data-service]').forEach((card) => card.addEventListener('click', async () => {
  if (transitionBusy) return;
  transitionBusy = true;
  const service = services[card.dataset.service];
  document.querySelector('#service-contact').dataset.interest = service.id;
  activeVisual = card.querySelector('.service-visual');
  activeVisual.style.viewTransitionName = 'service-focus';
  document.querySelector('#dialog-category').textContent = service.category;
  document.querySelector('#dialog-title').textContent = service.title;
  document.querySelector('#dialog-copy').textContent = service.copy;
  document.querySelector('.dialog-art span').textContent = service.symbol;
  const list = document.querySelector('#dialog-list');
  list.replaceChildren(...service.items.map((text) => {const li = document.createElement('li');li.textContent = text;return li;}));
  await transition(() => {
    activeVisual.style.viewTransitionName = '';
    document.querySelector('.dialog-art').style.viewTransitionName = 'service-focus';
    serviceDialog.showModal();
  });
  transitionBusy = false;
}));
async function closeDialog(dialog) {
  if (dialog === serviceDialog && activeVisual) {
    if (transitionBusy) return;
    transitionBusy = true;
    await transition(() => {
      document.querySelector('.dialog-art').style.viewTransitionName = '';
      activeVisual.style.viewTransitionName = 'service-focus';
      dialog.close();
    });
    activeVisual.style.viewTransitionName = '';
    transitionBusy = false;
  } else dialog.close();
}
document.querySelectorAll('dialog').forEach((dialog) => {
  dialog.querySelector('.dialog-close').addEventListener('click', () => closeDialog(dialog));
  dialog.addEventListener('cancel', (event) => {event.preventDefault();closeDialog(dialog);});
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(dialog);
  });
});
function openContact(button) {
  closeMenu();
  const form=document.querySelector('#brief-form');
  form.elements.service.value=button?.dataset.interest || content.services[0].id;
  if(button?.dataset.industry) form.elements.industry.value=button.dataset.industry;
  document.querySelector('#form-status').replaceChildren();
  contactDialog.showModal();
}
document.querySelectorAll('[data-contact]').forEach((button) => button.addEventListener('click', () => openContact(button)));
document.querySelector('#service-contact').addEventListener('click', async (event) => {const button=event.currentTarget;await closeDialog(serviceDialog);openContact(button);});
document.querySelector('#brief-form').addEventListener('submit', prepareRequest);

const steps = [
  {label: '01 — EL PRIMER CONTACTO', title: 'Una conversación.\nMuchas posibilidades.', copy: 'Cada mensaje es el inicio de algo. Una experiencia clara recoge lo importante y ayuda a definir el siguiente paso.', tag: 'Una consulta, un nuevo comienzo.'},
  {label: '02 — EL CONTEXTO CONECTADO', title: 'Las piezas correctas.\nEn el mismo lugar.', copy: 'El contexto de la conversación viaja hacia tus herramientas. La información encuentra su lugar para que tu equipo pueda avanzar.', tag: 'El contexto acompaña cada conexión.'},
  {label: '03 — EL SIGUIENTE PASO', title: 'De la información\na la acción.', copy: 'El sistema conecta la información con una tarea, una respuesta o una decisión. Cada paso tiene un propósito.', tag: 'Una conexión se convierte en posibilidad.'},
];
const tabs = [...document.querySelectorAll('[data-step]')];
const indicator = document.querySelector('.tab-indicator');
let activeStep = 0;
let animationId = 0;
function moveIndicator() {
  indicator.style.left = `${tabs[activeStep].offsetLeft}px`;
  indicator.style.width = `${tabs[activeStep].offsetWidth}px`;
}
async function selectStep(index) {
  activeStep = index;
  const id = ++animationId;
  tabs.forEach((tab, i) => {tab.setAttribute('aria-selected', String(i === index));tab.tabIndex = i === index ? 0 : -1;});
  moveIndicator();
  const copy = document.querySelector('.display-copy');
  if (!reducedMotion) await copy.animate([{opacity: 1, transform: 'translateY(0)'}, {opacity: 0, transform: 'translateY(7px)'}], {duration: 160, easing: 'ease-in'}).finished;
  if (id !== animationId) return;
  const step = steps[index];
  document.querySelector('#step-label').textContent = step.label;
  const title = document.querySelector('#step-title');title.replaceChildren();
  step.title.split('\n').forEach((line, i) => {if (i) title.append(document.createElement('br'));title.append(document.createTextNode(line));});
  document.querySelector('#step-description').textContent = step.copy;
  document.querySelector('#diagram-tag').replaceChildren(document.createTextNode(`✧  ${step.tag}`));
  const panel = document.querySelector('#system-panel');panel.dataset.step = String(index);panel.setAttribute('aria-labelledby', `tab-${index}`);
  if (!reducedMotion) copy.animate([{opacity: 0, transform: 'translateY(-7px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: 350, easing: 'cubic-bezier(.2,.7,.2,1)'});
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectStep(index));
  tab.addEventListener('keydown', (event) => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) {event.preventDefault();tabs[next].focus();selectStep(next);}
  });
});
new ResizeObserver(moveIndicator).observe(document.querySelector('.system-tabs'));
document.fonts.ready.then(moveIndicator);

// Keep the page interactive while the optional 3D module loads.
import('./core').then(({createCore})=>createCore()).catch(()=>{});
