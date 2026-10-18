// Shared profile helpers and the original local conversational engine.
export function normalizeProfile(profile = {}, language = 'en') {
  return { name: '', education: '', interests: [], skills: [], experiences: [], preferences: [], goals: [], locationPreference: '', ...profile,
    preferences: profile.preferences || (profile.work ? [profile.work] : []),
    goals: profile.goals || (profile.goal ? [profile.goal] : []),
    locationPreference: profile.locationPreference || profile.mobility || '', language };
}
export function questionFor(topic, profile, variant = 0) {
  const hi = profile.language === 'hi', name = profile.name;
  const questions = {
    name: ["Hi! I'm Raahi. What's your name?", 'Hi! Main Raahi hoon. Tumhara naam kya hai?'],
    education: [`Nice to meet you, ${name}! Where are you in your studies right now?`, `Hi ${name}! Abhi school mein ho, college mein, ya kuch aur kar rahe ho?`],
    interests: [profile.education ? `Outside or during ${profile.education}, what do you most enjoy doing?` : 'What do you most enjoy doing in your day?', 'School mein ya school ke bahar tumhe kya karna sabse zyada pasand hai?'],
    shop: ['You mentioned helping at a shop. What do you usually handle there?', 'Shop pe tum usually kya kaam karte ho?'],
    drawing: ['You enjoy drawing. What do you like making most — sketches, posters, or something else?', 'Drawing mein tumhe kya banana pasand hai — sketches, posters, ya kuch aur?'],
    experience: [`You mentioned ${profile.interests.join(' and ') || 'what you enjoy'}. Can you tell me about something you have tried or helped with?`, `Tumne ${profile.interests.join(' aur ') || 'apni pasand'} bataya. Isse juda koi kaam ya project kiya hai?`],
    skills: ['Thinking about that experience, what did you actually do yourself?', 'Us kaam mein tumne khud kya kiya tha?'],
    goals: [variant % 2 ? 'What would you like your work to make possible for you?' : `What would you like to work towards, ${name}?`, 'Aage chal kar tum kya karna ya paana chahte ho?'],
    preferences: [variant % 2 ? 'What kind of everyday work would feel enjoyable to you?' : 'What sort of work would you like to try — practical, creative, with people, or something else?', 'Tumhe kaisa kaam pasand aayega — haathon se, creative, logon ke saath, ya kuch aur?'],
    location: ['Would you prefer working close to home, or would you be open to moving?', 'Tum ghar ke paas kaam karna chahoge ya doosri jagah bhi ja sakte ho?'],
    summary: ["I think I'm starting to understand you. Here's what I've learned. You can change anything before we continue.", 'Ab mujhe tumhare baare mein kaafi kuch samajh aa gaya hai. Ek baar check kar lo — kuch badalna ho toh batao.'],
  };
  return questions[topic][hi ? 1 : 0];
}
export function getOfflineConversationTurn(message, previous, history) {
  const profile = normalizeProfile(previous, previous.language);
  // Copy arrays: never change a profile that has already been saved.
  for (const key of ['interests', 'skills', 'experiences', 'preferences', 'goals']) profile[key] = [...profile[key]];
  const text = message.trim(), lower = text.toLowerCase();
  const last = [...history].reverse().find(turn => turn.role === 'raahi');
  const topic = last?.topic || 'name';
  const uncertain = /^(not sure|i don'?t know|don't know|nothing|none|no|skip|pata nahi|nahi pata|पता नहीं|नहीं पता|नहीं)[.! ]*$/i.test(text);
  const add = (field, value) => { if (!profile[field].includes(value)) profile[field].push(value); };
  if (topic === 'name') {
    profile.name = text.replace(/^(my name is|i am|i'm|mera naam|मेरा नाम)\s+/i, '').replace(/\s+(hai|है)[.!]*$/i, '').slice(0, 80);
  } else {
    const education = lower.match(/(?:class|grade|कक्षा|क्लास)\s*(\d{1,2})|\b(\d{1,2})(?:th|st|nd|rd|वीं|वी)?\s*(?:mein|me|में|class|grade|standard)|\b(10th|11th|12th|9th|8th)\b/);
    if (education) profile.education = 'Class ' + (education[1] || education[2] || education[3].replace(/\D/g, ''));
    else if (/college|university|कॉलेज|महाविद्यालय/.test(lower)) profile.education = 'College';
    else if (/diploma|\biti\b|डिप्लोमा/.test(lower)) profile.education = 'ITI / Diploma';
    else if (/left school|out of school|drop.?out|स्कूल छोड़/.test(lower)) profile.education = 'Out of school';
    else if (topic === 'education' && !uncertain) profile.education = text;
    // Do not turn an explicit dislike/negation into a positive skill or interest.
    const positive = lower.split(/[.!?।]|\bbut\b|\blekin\b/).filter(part => !/\b(no|not|never|don'?t|dislike|hate|nahi|nahin)\b|नहीं|नापसंद/.test(part)).join(' ');
    for (const [pattern, value] of [[/math|number|गणित|मैथ/,'Mathematics'],[/draw|sketch|poster|design|चित्र|ड्रॉइंग/,'Drawing & design'],[/science|विज्ञान/,'Science'],[/farm|garden|खेती|बागवानी/,'Farming & nature'],[/computer|coding|technology|कंप्यूटर|कोडिंग/,'Technology'],[/sport|cricket|football|खेल|क्रिकेट/,'Sports'],[/cook|खाना बनाना/,'Cooking'],[/business|व्यापार/,'Business']]) {
      if (pattern.test(positive) && ['interests','drawing','experience'].includes(topic)) add('interests', value);
    }
    const evidence = positive.split(/[,;]|\band\b|\baur\b/).filter(part => !/want to|would like|hope to|learn to|learn how|chaht|seekhna|चाह|सीखना/.test(part)).join(' ');
    if (/shop|dukaan|dukan|दुकान/.test(evidence) && /help|work|assist|madad|मदद|काम/.test(evidence)) add('experiences', /father|papa|family|पापा|पिता/.test(positive) ? 'Helps at family shop' : 'Helps at a shop');
    if (/stock|inventory|स्टॉक|सामान का हिसाब/.test(evidence) && /track|keep|handle|manage|count|check|ginti|sambhal|गिन|संभाल|हिसाब/.test(evidence)) { add('skills','Basic inventory handling'); add('experiences','Keeps track of stock'); }
    if (/bill|बिल/.test(evidence) && /calculat|make|banat|jod|हिसाब|बनात|जोड़/.test(evidence)) { add('skills','Basic numerical work'); add('experiences','Calculates bills'); }
    if (/poster|sketch|पोस्टर|स्केच/.test(evidence) && /make|draw|creat|banat|बनात/.test(evidence)) add('skills','Drawing practice');
    if (!uncertain) {
      if (topic === 'interests' && !profile.interests.length) add('interests', text);
      if (['experience','skills','drawing','shop'].includes(topic)) add('experiences', text);
      if (topic === 'goals') add('goals', text);
      if (topic === 'preferences') add('preferences', text);
      if (topic === 'location') profile.locationPreference = text;
      if (topic !== 'goals' && /want to|my goal|dream|chaht|चाहत|सपना/.test(positive)) add('goals', text);
    }
  }
  const answered = history.filter(turn => turn.role === 'student').length + 1;
  const asked = history.filter(turn => turn.role === 'raahi').map(turn => turn.topic);
  const enough = profile.education && profile.interests.length && (profile.skills.length || profile.experiences.length) && (profile.goals.length || profile.preferences.length);
  let next;
  if (answered >= 8 || (answered >= 5 && enough && (profile.locationPreference || asked.includes('location')))) next = 'summary';
  else if (answered >= 5 && enough) next = 'location';
  else if (!profile.education && !asked.includes('education')) next = 'education';
  else if (/shop|dukaan|dukan|दुकान/.test(lower) && topic !== 'name' && !asked.includes('shop')) next = 'shop';
  else if (/draw|sketch|चित्र|ड्रॉइंग/.test(lower) && topic !== 'name' && !asked.includes('drawing')) next = 'drawing';
  else if (!profile.interests.length && !asked.includes('interests')) next = 'interests';
  else if (!profile.experiences.length && !asked.includes('experience')) next = 'experience';
  else if (!profile.skills.length && profile.experiences.length && !asked.includes('skills') && topic !== 'shop') next = 'skills';
  else if (!profile.goals.length && !asked.includes('goals')) next = 'goals';
  else if (!profile.preferences.length && !asked.includes('preferences')) next = 'preferences';
  else if (!profile.locationPreference && !asked.includes('location')) next = 'location';
  else next = answered >= 5 ? 'summary' : 'preferences';
  return { profile, topic: next, message: questionFor(next, profile, answered), status: next === 'summary' ? 'review' : 'chat' };
}


// One boundary for both online turns and the existing offline engine.
export async function getNextConversationTurn(message, profile, history, {signal} = {}) {
  const fields = ['name', 'education', 'interests', 'skills', 'experiences', 'preferences', 'goals', 'locationPreference', 'language'];
  const lists = ['interests', 'skills', 'experiences', 'preferences', 'goals'];
  const current = normalizeProfile(profile, profile.language);
  const cleanProfile = Object.fromEntries(fields.map(field => [field, current[field]]));
  if (navigator.onLine) {
    const controller = new AbortController();
    const cancel = () => controller.abort();
    signal?.addEventListener('abort', cancel, {once: true});
    if (signal?.aborted) controller.abort();
    const timeout = setTimeout(cancel, 12000);
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST', headers: {'Content-Type': 'application/json'}, signal: controller.signal,
        body: JSON.stringify({message, history: history.slice(-16).map(turn => ({role: turn.role, text: turn.text})), profile: cleanProfile, language: current.language}),
      });
      if (!response.ok) throw new Error('Service unavailable');
      const turn = await response.json();
      const p = turn?.profile;
      const topics = ['name', 'education', 'interests', 'shop', 'drawing', 'experience', 'skills', 'goals', 'preferences', 'location', 'summary'];
      if (!p || typeof p !== 'object' || Array.isArray(p) || Object.keys(p).length !== fields.length
        || !fields.every(field => Object.hasOwn(p, field))
        || !['name', 'education', 'locationPreference', 'language'].every(field => typeof p[field] === 'string' && p[field].length <= 1000)
        || !lists.every(field => Array.isArray(p[field]) && p[field].length <= 24 && p[field].every(value => typeof value === 'string' && value.trim() && value.length <= 1000))
        || p.language !== current.language || typeof turn.reply !== 'string' || !turn.reply.trim() || turn.reply.length > 600
        || typeof turn.profileComplete !== 'boolean' || !topics.includes(turn.topic)
        || (turn.profileComplete ? turn.topic !== 'summary' : turn.topic === 'summary')) throw new Error('Invalid turn');
      for (const field of lists) p[field] = [...new Set([...current[field], ...p[field]])];
      if (lists.some(field => p[field].length > 24) || ['name','education','locationPreference'].some(field => current[field] && !p[field].trim())) throw new Error('Lost profile data');
      if (turn.profileComplete && (!p.name.trim() || !p.education.trim() || !p.interests.length
        || !(p.skills.length || p.experiences.length) || !(p.goals.length || p.preferences.length)
        || history.filter(item => item.role === 'student').length + 1 < 5)) throw new Error('Premature completion');
      return {profile: {...current, ...p}, message: turn.reply.trim(), topic: turn.topic, status: turn.profileComplete ? 'review' : 'chat'};
    } catch {
      if (signal?.aborted) throw new DOMException('Conversation closed', 'AbortError');
      return {...getOfflineConversationTurn(message, current, history), fallback: true};
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener('abort', cancel);
    }
  }
  if (signal?.aborted) throw new DOMException('Conversation closed', 'AbortError');
  return getOfflineConversationTurn(message, current, history);
}
