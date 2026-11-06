const b=await figma.getNodeByIdAsync('568:4173');if(!b)throw new Error('Map missing');const fm={};for(const t of b.findAllWithCriteria({types:['TEXT']}))for(const s of t.getStyledTextSegments(['fontName']))fm[JSON.stringify(s.fontName)]=s.fontName;await Promise.all(Object.values(fm).map(f=>figma.loadFontAsync(f)));await Promise.all(['Regular','Medium','Bold'].map(style=>figma.loadFontAsync({family:'Inter',style})));
const created=[],mutated=[],removed=[];const color=h=>({r:parseInt(h.slice(0,2),16)/255,g:parseInt(h.slice(2,4),16)/255,b:parseInt(h.slice(4,6),16)/255});
function change(n,p){for(const k in p)n[k]=p[k];mutated.push(n.id)}
function text(p,s,x,y,w,size,style){const n=figma.createText();created.push(n.id);n.fontName={family:'Inter',style};n.fontSize=size;n.lineHeight={unit:'PIXELS',value:Math.round(size*1.35)};n.fills=[{type:'SOLID',color:color('1E1E1E')}];n.characters=s;p.appendChild(n);n.x=x;n.y=y;n.resize(w,10);n.textAutoResize='HEIGHT';return n}
b.resize(3936,4452);mutated.push(b.id);
for(const n of b.children){if(n.type==='SECTION'&&n.x>=328){n.x+=240;mutated.push(n.id)}if(n.type==='TEXT'&&n.x===88){n.resize(3720,n.height);mutated.push(n.id)}}
const subtitle=await figma.getNodeByIdAsync('587:3754');change(subtitle,{characters:'Gilbert’s goal: spend less time preparing and more time teaching.',fontName:{family:'Inter',style:'Bold'}});
const goals=[
{lane:'587:3791',body:'587:3793',meta:'587:3794',goal:'Prepare, teach and recap one useful lesson for one learner.'},
{lane:'587:3795',body:'587:3797',meta:'587:3798',goal:'Personalize existing material without rebuilding it, then give a clear next step.'},
{lane:'587:3799',body:'587:3801',meta:'587:3802',goal:'Use AI to assist preparation while Gilbert checks and approves the lesson.'}
];
const goalIds=[];
for(const d of goals){const lane=await figma.getNodeByIdAsync(d.lane);lane.resize(3840,lane.height);mutated.push(lane.id);
for(const n of [...lane.children]){if(n.type==='SECTION'){n.x+=240;mutated.push(n.id)}else if(n.type==='TEXT'){n.resize(456,n.height);mutated.push(n.id)}}
const c=figma.createSection();created.push(c.id);lane.appendChild(c);c.name='';c.x=24;c.y=96;c.resize(456,272);c.fills=[{type:'SOLID',color:color('FFFFFF')}];c.strokes=[{type:'SOLID',color:color('72B9EC')}];c.strokeWeight=2;goalIds.push(c.id);text(c,'GOAL',24,20,408,24,'Bold');
const body=await figma.getNodeByIdAsync(d.body);c.appendChild(body);body.x=24;body.y=68;body.fontName={family:'Inter',style:'Bold'};body.fontSize=30;body.lineHeight={unit:'PIXELS',value:40};body.characters=d.goal;body.resize(408,10);body.textAutoResize='HEIGHT';mutated.push(body.id);
const meta=await figma.getNodeByIdAsync(d.meta);change(meta,{characters:'Proposed slice goal',y:392});
}
const redundant=await figma.getNodeByIdAsync('602:4010');if(redundant){removed.push(redundant.id);redundant.remove()}
const quality=await figma.getNodeByIdAsync('602:4063');quality.resize(3840,1192);mutated.push(quality.id);
let i=0;for(const n of quality.children){if(n.type==='SECTION'){n.x=24+(i%5)*752;n.resize(728,440);mutated.push(n.id);for(const t of n.children){if(t.type==='TEXT'){t.resize(680,t.height);mutated.push(t.id)}}i++}else if(n.type==='TEXT'){n.resize(3792,n.height);mutated.push(n.id)}}
const issues=[];function audit(n){if(!('children'in n))return;for(const c of n.children){if(c.x<0||c.y<0||c.x+c.width>n.width+1||c.y+c.height>n.height+1)issues.push({kind:'overflow',id:c.id,parent:n.id});audit(c)}const tt=n.children.filter(c=>c.type==='TEXT');for(let i=0;i<tt.length;i++)for(let j=i+1;j<tt.length;j++){const a=tt[i],c=tt[j];if(a.x<c.x+c.width&&a.x+a.width>c.x&&a.y<c.y+c.height&&a.y+a.height>c.y)issues.push({kind:'textOverlap',ids:[a.id,c.id]})}}audit(b);
return {createdNodeIds:created,mutatedNodeIds:mutated,removedNodeIds:removed,goalIds,goals:goals.map(d=>d.goal),boardId:b.id,bounds:{x:b.x,y:b.y,w:b.width,h:b.height},issues};
