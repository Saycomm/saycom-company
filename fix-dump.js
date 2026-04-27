const fs = require('fs');

const engBase = require('./js/translations').translations?.en || {};
// wait, we can't require it if it has syntax error!
