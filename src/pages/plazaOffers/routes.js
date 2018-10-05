import React from 'react';
import { Route, IndexRoute } from 'react-router';

import PlazaOfferIndexPage from './PlazaOfferIndexPage';
import PlazaOfferAddPage from './PlazaOfferAddPage';
import PlazaOfferShowPage from './PlazaOfferShowPage';
import PlazaOfferEditPage from './PlazaOfferEditPage';
import PlazaOfferDeletePage from './PlazaOfferDeletePage';

import { RequireAuth } from '../../utils';

export default (
  <Route path="plazaOffers">
    <IndexRoute component={RequireAuth(PlazaOfferIndexPage)} />
    <Route path="new" component={RequireAuth(PlazaOfferAddPage)} />
    <Route path=":itemID/edit" component={RequireAuth(PlazaOfferEditPage)} />
    <Route path=":itemID/delete" component={RequireAuth(PlazaOfferDeletePage)} />
    <Route path=":itemID" component={RequireAuth(PlazaOfferShowPage)} />
  </Route>
);
