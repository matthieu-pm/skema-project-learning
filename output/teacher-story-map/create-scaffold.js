await Promise.all(['Regular','Bold','Medium','Semi Bold'].map(style=>figma.loadFontAsync({family:'Inter',style})));
const ids=[]; const h=hex=>({r:parseInt(hex.slice(0,2),16)/255,g:parseInt(hex.slice(2,4),16)/255,b:parseInt(hex.slice(4,6),16)/255});
function sec(parent,x,y,w,hh,color){const n=figma.createSection();ids.push(n.id);parent.appendChild(n);n.name='';n.x=x;n.y=y;n.resize(w,hh);n.fills=[{type:'SOLID',color:h(color)}];return n}
function txt(parent,s,x,y,w,size=24,style='Regular'){const n=figma.createText();ids.push(n.id);n.fontName={family:'Inter',style};n.fontSize=size;n.lineHeight={unit:'PIXELS',value:Math.round(size*1.35)};n.fills=[{type:'SOLID',color:h('1E1E1E')}];n.characters=s;parent.appendChild(n);n.x=x;n.y=y;n.resize(w,10);n.textAutoResize='HEIGHT';return n}
const b=sec(figma.currentPage,25032,27400,3648,2520,'FFFFFF');
txt(b,'Teacher story map · Gilbert',64,56,3480,64,'Bold');
txt(b,'From finding materials to sharing a teacher-approved recap.',64,152,3480,32);
txt(b,'Seven source actions · 14 product stories · 2 external-context stories · proposed priority slices',64,220,3480,22);
txt(b,'Read left to right for the journey; top to bottom for proposed priority. Every story is derived only from Gilbert’s journey.',64,264,3480,20);
const cols=['Find suitable materials','Create a teaching profile','Read the learner’s goal','Adapt a lesson','Approve the lesson','Teach the session','Share a recap'];
const bands=[['Awareness',0,1],['Onboarding',1,1],['Lesson preparation',2,3],['Teaching',5,1],['Follow-up',6,1]];
txt(b,'STAGES',48,346,224,24,'Bold');
txt(b,'ACTIVITIES',48,462,224,24,'Bold');txt(b,'Source backbone',48,506,224,20);
for(const [label,start,count]of bands){const n=sec(b,304+464*start,332,440*count+24*(count-1),80,'C2E5FF');txt(n,label,24,22,n.width-48,24,'Bold')}
const statuses=['Scenario · external','Current onboarding','Proposed in journey','Proposed in journey','Proposed in journey','Proposed in journey','Proposed in journey'];
for(let i=0;i<7;i++){const n=sec(b,304+464*i,436,440,160,'F5FBFF');txt(n,String(i+1).padStart(2,'0')+' / '+statuses[i],24,18,392,16,'Medium');txt(n,cols[i],24,56,392,28,'Bold')}
const lanes=[['R1 · Core journey','One useful lesson and a recap',648,'FFFBEF'],['R2 · More control','Refine the same seven actions',1116,'FFF7F0'],['R3 · Optional AI','Manual work stays available',1584,'F8F5FF']];
const laneIds=[];
for(const [label,goal,y,color]of lanes){const lane=sec(b,24,y-16,3600,436,color);laneIds.push(lane.id);txt(lane,label,24,24,232,28,'Bold');txt(lane,goal,24,114,232,22);txt(lane,'Proposed slice',24,210,232,16)}
txt(b,'Source and interpretation',64,2072,3480,32,'Bold');
const link=txt(b,'Teacher journey · Gilbert / seven original actions',64,2132,3480,24,'Medium');link.setRangeHyperlink(0,link.characters.length,{type:'URL',value:'https://www.figma.com/board/AYNNAqQDARTmwlsa6AYHsd?node-id=372-2151'});
txt(b,'Awareness is an existing search-engine / AI-search activity. Its two grey cards describe context, not a new in-app search feature.',64,2180,3480,22);
txt(b,'Stories and priorities are planning interpretations of the journey. Its first-person statements are illustrative voice, not interview quotations.',64,2224,3480,22);
txt(b,'Source labels are retained: onboarding is current; preparation, teaching and recap are proposed in this journey. These labels are not a fresh implementation audit.',64,2268,3480,22);
txt(b,'Unreviewed lesson drafts stay unshared. AI is optional and teacher-controlled. Reduced preparation and follow-up work remain hypotheses to test.',64,2340,3480,22);
return {createdNodeIds:ids,boardId:b.id,laneIds,bounds:{x:b.x,y:b.y,w:b.width,h:b.height},backbone:cols,sourceNode:'372:2151'};
