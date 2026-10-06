// Run in Figma Desktop to access the user's installed local fonts.
const pageIds = ['92:248','92:249','92:250','92:251','92:252','92:253','92:254','92:255'];
const report = {styles:[], pages:[], mutatedNodeIds:[], errors:[]};
function show(title, data) {
  figma.showUI('<main style="font:13px system-ui;padding:16px"><h2>'+title+'</h2><textarea aria-label="Typography update report" style="width:100%;height:470px">'+JSON.stringify(data,null,2).replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</textarea></main>',{width:600,height:580});
}
async function run() {
  if (figma.fileKey && figma.fileKey !== 'w4nc4L3hNF63uh2HBX9Np5') throw new Error('Open the Mimo design file first.');
  const fonts = (await figma.listAvailableFontsAsync()).map(f=>f.fontName).filter(f=>/labil.*grotesk/i.test(f.family));
  report.availableFonts=fonts;
  if (!fonts.length) throw new Error('Labil Grotesk is not available in this Figma Desktop session. No changes made.');
  function weight(f) {
    const s=(f.family+' '+f.style).toLowerCase().replace(/\s/g,'');
    if (/black|heavy/.test(s)) return 900;
    if (/extrabold|ultrabold/.test(s)) return 800;
    if (/semibold|demibold/.test(s)) return 600;
    if (/bold/.test(s)) return 700;
    if (/medium/.test(s)) return 500;
    if (/light/.test(s)) return 300;
    return 400;
  }
  function target(f) {
    const italic=/italic|oblique/i.test(f.style);
    const candidates=fonts.filter(t=>/italic|oblique/i.test(t.family+' '+t.style)===italic);
    if (!candidates.length) throw new Error('No corresponding Labil face for '+JSON.stringify(f));
    return candidates.slice().sort((a,b)=>Math.abs(weight(a)-weight(f))-Math.abs(weight(b)-weight(f)))[0];
  }
  const styles=(await figma.getLocalTextStylesAsync()).filter(s=>s.name.startsWith('Mimo/System/'));
  const pages=[];
  const loads=new Map();
  function load(f) {const key=JSON.stringify(f);if(!loads.has(key)) loads.set(key,figma.loadFontAsync(f));}
  for(const s of styles) {load(s.fontName);load(target(s.fontName));}
  for(const id of pageIds) {
    const page=await figma.getNodeByIdAsync(id); if(!page || page.type!=='PAGE') throw new Error('Missing page '+id);
    await page.loadAsync();
    const nodes=page.findAllWithCriteria({types:['TEXT']});
    const entries=nodes.map(n=>({node:n,segments:n.getStyledTextSegments(['fontName'])}));
    for(const e of entries) for(const s of e.segments){load(s.fontName);if(s.fontName.family==='Nunito')load(target(s.fontName));}
    pages.push({page,entries});
  }
  await Promise.all([...loads.values()]);
  for(const s of styles) {const before=s.fontName; s.fontName=target(before); report.styles.push({id:s.id,name:s.name,before,after:s.fontName});}
  for(const {page,entries} of pages) {
    let updated=0;
    for(const {node:n,segments} of entries) {
      let changed=false;
      for(const s of segments) if(s.fontName.family==='Nunito') {n.setRangeFontName(s.start,s.end,target(s.fontName));changed=true;}
      if(n.characters.includes('Nunito')) {n.characters=n.characters.replace(/Nunito/g,'Labil Grotesk');changed=true;}
      if(changed){report.mutatedNodeIds.push(n.id);updated++;}
    }
    const remaining=entries.filter(e=>e.node.getStyledTextSegments(['fontName']).some(s=>s.fontName.family==='Nunito')).map(e=>e.node.id);
    report.pages.push({id:page.id,name:page.name,textNodes:entries.length,updated,remainingNunito:remaining});
  }
  figma.commitUndo();
  show('Labil Grotesk typography updated',report);
}
run().catch(error=>{report.errors.push(String(error));show('Typography update stopped',report);});
