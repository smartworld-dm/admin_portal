import React from 'react';
import { Route, IndexRoute } from 'react-router';

import { MainLayout, Error404 } from './components';
import { Dashboard, auth, business, profile, billing, bundles, plans, events, eventTypes, eventTags, specials, locations, locationTypes, promoCodes, users, boosts, series, plazaOffers, rules, groups, planTemplates } from './pages';

export default (
  <Route path="/" component={MainLayout}>
    <IndexRoute component={Dashboard} />
    {auth}
    {business}
    {profile}
    {billing}
    {bundles}
    {plans}
	{series}
    {events}
    {eventTypes}
	{eventTags}
    {specials}
    {locations}
    {locationTypes}
    {promoCodes}
	{plazaOffers}
    {users}
    {boosts}
    {rules}
    {groups}
    {planTemplates}
    <Route path="*" component={Error404} />
  </Route>
);
