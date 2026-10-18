import React from 'react';
import {NavLink} from 'react-router-dom';
import {Icon} from '../App';
export const studentTabs = [['/dashboard','For You','sun'],['/explore','Explore','compass'],['/learn','Learn','book'],['/earn','Earn','leaf'],['/community','Community','people']];
export default function BottomNav(){return <nav className="bottom-nav" aria-label="Student navigation">{studentTabs.map(([path,label,icon])=><NavLink to={path} key={path}><Icon name={icon} size={22}/><span>{label}</span></NavLink>)}</nav>}
