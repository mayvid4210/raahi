import React, {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Icon} from '../App';
import {read, saveOnboarding} from '../db';
import {getNextConversationTurn, normalizeProfile, questionFor} from '../onboardingEngine';

export default function Onboarding({profile, onSave, language, setLanguage}) {
  const [session, setSession] = useState(null);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [connectionNotice, setConnectionNotice] = useState('');
  const [error, setError] = useState('');
  const [online, setOnline] = useState(navigator.onLine);
  const [listening, setListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState('');
  const [editing, setEditing] = useState(null);
  const [correction, setCorrection] = useState('');
  const recognition = useRef(null), log = useRef(null), locked = useRef(false);
  const request = useRef(null), sending = useRef(false), mounted = useRef(true);
  const navigate = useNavigate();
  const hi = language === 'hi';
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  useEffect(() => {
    let active = true; mounted.current = true;
    read('onboarding').then(saved => {
      if (!active) return;
      const data = normalizeProfile(saved?.profile || profile || {}, saved?.language || language);
      const initial = saved || {profile: data, language: data.language, status: profile ? 'review' : 'chat', onboardingComplete: false,
        history: [{role: 'raahi', topic: profile ? 'summary' : 'name', text: questionFor(profile ? 'summary' : 'name', data)}]};
      setSession(initial);
      if (initial.pendingMessage) processReply(initial);
    }).catch(() => setError('Could not open your saved conversation. Please enable browser storage and reload.'));
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update); window.addEventListener('offline', update);
    return () => {active = false; mounted.current = false; request.current?.abort(); window.removeEventListener('online', update); window.removeEventListener('offline', update); recognition.current?.abort(); window.speechSynthesis?.cancel();};
  }, []);

  // Language changes keep the transcript intact and translate only the active prompt.
  useEffect(() => {
    if (!session || busy || thinking || session.language === language) return;
    const data = {...session.profile, language};
    const history = session.history.map((turn, index) => index === session.history.length - 1 && turn.role === 'raahi' ? {...turn, text: questionFor(turn.topic, data, session.history.length)} : turn);
    persist({...session, profile: data, language, history}).then(saved => {if (!saved) setLanguage(session.language);});
    recognition.current?.abort(); window.speechSynthesis?.cancel();
  }, [language, session, busy, thinking]);
  useEffect(() => {if (log.current) log.current.scrollTop = log.current.scrollHeight;}, [session?.history.length]);

  async function persist(next, confirm = false) {
    if (locked.current) return false;
    locked.current = true; setBusy(true); setError('');
    try {
      if (confirm) await onSave(next.profile, next); else await saveOnboarding(next);
      setSession(next); return true;
    } catch {setError(hi ? 'Save nahi hua. Dobara try karo; tumhara jawab abhi yahin hai.' : 'Could not save. Please try again; your answer is still here.'); return false;}
    finally {locked.current = false; setBusy(false);}
  }
  async function processReply(pending) {
    if (sending.current || locked.current) return;
    sending.current = true; setThinking(true); setError(''); setConnectionNotice('');
    recognition.current?.abort();
    const controller = new AbortController(); request.current = controller;
    try {
      // Save the student's words before waiting for the network, so refresh can resume this turn.
      await saveOnboarding(pending);
      if (!mounted.current || controller.signal.aborted) return;
      setSession(pending); setInput('');
      const turn = await getNextConversationTurn(pending.pendingMessage, {...pending.profile, language: pending.language}, pending.history.slice(0, -1), {signal: controller.signal});
      if (!mounted.current || controller.signal.aborted) return;
      const {pendingMessage, ...previous} = pending;
      const next = {...previous, profile: turn.profile, status: turn.status, onboardingComplete: false,
        history: [...pending.history, {role: 'raahi', topic: turn.topic, text: turn.message}]};
      if (turn.status === 'review') next.history[next.history.length - 1].text = pending.language === 'hi' ? 'Maine tumhare baare mein yeh samjha hai. Ek baar check kar lo.' : "Here's what I've understood about you.";
      if (turn.fallback) setConnectionNotice(pending.language === 'hi' ? 'Connection kamzor hai. Raahi offline baat jaari rakh raha hai.' : 'Connection is weak. Raahi is continuing offline.');
      await persist(next);
    } catch (error) {
      if (error.name !== 'AbortError' && mounted.current) setError(hi ? 'Save nahi hua. Dobara try karo; tumhara jawab yahin hai.' : 'Could not save this turn. Please try again; your reply is still here.');
    } finally {
      sending.current = false;
      if (mounted.current) setThinking(false);
    }
  }
  function send(event) {
    event.preventDefault();
    const message = input.trim();
    if (!message || locked.current || sending.current || session.pendingMessage || session.status !== 'chat') return;
    processReply({...session, language, profile: {...session.profile, language}, pendingMessage: message,
      history: [...session.history, {role: 'student', text: message}]});
  }
  function startVoice() {
    if (!SpeechRecognition || busy || thinking) return;
    if (listening) {recognition.current?.stop(); return;}
    const speech = new SpeechRecognition(); recognition.current = speech;
    speech.lang = hi ? 'hi-IN' : 'en-IN'; speech.interimResults = false; speech.continuous = false;
    speech.onstart = () => {setListening(true); setVoiceNotice(hi ? 'Sun raha hoon…' : 'Listening…');};
    speech.onresult = event => {setInput(current => (current ? current + ' ' : '') + event.results[0][0].transcript); setVoiceNotice(hi ? 'Bhejne se pehle jawab badal sakte ho.' : 'You can edit your words before sending.');};
    speech.onerror = event => setVoiceNotice(event.error === 'not-allowed' ? (hi ? 'Mic ki permission nahi mili. Type karke jawab de sakte ho.' : 'Microphone permission was denied. You can still type your answer.') : (hi ? 'Voice abhi nahi chala. Type karke baat jaari rakho.' : 'Voice input is unavailable right now. Keep going by typing.'));
    speech.onend = () => setListening(false);
    try {speech.start();} catch {setVoiceNotice('Voice input could not start. Please type instead.');}
  }
  function speak(text) {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.lang = hi ? 'hi-IN' : 'en-IN';
    const voices = synth.getVoices(); utterance.voice = voices.find(voice => voice.lang === utterance.lang) || voices.find(voice => voice.lang.startsWith(hi ? 'hi' : 'en')) || null;
    utterance.onerror = () => setVoiceNotice(hi ? 'Awaaz nahi chali. Message padh sakte ho.' : 'Read-aloud is unavailable. The message is still here to read.');
    synth.speak(utterance);
  }
  async function correct(event) {
    event.preventDefault(); if (!correction.trim()) return;
    const value = correction.trim(); const data = {...session.profile};
    if (editing === 'education') data.education = value;
    else if (editing === 'evidence') {data.skills = []; data.experiences = value.split(/[,\n]/).map(x => x.trim()).filter(Boolean);}
    else data[editing] = value.split(/[,\n]/).map(x => x.trim()).filter(Boolean);
    if (await persist({...session, profile: data, onboardingComplete: false, status: 'review'})) setEditing(null);
  }
  async function finish() {
    const next = {...session, status: 'complete', onboardingComplete: true, profile: {...session.profile, language, onboardingComplete: true}};
    if (await persist(next, true)) navigate('/dashboard');
  }
  if (!session) return <main className="page">{error ? <p role="alert">{error}</p> : 'Opening your conversation…'}</main>;
  const summary = session.status !== 'chat';
  const fields = [['education', hi ? 'Padhai' : 'Studying'], ['interests', hi ? 'Pasand' : 'Interested in'], ['skills', hi ? 'Skills' : 'Skills'], ['experiences', hi ? 'Anubhav' : 'Experience'], ['preferences', hi ? 'Kaam ki pasand' : 'Enjoys'], ['goals', hi ? 'Aage ke sapne' : 'Looking for'], ['locationPreference', hi ? 'Jagah' : 'Location preference']];
  return <main className="conversation page">
    <div className="chat-heading"><div><h1>Raahi</h1><p>{hi ? 'Tumhara safar, tumhari baat.' : 'Your story. Your own pace.'}</p></div><div className="chat-languages"><button disabled={busy || thinking} aria-pressed={!hi} onClick={() => setLanguage('en')}>English</button><span>|</span><button disabled={busy || thinking} aria-pressed={hi} onClick={() => setLanguage('hi')}>हिन्दी</button></div></div>
    <p className="chat-status" role="status">{online ? (hi ? 'Online · Baat yahin se jaari rahegi' : 'Online · Your conversation stays with you') : (hi ? 'Offline ho. Raahi phir bhi tumhe samajhne ke liye baat kar sakta hai.' : "You're offline. Raahi can still continue getting to know you.")}</p>
    <div className="chat-log" ref={log} role="log" aria-label={hi ? 'Raahi ke saath baatcheet' : 'Conversation with Raahi'} aria-live="polite">
      {session.history.map((turn, i) => <div key={i} className={'chat-message ' + turn.role}><small>{turn.role === 'raahi' ? 'RAAHI' : session.profile.name || (hi ? 'Tum' : 'You')}</small><p>{turn.text}</p>{turn.role === 'raahi' && 'speechSynthesis' in window && <button type="button" className="speak-button" aria-label={(hi ? 'Suno: ' : 'Read aloud: ') + turn.text} onClick={() => speak(turn.text)}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M11 4 5 9H2v6h3l6 5zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></svg>{hi ? 'Suno' : 'Listen'}</button>}</div>)}
    </div>
    {summary && <section className="conversation-summary" aria-label="Profile summary"><h2>{session.profile.name || (hi ? 'Tumhari kahani' : 'Your story')}</h2><dl>{fields.map(([key, label]) => {const value = session.profile[key];return value?.length ? <div key={key}><dt>{label}</dt><dd>{Array.isArray(value) ? value.join(' · ') : value}</dd></div> : null;})}</dl>
      {editing === 'choose' ? <div className="correction-options">{[['education','Education','Padhai'],['interests','Interests','Pasand'],['evidence','Skills/Experience','Skills/Anubhav'],['goals','Goals','Sapne'],['preferences','Preferences','Kaam ki pasand']].map(([key,en,hin]) => <button className="chip" disabled={busy || thinking} key={key} onClick={() => {setEditing(key);setCorrection(key === 'evidence' ? [...session.profile.skills,...session.profile.experiences].join(', ') : Array.isArray(session.profile[key]) ? session.profile[key].join(', ') : session.profile[key]);}}>{hi ? hin : en}</button>)}<button className="text-button" onClick={() => setEditing(null)}>{hi ? 'Wapas' : 'Cancel'}</button></div> : editing ? <form onSubmit={correct}><label htmlFor="correction">{hi ? 'Sahi baat likho (list ke liye comma lagao)' : 'Write your correction (separate a list with commas)'}</label><textarea id="correction" value={correction} onChange={e => setCorrection(e.target.value)} maxLength={1000}/><button className="button" disabled={busy || thinking || !correction.trim()}>{hi ? 'Save karo' : 'Save correction'}</button> <button type="button" className="text-button" onClick={() => setEditing(null)}>{hi ? 'Wapas' : 'Cancel'}</button></form> : <div className="summary-actions"><button className="button" disabled={busy || thinking} onClick={finish}>{hi ? 'Haan, yeh mere jaisa hai' : 'Yes, this sounds like me'}<Icon size={18}/></button><button className="text-button" disabled={busy || thinking} onClick={() => setEditing('choose')}>{hi ? 'Kuch badalna hai' : 'Change something'}</button></div>}
    </section>}
    {thinking && <p className="voice-notice" role="status">{hi ? 'Raahi soch raha hai…' : 'Raahi is thinking...'}</p>}
    {connectionNotice && <p className="voice-notice" role="status">{connectionNotice}</p>}
    {error && <p role="alert" className="error">{error}</p>}
    {session.pendingMessage && !thinking && <button className="text-button" onClick={() => processReply(session)}>{hi ? 'Dobara try karo' : 'Retry saved reply'}</button>}
    {!summary && !session.pendingMessage && <form className="chat-composer" onSubmit={send}><label className="sr-only" htmlFor="chat-input">{hi ? 'Tumhara jawab' : 'Your reply'}</label><textarea id="chat-input" rows="2" placeholder={hi ? 'Apni baat likho…' : 'Tell me a little…'} value={input} maxLength={1000} disabled={busy || thinking} onChange={e => setInput(e.target.value)} onKeyDown={e => {if(e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing){e.preventDefault();send(e);}}}/><button className={'mic ' + (listening ? 'listening' : '')} type="button" disabled={!SpeechRecognition || busy} aria-label={hi ? 'Bolkar jawab do' : 'Speak your reply'} aria-pressed={listening} onClick={startVoice}><Icon name="mic"/></button><button className="button chat-send" disabled={busy || thinking || !input.trim()} aria-label={hi ? 'Bhejo' : 'Send reply'}><Icon size={20}/><span>{hi ? 'Bhejo' : 'Send'}</span></button></form>}
    <p className="voice-notice" role="status">{voiceNotice || (!SpeechRecognition && !summary ? (hi ? 'Is browser mein voice nahi hai. Type karke baat karo.' : 'Voice input is unavailable in this browser. You can type your reply.') : '')}</p>
    <p className="storage-note"><Icon name="check" size={16}/>{hi ? 'Har jawab is device par save hota hai.' : 'Every reply is saved on this device.'}</p>
  </main>;
}
