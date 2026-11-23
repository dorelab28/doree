const url = 'https://egnmdruacjyblcarwhrs.supabase.co';
const anonKey = 'sb_publishable_hwfFhL4qccUmuCqKSlz3OA_qNQTjReR';

const recipeBase = [
  {ingredient:'butter',quantity:180,section:'masa'},{ingredient:'sugar-white',quantity:180,section:'masa'},
  {ingredient:'eggs',quantity:3.6,section:'masa'},{ingredient:'flour',quantity:230,section:'masa'},
  {ingredient:'milk',quantity:130,section:'masa'},{ingredient:'oil',quantity:30,section:'masa'},
  {ingredient:'baking-powder',quantity:10,section:'masa'},{ingredient:'vanilla',quantity:5,section:'masa'},
  {ingredient:'salt',quantity:2,section:'masa'}
];
const defaults = {
  ingredients: [
    ['butter','Manteca',13600,1000,'g'],['flour','Harina 0000',1600,1000,'g'],['sugar-white','Azúcar blanca',1900,1000,'g'],
    ['sugar-brown','Azúcar rubia',2400,1000,'g'],['eggs','Huevos',325,1,'unidad'],['hazelnut-paste','Pasta de avellanas / Nutella',87300,4000,'g'],
    ['pistachio-paste','Pasta de pistacho',85700,4000,'g'],['white-chocolate','Chocolate blanco',13000,1000,'g'],['dark-chocolate','Chocolate semiamargo',13000,1000,'g'],
    ['cocoa','Cacao amargo',20000,1000,'g'],['cream','Crema de leche',5500,500,'ml'],['cream-cheese','Queso crema',25000,3000,'g'],
    ['walnuts','Nueces',20000,1000,'g'],['milk','Leche',2500,1000,'ml'],['oil','Aceite',4000,1000,'ml'],['carrot','Zanahoria',4000,1000,'g'],
    ['cinnamon','Canela',3000,100,'g'],['yogurt','Yogur natural',3000,1000,'ml'],['baking-powder','Polvo de hornear',2000,100,'g'],
    ['bicarbonate','Bicarbonato',2000,100,'g'],['vanilla','Esencia de vainilla',3000,1000,'ml'],['powdered-sugar','Azúcar impalpable',10000,1000,'g'],
    ['red-color','Colorante rojo',25000,500,'g'],['packaging','Packaging budinera',2000,1,'unidad'],['salt','Sal',null,null,'g'],
    ['frosting','Frosting preparado (costo por registrar)',null,null,'g'],['chopped-pistachio','Pistacho picado (costo por registrar)',null,null,'g'],['chopped-hazelnut','Avellanas picadas (cantidad y costo por registrar)',null,null,'g']
  ].map(([id,name,purchasePrice,packageQty,unit])=>({id,name,purchasePrice,packageQty,unit,updatedAt:'2026-11-23',sourceStatus:purchasePrice===null?'Sin precio registrado':'Valor registrado · pendiente de actualización'})),
  recipes: {
    nutella:[...recipeBase,{ingredient:'hazelnut-paste',quantity:180,section:'relleno'},{ingredient:'hazelnut-paste',quantity:70,section:'cobertura'},{ingredient:'dark-chocolate',quantity:100,section:'cobertura'},{ingredient:'cream',quantity:40,section:'cobertura'},{ingredient:'chopped-hazelnut',quantity:0,section:'decoración'}],
    pistacho:[...recipeBase,{ingredient:'pistachio-paste',quantity:60,section:'masa'},{ingredient:'pistachio-paste',quantity:180,section:'relleno'},{ingredient:'white-chocolate',quantity:100,section:'cobertura'},{ingredient:'pistachio-paste',quantity:50,section:'cobertura'},{ingredient:'chopped-pistachio',quantity:40,section:'decoración'}],
    'red-velvet':[...recipeBase,{ingredient:'cocoa',quantity:20,section:'masa'},{ingredient:'red-color',quantity:5,section:'masa'},{ingredient:'frosting',quantity:150,section:'relleno'},{ingredient:'white-chocolate',quantity:180,section:'cobertura'}],
    'carrot-cake':[...recipeBase,{ingredient:'carrot',quantity:200,section:'masa'},{ingredient:'walnuts',quantity:100,section:'masa'},{ingredient:'cinnamon',quantity:5,section:'masa'},{ingredient:'cream-cheese',quantity:200,section:'cobertura'},{ingredient:'butter',quantity:50,section:'cobertura'},{ingredient:'powdered-sugar',quantity:80,section:'cobertura'}]
  },
  sizes:{chico:{weight:900,multiplier:.75,packaging:1},mediano:{weight:1200,multiplier:1,packaging:1},doble:{weight:2400,multiplier:2,packaging:2}},
  operations:{wastePercent:null,laborPerMedium:null,energyPerMedium:null,targetMargin:30,productionValidated:false},
  notes:['Cantidades iniciales: pendientes de validar en producción.','Nutella se aproxima con la presentación registrada como pasta de avellanas; confirmar equivalencia.','Huevos convertidos a 3,6 unidades suponiendo 50 g por huevo.','Frosting preparado, sal, pistacho picado y avellanas picadas no tienen precio registrado.','Decoración y cantidades de toppings pendientes de confirmar.','Mano de obra, energía y merma requieren valores reales.','El tamaño doble se especifica como dos budineras medianas.']
};

module.exports = async (req, res) => {
  res.setHeader('Cache-Control','no-store, private');
  res.setHeader('Vary','Authorization');
  if (req.method !== 'GET') return res.status(405).json({error:'Method not allowed'});
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i,'');
  if (!token) return res.status(401).json({error:'Unauthorized'});
  try {
    const auth = await fetch(`${url}/auth/v1/user`, {headers:{apikey:anonKey,Authorization:`Bearer ${token}`}});
    if (!auth.ok) return res.status(401).json({error:'Unauthorized'});
    const user = await auth.json();
    const access = await fetch(`${url}/rest/v1/budin_admins?select=user_id&user_id=eq.${encodeURIComponent(user.id)}`, {headers:{apikey:anonKey,Authorization:`Bearer ${token}`}});
    if (!access.ok || !(await access.json()).length) return res.status(403).json({error:'Forbidden'});
    return res.status(200).json({config:defaults});
  } catch { return res.status(503).json({error:'Configuration unavailable'}); }
};
