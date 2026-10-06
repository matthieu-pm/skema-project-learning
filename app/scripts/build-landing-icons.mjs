import * as icons from '@hugeicons/core-free-icons';
import { writeFileSync } from 'node:fs';

// Only these official Hugeicons are shipped; the complete library stays out of the browser.
const selected = {
  'arrow-up-right': 'ArrowUpRight01Icon', 'arrow-right': 'ArrowRight01Icon',
  'arrow-down': 'ArrowDown01Icon', menu: 'Menu01Icon', close: 'Cancel01Icon',
  search: 'Search01Icon', message: 'Message01Icon', people: 'UserMultipleIcon',
  book: 'BookOpen01Icon', target: 'Target01Icon', check: 'Tick02Icon',
  plus: 'Add01Icon', globe: 'Globe02Icon', travel: 'Airplane01Icon',
  work: 'Briefcase01Icon', sparkles: 'SparklesIcon', clock: 'Clock01Icon',
  calendar: 'Calendar03Icon',
};
const escape = (value) => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;');
const symbols = Object.entries(selected).map(([id, name]) => {
  const paths = icons[name].map(([tag, props]) => {
    const attributes = Object.entries(props).filter(([key]) => key !== 'key')
      .map(([key, value]) => `${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}="${escape(value)}"`).join(' ');
    return `<${tag} ${attributes}/>`;
  }).join('');
  return `<symbol id="${id}" viewBox="0 0 24 24" fill="none">${paths}</symbol>`;
});
writeFileSync(new URL('../public/landing/hugeicons.svg', import.meta.url),
  `<!-- Hugeicons core-free-icons 4.3.5, MIT. https://hugeicons.com -->\n<svg xmlns="http://www.w3.org/2000/svg">${symbols.join('\n')}</svg>\n`);
console.log(`Built ${symbols.length} Hugeicons for the landing page.`);
