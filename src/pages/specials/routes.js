import React from 'react';
import { Route, IndexRoute } from 'react-router';

import SpecialsIndexPage from './SpecialsIndexPage';
import SpecialAddPage from './SpecialAddPage';
import SpecialShowPage from './SpecialShowPage';
import SpecialEditPage from './SpecialEditPage';
import SpecialDeletePage from './SpecialDeletePage';

import { RequireAuth } from '../../utils';

export default (
  <Route path="specials">
    <IndexRoute component={(SpecialsIndexPage)} />
    <Route path="new" component={(SpecialAddPage)} />
    <Route path=":itemID/edit" component={(SpecialEditPage)} />
    <Route path=":itemID/delete" component={(SpecialDeletePage)} />
    <Route path=":itemID" component={(SpecialShowPage)} />
  </Route>
);
