import React,{useEffect,useState} from 'react';
import {Link,NavLink,Route,Routes,useLocation,useNavigate} from 'react-router-dom';
import {read,save,saveOnboarding,clearAllRaahiData} from './db';
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Placeholder from './pages/Placeholder';
export function Icon({name='arrow',size=24}){const paths={arrow:'M5 12h14m-6-6 6 6-6 6',compass:'m16 8-3 5-5 3 3-5 5-3M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18',book:'M12 6v15m0-15C9 3 5 3 2 4v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-3-1-7-1-10 2',sun:'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',people:'M16 21v-3a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v3m20 0v-3a4 4 0 0 0-3-4M13 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0m3-3a4 4 0 0 1 0 8',check:'m5 12 4 4L19 6',mic:'M9 5a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0zm-3 6v1a6 6 0 0 0 12 0v-1m-6 7v4m-3 0h6',leaf:'M20 3C9 2 2 9 6 16s16 0 14-13ZM5 20 15 9',wifi:'M3 8a15 15 0 0 1 18 0M6 12a10 10 0 0 1 12 0m-9 4a5 5 0 0 1 6 0m-3 4h.01'};return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]||paths.arrow}/></svg>}
export default function App(){const [profile,setProfile]=useState(null),[ready,setReady]=useState(false),[error,setError]=useState(''),[online,setOnline]=useState(navigator.onLine),[reconnected,setReconnected]=useState(false),[language,setLanguage]=useState('en');const location=useLocation();const navigate=useNavigate();
const resetRequested=location.pathname==='/onboarding' && new URLSearchParams(location.search).get('reset')==='true';
useEffect(()=>{
  let active=true;
  setReady(false);
  async function load(){
    try{
      const [savedProfile,conversation]=await Promise.all([read('profile'),read('onboarding')]);
      if(resetRequested) await clearAllRaahiData();
      if(!active)return;
      setProfile(resetRequested?null:savedProfile);
      setLanguage(previous=>conversation?.language || savedProfile?.language || previous);
      setError('');
      if(resetRequested) navigate('/onboarding',{replace:true});
    }catch{if(active)setError('Device storage is unavailable. Please enable browser storage and reload to try again.');}
    finally{if(active)setReady(true);}
  }
  load();
  return()=>{active=false};
},[resetRequested]);
useEffect(()=>{const on=()=>{setOnline(true);setReconnected(true)},off=()=>{setOnline(false);setReconnected(false)};window.addEventListener('online',on);window.addEventListener('offline',off);return()=>{window.removeEventListener('online',on);window.removeEventListener('offline',off)}},[]);
function resetStudent(){setProfile(null);setError('');navigate('/onboarding',{replace:true});}
useEffect(()=>{window.scrollTo(0,0);document.documentElement.lang=language},[location.pathname,language]);async function updateProfile(value,conversation){if(conversation)await saveOnboarding(conversation);else await save('profile',value);setProfile(value)}return <><header className="header"><Link className="brand" to="/" aria-label="Raahi home"><span className="brand-mark">r<span>✦</span></span>raahi<span className="brand-dot">.</span></Link><nav className="desktop-nav" aria-label="Main navigation"><NavLink to="/" end>Home</NavLink><NavLink to="/future">Discover</NavLink><NavLink to="/journey">Learn</NavLink><NavLink to="/opportunities">Opportunities</NavLink></nav><div className="header-actions"><div className="language" aria-label="Language"><button className={language==='en'?'selected':''} onClick={()=>setLanguage('en')}>EN</button><span>/</span><button className={language==='hi'?'selected':''} onClick={()=>setLanguage('hi')}>हिन्दी</button></div><Link className="header-start" to={profile?'/dashboard':'/onboarding'}>{profile?'My dashboard':'Get started'} <Icon size={16}/></Link></div></header><div className={'connection '+(!online?'offline':'')} role="status"><span className="status-dot"/>{online?(reconnected?'Back online • Ready to sync':'Online • Made for wherever you are'):'Offline • Your progress is saved'}</div>{error&&<p role="alert" className="error">{error}</p>}{!ready||resetRequested?<main className="page">{error?'Could not reset your demo. Please reload to try again.':'Opening your journey…'}</main>:<Routes><Route path="/" element={<Landing profile={profile} language={language}/>}/><Route path="/onboarding" element={<Onboarding profile={profile} onSave={updateProfile} language={language} setLanguage={setLanguage}/>}/><Route path="/dashboard" element={<Dashboard profile={profile} onReset={resetStudent}/>}/><Route path="/profile" element={<Onboarding profile={profile} onSave={updateProfile} language={language} setLanguage={setLanguage}/>}/>{['future','journey','opportunities','projects','facilitator'].map(kind=><Route key={kind} path={'/'+kind} element={<Placeholder kind={kind} profile={profile} online={online}/>}/>)}<Route path="*" element={<main className="page"><h1>A new turn in the road.</h1><Link className="button" to="/">Back home <Icon/></Link></main>}/></Routes>}<footer><Link className="footer-brand" to="/">raahi.</Link><span>Small steps. Real possibilities.</span><span className="footer-note"><Icon name="leaf" size={15}/> Rooted in you. Ready for tomorrow.</span></footer></>}
