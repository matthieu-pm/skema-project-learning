await Promise.all(['Regular','Bold','ExtraBold','Black'].map(style=>figma.loadFontAsync({family:'Nunito',style})));
const page=await figma.getNodeByIdAsync(PAGE);await figma.setCurrentPageAsync(page);
if(page.children.length)throw new Error('Page already populated; inspect before rebuilding '+page.name);
const vars=await figma.variables.getLocalVariablesAsync();const V=Object.fromEntries(Object.entries(ST.variables).map(([k,id])=>[k,vars.find(v=>v.id===id)]));const M=Object.fromEntries(Object.entries(ST.metrics).map(([k,id])=>[k,vars.find(v=>v.id===id)]));
const styles={};for(const [k,id]of Object.entries(ST.styles))styles[k]=await figma.getStyleByIdAsync(id);
const col=await figma.variables.getVariableCollectionByIdAsync(ST.collections.roles);
const paint=k=>figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:0,g:0,b:0}},'color',V[k]);
const rgb=h=>({r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255});
function metric(n,p,k){if(M[k])n.setBoundVariable(p,M[k]);}
function role(n,r){n.setExplicitVariableModeForCollection(col,ST.modes.find(m=>m.name===r).modeId);}
function txt(p,s,style='Body small',color='ink',w){const t=figma.createText();t.fontName=styles[style].fontName;t.textStyleId=styles[style].id;t.characters=s;t.name=s.length>50?s.slice(0,50):s;t.fills=[paint(color)];p.appendChild(t);if(w){t.textAutoResize='HEIGHT';t.resize(w,t.height);}return t;}
function box(p,name,dir='VERTICAL',gap=12,w){const n=figma.createAutoLayout(dir,{name,itemSpacing:gap});n.fills=[];p.appendChild(n);if(w){n.resize(w,40);if(dir==='VERTICAL'){n.primaryAxisSizingMode='AUTO';n.counterAxisSizingMode='FIXED';}else{n.primaryAxisSizingMode='FIXED';n.counterAxisSizingMode='AUTO';}}metric(n,'itemSpacing','space/'+gap);return n;}
function pad(n,v){for(const x of ['Top','Right','Bottom','Left']){n['padding'+x]=v;metric(n,'padding'+x,'space/'+v);}}
function rounded(n,r){n.cornerRadius=r;metric(n,'cornerRadius','radius/'+r);}
function outline(n,k='line',weight=2){n.strokes=[paint(k)];n.strokeWeight=weight;metric(n,'strokeWeight','stroke/'+weight);}
function expose(c,t,name='Label'){const prop=c.addComponentProperty(name,'TEXT',t.characters);t.componentPropertyReferences={characters:prop};return prop;}
function comp(name,w,h,dir='HORIZONTAL',fill='paper'){const c=figma.createComponent();c.name=name;c.layoutMode=dir;c.resize(w,h);c.fills=fill?[paint(fill)]:[];c.counterAxisAlignItems='CENTER';c.primaryAxisAlignItems='CENTER';rounded(c,13);metric(c,'itemSpacing','space/0');page.appendChild(c);return c;}
let libraryY=80;
// Adapted grid layout from createComponentWithVariants.js; a single page switch per call.
function set(name,variants,desc){const c=figma.combineAsVariants(variants,page);c.name='Mimo/'+name;c.description=desc;const columns=Math.min(4,variants.length);const w=Math.max(...variants.map(n=>n.width)),h=Math.max(...variants.map(n=>n.height));variants.forEach((n,i)=>{n.x=32+(i%columns)*(w+32);n.y=32+Math.floor(i/columns)*(h+32);});c.resizeWithoutConstraints(columns*(w+32)+32,Math.ceil(variants.length/columns)*(h+32)+32);c.x=1400;c.y=libraryY;libraryY+=c.height+80;return c;}
function doc(title,subtitle){const n=box(page,'Review · '+title,'VERTICAL',32,1160);n.x=80;n.y=80;pad(n,48);n.fills=[paint('paper')];rounded(n,24);txt(n,'MIMO  /  DESIGN SYSTEM','Micro','shadow');txt(n,title,'Display');txt(n,subtitle,'Body','muted',1064);return n;}
function section(p,title,note){const n=box(p,title,'VERTICAL',20,1064);txt(n,title,'Heading');if(note)txt(n,note,'Detail','muted',1064);return n;}
function samples(p,variants,labels,columns=3){for(let i=0;i<variants.length;i+=columns){const row=box(p,'Examples','HORIZONTAL',24);for(let j=i;j<Math.min(i+columns,variants.length);j++){const cell=box(row,labels?.[j]||variants[j].name,'VERTICAL',12);const instance=variants[j].createInstance();cell.appendChild(instance);txt(cell,labels?.[j]||variants[j].name,'Caption','muted',Math.min(instance.width||200,326));}}}
const result={pageId:page.id,components:{},reviewIds:[]};
function finish(root){result.reviewIds.push(root.id);result.createdNodeIds=[page.id,...page.findAll(()=>true).map(n=>n.id)];result.counts={components:page.findAllWithCriteria({types:['COMPONENT']}).length,sets:page.findAllWithCriteria({types:['COMPONENT_SET']}).length,instances:page.findAllWithCriteria({types:['INSTANCE']}).length,text:page.findAllWithCriteria({types:['TEXT']}).length};return result;}
