/**************************************************************/
// main.mjs
// Main entry for index.html
// Written by <Carmen O'Grady>, Term 2 2025
/**************************************************************/
const COL_C = 'white';	    // These two const are part of the coloured 	
const COL_B = '#CD7F32';	//  console.log for functions scheme
console.log('%c main.mjs', 
    'color: blue; background-color: white;');

/**************************************************************/
// Import all external constants & functions required
/**************************************************************/
// Import all the constants & functions required from fb_io module

import { fb_authenticate }
    from './script.mjs';
    window.fb_authenticate = fb_authenticate;

import { fb_write }
    from './script.mjs';
    window.fb_write = fb_write;

import { fb_read }
    from './script.mjs';
    window.fb_read = fb_read;

import { email_view }
    from './script.mjs';
    window.email_view = email_view;
/**************************************************************/
// index.html main code
/**************************************************************/


/**************************************************************/
//   END OF CODE
/**************************************************************/