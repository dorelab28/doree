(() => {
  const db = window.doreSupabase;
  const loginPanel = document.querySelector('[data-login-panel]'), dashboard = document.querySelector('[data-dashboard]'), status = document.querySelector('[data-admin-status]'), saveStatus = document.querySelector('[data-save-status]');
  if (!db || !loginPanel) return;
  const names = { nutella:'Nutella', pistacho:'Pistacho', 'red-velvet':'Red Velvet', 'carrot-cake':'Carrot Cake' };
  const sizeNames = { chico:'Chico', mediano:'Mediano', doble:'Doble' };
  const groups = ['masa','relleno','cobertura','decoración'];
  let defaults = null, config = null, prices = [], allowed = false;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const money = value => new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(value);
  const ingredient = id => config.ingredients.find(item => item.id === id);
  const setStatus = message => { if (status) status.textContent = message; };
  const signOut = async () => { await db.auth.signOut(); allowed = false; dashboard.hidden = true; loginPanel.hidden = false; };

  function renderPriceRows() {
    const body = document.querySelector('[data-price-rows]');
    body.innerHTML = Object.keys(names).flatMap(flavor => Object.keys(sizeNames).map(size => {
      const row = prices.find(item => item.flavor===flavor&&item.size===size) || {flavor,size,price:0,weight_grams:config.sizes[size]?.weight||0};
      return `<tr><td>${names[flavor]}</td><td>${sizeNames[size]}</td><td><input type="number" min="1" step="1" data-price-weight="${flavor}|${size}" value="${esc(row.weight_grams)}" aria-label="Peso ${names[flavor]} ${sizeNames[size]}"></td><td><input class="price-input" type="number" min="0" step="100" data-price-value="${flavor}|${size}" value="${esc(row.price)}" aria-label="Precio ${names[flavor]} ${sizeNames[size]}"></td></tr>`;
    })).join('');
  }
  function renderIngredients() {
    const body = document.querySelector('[data-ingredient-rows]');
    body.innerHTML = config.ingredients.map(item => `<tr data-ingredient-row="${esc(item.id)}"><td><input data-ing-field="name" value="${esc(item.name)}" aria-label="Nombre"></td><td><div class="admin-inline"><input type="number" min="0" step="any" data-ing-field="packageQty" value="${esc(item.packageQty ?? '')}" placeholder="Cantidad"><select data-ing-field="unit"><option ${item.unit==='g'?'selected':''}>g</option><option ${item.unit==='ml'?'selected':''}>ml</option><option ${item.unit==='unidad'?'selected':''}>unidad</option></select></div></td><td><input class="price-input" type="number" min="0" step="any" data-ing-field="purchasePrice" value="${esc(item.purchasePrice ?? '')}" placeholder="Pendiente"></td><td data-ing-base-unit>${esc(item.unit||'')}</td><td data-unit-cost>${Number(item.purchasePrice)>0&&Number(item.packageQty)>0?money(Number(item.purchasePrice)/Number(item.packageQty))+' / '+esc(item.unit):'Pendiente'}</td><td><input type="date" data-ing-field="updatedAt" value="${esc(item.updatedAt||'2026-11-23')}"></td><td><input data-ing-field="sourceStatus" value="${esc(item.sourceStatus||'Pendiente de revisar')}" aria-label="Estado del precio"></td></tr>`).join('');
  }
  function renderRecipes() {
    const root = document.querySelector('[data-recipe-editors]');
    root.innerHTML = Object.entries(config.recipes).map(([flavor,lines]) => `<details class="recipe-editor" ${flavor==='nutella'?'open':''}><summary>${names[flavor]} · receta mediana</summary><div class="recipe-tools"><button type="button" class="button secondary" data-add-line="${flavor}">Agregar ingrediente</button></div><div class="recipe-lines"><table><thead><tr><th>Componente</th><th>Sección</th><th>Cantidad</th><th>Unidad</th><th></th></tr></thead><tbody>${lines.map((line,index) => recipeRow(flavor,line,index)).join('')}</tbody></table></div></details>`).join('');
  }
  function recipeRow(flavor,line,index) {
    return `<tr data-recipe-line="${flavor}|${index}"><td><select data-recipe-field="ingredient">${config.ingredients.map(item=>`<option value="${esc(item.id)}" ${item.id===line.ingredient?'selected':''}>${esc(item.name)}</option>`).join('')}</select></td><td><select data-recipe-field="section">${groups.map(group=>`<option ${line.section===group?'selected':''}>${group}</option>`).join('')}</select></td><td><input type="number" min="0" step="any" data-recipe-field="quantity" value="${esc(line.quantity)}"></td><td data-recipe-unit>${esc(ingredient(line.ingredient)?.unit||'')}</td><td><button type="button" class="remove-line" data-remove-line="${flavor}|${index}" aria-label="Quitar ingrediente">Quitar</button></td></tr>`;
  }
  function renderSettings() {
    const root = document.querySelector('[data-settings]'), op = config.operations;
    root.innerHTML = `<label>Merma (%)<input type="number" min="0" max="100" step="0.1" data-operation="wastePercent" value="${esc(op.wastePercent ?? '')}" placeholder="Completar"></label><label>Mano de obra por receta mediana ($)<input type="number" min="0" step="any" data-operation="laborPerMedium" value="${esc(op.laborPerMedium ?? '')}" placeholder="Completar"></label><label>Energía y otros por receta mediana ($)<input type="number" min="0" step="any" data-operation="energyPerMedium" value="${esc(op.energyPerMedium ?? '')}" placeholder="Completar"></label><label>Margen objetivo (%)<input type="number" min="1" max="95" step="1" data-operation="targetMargin" value="${esc(op.targetMargin ?? '')}" placeholder="Configurar"></label><label>Producción validada<input type="checkbox" data-operation="productionValidated" ${op.productionValidated?'checked':''}></label>${Object.entries(config.sizes).map(([size,values])=>`<label>Multiplicador ${sizeNames[size]}<input type="number" min="0.01" max="10" step="0.01" data-size-operation="${size}|multiplier" value="${esc(values.multiplier)}"></label><label>Packaging ${sizeNames[size]} (unidades)<input type="number" min="0" max="10" step="1" data-size-operation="${size}|packaging" value="${esc(values.packaging)}"></label>`).join('')}`;
  }
  function getCosts(flavor,size) {
    const multiplier = Number(config.sizes[size]?.multiplier), scale = config.recipes[flavor]||[];
    const sections={masa:0,relleno:0,cobertura:0,'decoración':0};let complete=true;
    for (const line of scale) {
      const item=ingredient(line.ingredient), qty=Number(line.quantity);
      if (!item||!Number.isFinite(qty)||qty<=0||!Number.isFinite(Number(item.purchasePrice))||!Number.isFinite(Number(item.packageQty))||Number(item.packageQty)<=0) { complete=false; continue; }
      sections[line.section] += qty*multiplier*Number(item.purchasePrice)/Number(item.packageQty);
    }
    const packaging=ingredient('packaging'), packageCount=Number(config.sizes[size]?.packaging);
    if (!packaging||!Number.isFinite(Number(packaging.purchasePrice))||!Number.isFinite(Number(packaging.packageQty))||Number(packaging.packageQty)<=0) complete=false;
    const packageCost=packaging&&Number.isFinite(Number(packaging.purchasePrice))&&Number.isFinite(Number(packaging.packageQty))&&Number(packaging.packageQty)>0?packageCount*Number(packaging.purchasePrice)/Number(packaging.packageQty):0;
    const op=config.operations;
    if (op.wastePercent===null||op.wastePercent===''||!Number.isFinite(Number(op.wastePercent))||op.laborPerMedium===null||op.laborPerMedium===''||!Number.isFinite(Number(op.laborPerMedium))||op.energyPerMedium===null||op.energyPerMedium===''||!Number.isFinite(Number(op.energyPerMedium))) complete=false;
    if (!op.productionValidated) complete=false;
    const recipeCost=Object.values(sections).reduce((sum,value)=>sum+value,0),waste=(recipeCost+packageCost)*(Number(op.wastePercent)||0)/100,labor=(Number(op.laborPerMedium)||0)*multiplier,energy=(Number(op.energyPerMedium)||0)*multiplier;
    const cost=recipeCost+packageCost+waste+labor+energy;
    const price=Number(prices.find(row=>row.flavor===flavor&&row.size===size)?.price);
    const weight=Number(prices.find(row=>row.flavor===flavor&&row.size===size)?.weight_grams||config.sizes[size]?.weight);
    return {cost,complete,price,weight,profit:price-cost,margin:price?((price-cost)/price*100):0,perKg:weight?cost/(weight/1000):0,suggested:complete&&Number.isFinite(Number(op.targetMargin))&&Number(op.targetMargin)>0&&Number(op.targetMargin)<100?cost/(1-Number(op.targetMargin)/100):null,sections,packageCost,waste,labor,energy};
  }
  function renderCosts() {
    const body=document.querySelector('[data-cost-rows]');
    body.innerHTML=Object.keys(names).flatMap(flavor=>Object.keys(sizeNames).map(size=>{
      const row=getCosts(flavor,size), precision=amount=>money(Math.round(amount));
      const parcial=row.complete?'':' · parcial';
      return `<tr><td>${names[flavor]}</td><td>${sizeNames[size]}</td><td>${new Intl.NumberFormat('es-AR').format(row.weight)} g</td><td>${precision(row.sections.masa)}${parcial}</td><td>${precision(row.sections.relleno)}${parcial}</td><td>${precision(row.sections.cobertura)}${parcial}</td><td>${precision(row.sections['decoración'])}${parcial}</td><td>${precision(row.packageCost)}${parcial}</td><td>${precision(row.waste)}${parcial}</td><td>${precision(row.labor)}${parcial}</td><td>${precision(row.energy)}${parcial}</td><td>${precision(row.cost)}${parcial}</td><td>${money(row.price||0)}</td><td>${row.complete?precision(row.profit):'Pendiente'}</td><td>${row.complete?row.margin.toFixed(1)+'%':'Pendiente'}</td><td>${row.complete?precision(row.perKg):'Pendiente'}</td><td>${row.suggested?precision(row.suggested):'Pendiente'}</td></tr>`;
    })).join('');
  }
  function renderAll() { renderPriceRows(); renderIngredients(); renderRecipes(); renderSettings(); renderCosts();document.querySelector('[data-review-notes]').innerHTML=(config.notes||[]).map(note=>`<li>${esc(note)}</li>`).join(''); }
  async function loadDashboard(user) {
    const {data:access,error:accessError}=await db.from('budin_admins').select('user_id').eq('user_id',user.id).maybeSingle();
    if(accessError||!access){await db.auth.signOut();setStatus('La cuenta inició sesión, pero no está habilitada para administrar Budines.');return;}
    allowed=true;
    const {data:sessionData}=await db.auth.getSession();
    const defaultResponse=await fetch('/api/budines-config',{headers:{Authorization:`Bearer ${sessionData.session?.access_token||''}`},cache:'no-store'});
    if(!defaultResponse.ok){await db.auth.signOut();setStatus('No se pudo validar el acceso privado a las recetas.');return;}
    defaults=(await defaultResponse.json()).config;config=structuredClone(defaults);
    const [{data:priceRows,error:priceError},{data:configRow,error:configError}]=await Promise.all([
      db.from('budin_prices').select('flavor,size,price,weight_grams'),
      db.from('budin_cost_config').select('config').eq('id','production').maybeSingle()
    ]);
    if(priceError||configError){setStatus('No se pudo leer la configuración segura. Ejecutá la migración de Budines en Supabase.');return;}
    prices=priceRows||[];
    config=configRow?.config?{...structuredClone(defaults),...configRow.config}:structuredClone(defaults);
    loginPanel.hidden=true;dashboard.hidden=false;setStatus('');renderAll();
  }
  document.querySelector('[data-admin-login]')?.addEventListener('submit',async event=>{
    event.preventDefault();const data=new FormData(event.currentTarget);setStatus('Verificando acceso…');
    const {data:result,error}=await db.auth.signInWithPassword({email:data.get('email'),password:data.get('password')});
    if(error){setStatus('No se pudo iniciar sesión. Revisá tus datos.');return;}
    await loadDashboard(result.user);
  });
  document.querySelector('[data-logout]')?.addEventListener('click',signOut);
  document.querySelector('[data-add-ingredient]')?.addEventListener('click',()=>{
    const id=`nuevo-${Date.now()}`;config.ingredients.push({id,name:'Ingrediente nuevo',purchasePrice:null,packageQty:null,unit:'g',updatedAt:new Date().toISOString().slice(0,10),sourceStatus:'Precio pendiente'});renderIngredients();
  });
  document.addEventListener('click',event=>{
    const add=event.target.closest('[data-add-line]');if(add){const flavor=add.dataset.addLine;config.recipes[flavor].push({ingredient:config.ingredients[0]?.id||'butter',quantity:0,section:'decoración'});renderRecipes();renderCosts();return;}
    const remove=event.target.closest('[data-remove-line]');if(remove){const [flavor,index]=remove.dataset.removeLine.split('|');config.recipes[flavor].splice(Number(index),1);renderRecipes();renderCosts();}
  });
  document.addEventListener('input',event=>{
    const target=event.target;
    const sizeField=target.dataset.sizeOperation;if(sizeField){const [size,field]=sizeField.split('|');config.sizes[size][field]=Number(target.value);renderCosts();}
    const priceValue=target.dataset.priceValue;if(priceValue){const [flavor,size]=priceValue.split('|');const row=prices.find(item=>item.flavor===flavor&&item.size===size)||{flavor,size,price:0,weight_grams:config.sizes[size].weight};row.price=Number(target.value);if(!prices.includes(row))prices.push(row);renderCosts();}
    const weightValue=target.dataset.priceWeight;if(weightValue){const [flavor,size]=weightValue.split('|');const row=prices.find(item=>item.flavor===flavor&&item.size===size)||{flavor,size,price:0,weight_grams:config.sizes[size].weight};row.weight_grams=Number(target.value);if(!prices.includes(row))prices.push(row);config.sizes[size].weight=Number(target.value);prices.filter(item=>item.size===size).forEach(item=>item.weight_grams=Number(target.value));document.querySelectorAll(`[data-price-weight$="|${size}"]`).forEach(input=>{if(input!==target)input.value=target.value});renderCosts();}
    const ingField=target.dataset.ingField;if(ingField){const row=target.closest('[data-ingredient-row]'),item=ingredient(row.dataset.ingredientRow);item[ingField]=['purchasePrice','packageQty'].includes(ingField)?(target.value===''?null:Number(target.value)):target.value;if(ingField==='unit')row.querySelector('[data-ing-base-unit]').textContent=target.value;const unit=row.querySelector('[data-unit-cost]');unit.textContent=Number(item.purchasePrice)>0&&Number(item.packageQty)>0?money(item.purchasePrice/item.packageQty)+' / '+item.unit:'Pendiente';renderRecipes();renderCosts();}
    const recipeField=target.dataset.recipeField;if(recipeField){const row=target.closest('[data-recipe-line]'),[flavor,index]=row.dataset.recipeLine.split('|'),line=config.recipes[flavor][Number(index)];line[recipeField]=recipeField==='quantity'?Number(target.value):target.value;if(recipeField==='ingredient')row.querySelector('[data-recipe-unit]').textContent=ingredient(line.ingredient)?.unit||'';renderCosts();}
    const opField=target.dataset.operation;if(opField&&opField!=='productionValidated'){config.operations[opField]=target.value===''?null:Number(target.value);renderCosts();}
  });
  document.addEventListener('change',event=>{const target=event.target;if(target.dataset.operation==='productionValidated'){config.operations.productionValidated=target.checked;renderCosts();return;}if(target.dataset.recipeField||target.dataset.ingField||target.dataset.sizeOperation){target.dispatchEvent(new Event('input',{bubbles:true}));}});
  document.querySelector('[data-save]')?.addEventListener('click',async()=>{
    if(!allowed)return;saveStatus.textContent='Guardando…';
    try {
      const priceRows=Object.values(Object.keys(names).flatMap(flavor=>Object.keys(sizeNames).map(size=>{
        const row=prices.find(item=>item.flavor===flavor&&item.size===size);
        if(!row||!Number.isInteger(Number(row.price))||Number(row.price)<0||!Number.isInteger(Number(row.weight_grams))||Number(row.weight_grams)<1)throw new Error('Completá precio y peso válidos para las 12 presentaciones.');
        return {flavor,size,price:Number(row.price),weight_grams:Number(row.weight_grams),updated_at:new Date().toISOString()};
      })));
      for(const row of config.ingredients){if(!row.name||(row.packageQty!==null&&(!Number.isFinite(Number(row.packageQty))||Number(row.packageQty)<0))||(row.purchasePrice!==null&&(!Number.isFinite(Number(row.purchasePrice))||Number(row.purchasePrice)<0)))throw new Error('Revisá nombres y valores de los ingredientes.');}
      for(const [flavor,lines] of Object.entries(config.recipes)){if(!Object.hasOwn(names,flavor)||lines.some(line=>!ingredient(line.ingredient)||!groups.includes(line.section)||!Number.isFinite(Number(line.quantity))||line.quantity<0))throw new Error('Hay una línea de receta inválida.');}
      const {error:priceError}=await db.from('budin_prices').upsert(priceRows,{onConflict:'flavor,size'});if(priceError)throw priceError;
      const {error:configError}=await db.from('budin_cost_config').upsert({id:'production',config,updated_at:new Date().toISOString()},{onConflict:'id'});if(configError)throw configError;
      prices=priceRows;saveStatus.textContent='Cambios guardados. Los precios públicos se actualizaron.';
    } catch(error) { saveStatus.textContent=error.message||'No se pudo guardar. Revisá la conexión y las políticas de Supabase.'; }
  });
  db.auth.getSession().then(({data})=>data.session?.user&&loadDashboard(data.session.user));
})();
