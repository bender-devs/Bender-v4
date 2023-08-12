// database limits: used for validation before saving
// TODO: make more robust w/ relational restrictions etc.?

import { DURATION_UNITS } from '../utils/time.js';

// minage.enabled = true requires a value for minage.duration
export const MINAGE_MESSAGE_LENGTH_MAXIMUM = 500;
export const MINAGE_DURATION_MINIMUM = DURATION_UNITS.MINUTE;
export const MINAGE_DURATION_MAXIMUM = DURATION_UNITS.YEAR;