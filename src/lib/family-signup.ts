const SUBSCRIBED_KEY = 'familyUpdatesSubscribed';
const DISMISSED_KEY = 'familyUpdatesDismissedAt';
const LAST_SHOWN_KEY = 'familyUpdatesLastShownAt';
const DISMISSAL_MS = 30 * 24 * 60 * 60 * 1000;
const SHOWN_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
const dialog = document.querySelector<HTMLDialogElement>('#family-signup-dialog');
const forms = document.querySelectorAll<HTMLFormElement>('[data-signup-form]');

function readStorage(key: string) { try { return localStorage.getItem(key); } catch { return null; } }
function writeStorage(key: string, value: string) { try { localStorage.setItem(key, value); } catch { /* Form still works without storage. */ } }
function ageOf(key: string) { const value=readStorage(key); if(!value)return Infinity; const time=Date.parse(value); return Number.isFinite(time)?Date.now()-time:Infinity; }
function isEligible() { return readStorage(SUBSCRIBED_KEY)!=='true'&&ageOf(DISMISSED_KEY)>=DISMISSAL_MS&&ageOf(LAST_SHOWN_KEY)>=SHOWN_COOLDOWN_MS; }
function openSignup(manual=false) { if(!dialog||dialog.open||(!manual&&!isEligible()))return; dialog.showModal(); if(!manual)writeStorage(LAST_SHOWN_KEY,new Date().toISOString()); setTimeout(()=>dialog.querySelector<HTMLInputElement>('input[name="firstName"]')?.focus(),50); }
function dismissSignup() { if(!dialog?.open)return; writeStorage(DISMISSED_KEY,new Date().toISOString()); dialog.close(); }
function setFieldError(form:HTMLFormElement,input:HTMLInputElement,message:string){input.setAttribute('aria-invalid',message?'true':'false');const error=form.querySelector<HTMLElement>(`[data-error-for="${input.name}"]`);if(error)error.textContent=message;}
function validate(form:HTMLFormElement){const name=form.elements.namedItem('firstName') as HTMLInputElement;const email=form.elements.namedItem('email') as HTMLInputElement;let valid=true;name.value=name.value.trim();email.value=email.value.trim();if(!name.value){setFieldError(form,name,'Please enter your name.');valid=false}else setFieldError(form,name,'');if(!email.value){setFieldError(form,email,'Please enter your email address.');valid=false}else if(!email.validity.valid){setFieldError(form,email,'Please enter a valid email address.');valid=false}else setFieldError(form,email,'');if(!valid)form.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus();return valid;}

forms.forEach(form=>{
  form.addEventListener('input',event=>{const input=event.target as HTMLInputElement;if(input.name==='firstName'||input.name==='email')setFieldError(form,input,'');});
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(!validate(form))return;
    const submit=form.querySelector<HTMLButtonElement>('button[type="submit"]')!;const status=form.querySelector<HTMLElement>('[data-signup-status]')!;const data=new FormData(form);
    submit.disabled=true;submit.textContent='Signing you up…';status.textContent='';
    try{
      const response=await fetch('/api/family-signup.php',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({firstName:String(data.get('firstName')||'').trim(),email:String(data.get('email')||'').trim(),website:String(data.get('website')||'')})});
      const result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.message||'We couldn’t save your signup. Please try again.');
      writeStorage(SUBSCRIBED_KEY,'true');status.classList.add('is-success');status.textContent='You’re on the list. We’ll keep you posted!';submit.textContent='You’re signed up ✓';form.reset();setTimeout(()=>dialog?.open&&dialog.close(),1800);
    }catch(error){status.classList.remove('is-success');status.textContent=error instanceof Error?error.message:'We couldn’t save your signup. Please try again.';submit.disabled=false;submit.textContent='Keep me updated →';}
  });
});

document.querySelectorAll<HTMLElement>('[data-open-signup]').forEach(button=>button.addEventListener('click',()=>openSignup(true)));
dialog?.querySelector('[data-close-signup]')?.addEventListener('click',dismissSignup);
dialog?.addEventListener('cancel',event=>{event.preventDefault();dismissSignup();});
dialog?.addEventListener('click',event=>{if(event.target===dialog)dismissSignup();});
if(dialog&&isEligible()){
  let opened=false;
  const tryOpen=()=>{if(opened||document.hidden||document.querySelector('dialog[open]'))return;opened=true;openSignup();};
  const onScroll=()=>{const scrollable=document.documentElement.scrollHeight-innerHeight;if(scrollable>0&&scrollY/scrollable>=.3){removeEventListener('scroll',onScroll);setTimeout(tryOpen,1200);}};
  addEventListener('scroll',onScroll,{passive:true});setTimeout(tryOpen,25000);
}
