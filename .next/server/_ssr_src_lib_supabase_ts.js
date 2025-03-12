"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "_ssr_src_lib_supabase_ts";
exports.ids = ["_ssr_src_lib_supabase_ts"];
exports.modules = {

/***/ "(ssr)/./src/lib/supabase.ts":
/*!*****************************!*\
  !*** ./src/lib/supabase.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   supabase: () => (/* binding */ supabase)\n/* harmony export */ });\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @supabase/supabase-js */ \"(ssr)/./node_modules/@supabase/supabase-js/dist/module/index.js\");\n\n// Add logging to see what credentials are being used\nconst supabaseUrl = \"https://lvqhxqkvorqfungphdzb.supabase.co\" || 0;\nconst supabaseKey = \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2cWh4cWt2b3JxZnVuZ3BoZHpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NTQxMzUsImV4cCI6MjA1NzMzMDEzNX0.uU3gItOnBIKXW0mP5tNGXIfb_W1-p8qAZJ-Nzy-1jVM\" || 0;\nconsole.log(\"Initializing Supabase client with URL:\", supabaseUrl);\n// Don't log the full key for security reasons\nconsole.log(\"Supabase key available:\", supabaseKey ? \"Yes\" : \"No\");\nconst supabase = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__.createClient)(supabaseUrl, supabaseKey);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9zcmMvbGliL3N1cGFiYXNlLnRzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQXFEO0FBRXJELHFEQUFxRDtBQUNyRCxNQUFNQyxjQUFjQywwQ0FBb0MsSUFBSTtBQUM1RCxNQUFNRyxjQUFjSCxrTkFBeUMsSUFBSTtBQUVqRUssUUFBUUMsR0FBRyxDQUFDLDBDQUEwQ1A7QUFDdEQsOENBQThDO0FBQzlDTSxRQUFRQyxHQUFHLENBQUMsMkJBQTJCSCxjQUFjLFFBQVE7QUFFdEQsTUFBTUksV0FBV1QsbUVBQVlBLENBQUNDLGFBQWFJLGFBQWEiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9lbXBsb3llZS1wb3J0YWwvLi9zcmMvbGliL3N1cGFiYXNlLnRzPzA2ZTEiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY3JlYXRlQ2xpZW50IH0gZnJvbSAnQHN1cGFiYXNlL3N1cGFiYXNlLWpzJztcblxuLy8gQWRkIGxvZ2dpbmcgdG8gc2VlIHdoYXQgY3JlZGVudGlhbHMgYXJlIGJlaW5nIHVzZWRcbmNvbnN0IHN1cGFiYXNlVXJsID0gcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMIHx8ICcnO1xuY29uc3Qgc3VwYWJhc2VLZXkgPSBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19TVVBBQkFTRV9BTk9OX0tFWSB8fCAnJztcblxuY29uc29sZS5sb2coJ0luaXRpYWxpemluZyBTdXBhYmFzZSBjbGllbnQgd2l0aCBVUkw6Jywgc3VwYWJhc2VVcmwpO1xuLy8gRG9uJ3QgbG9nIHRoZSBmdWxsIGtleSBmb3Igc2VjdXJpdHkgcmVhc29uc1xuY29uc29sZS5sb2coJ1N1cGFiYXNlIGtleSBhdmFpbGFibGU6Jywgc3VwYWJhc2VLZXkgPyAnWWVzJyA6ICdObycpO1xuXG5leHBvcnQgY29uc3Qgc3VwYWJhc2UgPSBjcmVhdGVDbGllbnQoc3VwYWJhc2VVcmwsIHN1cGFiYXNlS2V5KTsgIl0sIm5hbWVzIjpbImNyZWF0ZUNsaWVudCIsInN1cGFiYXNlVXJsIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCIsInN1cGFiYXNlS2V5IiwiTkVYVF9QVUJMSUNfU1VQQUJBU0VfQU5PTl9LRVkiLCJjb25zb2xlIiwibG9nIiwic3VwYWJhc2UiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./src/lib/supabase.ts\n");

/***/ })

};
;