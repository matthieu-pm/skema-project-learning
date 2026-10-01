export type Role = '' | 'learner' | 'teacher';
export type Answers = {
  role: Role; email: string; age: string; guardianEmail: string; guardianReady: boolean;
  code: string; verified: boolean; learningLanguages: string[]; learningLevels: Record<string,string>; topic: string;
  personalGoal: string; format: string; city: string;
  days: string[]; time: string; notifications: boolean; widget: boolean;
  name: string; teachingLanguages: string[]; teachingLevels: string[]; approach: string;
  duration: string; rate: string; legalName: string; dateOfBirth: string; country: string;
  documentType: string; documentReady: boolean; selfieReady: boolean; identityPreviewComplete: boolean; identityMethod: 'document' | 'persona';
};
export const initialAnswers: Answers = {
  role:'', email:'', age:'', guardianEmail:'', guardianReady:false, code:'', verified:false,
  learningLanguages:[], learningLevels:{}, topic:'', personalGoal:'', format:'', city:'',
  days:[], time:'', notifications:false, widget:false, name:'', teachingLanguages:[],
  teachingLevels:[], approach:'', duration:'', rate:'', legalName:'', dateOfBirth:'', country:'',
  documentType:'', documentReady:false, selfieReady:false, identityPreviewComplete:false, identityMethod:'document',
};
export const languageChoices = ['Spanish','French','German','Italian','English','Japanese'] as const;
const languageLevelSteps = languageChoices.map(language=>`level-${language}` as const);
export function toggleLearningLanguage(a: Answers, language: string): Partial<Answers> {
  const selected=a.learningLanguages.includes(language);
  const learningLevels={...a.learningLevels};
  if(selected)delete learningLevels[language];
  return {learningLanguages:selected?a.learningLanguages.filter(value=>value!==language):[...a.learningLanguages,language],learningLevels};
}
export const sharedSteps = ['welcome','greeting','role','setup-intro','email'] as const;
export const identitySteps = ['identity-intro','legal-name','date-of-birth','country','document-type','document','selfie'] as const;
export const needsGuardian = (a: Answers) => a.role==='learner' && a.age==='Under 18';
export const clearedIdentity = {legalName:'',dateOfBirth:'',country:'',documentType:'',documentReady:false,selfieReady:false,identityPreviewComplete:false,identityMethod:'document' as const};
export function changeAge(a: Answers, age: string): Partial<Answers> {
  return a.age===age ? {age} : {age,guardianEmail:'',guardianReady:false,...clearedIdentity};
}
export const verificationExit = (a: Answers): Step => a.role==='teacher'?'teacher-draft':needsGuardian(a)?'language':'learner-ready';
export const learnerSteps = ['language','level','topic','personal-goal','resource','encouragement','format','city','days','time','notifications','widget','benefits',...identitySteps,'learner-ready'] as const;
export const teacherSteps = ['teacher-intro','name','photo','teaching-languages','teaching-levels','approach','format','city','duration','rate','teacher-review',...identitySteps,'verification-ready'] as const;
export const stepIds = [...sharedSteps,'age','guardian','guardian-handoff','verify',...learnerSteps,...teacherSteps,...languageLevelSteps,'persona-link','teacher-draft'] as const;
export type Step = typeof stepIds[number];
export const emailValid = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
export function routeFor(a: Answers): Step[] {
  const branch = a.role === 'teacher' ? teacherSteps : learnerSteps;
  const ageSteps: Step[] = a.role==='teacher'?[]:['age',...(a.age==='Under 18'?['guardian' as const]:[])];
  const verificationSteps: Step[] = a.identityMethod==='persona'?['identity-intro','persona-link']:[...identitySteps];
  const guardianVerification: Step[] = needsGuardian(a)?['guardian-handoff',...verificationSteps]:[];
  const remainingSteps = branch.filter(s=>(s!=='city'||a.format!=='Online') &&
    (!needsGuardian(a)||!identitySteps.some(identityStep=>identityStep===s)));
  return [...sharedSteps, ...ageSteps, 'verify', ...guardianVerification, ...remainingSteps.flatMap(s=>!needsGuardian(a)&&a.identityMethod==='persona'&&identitySteps.some(identityStep=>identityStep===s)?(s==='identity-intro'?verificationSteps:[]):s==='level'&&a.learningLanguages.length?a.learningLanguages.map(language=>`level-${language}` as Step):[s])];
}
export function nextStep(step: Step, a: Answers): Step | null {
  const route = routeFor(a), index = route.indexOf(step);
  return index < 0 ? null : route[index+1] ?? null;
}
export function validStep(step: Step,a: Answers): boolean {
  if(step.startsWith('level-'))return !!a.learningLevels[step.slice(6)];
  switch(step) {
    case 'role': return !!a.role;
    case 'email': return emailValid(a.email);
    case 'age': return !!a.age;
    case 'guardian': return emailValid(a.guardianEmail) && a.guardianEmail.trim().toLowerCase()!==a.email.trim().toLowerCase();
    case 'verify': return /^\d{6}$/.test(a.code);
    case 'language': return a.learningLanguages.length>0;
    case 'level': return a.learningLanguages.length>0 && a.learningLanguages.every(language=>!!a.learningLevels[language]);
    case 'topic': return !!a.topic;
    case 'personal-goal': return a.personalGoal.trim().length>=3;
    case 'name': return a.name.trim().length>=2;
    case 'teaching-languages': return a.teachingLanguages.length>0;
    case 'teaching-levels': return a.teachingLevels.length>0;
    case 'approach': return a.approach.trim().length>=5;
    case 'duration': return !!a.duration;
    case 'rate': return Number(a.rate)>0 && Number(a.rate)<=1000;
    case 'legal-name': return a.legalName.trim().length>=3;
    case 'date-of-birth': return dateOfBirthValid(a.dateOfBirth);
    case 'country': return a.country.trim().length>=2;
    case 'document-type': return !!a.documentType;
    case 'document': return a.documentReady;
    case 'selfie': return a.selfieReady;
    default: return true;
  }
}
export const levelChoices = [
  ['A1','I’m just starting out'],['A2','I can manage simple, everyday conversations'],
  ['B1','I can talk about familiar topics'],['B2','I can discuss a range of topics'],
  ['C1','I can express complex ideas'],['C2','I feel comfortable in almost any conversation'],
] as const;

// Keep date entry local to the verification preview, in explicit day/month/year order.
export function formatDateOfBirth(value: string): string {
  return value.replace(/\D/g,'').slice(0,8).replace(/^(\d{2})(\d)/,'$1/$2').replace(/^(\d{2}\/\d{2})(\d)/,'$1/$2');
}
export function dateOfBirthValid(value: string, today = new Date()): boolean {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if(!match)return false;
  const [,dayText,monthText,yearText]=match;
  const day=Number(dayText),month=Number(monthText),year=Number(yearText);
  if(year<1 || month<1 || month>12 || day<1)return false;
  const leap=year%4===0 && (year%100!==0 || year%400===0);
  const days=[31,leap?29:28,31,30,31,30,31,31,30,31,30,31];
  if(day>days[month-1])return false;
  return year*10000+month*100+day <= today.getFullYear()*10000+(today.getMonth()+1)*100+today.getDate();
}
