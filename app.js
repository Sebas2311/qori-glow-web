'use strict';
const CONTACT_EMAIL = 'qoriglow.pe@gmail.com';
const colors = { 'Rosa Terracota':'#a66255','Rojo Profundo':'#8d273e','Rosa Suave':'#c18a90','Coral':'#c56b5b','Rosa':'#c993a0','Bronce':'#8c6856' };
const products = {
  lipstick:{title:'Labial Qori Glow',category:'LABIOS · PROPUESTA DE COLECCIÓN',description:'Una propuesta de color para los labios, con pigmentos naturales y aceite de sacha inchi. El acabado mate o semimate se evaluará durante el desarrollo.',format:'Barra sólida',interest:'Labial'},
  blush:{title:'Rubor Qori Glow',category:'MEJILLAS · PROPUESTA DE COLECCIÓN',description:'Una propuesta de polvo compacto para aportar color a las mejillas. La uniformidad, compactación y pigmentación modulable se evaluarán con muestras.',format:'Polvo compacto',interest:'Rubor'}
};
const ingredients = {
  beet:{number:'01',label:'BETARRAGA',scientific:'Beta vulgaris',title:'Una referencia vegetal para nuestra paleta.',description:'La propuesta contempla pigmentos o extractos de betarraga como fuente de color en el labial y el rubor. Su forma de suministro y concentración se definirán durante la formulación.',function:'FUNCIÓN PROPUESTA · APORTE DE COLOR',color:'#a84254'},
  cochineal:{number:'02',label:'COCHINILLA',scientific:'Dactylopius coccus',title:'El rojo de una tradición de color.',description:'La cochinilla forma parte de los pigmentos propuestos para ambos productos. Es un insumo de origen animal. Su identidad cosmética, concentración y condiciones de uso deben verificarse en la fórmula final.',function:'FUNCIÓN PROPUESTA · APORTE DE COLOR',color:'#832d41'},
  sacha:{number:'03',label:'SACHA INCHI',scientific:'Plukenetia volubilis',title:'Un aceite para dos fórmulas propias.',description:'Se propone incorporar aceite de sacha inchi como componente emoliente del labial y como parte del sistema aglutinante del rubor. Su concentración y desempeño se validarán por separado.',function:'FUNCIÓN PROPUESTA · EMOLIENTE Y AGLUTINANTE',color:'#a18c42'}
};
const qs = selector => document.querySelector(selector);
const qsa = selector => Array.from(document.querySelectorAll(selector));
const menu = qs('.menu-toggle');
function closeMenu(){menu.setAttribute('aria-expanded','false');qs('#navigation').classList.remove('open');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));qs('#navigation').classList.toggle('open',open);});
qsa('#navigation a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});

function syncSet(){
  const lip=qs('#set-lipstick').value,blush=qs('#set-blush').value;
  qs('#set-summary').textContent=`${lip} + ${blush}`;
  qs('#lipstick-dot').style.backgroundColor=colors[lip];qs('#blush-dot').style.backgroundColor=colors[blush];
  ['lipstick','blush'].forEach(key=>{const tone=qs(`#set-${key}`).value;qs(`#${key}-tone-name`).textContent=tone;qsa(`input[name="${key}-tone"]`).forEach(input=>{input.checked=input.value===tone;});});
}
qsa('.swatches input').forEach(input=>input.addEventListener('change',()=>{const key=input.name.replace('-tone','');qs(`#set-${key}`).value=input.value;syncSet();}));
qsa('.set-controls select').forEach(select=>select.addEventListener('change',syncSet));

let activeProduct='lipstick',lastDialogTrigger=null;
const productDialog=qs('#product-dialog'),imageDialog=qs('#image-dialog');
function openDialog(dialog,trigger){lastDialogTrigger=trigger;dialog.showModal();document.body.classList.add('dialog-open');}
function closeDialog(dialog){dialog.close();}
[productDialog,imageDialog].forEach(dialog=>{
  dialog.querySelector('[data-close]').addEventListener('click',()=>closeDialog(dialog));
  dialog.addEventListener('close',()=>{document.body.classList.remove('dialog-open');if(lastDialogTrigger)lastDialogTrigger.focus();});
  dialog.addEventListener('click',event=>{if(event.target===dialog){const b=dialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)closeDialog(dialog);}});
});
qsa('[data-product]').forEach(button=>button.addEventListener('click',()=>{
  activeProduct=button.dataset.product;const p=products[activeProduct];
  const cardImage=qs(`.product-image[data-product="${activeProduct}"] img`),detailImage=qs('#product-dialog .dialog-image img');
  detailImage.src=cardImage.currentSrc||cardImage.src;detailImage.alt=cardImage.alt;
  detailImage.width=cardImage.width;detailImage.height=cardImage.height;
  qs('#dialog-title').textContent=p.title;qs('#dialog-category').textContent=p.category;qs('#dialog-description').textContent=p.description;qs('#dialog-format').textContent=p.format;qs('#dialog-tone').textContent=qs(`#set-${activeProduct}`).value;
  openDialog(productDialog,button);
}));
qs('#view-packaging').addEventListener('click',event=>openDialog(imageDialog,event.currentTarget));
function prepareInterest(interest,message){
  qs('#inquiry-result').hidden=true;qs('#inquiry-form').hidden=false;qs('#interest').value=interest;
  if(message){const field=qs('#message');const old=field.value.replace(/^Me interesa[^\n]*(?:\n|$)/,'');field.value=message+(old?`\n${old}`:'');}
  qs('#contacto').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  qs('#contact-name').focus({preventScroll:true});
}
qs('#inquire-product').addEventListener('click',()=>{closeDialog(productDialog);prepareInterest(products[activeProduct].interest,`Me interesa ${products[activeProduct].title}, tono ${qs(`#set-${activeProduct}`).value}.`);});
qs('#inquire-set').addEventListener('click',()=>prepareInterest('Set de labial y rubor',`Me interesa el set: labial ${qs('#set-lipstick').value} y rubor ${qs('#set-blush').value}.`));

const tabs=qsa('[data-ingredient]');
function selectIngredient(tab){
  const d=ingredients[tab.dataset.ingredient];tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;});
  qs('#ingredient-panel').setAttribute('aria-labelledby',tab.id);
  ['number','art-label','scientific','title','description','function'].forEach(key=>{const property=key==='art-label'?'label':key;qs(`#ingredient-${key}`).textContent=d[property];});
  qs('.ingredient-art').style.setProperty('--pigment',d.color);
}
tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>selectIngredient(tab));tab.addEventListener('keydown',event=>{let next=index;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();selectIngredient(tabs[next]);tabs[next].focus();});});

let inquiryText='';
function errorFor(field,message){const el=qs(`#${field.id}-error`);el.textContent=message;if(message){field.setAttribute('aria-invalid','true');field.setAttribute('aria-describedby',el.id);}else{field.removeAttribute('aria-invalid');field.removeAttribute('aria-describedby');}}
const requiredFields=qsa('#inquiry-form [required]');
requiredFields.forEach(field=>field.addEventListener('input',()=>{if(field.getAttribute('aria-invalid')==='true')errorFor(field,'');}));
qs('#inquiry-form').addEventListener('submit',event=>{
  event.preventDefault();let firstInvalid=null;
  requiredFields.forEach(field=>{let error='';if(!field.value.trim())error='Completa este campo.';else if(field.type==='email'&&!field.validity.valid)error='Escribe un correo válido, por ejemplo nombre@empresa.com.';errorFor(field,error);if(error&&!firstInvalid)firstInvalid=field;});
  if(firstInvalid){qs('#form-status').textContent='Revisa los campos señalados para preparar tu consulta.';firstInvalid.focus();return;}
  qs('#form-status').textContent='';const data=new FormData(event.target);
  inquiryText=['CONSULTA COMERCIAL · QORI GLOW',`Fecha: ${new Date().toLocaleDateString('es-PE')}`,`Nombre: ${String(data.get('name')).trim()}`,`Empresa: ${String(data.get('company')).trim()}`,`Correo: ${String(data.get('email')).trim()}`,`Ciudad y país: ${String(data.get('city')).trim()}`,`Tipo de negocio: ${data.get('business')}`,`Interés: ${data.get('interest')}`,'',`Mensaje: ${String(data.get('message')||'').trim()||'Sin mensaje adicional.'}`,'','Consulta preparada desde la web del proyecto Qori Glow. Productos en desarrollo; disponibilidad y condiciones por confirmar.'].join('\n');
  qs('#inquiry-preview').textContent=inquiryText;qs('#inquiry-form').hidden=true;qs('#inquiry-result').hidden=false;qs('#copy-status').textContent='';
  qs('#inquiry-result').setAttribute('tabindex','-1');qs('#inquiry-result').focus({preventScroll:true});
  if(CONTACT_EMAIL){const a=qs('#email-inquiry');a.href=`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Consulta comercial Qori Glow')}&body=${encodeURIComponent(inquiryText)}`;a.hidden=false;qs('#result-explanation').textContent='Revisa el resumen. Puedes abrir tu aplicación de correo para enviarlo al equipo del proyecto, o descargarlo. Todavía no se ha enviado.';}
});
qs('#download-inquiry').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob(['\uFEFF'+inquiryText],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='Consulta-Qori-Glow.txt';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);});
qs('#copy-inquiry').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(inquiryText);qs('#copy-status').textContent='Consulta copiada. Puedes pegarla donde quieras compartirla.';}catch{const range=document.createRange();range.selectNodeContents(qs('#inquiry-preview'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);qs('#copy-status').textContent='Seleccionamos el resumen. Usa la opción Copiar de tu dispositivo o descarga la consulta.';}});
qs('#edit-inquiry').addEventListener('click',()=>{qs('#inquiry-result').hidden=true;qs('#inquiry-form').hidden=false;qs('#contact-name').focus();});
syncSet();
