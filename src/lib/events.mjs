export const identities = {Rashid:{initial:'R',color:'peach'},Kamaal:{initial:'K',color:'blue'},Sophia:{initial:'S',color:'lilac'}};
export const globalPaymentMethods = {cashapp:{enabled:false,url:''},venmo:{enabled:false,url:''},zelle:{enabled:false,destination:''},card:{enabled:false,url:''}};
export const labels = {funding:'Needs help',funded:'Fully funded',upcoming:'Upcoming',completed:'Completed','made-possible':'Made possible'};
export const money = value => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(value);
export function todayKey(now = new Date()) {return new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);}
export function statusOf(e,today=todayKey()) {
 if(e.status && e.status!=='auto') return e.status;
 const funded = e.goal != null && e.raised != null && e.raised>=e.goal;
 if(e.date && e.date<today) return funded?'made-possible':'completed';
 return funded?'funded':e.goal!=null?'funding':'upcoming';
}
export function progress(e) {return e.goal && e.raised!=null ? {percent:Math.min(100,Math.round(e.raised/e.goal*100)),remaining:Math.max(0,e.goal-e.raised)}:null;}
export function dateLabel(date) {return date ? new Date(date+'T12:00:00Z').toLocaleDateString('en-US',{month:'long',day:'numeric',timeZone:'UTC'}):'Date to come';}
export function countdown(date,today=todayKey()) {if(!date)return 'A milestone ahead';const n=Math.round((Date.parse(date)-Date.parse(today))/86400000);return n===0?'Today':n===1?'Tomorrow':n>0?`In ${n} days`:'A moment to remember';}
export function sortedEvents(events) {return [...events].sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999'));}
export function safeLink(value) {try {return new URL(value).protocol==='https:'?value:null;} catch{return null;}}
export function paymentOptions(e) {const all={...globalPaymentMethods};for(const [key,value] of Object.entries(e.paymentMethods||{}))all[key]={...all[key],...value};return Object.entries(all).filter(([key,m])=>m.enabled && (key==='zelle'?Boolean(m.destination?.trim()):Boolean(safeLink(m.url))));}
