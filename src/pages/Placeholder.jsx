import React from 'react';
import {Link} from 'react-router-dom';
import {Icon} from '../App';
// The existing facilitator shell stays simple; student features now live in five areas.
export default function Placeholder({profile}){
  return <main className="page feature"><Link className="back-link" to={profile?'/dashboard':'/'}>← {profile?'For You':'Home'}</Link><div className="eyebrow">YOUR NEXT CHAPTER</div><h1>Facilitator Dashboard</h1><p>Help a student take their next step with confidence.</p><section className="profile-card"><Icon name="people" size={36}/><h3>A conversation can be a starting point.</h3><p>This MVP supports one student profile on this device. Start together, listen to their interests, and explore possibilities.</p>{profile?<><p><strong>{profile.name}</strong> · {profile.education}</p><Link className="button" to="/dashboard">Open student journey <Icon/></Link></>:<Link className="button" to="/onboarding">Begin student onboarding <Icon/></Link>}</section><p className="storage-note"><Icon name="check" size={16}/>Saved on this device. No account needed.</p></main>
}
