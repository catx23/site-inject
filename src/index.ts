import * as lodash from 'lodash';
import * as debug from './log';
import { curry, unless, when, ifElse, isNil } from 'ramda';
import * as R from 'ramda';

// K :: a -> b -> a (constant combinator)
const K = curry(
    x => () => x
);
const defaultValue = x => when(isNil, K(x));
