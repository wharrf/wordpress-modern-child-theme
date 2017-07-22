/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getElement = (function (fn) {
	var memo = {};

	return function(selector) {
		if (typeof memo[selector] === "undefined") {
			memo[selector] = fn.call(this, selector);
		}

		return memo[selector]
	};
})(function (target) {
	return document.querySelector(target)
});

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(5);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton) options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

//js/app.js

//Require SASS
__webpack_require__(3);

//Require CSS
__webpack_require__(6);

//Require scripts
__webpack_require__(8);

//Require Slick
__webpack_require__(9);

console.log('app.js');

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(4);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/sass-loader/lib/loader.js!./main.scss", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/sass-loader/lib/loader.js!./main.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, ".site-title a {\n  color: red !important; }\n", ""]);

// exports


/***/ }),
/* 5 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(7);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!./node_modules/css-loader/index.js!./style.css", function() {
			var newContent = require("!!./node_modules/css-loader/index.js!./style.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, "/*\nTheme Name:     Twentyseventeen-child\nTheme URI:      \nDescription:    Twentyseventeen child theme.\nAuthor:         Me\nAuthor URI:     \nTemplate:       twentyseventeen\nVersion:        0.1.0\n*/\n", ""]);

// exports


/***/ }),
/* 8 */
/***/ (function(module, exports) {

console.log('otro js');

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(10)(__webpack_require__(11))

/***/ }),
/* 10 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
module.exports = function(src) {
	if (typeof execScript !== "undefined")
		execScript(src);
	else
		eval.call(null, src);
}


/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = "/*\n     _ _      _       _\n ___| (_) ___| | __  (_)___\n/ __| | |/ __| |/ /  | / __|\n\\__ \\ | | (__|   < _ | \\__ \\\n|___/_|_|\\___|_|\\_(_)/ |___/\n                   |__/\n\n Version: 1.6.0\n  Author: Ken Wheeler\n Website: http://kenwheeler.github.io\n    Docs: http://kenwheeler.github.io/slick\n    Repo: http://github.com/kenwheeler/slick\n  Issues: http://github.com/kenwheeler/slick/issues\n\n */\n/* global window, document, define, jQuery, setInterval, clearInterval */\n(function(factory) {\n    'use strict';\n    if (typeof define === 'function' && define.amd) {\n        define(['jquery'], factory);\n    } else if (typeof exports !== 'undefined') {\n        module.exports = factory(require('jquery'));\n    } else {\n        factory(jQuery);\n    }\n\n}(function($) {\n    'use strict';\n    var Slick = window.Slick || {};\n\n    Slick = (function() {\n\n        var instanceUid = 0;\n\n        function Slick(element, settings) {\n\n            var _ = this, dataSettings;\n\n            _.defaults = {\n                accessibility: true,\n                adaptiveHeight: false,\n                appendArrows: $(element),\n                appendDots: $(element),\n                arrows: true,\n                asNavFor: null,\n                prevArrow: '<button type=\"button\" data-role=\"none\" class=\"slick-prev\" aria-label=\"Previous\" tabindex=\"0\" role=\"button\">Previous</button>',\n                nextArrow: '<button type=\"button\" data-role=\"none\" class=\"slick-next\" aria-label=\"Next\" tabindex=\"0\" role=\"button\">Next</button>',\n                autoplay: false,\n                autoplaySpeed: 3000,\n                centerMode: false,\n                centerPadding: '50px',\n                cssEase: 'ease',\n                customPaging: function(slider, i) {\n                    return $('<button type=\"button\" data-role=\"none\" role=\"button\" tabindex=\"0\" />').text(i + 1);\n                },\n                dots: false,\n                dotsClass: 'slick-dots',\n                draggable: true,\n                easing: 'linear',\n                edgeFriction: 0.35,\n                fade: false,\n                focusOnSelect: false,\n                infinite: true,\n                initialSlide: 0,\n                lazyLoad: 'ondemand',\n                mobileFirst: false,\n                pauseOnHover: true,\n                pauseOnFocus: true,\n                pauseOnDotsHover: false,\n                respondTo: 'window',\n                responsive: null,\n                rows: 1,\n                rtl: false,\n                slide: '',\n                slidesPerRow: 1,\n                slidesToShow: 1,\n                slidesToScroll: 1,\n                speed: 500,\n                swipe: true,\n                swipeToSlide: false,\n                touchMove: true,\n                touchThreshold: 5,\n                useCSS: true,\n                useTransform: true,\n                variableWidth: false,\n                vertical: false,\n                verticalSwiping: false,\n                waitForAnimate: true,\n                zIndex: 1000\n            };\n\n            _.initials = {\n                animating: false,\n                dragging: false,\n                autoPlayTimer: null,\n                currentDirection: 0,\n                currentLeft: null,\n                currentSlide: 0,\n                direction: 1,\n                $dots: null,\n                listWidth: null,\n                listHeight: null,\n                loadIndex: 0,\n                $nextArrow: null,\n                $prevArrow: null,\n                slideCount: null,\n                slideWidth: null,\n                $slideTrack: null,\n                $slides: null,\n                sliding: false,\n                slideOffset: 0,\n                swipeLeft: null,\n                $list: null,\n                touchObject: {},\n                transformsEnabled: false,\n                unslicked: false\n            };\n\n            $.extend(_, _.initials);\n\n            _.activeBreakpoint = null;\n            _.animType = null;\n            _.animProp = null;\n            _.breakpoints = [];\n            _.breakpointSettings = [];\n            _.cssTransitions = false;\n            _.focussed = false;\n            _.interrupted = false;\n            _.hidden = 'hidden';\n            _.paused = true;\n            _.positionProp = null;\n            _.respondTo = null;\n            _.rowCount = 1;\n            _.shouldClick = true;\n            _.$slider = $(element);\n            _.$slidesCache = null;\n            _.transformType = null;\n            _.transitionType = null;\n            _.visibilityChange = 'visibilitychange';\n            _.windowWidth = 0;\n            _.windowTimer = null;\n\n            dataSettings = $(element).data('slick') || {};\n\n            _.options = $.extend({}, _.defaults, settings, dataSettings);\n\n            _.currentSlide = _.options.initialSlide;\n\n            _.originalSettings = _.options;\n\n            if (typeof document.mozHidden !== 'undefined') {\n                _.hidden = 'mozHidden';\n                _.visibilityChange = 'mozvisibilitychange';\n            } else if (typeof document.webkitHidden !== 'undefined') {\n                _.hidden = 'webkitHidden';\n                _.visibilityChange = 'webkitvisibilitychange';\n            }\n\n            _.autoPlay = $.proxy(_.autoPlay, _);\n            _.autoPlayClear = $.proxy(_.autoPlayClear, _);\n            _.autoPlayIterator = $.proxy(_.autoPlayIterator, _);\n            _.changeSlide = $.proxy(_.changeSlide, _);\n            _.clickHandler = $.proxy(_.clickHandler, _);\n            _.selectHandler = $.proxy(_.selectHandler, _);\n            _.setPosition = $.proxy(_.setPosition, _);\n            _.swipeHandler = $.proxy(_.swipeHandler, _);\n            _.dragHandler = $.proxy(_.dragHandler, _);\n            _.keyHandler = $.proxy(_.keyHandler, _);\n\n            _.instanceUid = instanceUid++;\n\n            // A simple way to check for HTML strings\n            // Strict HTML recognition (must start with <)\n            // Extracted from jQuery v1.11 source\n            _.htmlExpr = /^(?:\\s*(<[\\w\\W]+>)[^>]*)$/;\n\n\n            _.registerBreakpoints();\n            _.init(true);\n\n        }\n\n        return Slick;\n\n    }());\n\n    Slick.prototype.activateADA = function() {\n        var _ = this;\n\n        _.$slideTrack.find('.slick-active').attr({\n            'aria-hidden': 'false'\n        }).find('a, input, button, select').attr({\n            'tabindex': '0'\n        });\n\n    };\n\n    Slick.prototype.addSlide = Slick.prototype.slickAdd = function(markup, index, addBefore) {\n\n        var _ = this;\n\n        if (typeof(index) === 'boolean') {\n            addBefore = index;\n            index = null;\n        } else if (index < 0 || (index >= _.slideCount)) {\n            return false;\n        }\n\n        _.unload();\n\n        if (typeof(index) === 'number') {\n            if (index === 0 && _.$slides.length === 0) {\n                $(markup).appendTo(_.$slideTrack);\n            } else if (addBefore) {\n                $(markup).insertBefore(_.$slides.eq(index));\n            } else {\n                $(markup).insertAfter(_.$slides.eq(index));\n            }\n        } else {\n            if (addBefore === true) {\n                $(markup).prependTo(_.$slideTrack);\n            } else {\n                $(markup).appendTo(_.$slideTrack);\n            }\n        }\n\n        _.$slides = _.$slideTrack.children(this.options.slide);\n\n        _.$slideTrack.children(this.options.slide).detach();\n\n        _.$slideTrack.append(_.$slides);\n\n        _.$slides.each(function(index, element) {\n            $(element).attr('data-slick-index', index);\n        });\n\n        _.$slidesCache = _.$slides;\n\n        _.reinit();\n\n    };\n\n    Slick.prototype.animateHeight = function() {\n        var _ = this;\n        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {\n            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);\n            _.$list.animate({\n                height: targetHeight\n            }, _.options.speed);\n        }\n    };\n\n    Slick.prototype.animateSlide = function(targetLeft, callback) {\n\n        var animProps = {},\n            _ = this;\n\n        _.animateHeight();\n\n        if (_.options.rtl === true && _.options.vertical === false) {\n            targetLeft = -targetLeft;\n        }\n        if (_.transformsEnabled === false) {\n            if (_.options.vertical === false) {\n                _.$slideTrack.animate({\n                    left: targetLeft\n                }, _.options.speed, _.options.easing, callback);\n            } else {\n                _.$slideTrack.animate({\n                    top: targetLeft\n                }, _.options.speed, _.options.easing, callback);\n            }\n\n        } else {\n\n            if (_.cssTransitions === false) {\n                if (_.options.rtl === true) {\n                    _.currentLeft = -(_.currentLeft);\n                }\n                $({\n                    animStart: _.currentLeft\n                }).animate({\n                    animStart: targetLeft\n                }, {\n                    duration: _.options.speed,\n                    easing: _.options.easing,\n                    step: function(now) {\n                        now = Math.ceil(now);\n                        if (_.options.vertical === false) {\n                            animProps[_.animType] = 'translate(' +\n                                now + 'px, 0px)';\n                            _.$slideTrack.css(animProps);\n                        } else {\n                            animProps[_.animType] = 'translate(0px,' +\n                                now + 'px)';\n                            _.$slideTrack.css(animProps);\n                        }\n                    },\n                    complete: function() {\n                        if (callback) {\n                            callback.call();\n                        }\n                    }\n                });\n\n            } else {\n\n                _.applyTransition();\n                targetLeft = Math.ceil(targetLeft);\n\n                if (_.options.vertical === false) {\n                    animProps[_.animType] = 'translate3d(' + targetLeft + 'px, 0px, 0px)';\n                } else {\n                    animProps[_.animType] = 'translate3d(0px,' + targetLeft + 'px, 0px)';\n                }\n                _.$slideTrack.css(animProps);\n\n                if (callback) {\n                    setTimeout(function() {\n\n                        _.disableTransition();\n\n                        callback.call();\n                    }, _.options.speed);\n                }\n\n            }\n\n        }\n\n    };\n\n    Slick.prototype.getNavTarget = function() {\n\n        var _ = this,\n            asNavFor = _.options.asNavFor;\n\n        if ( asNavFor && asNavFor !== null ) {\n            asNavFor = $(asNavFor).not(_.$slider);\n        }\n\n        return asNavFor;\n\n    };\n\n    Slick.prototype.asNavFor = function(index) {\n\n        var _ = this,\n            asNavFor = _.getNavTarget();\n\n        if ( asNavFor !== null && typeof asNavFor === 'object' ) {\n            asNavFor.each(function() {\n                var target = $(this).slick('getSlick');\n                if(!target.unslicked) {\n                    target.slideHandler(index, true);\n                }\n            });\n        }\n\n    };\n\n    Slick.prototype.applyTransition = function(slide) {\n\n        var _ = this,\n            transition = {};\n\n        if (_.options.fade === false) {\n            transition[_.transitionType] = _.transformType + ' ' + _.options.speed + 'ms ' + _.options.cssEase;\n        } else {\n            transition[_.transitionType] = 'opacity ' + _.options.speed + 'ms ' + _.options.cssEase;\n        }\n\n        if (_.options.fade === false) {\n            _.$slideTrack.css(transition);\n        } else {\n            _.$slides.eq(slide).css(transition);\n        }\n\n    };\n\n    Slick.prototype.autoPlay = function() {\n\n        var _ = this;\n\n        _.autoPlayClear();\n\n        if ( _.slideCount > _.options.slidesToShow ) {\n            _.autoPlayTimer = setInterval( _.autoPlayIterator, _.options.autoplaySpeed );\n        }\n\n    };\n\n    Slick.prototype.autoPlayClear = function() {\n\n        var _ = this;\n\n        if (_.autoPlayTimer) {\n            clearInterval(_.autoPlayTimer);\n        }\n\n    };\n\n    Slick.prototype.autoPlayIterator = function() {\n\n        var _ = this,\n            slideTo = _.currentSlide + _.options.slidesToScroll;\n\n        if ( !_.paused && !_.interrupted && !_.focussed ) {\n\n            if ( _.options.infinite === false ) {\n\n                if ( _.direction === 1 && ( _.currentSlide + 1 ) === ( _.slideCount - 1 )) {\n                    _.direction = 0;\n                }\n\n                else if ( _.direction === 0 ) {\n\n                    slideTo = _.currentSlide - _.options.slidesToScroll;\n\n                    if ( _.currentSlide - 1 === 0 ) {\n                        _.direction = 1;\n                    }\n\n                }\n\n            }\n\n            _.slideHandler( slideTo );\n\n        }\n\n    };\n\n    Slick.prototype.buildArrows = function() {\n\n        var _ = this;\n\n        if (_.options.arrows === true ) {\n\n            _.$prevArrow = $(_.options.prevArrow).addClass('slick-arrow');\n            _.$nextArrow = $(_.options.nextArrow).addClass('slick-arrow');\n\n            if( _.slideCount > _.options.slidesToShow ) {\n\n                _.$prevArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');\n                _.$nextArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');\n\n                if (_.htmlExpr.test(_.options.prevArrow)) {\n                    _.$prevArrow.prependTo(_.options.appendArrows);\n                }\n\n                if (_.htmlExpr.test(_.options.nextArrow)) {\n                    _.$nextArrow.appendTo(_.options.appendArrows);\n                }\n\n                if (_.options.infinite !== true) {\n                    _.$prevArrow\n                        .addClass('slick-disabled')\n                        .attr('aria-disabled', 'true');\n                }\n\n            } else {\n\n                _.$prevArrow.add( _.$nextArrow )\n\n                    .addClass('slick-hidden')\n                    .attr({\n                        'aria-disabled': 'true',\n                        'tabindex': '-1'\n                    });\n\n            }\n\n        }\n\n    };\n\n    Slick.prototype.buildDots = function() {\n\n        var _ = this,\n            i, dot;\n\n        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {\n\n            _.$slider.addClass('slick-dotted');\n\n            dot = $('<ul />').addClass(_.options.dotsClass);\n\n            for (i = 0; i <= _.getDotCount(); i += 1) {\n                dot.append($('<li />').append(_.options.customPaging.call(this, _, i)));\n            }\n\n            _.$dots = dot.appendTo(_.options.appendDots);\n\n            _.$dots.find('li').first().addClass('slick-active').attr('aria-hidden', 'false');\n\n        }\n\n    };\n\n    Slick.prototype.buildOut = function() {\n\n        var _ = this;\n\n        _.$slides =\n            _.$slider\n                .children( _.options.slide + ':not(.slick-cloned)')\n                .addClass('slick-slide');\n\n        _.slideCount = _.$slides.length;\n\n        _.$slides.each(function(index, element) {\n            $(element)\n                .attr('data-slick-index', index)\n                .data('originalStyling', $(element).attr('style') || '');\n        });\n\n        _.$slider.addClass('slick-slider');\n\n        _.$slideTrack = (_.slideCount === 0) ?\n            $('<div class=\"slick-track\"/>').appendTo(_.$slider) :\n            _.$slides.wrapAll('<div class=\"slick-track\"/>').parent();\n\n        _.$list = _.$slideTrack.wrap(\n            '<div aria-live=\"polite\" class=\"slick-list\"/>').parent();\n        _.$slideTrack.css('opacity', 0);\n\n        if (_.options.centerMode === true || _.options.swipeToSlide === true) {\n            _.options.slidesToScroll = 1;\n        }\n\n        $('img[data-lazy]', _.$slider).not('[src]').addClass('slick-loading');\n\n        _.setupInfinite();\n\n        _.buildArrows();\n\n        _.buildDots();\n\n        _.updateDots();\n\n\n        _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);\n\n        if (_.options.draggable === true) {\n            _.$list.addClass('draggable');\n        }\n\n    };\n\n    Slick.prototype.buildRows = function() {\n\n        var _ = this, a, b, c, newSlides, numOfSlides, originalSlides,slidesPerSection;\n\n        newSlides = document.createDocumentFragment();\n        originalSlides = _.$slider.children();\n\n        if(_.options.rows > 1) {\n\n            slidesPerSection = _.options.slidesPerRow * _.options.rows;\n            numOfSlides = Math.ceil(\n                originalSlides.length / slidesPerSection\n            );\n\n            for(a = 0; a < numOfSlides; a++){\n                var slide = document.createElement('div');\n                for(b = 0; b < _.options.rows; b++) {\n                    var row = document.createElement('div');\n                    for(c = 0; c < _.options.slidesPerRow; c++) {\n                        var target = (a * slidesPerSection + ((b * _.options.slidesPerRow) + c));\n                        if (originalSlides.get(target)) {\n                            row.appendChild(originalSlides.get(target));\n                        }\n                    }\n                    slide.appendChild(row);\n                }\n                newSlides.appendChild(slide);\n            }\n\n            _.$slider.empty().append(newSlides);\n            _.$slider.children().children().children()\n                .css({\n                    'width':(100 / _.options.slidesPerRow) + '%',\n                    'display': 'inline-block'\n                });\n\n        }\n\n    };\n\n    Slick.prototype.checkResponsive = function(initial, forceUpdate) {\n\n        var _ = this,\n            breakpoint, targetBreakpoint, respondToWidth, triggerBreakpoint = false;\n        var sliderWidth = _.$slider.width();\n        var windowWidth = window.innerWidth || $(window).width();\n\n        if (_.respondTo === 'window') {\n            respondToWidth = windowWidth;\n        } else if (_.respondTo === 'slider') {\n            respondToWidth = sliderWidth;\n        } else if (_.respondTo === 'min') {\n            respondToWidth = Math.min(windowWidth, sliderWidth);\n        }\n\n        if ( _.options.responsive &&\n            _.options.responsive.length &&\n            _.options.responsive !== null) {\n\n            targetBreakpoint = null;\n\n            for (breakpoint in _.breakpoints) {\n                if (_.breakpoints.hasOwnProperty(breakpoint)) {\n                    if (_.originalSettings.mobileFirst === false) {\n                        if (respondToWidth < _.breakpoints[breakpoint]) {\n                            targetBreakpoint = _.breakpoints[breakpoint];\n                        }\n                    } else {\n                        if (respondToWidth > _.breakpoints[breakpoint]) {\n                            targetBreakpoint = _.breakpoints[breakpoint];\n                        }\n                    }\n                }\n            }\n\n            if (targetBreakpoint !== null) {\n                if (_.activeBreakpoint !== null) {\n                    if (targetBreakpoint !== _.activeBreakpoint || forceUpdate) {\n                        _.activeBreakpoint =\n                            targetBreakpoint;\n                        if (_.breakpointSettings[targetBreakpoint] === 'unslick') {\n                            _.unslick(targetBreakpoint);\n                        } else {\n                            _.options = $.extend({}, _.originalSettings,\n                                _.breakpointSettings[\n                                    targetBreakpoint]);\n                            if (initial === true) {\n                                _.currentSlide = _.options.initialSlide;\n                            }\n                            _.refresh(initial);\n                        }\n                        triggerBreakpoint = targetBreakpoint;\n                    }\n                } else {\n                    _.activeBreakpoint = targetBreakpoint;\n                    if (_.breakpointSettings[targetBreakpoint] === 'unslick') {\n                        _.unslick(targetBreakpoint);\n                    } else {\n                        _.options = $.extend({}, _.originalSettings,\n                            _.breakpointSettings[\n                                targetBreakpoint]);\n                        if (initial === true) {\n                            _.currentSlide = _.options.initialSlide;\n                        }\n                        _.refresh(initial);\n                    }\n                    triggerBreakpoint = targetBreakpoint;\n                }\n            } else {\n                if (_.activeBreakpoint !== null) {\n                    _.activeBreakpoint = null;\n                    _.options = _.originalSettings;\n                    if (initial === true) {\n                        _.currentSlide = _.options.initialSlide;\n                    }\n                    _.refresh(initial);\n                    triggerBreakpoint = targetBreakpoint;\n                }\n            }\n\n            // only trigger breakpoints during an actual break. not on initialize.\n            if( !initial && triggerBreakpoint !== false ) {\n                _.$slider.trigger('breakpoint', [_, triggerBreakpoint]);\n            }\n        }\n\n    };\n\n    Slick.prototype.changeSlide = function(event, dontAnimate) {\n\n        var _ = this,\n            $target = $(event.currentTarget),\n            indexOffset, slideOffset, unevenOffset;\n\n        // If target is a link, prevent default action.\n        if($target.is('a')) {\n            event.preventDefault();\n        }\n\n        // If target is not the <li> element (ie: a child), find the <li>.\n        if(!$target.is('li')) {\n            $target = $target.closest('li');\n        }\n\n        unevenOffset = (_.slideCount % _.options.slidesToScroll !== 0);\n        indexOffset = unevenOffset ? 0 : (_.slideCount - _.currentSlide) % _.options.slidesToScroll;\n\n        switch (event.data.message) {\n\n            case 'previous':\n                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : _.options.slidesToShow - indexOffset;\n                if (_.slideCount > _.options.slidesToShow) {\n                    _.slideHandler(_.currentSlide - slideOffset, false, dontAnimate);\n                }\n                break;\n\n            case 'next':\n                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : indexOffset;\n                if (_.slideCount > _.options.slidesToShow) {\n                    _.slideHandler(_.currentSlide + slideOffset, false, dontAnimate);\n                }\n                break;\n\n            case 'index':\n                var index = event.data.index === 0 ? 0 :\n                    event.data.index || $target.index() * _.options.slidesToScroll;\n\n                _.slideHandler(_.checkNavigable(index), false, dontAnimate);\n                $target.children().trigger('focus');\n                break;\n\n            default:\n                return;\n        }\n\n    };\n\n    Slick.prototype.checkNavigable = function(index) {\n\n        var _ = this,\n            navigables, prevNavigable;\n\n        navigables = _.getNavigableIndexes();\n        prevNavigable = 0;\n        if (index > navigables[navigables.length - 1]) {\n            index = navigables[navigables.length - 1];\n        } else {\n            for (var n in navigables) {\n                if (index < navigables[n]) {\n                    index = prevNavigable;\n                    break;\n                }\n                prevNavigable = navigables[n];\n            }\n        }\n\n        return index;\n    };\n\n    Slick.prototype.cleanUpEvents = function() {\n\n        var _ = this;\n\n        if (_.options.dots && _.$dots !== null) {\n\n            $('li', _.$dots)\n                .off('click.slick', _.changeSlide)\n                .off('mouseenter.slick', $.proxy(_.interrupt, _, true))\n                .off('mouseleave.slick', $.proxy(_.interrupt, _, false));\n\n        }\n\n        _.$slider.off('focus.slick blur.slick');\n\n        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {\n            _.$prevArrow && _.$prevArrow.off('click.slick', _.changeSlide);\n            _.$nextArrow && _.$nextArrow.off('click.slick', _.changeSlide);\n        }\n\n        _.$list.off('touchstart.slick mousedown.slick', _.swipeHandler);\n        _.$list.off('touchmove.slick mousemove.slick', _.swipeHandler);\n        _.$list.off('touchend.slick mouseup.slick', _.swipeHandler);\n        _.$list.off('touchcancel.slick mouseleave.slick', _.swipeHandler);\n\n        _.$list.off('click.slick', _.clickHandler);\n\n        $(document).off(_.visibilityChange, _.visibility);\n\n        _.cleanUpSlideEvents();\n\n        if (_.options.accessibility === true) {\n            _.$list.off('keydown.slick', _.keyHandler);\n        }\n\n        if (_.options.focusOnSelect === true) {\n            $(_.$slideTrack).children().off('click.slick', _.selectHandler);\n        }\n\n        $(window).off('orientationchange.slick.slick-' + _.instanceUid, _.orientationChange);\n\n        $(window).off('resize.slick.slick-' + _.instanceUid, _.resize);\n\n        $('[draggable!=true]', _.$slideTrack).off('dragstart', _.preventDefault);\n\n        $(window).off('load.slick.slick-' + _.instanceUid, _.setPosition);\n        $(document).off('ready.slick.slick-' + _.instanceUid, _.setPosition);\n\n    };\n\n    Slick.prototype.cleanUpSlideEvents = function() {\n\n        var _ = this;\n\n        _.$list.off('mouseenter.slick', $.proxy(_.interrupt, _, true));\n        _.$list.off('mouseleave.slick', $.proxy(_.interrupt, _, false));\n\n    };\n\n    Slick.prototype.cleanUpRows = function() {\n\n        var _ = this, originalSlides;\n\n        if(_.options.rows > 1) {\n            originalSlides = _.$slides.children().children();\n            originalSlides.removeAttr('style');\n            _.$slider.empty().append(originalSlides);\n        }\n\n    };\n\n    Slick.prototype.clickHandler = function(event) {\n\n        var _ = this;\n\n        if (_.shouldClick === false) {\n            event.stopImmediatePropagation();\n            event.stopPropagation();\n            event.preventDefault();\n        }\n\n    };\n\n    Slick.prototype.destroy = function(refresh) {\n\n        var _ = this;\n\n        _.autoPlayClear();\n\n        _.touchObject = {};\n\n        _.cleanUpEvents();\n\n        $('.slick-cloned', _.$slider).detach();\n\n        if (_.$dots) {\n            _.$dots.remove();\n        }\n\n\n        if ( _.$prevArrow && _.$prevArrow.length ) {\n\n            _.$prevArrow\n                .removeClass('slick-disabled slick-arrow slick-hidden')\n                .removeAttr('aria-hidden aria-disabled tabindex')\n                .css('display','');\n\n            if ( _.htmlExpr.test( _.options.prevArrow )) {\n                _.$prevArrow.remove();\n            }\n        }\n\n        if ( _.$nextArrow && _.$nextArrow.length ) {\n\n            _.$nextArrow\n                .removeClass('slick-disabled slick-arrow slick-hidden')\n                .removeAttr('aria-hidden aria-disabled tabindex')\n                .css('display','');\n\n            if ( _.htmlExpr.test( _.options.nextArrow )) {\n                _.$nextArrow.remove();\n            }\n\n        }\n\n\n        if (_.$slides) {\n\n            _.$slides\n                .removeClass('slick-slide slick-active slick-center slick-visible slick-current')\n                .removeAttr('aria-hidden')\n                .removeAttr('data-slick-index')\n                .each(function(){\n                    $(this).attr('style', $(this).data('originalStyling'));\n                });\n\n            _.$slideTrack.children(this.options.slide).detach();\n\n            _.$slideTrack.detach();\n\n            _.$list.detach();\n\n            _.$slider.append(_.$slides);\n        }\n\n        _.cleanUpRows();\n\n        _.$slider.removeClass('slick-slider');\n        _.$slider.removeClass('slick-initialized');\n        _.$slider.removeClass('slick-dotted');\n\n        _.unslicked = true;\n\n        if(!refresh) {\n            _.$slider.trigger('destroy', [_]);\n        }\n\n    };\n\n    Slick.prototype.disableTransition = function(slide) {\n\n        var _ = this,\n            transition = {};\n\n        transition[_.transitionType] = '';\n\n        if (_.options.fade === false) {\n            _.$slideTrack.css(transition);\n        } else {\n            _.$slides.eq(slide).css(transition);\n        }\n\n    };\n\n    Slick.prototype.fadeSlide = function(slideIndex, callback) {\n\n        var _ = this;\n\n        if (_.cssTransitions === false) {\n\n            _.$slides.eq(slideIndex).css({\n                zIndex: _.options.zIndex\n            });\n\n            _.$slides.eq(slideIndex).animate({\n                opacity: 1\n            }, _.options.speed, _.options.easing, callback);\n\n        } else {\n\n            _.applyTransition(slideIndex);\n\n            _.$slides.eq(slideIndex).css({\n                opacity: 1,\n                zIndex: _.options.zIndex\n            });\n\n            if (callback) {\n                setTimeout(function() {\n\n                    _.disableTransition(slideIndex);\n\n                    callback.call();\n                }, _.options.speed);\n            }\n\n        }\n\n    };\n\n    Slick.prototype.fadeSlideOut = function(slideIndex) {\n\n        var _ = this;\n\n        if (_.cssTransitions === false) {\n\n            _.$slides.eq(slideIndex).animate({\n                opacity: 0,\n                zIndex: _.options.zIndex - 2\n            }, _.options.speed, _.options.easing);\n\n        } else {\n\n            _.applyTransition(slideIndex);\n\n            _.$slides.eq(slideIndex).css({\n                opacity: 0,\n                zIndex: _.options.zIndex - 2\n            });\n\n        }\n\n    };\n\n    Slick.prototype.filterSlides = Slick.prototype.slickFilter = function(filter) {\n\n        var _ = this;\n\n        if (filter !== null) {\n\n            _.$slidesCache = _.$slides;\n\n            _.unload();\n\n            _.$slideTrack.children(this.options.slide).detach();\n\n            _.$slidesCache.filter(filter).appendTo(_.$slideTrack);\n\n            _.reinit();\n\n        }\n\n    };\n\n    Slick.prototype.focusHandler = function() {\n\n        var _ = this;\n\n        _.$slider\n            .off('focus.slick blur.slick')\n            .on('focus.slick blur.slick',\n                '*:not(.slick-arrow)', function(event) {\n\n            event.stopImmediatePropagation();\n            var $sf = $(this);\n\n            setTimeout(function() {\n\n                if( _.options.pauseOnFocus ) {\n                    _.focussed = $sf.is(':focus');\n                    _.autoPlay();\n                }\n\n            }, 0);\n\n        });\n    };\n\n    Slick.prototype.getCurrent = Slick.prototype.slickCurrentSlide = function() {\n\n        var _ = this;\n        return _.currentSlide;\n\n    };\n\n    Slick.prototype.getDotCount = function() {\n\n        var _ = this;\n\n        var breakPoint = 0;\n        var counter = 0;\n        var pagerQty = 0;\n\n        if (_.options.infinite === true) {\n            while (breakPoint < _.slideCount) {\n                ++pagerQty;\n                breakPoint = counter + _.options.slidesToScroll;\n                counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;\n            }\n        } else if (_.options.centerMode === true) {\n            pagerQty = _.slideCount;\n        } else if(!_.options.asNavFor) {\n            pagerQty = 1 + Math.ceil((_.slideCount - _.options.slidesToShow) / _.options.slidesToScroll);\n        }else {\n            while (breakPoint < _.slideCount) {\n                ++pagerQty;\n                breakPoint = counter + _.options.slidesToScroll;\n                counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;\n            }\n        }\n\n        return pagerQty - 1;\n\n    };\n\n    Slick.prototype.getLeft = function(slideIndex) {\n\n        var _ = this,\n            targetLeft,\n            verticalHeight,\n            verticalOffset = 0,\n            targetSlide;\n\n        _.slideOffset = 0;\n        verticalHeight = _.$slides.first().outerHeight(true);\n\n        if (_.options.infinite === true) {\n            if (_.slideCount > _.options.slidesToShow) {\n                _.slideOffset = (_.slideWidth * _.options.slidesToShow) * -1;\n                verticalOffset = (verticalHeight * _.options.slidesToShow) * -1;\n            }\n            if (_.slideCount % _.options.slidesToScroll !== 0) {\n                if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {\n                    if (slideIndex > _.slideCount) {\n                        _.slideOffset = ((_.options.slidesToShow - (slideIndex - _.slideCount)) * _.slideWidth) * -1;\n                        verticalOffset = ((_.options.slidesToShow - (slideIndex - _.slideCount)) * verticalHeight) * -1;\n                    } else {\n                        _.slideOffset = ((_.slideCount % _.options.slidesToScroll) * _.slideWidth) * -1;\n                        verticalOffset = ((_.slideCount % _.options.slidesToScroll) * verticalHeight) * -1;\n                    }\n                }\n            }\n        } else {\n            if (slideIndex + _.options.slidesToShow > _.slideCount) {\n                _.slideOffset = ((slideIndex + _.options.slidesToShow) - _.slideCount) * _.slideWidth;\n                verticalOffset = ((slideIndex + _.options.slidesToShow) - _.slideCount) * verticalHeight;\n            }\n        }\n\n        if (_.slideCount <= _.options.slidesToShow) {\n            _.slideOffset = 0;\n            verticalOffset = 0;\n        }\n\n        if (_.options.centerMode === true && _.options.infinite === true) {\n            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2) - _.slideWidth;\n        } else if (_.options.centerMode === true) {\n            _.slideOffset = 0;\n            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2);\n        }\n\n        if (_.options.vertical === false) {\n            targetLeft = ((slideIndex * _.slideWidth) * -1) + _.slideOffset;\n        } else {\n            targetLeft = ((slideIndex * verticalHeight) * -1) + verticalOffset;\n        }\n\n        if (_.options.variableWidth === true) {\n\n            if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {\n                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);\n            } else {\n                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow);\n            }\n\n            if (_.options.rtl === true) {\n                if (targetSlide[0]) {\n                    targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;\n                } else {\n                    targetLeft =  0;\n                }\n            } else {\n                targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;\n            }\n\n            if (_.options.centerMode === true) {\n                if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {\n                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);\n                } else {\n                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow + 1);\n                }\n\n                if (_.options.rtl === true) {\n                    if (targetSlide[0]) {\n                        targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;\n                    } else {\n                        targetLeft =  0;\n                    }\n                } else {\n                    targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;\n                }\n\n                targetLeft += (_.$list.width() - targetSlide.outerWidth()) / 2;\n            }\n        }\n\n        return targetLeft;\n\n    };\n\n    Slick.prototype.getOption = Slick.prototype.slickGetOption = function(option) {\n\n        var _ = this;\n\n        return _.options[option];\n\n    };\n\n    Slick.prototype.getNavigableIndexes = function() {\n\n        var _ = this,\n            breakPoint = 0,\n            counter = 0,\n            indexes = [],\n            max;\n\n        if (_.options.infinite === false) {\n            max = _.slideCount;\n        } else {\n            breakPoint = _.options.slidesToScroll * -1;\n            counter = _.options.slidesToScroll * -1;\n            max = _.slideCount * 2;\n        }\n\n        while (breakPoint < max) {\n            indexes.push(breakPoint);\n            breakPoint = counter + _.options.slidesToScroll;\n            counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;\n        }\n\n        return indexes;\n\n    };\n\n    Slick.prototype.getSlick = function() {\n\n        return this;\n\n    };\n\n    Slick.prototype.getSlideCount = function() {\n\n        var _ = this,\n            slidesTraversed, swipedSlide, centerOffset;\n\n        centerOffset = _.options.centerMode === true ? _.slideWidth * Math.floor(_.options.slidesToShow / 2) : 0;\n\n        if (_.options.swipeToSlide === true) {\n            _.$slideTrack.find('.slick-slide').each(function(index, slide) {\n                if (slide.offsetLeft - centerOffset + ($(slide).outerWidth() / 2) > (_.swipeLeft * -1)) {\n                    swipedSlide = slide;\n                    return false;\n                }\n            });\n\n            slidesTraversed = Math.abs($(swipedSlide).attr('data-slick-index') - _.currentSlide) || 1;\n\n            return slidesTraversed;\n\n        } else {\n            return _.options.slidesToScroll;\n        }\n\n    };\n\n    Slick.prototype.goTo = Slick.prototype.slickGoTo = function(slide, dontAnimate) {\n\n        var _ = this;\n\n        _.changeSlide({\n            data: {\n                message: 'index',\n                index: parseInt(slide)\n            }\n        }, dontAnimate);\n\n    };\n\n    Slick.prototype.init = function(creation) {\n\n        var _ = this;\n\n        if (!$(_.$slider).hasClass('slick-initialized')) {\n\n            $(_.$slider).addClass('slick-initialized');\n\n            _.buildRows();\n            _.buildOut();\n            _.setProps();\n            _.startLoad();\n            _.loadSlider();\n            _.initializeEvents();\n            _.updateArrows();\n            _.updateDots();\n            _.checkResponsive(true);\n            _.focusHandler();\n\n        }\n\n        if (creation) {\n            _.$slider.trigger('init', [_]);\n        }\n\n        if (_.options.accessibility === true) {\n            _.initADA();\n        }\n\n        if ( _.options.autoplay ) {\n\n            _.paused = false;\n            _.autoPlay();\n\n        }\n\n    };\n\n    Slick.prototype.initADA = function() {\n        var _ = this;\n        _.$slides.add(_.$slideTrack.find('.slick-cloned')).attr({\n            'aria-hidden': 'true',\n            'tabindex': '-1'\n        }).find('a, input, button, select').attr({\n            'tabindex': '-1'\n        });\n\n        _.$slideTrack.attr('role', 'listbox');\n\n        _.$slides.not(_.$slideTrack.find('.slick-cloned')).each(function(i) {\n            $(this).attr({\n                'role': 'option',\n                'aria-describedby': 'slick-slide' + _.instanceUid + i + ''\n            });\n        });\n\n        if (_.$dots !== null) {\n            _.$dots.attr('role', 'tablist').find('li').each(function(i) {\n                $(this).attr({\n                    'role': 'presentation',\n                    'aria-selected': 'false',\n                    'aria-controls': 'navigation' + _.instanceUid + i + '',\n                    'id': 'slick-slide' + _.instanceUid + i + ''\n                });\n            })\n                .first().attr('aria-selected', 'true').end()\n                .find('button').attr('role', 'button').end()\n                .closest('div').attr('role', 'toolbar');\n        }\n        _.activateADA();\n\n    };\n\n    Slick.prototype.initArrowEvents = function() {\n\n        var _ = this;\n\n        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {\n            _.$prevArrow\n               .off('click.slick')\n               .on('click.slick', {\n                    message: 'previous'\n               }, _.changeSlide);\n            _.$nextArrow\n               .off('click.slick')\n               .on('click.slick', {\n                    message: 'next'\n               }, _.changeSlide);\n        }\n\n    };\n\n    Slick.prototype.initDotEvents = function() {\n\n        var _ = this;\n\n        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {\n            $('li', _.$dots).on('click.slick', {\n                message: 'index'\n            }, _.changeSlide);\n        }\n\n        if ( _.options.dots === true && _.options.pauseOnDotsHover === true ) {\n\n            $('li', _.$dots)\n                .on('mouseenter.slick', $.proxy(_.interrupt, _, true))\n                .on('mouseleave.slick', $.proxy(_.interrupt, _, false));\n\n        }\n\n    };\n\n    Slick.prototype.initSlideEvents = function() {\n\n        var _ = this;\n\n        if ( _.options.pauseOnHover ) {\n\n            _.$list.on('mouseenter.slick', $.proxy(_.interrupt, _, true));\n            _.$list.on('mouseleave.slick', $.proxy(_.interrupt, _, false));\n\n        }\n\n    };\n\n    Slick.prototype.initializeEvents = function() {\n\n        var _ = this;\n\n        _.initArrowEvents();\n\n        _.initDotEvents();\n        _.initSlideEvents();\n\n        _.$list.on('touchstart.slick mousedown.slick', {\n            action: 'start'\n        }, _.swipeHandler);\n        _.$list.on('touchmove.slick mousemove.slick', {\n            action: 'move'\n        }, _.swipeHandler);\n        _.$list.on('touchend.slick mouseup.slick', {\n            action: 'end'\n        }, _.swipeHandler);\n        _.$list.on('touchcancel.slick mouseleave.slick', {\n            action: 'end'\n        }, _.swipeHandler);\n\n        _.$list.on('click.slick', _.clickHandler);\n\n        $(document).on(_.visibilityChange, $.proxy(_.visibility, _));\n\n        if (_.options.accessibility === true) {\n            _.$list.on('keydown.slick', _.keyHandler);\n        }\n\n        if (_.options.focusOnSelect === true) {\n            $(_.$slideTrack).children().on('click.slick', _.selectHandler);\n        }\n\n        $(window).on('orientationchange.slick.slick-' + _.instanceUid, $.proxy(_.orientationChange, _));\n\n        $(window).on('resize.slick.slick-' + _.instanceUid, $.proxy(_.resize, _));\n\n        $('[draggable!=true]', _.$slideTrack).on('dragstart', _.preventDefault);\n\n        $(window).on('load.slick.slick-' + _.instanceUid, _.setPosition);\n        $(document).on('ready.slick.slick-' + _.instanceUid, _.setPosition);\n\n    };\n\n    Slick.prototype.initUI = function() {\n\n        var _ = this;\n\n        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {\n\n            _.$prevArrow.show();\n            _.$nextArrow.show();\n\n        }\n\n        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {\n\n            _.$dots.show();\n\n        }\n\n    };\n\n    Slick.prototype.keyHandler = function(event) {\n\n        var _ = this;\n         //Dont slide if the cursor is inside the form fields and arrow keys are pressed\n        if(!event.target.tagName.match('TEXTAREA|INPUT|SELECT')) {\n            if (event.keyCode === 37 && _.options.accessibility === true) {\n                _.changeSlide({\n                    data: {\n                        message: _.options.rtl === true ? 'next' :  'previous'\n                    }\n                });\n            } else if (event.keyCode === 39 && _.options.accessibility === true) {\n                _.changeSlide({\n                    data: {\n                        message: _.options.rtl === true ? 'previous' : 'next'\n                    }\n                });\n            }\n        }\n\n    };\n\n    Slick.prototype.lazyLoad = function() {\n\n        var _ = this,\n            loadRange, cloneRange, rangeStart, rangeEnd;\n\n        function loadImages(imagesScope) {\n\n            $('img[data-lazy]', imagesScope).each(function() {\n\n                var image = $(this),\n                    imageSource = $(this).attr('data-lazy'),\n                    imageToLoad = document.createElement('img');\n\n                imageToLoad.onload = function() {\n\n                    image\n                        .animate({ opacity: 0 }, 100, function() {\n                            image\n                                .attr('src', imageSource)\n                                .animate({ opacity: 1 }, 200, function() {\n                                    image\n                                        .removeAttr('data-lazy')\n                                        .removeClass('slick-loading');\n                                });\n                            _.$slider.trigger('lazyLoaded', [_, image, imageSource]);\n                        });\n\n                };\n\n                imageToLoad.onerror = function() {\n\n                    image\n                        .removeAttr( 'data-lazy' )\n                        .removeClass( 'slick-loading' )\n                        .addClass( 'slick-lazyload-error' );\n\n                    _.$slider.trigger('lazyLoadError', [ _, image, imageSource ]);\n\n                };\n\n                imageToLoad.src = imageSource;\n\n            });\n\n        }\n\n        if (_.options.centerMode === true) {\n            if (_.options.infinite === true) {\n                rangeStart = _.currentSlide + (_.options.slidesToShow / 2 + 1);\n                rangeEnd = rangeStart + _.options.slidesToShow + 2;\n            } else {\n                rangeStart = Math.max(0, _.currentSlide - (_.options.slidesToShow / 2 + 1));\n                rangeEnd = 2 + (_.options.slidesToShow / 2 + 1) + _.currentSlide;\n            }\n        } else {\n            rangeStart = _.options.infinite ? _.options.slidesToShow + _.currentSlide : _.currentSlide;\n            rangeEnd = Math.ceil(rangeStart + _.options.slidesToShow);\n            if (_.options.fade === true) {\n                if (rangeStart > 0) rangeStart--;\n                if (rangeEnd <= _.slideCount) rangeEnd++;\n            }\n        }\n\n        loadRange = _.$slider.find('.slick-slide').slice(rangeStart, rangeEnd);\n        loadImages(loadRange);\n\n        if (_.slideCount <= _.options.slidesToShow) {\n            cloneRange = _.$slider.find('.slick-slide');\n            loadImages(cloneRange);\n        } else\n        if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {\n            cloneRange = _.$slider.find('.slick-cloned').slice(0, _.options.slidesToShow);\n            loadImages(cloneRange);\n        } else if (_.currentSlide === 0) {\n            cloneRange = _.$slider.find('.slick-cloned').slice(_.options.slidesToShow * -1);\n            loadImages(cloneRange);\n        }\n\n    };\n\n    Slick.prototype.loadSlider = function() {\n\n        var _ = this;\n\n        _.setPosition();\n\n        _.$slideTrack.css({\n            opacity: 1\n        });\n\n        _.$slider.removeClass('slick-loading');\n\n        _.initUI();\n\n        if (_.options.lazyLoad === 'progressive') {\n            _.progressiveLazyLoad();\n        }\n\n    };\n\n    Slick.prototype.next = Slick.prototype.slickNext = function() {\n\n        var _ = this;\n\n        _.changeSlide({\n            data: {\n                message: 'next'\n            }\n        });\n\n    };\n\n    Slick.prototype.orientationChange = function() {\n\n        var _ = this;\n\n        _.checkResponsive();\n        _.setPosition();\n\n    };\n\n    Slick.prototype.pause = Slick.prototype.slickPause = function() {\n\n        var _ = this;\n\n        _.autoPlayClear();\n        _.paused = true;\n\n    };\n\n    Slick.prototype.play = Slick.prototype.slickPlay = function() {\n\n        var _ = this;\n\n        _.autoPlay();\n        _.options.autoplay = true;\n        _.paused = false;\n        _.focussed = false;\n        _.interrupted = false;\n\n    };\n\n    Slick.prototype.postSlide = function(index) {\n\n        var _ = this;\n\n        if( !_.unslicked ) {\n\n            _.$slider.trigger('afterChange', [_, index]);\n\n            _.animating = false;\n\n            _.setPosition();\n\n            _.swipeLeft = null;\n\n            if ( _.options.autoplay ) {\n                _.autoPlay();\n            }\n\n            if (_.options.accessibility === true) {\n                _.initADA();\n            }\n\n        }\n\n    };\n\n    Slick.prototype.prev = Slick.prototype.slickPrev = function() {\n\n        var _ = this;\n\n        _.changeSlide({\n            data: {\n                message: 'previous'\n            }\n        });\n\n    };\n\n    Slick.prototype.preventDefault = function(event) {\n\n        event.preventDefault();\n\n    };\n\n    Slick.prototype.progressiveLazyLoad = function( tryCount ) {\n\n        tryCount = tryCount || 1;\n\n        var _ = this,\n            $imgsToLoad = $( 'img[data-lazy]', _.$slider ),\n            image,\n            imageSource,\n            imageToLoad;\n\n        if ( $imgsToLoad.length ) {\n\n            image = $imgsToLoad.first();\n            imageSource = image.attr('data-lazy');\n            imageToLoad = document.createElement('img');\n\n            imageToLoad.onload = function() {\n\n                image\n                    .attr( 'src', imageSource )\n                    .removeAttr('data-lazy')\n                    .removeClass('slick-loading');\n\n                if ( _.options.adaptiveHeight === true ) {\n                    _.setPosition();\n                }\n\n                _.$slider.trigger('lazyLoaded', [ _, image, imageSource ]);\n                _.progressiveLazyLoad();\n\n            };\n\n            imageToLoad.onerror = function() {\n\n                if ( tryCount < 3 ) {\n\n                    /**\n                     * try to load the image 3 times,\n                     * leave a slight delay so we don't get\n                     * servers blocking the request.\n                     */\n                    setTimeout( function() {\n                        _.progressiveLazyLoad( tryCount + 1 );\n                    }, 500 );\n\n                } else {\n\n                    image\n                        .removeAttr( 'data-lazy' )\n                        .removeClass( 'slick-loading' )\n                        .addClass( 'slick-lazyload-error' );\n\n                    _.$slider.trigger('lazyLoadError', [ _, image, imageSource ]);\n\n                    _.progressiveLazyLoad();\n\n                }\n\n            };\n\n            imageToLoad.src = imageSource;\n\n        } else {\n\n            _.$slider.trigger('allImagesLoaded', [ _ ]);\n\n        }\n\n    };\n\n    Slick.prototype.refresh = function( initializing ) {\n\n        var _ = this, currentSlide, lastVisibleIndex;\n\n        lastVisibleIndex = _.slideCount - _.options.slidesToShow;\n\n        // in non-infinite sliders, we don't want to go past the\n        // last visible index.\n        if( !_.options.infinite && ( _.currentSlide > lastVisibleIndex )) {\n            _.currentSlide = lastVisibleIndex;\n        }\n\n        // if less slides than to show, go to start.\n        if ( _.slideCount <= _.options.slidesToShow ) {\n            _.currentSlide = 0;\n\n        }\n\n        currentSlide = _.currentSlide;\n\n        _.destroy(true);\n\n        $.extend(_, _.initials, { currentSlide: currentSlide });\n\n        _.init();\n\n        if( !initializing ) {\n\n            _.changeSlide({\n                data: {\n                    message: 'index',\n                    index: currentSlide\n                }\n            }, false);\n\n        }\n\n    };\n\n    Slick.prototype.registerBreakpoints = function() {\n\n        var _ = this, breakpoint, currentBreakpoint, l,\n            responsiveSettings = _.options.responsive || null;\n\n        if ( $.type(responsiveSettings) === 'array' && responsiveSettings.length ) {\n\n            _.respondTo = _.options.respondTo || 'window';\n\n            for ( breakpoint in responsiveSettings ) {\n\n                l = _.breakpoints.length-1;\n                currentBreakpoint = responsiveSettings[breakpoint].breakpoint;\n\n                if (responsiveSettings.hasOwnProperty(breakpoint)) {\n\n                    // loop through the breakpoints and cut out any existing\n                    // ones with the same breakpoint number, we don't want dupes.\n                    while( l >= 0 ) {\n                        if( _.breakpoints[l] && _.breakpoints[l] === currentBreakpoint ) {\n                            _.breakpoints.splice(l,1);\n                        }\n                        l--;\n                    }\n\n                    _.breakpoints.push(currentBreakpoint);\n                    _.breakpointSettings[currentBreakpoint] = responsiveSettings[breakpoint].settings;\n\n                }\n\n            }\n\n            _.breakpoints.sort(function(a, b) {\n                return ( _.options.mobileFirst ) ? a-b : b-a;\n            });\n\n        }\n\n    };\n\n    Slick.prototype.reinit = function() {\n\n        var _ = this;\n\n        _.$slides =\n            _.$slideTrack\n                .children(_.options.slide)\n                .addClass('slick-slide');\n\n        _.slideCount = _.$slides.length;\n\n        if (_.currentSlide >= _.slideCount && _.currentSlide !== 0) {\n            _.currentSlide = _.currentSlide - _.options.slidesToScroll;\n        }\n\n        if (_.slideCount <= _.options.slidesToShow) {\n            _.currentSlide = 0;\n        }\n\n        _.registerBreakpoints();\n\n        _.setProps();\n        _.setupInfinite();\n        _.buildArrows();\n        _.updateArrows();\n        _.initArrowEvents();\n        _.buildDots();\n        _.updateDots();\n        _.initDotEvents();\n        _.cleanUpSlideEvents();\n        _.initSlideEvents();\n\n        _.checkResponsive(false, true);\n\n        if (_.options.focusOnSelect === true) {\n            $(_.$slideTrack).children().on('click.slick', _.selectHandler);\n        }\n\n        _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);\n\n        _.setPosition();\n        _.focusHandler();\n\n        _.paused = !_.options.autoplay;\n        _.autoPlay();\n\n        _.$slider.trigger('reInit', [_]);\n\n    };\n\n    Slick.prototype.resize = function() {\n\n        var _ = this;\n\n        if ($(window).width() !== _.windowWidth) {\n            clearTimeout(_.windowDelay);\n            _.windowDelay = window.setTimeout(function() {\n                _.windowWidth = $(window).width();\n                _.checkResponsive();\n                if( !_.unslicked ) { _.setPosition(); }\n            }, 50);\n        }\n    };\n\n    Slick.prototype.removeSlide = Slick.prototype.slickRemove = function(index, removeBefore, removeAll) {\n\n        var _ = this;\n\n        if (typeof(index) === 'boolean') {\n            removeBefore = index;\n            index = removeBefore === true ? 0 : _.slideCount - 1;\n        } else {\n            index = removeBefore === true ? --index : index;\n        }\n\n        if (_.slideCount < 1 || index < 0 || index > _.slideCount - 1) {\n            return false;\n        }\n\n        _.unload();\n\n        if (removeAll === true) {\n            _.$slideTrack.children().remove();\n        } else {\n            _.$slideTrack.children(this.options.slide).eq(index).remove();\n        }\n\n        _.$slides = _.$slideTrack.children(this.options.slide);\n\n        _.$slideTrack.children(this.options.slide).detach();\n\n        _.$slideTrack.append(_.$slides);\n\n        _.$slidesCache = _.$slides;\n\n        _.reinit();\n\n    };\n\n    Slick.prototype.setCSS = function(position) {\n\n        var _ = this,\n            positionProps = {},\n            x, y;\n\n        if (_.options.rtl === true) {\n            position = -position;\n        }\n        x = _.positionProp == 'left' ? Math.ceil(position) + 'px' : '0px';\n        y = _.positionProp == 'top' ? Math.ceil(position) + 'px' : '0px';\n\n        positionProps[_.positionProp] = position;\n\n        if (_.transformsEnabled === false) {\n            _.$slideTrack.css(positionProps);\n        } else {\n            positionProps = {};\n            if (_.cssTransitions === false) {\n                positionProps[_.animType] = 'translate(' + x + ', ' + y + ')';\n                _.$slideTrack.css(positionProps);\n            } else {\n                positionProps[_.animType] = 'translate3d(' + x + ', ' + y + ', 0px)';\n                _.$slideTrack.css(positionProps);\n            }\n        }\n\n    };\n\n    Slick.prototype.setDimensions = function() {\n\n        var _ = this;\n\n        if (_.options.vertical === false) {\n            if (_.options.centerMode === true) {\n                _.$list.css({\n                    padding: ('0px ' + _.options.centerPadding)\n                });\n            }\n        } else {\n            _.$list.height(_.$slides.first().outerHeight(true) * _.options.slidesToShow);\n            if (_.options.centerMode === true) {\n                _.$list.css({\n                    padding: (_.options.centerPadding + ' 0px')\n                });\n            }\n        }\n\n        _.listWidth = _.$list.width();\n        _.listHeight = _.$list.height();\n\n\n        if (_.options.vertical === false && _.options.variableWidth === false) {\n            _.slideWidth = Math.ceil(_.listWidth / _.options.slidesToShow);\n            _.$slideTrack.width(Math.ceil((_.slideWidth * _.$slideTrack.children('.slick-slide').length)));\n\n        } else if (_.options.variableWidth === true) {\n            _.$slideTrack.width(5000 * _.slideCount);\n        } else {\n            _.slideWidth = Math.ceil(_.listWidth);\n            _.$slideTrack.height(Math.ceil((_.$slides.first().outerHeight(true) * _.$slideTrack.children('.slick-slide').length)));\n        }\n\n        var offset = _.$slides.first().outerWidth(true) - _.$slides.first().width();\n        if (_.options.variableWidth === false) _.$slideTrack.children('.slick-slide').width(_.slideWidth - offset);\n\n    };\n\n    Slick.prototype.setFade = function() {\n\n        var _ = this,\n            targetLeft;\n\n        _.$slides.each(function(index, element) {\n            targetLeft = (_.slideWidth * index) * -1;\n            if (_.options.rtl === true) {\n                $(element).css({\n                    position: 'relative',\n                    right: targetLeft,\n                    top: 0,\n                    zIndex: _.options.zIndex - 2,\n                    opacity: 0\n                });\n            } else {\n                $(element).css({\n                    position: 'relative',\n                    left: targetLeft,\n                    top: 0,\n                    zIndex: _.options.zIndex - 2,\n                    opacity: 0\n                });\n            }\n        });\n\n        _.$slides.eq(_.currentSlide).css({\n            zIndex: _.options.zIndex - 1,\n            opacity: 1\n        });\n\n    };\n\n    Slick.prototype.setHeight = function() {\n\n        var _ = this;\n\n        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {\n            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);\n            _.$list.css('height', targetHeight);\n        }\n\n    };\n\n    Slick.prototype.setOption =\n    Slick.prototype.slickSetOption = function() {\n\n        /**\n         * accepts arguments in format of:\n         *\n         *  - for changing a single option's value:\n         *     .slick(\"setOption\", option, value, refresh )\n         *\n         *  - for changing a set of responsive options:\n         *     .slick(\"setOption\", 'responsive', [{}, ...], refresh )\n         *\n         *  - for updating multiple values at once (not responsive)\n         *     .slick(\"setOption\", { 'option': value, ... }, refresh )\n         */\n\n        var _ = this, l, item, option, value, refresh = false, type;\n\n        if( $.type( arguments[0] ) === 'object' ) {\n\n            option =  arguments[0];\n            refresh = arguments[1];\n            type = 'multiple';\n\n        } else if ( $.type( arguments[0] ) === 'string' ) {\n\n            option =  arguments[0];\n            value = arguments[1];\n            refresh = arguments[2];\n\n            if ( arguments[0] === 'responsive' && $.type( arguments[1] ) === 'array' ) {\n\n                type = 'responsive';\n\n            } else if ( typeof arguments[1] !== 'undefined' ) {\n\n                type = 'single';\n\n            }\n\n        }\n\n        if ( type === 'single' ) {\n\n            _.options[option] = value;\n\n\n        } else if ( type === 'multiple' ) {\n\n            $.each( option , function( opt, val ) {\n\n                _.options[opt] = val;\n\n            });\n\n\n        } else if ( type === 'responsive' ) {\n\n            for ( item in value ) {\n\n                if( $.type( _.options.responsive ) !== 'array' ) {\n\n                    _.options.responsive = [ value[item] ];\n\n                } else {\n\n                    l = _.options.responsive.length-1;\n\n                    // loop through the responsive object and splice out duplicates.\n                    while( l >= 0 ) {\n\n                        if( _.options.responsive[l].breakpoint === value[item].breakpoint ) {\n\n                            _.options.responsive.splice(l,1);\n\n                        }\n\n                        l--;\n\n                    }\n\n                    _.options.responsive.push( value[item] );\n\n                }\n\n            }\n\n        }\n\n        if ( refresh ) {\n\n            _.unload();\n            _.reinit();\n\n        }\n\n    };\n\n    Slick.prototype.setPosition = function() {\n\n        var _ = this;\n\n        _.setDimensions();\n\n        _.setHeight();\n\n        if (_.options.fade === false) {\n            _.setCSS(_.getLeft(_.currentSlide));\n        } else {\n            _.setFade();\n        }\n\n        _.$slider.trigger('setPosition', [_]);\n\n    };\n\n    Slick.prototype.setProps = function() {\n\n        var _ = this,\n            bodyStyle = document.body.style;\n\n        _.positionProp = _.options.vertical === true ? 'top' : 'left';\n\n        if (_.positionProp === 'top') {\n            _.$slider.addClass('slick-vertical');\n        } else {\n            _.$slider.removeClass('slick-vertical');\n        }\n\n        if (bodyStyle.WebkitTransition !== undefined ||\n            bodyStyle.MozTransition !== undefined ||\n            bodyStyle.msTransition !== undefined) {\n            if (_.options.useCSS === true) {\n                _.cssTransitions = true;\n            }\n        }\n\n        if ( _.options.fade ) {\n            if ( typeof _.options.zIndex === 'number' ) {\n                if( _.options.zIndex < 3 ) {\n                    _.options.zIndex = 3;\n                }\n            } else {\n                _.options.zIndex = _.defaults.zIndex;\n            }\n        }\n\n        if (bodyStyle.OTransform !== undefined) {\n            _.animType = 'OTransform';\n            _.transformType = '-o-transform';\n            _.transitionType = 'OTransition';\n            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;\n        }\n        if (bodyStyle.MozTransform !== undefined) {\n            _.animType = 'MozTransform';\n            _.transformType = '-moz-transform';\n            _.transitionType = 'MozTransition';\n            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.MozPerspective === undefined) _.animType = false;\n        }\n        if (bodyStyle.webkitTransform !== undefined) {\n            _.animType = 'webkitTransform';\n            _.transformType = '-webkit-transform';\n            _.transitionType = 'webkitTransition';\n            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;\n        }\n        if (bodyStyle.msTransform !== undefined) {\n            _.animType = 'msTransform';\n            _.transformType = '-ms-transform';\n            _.transitionType = 'msTransition';\n            if (bodyStyle.msTransform === undefined) _.animType = false;\n        }\n        if (bodyStyle.transform !== undefined && _.animType !== false) {\n            _.animType = 'transform';\n            _.transformType = 'transform';\n            _.transitionType = 'transition';\n        }\n        _.transformsEnabled = _.options.useTransform && (_.animType !== null && _.animType !== false);\n    };\n\n\n    Slick.prototype.setSlideClasses = function(index) {\n\n        var _ = this,\n            centerOffset, allSlides, indexOffset, remainder;\n\n        allSlides = _.$slider\n            .find('.slick-slide')\n            .removeClass('slick-active slick-center slick-current')\n            .attr('aria-hidden', 'true');\n\n        _.$slides\n            .eq(index)\n            .addClass('slick-current');\n\n        if (_.options.centerMode === true) {\n\n            centerOffset = Math.floor(_.options.slidesToShow / 2);\n\n            if (_.options.infinite === true) {\n\n                if (index >= centerOffset && index <= (_.slideCount - 1) - centerOffset) {\n\n                    _.$slides\n                        .slice(index - centerOffset, index + centerOffset + 1)\n                        .addClass('slick-active')\n                        .attr('aria-hidden', 'false');\n\n                } else {\n\n                    indexOffset = _.options.slidesToShow + index;\n                    allSlides\n                        .slice(indexOffset - centerOffset + 1, indexOffset + centerOffset + 2)\n                        .addClass('slick-active')\n                        .attr('aria-hidden', 'false');\n\n                }\n\n                if (index === 0) {\n\n                    allSlides\n                        .eq(allSlides.length - 1 - _.options.slidesToShow)\n                        .addClass('slick-center');\n\n                } else if (index === _.slideCount - 1) {\n\n                    allSlides\n                        .eq(_.options.slidesToShow)\n                        .addClass('slick-center');\n\n                }\n\n            }\n\n            _.$slides\n                .eq(index)\n                .addClass('slick-center');\n\n        } else {\n\n            if (index >= 0 && index <= (_.slideCount - _.options.slidesToShow)) {\n\n                _.$slides\n                    .slice(index, index + _.options.slidesToShow)\n                    .addClass('slick-active')\n                    .attr('aria-hidden', 'false');\n\n            } else if (allSlides.length <= _.options.slidesToShow) {\n\n                allSlides\n                    .addClass('slick-active')\n                    .attr('aria-hidden', 'false');\n\n            } else {\n\n                remainder = _.slideCount % _.options.slidesToShow;\n                indexOffset = _.options.infinite === true ? _.options.slidesToShow + index : index;\n\n                if (_.options.slidesToShow == _.options.slidesToScroll && (_.slideCount - index) < _.options.slidesToShow) {\n\n                    allSlides\n                        .slice(indexOffset - (_.options.slidesToShow - remainder), indexOffset + remainder)\n                        .addClass('slick-active')\n                        .attr('aria-hidden', 'false');\n\n                } else {\n\n                    allSlides\n                        .slice(indexOffset, indexOffset + _.options.slidesToShow)\n                        .addClass('slick-active')\n                        .attr('aria-hidden', 'false');\n\n                }\n\n            }\n\n        }\n\n        if (_.options.lazyLoad === 'ondemand') {\n            _.lazyLoad();\n        }\n\n    };\n\n    Slick.prototype.setupInfinite = function() {\n\n        var _ = this,\n            i, slideIndex, infiniteCount;\n\n        if (_.options.fade === true) {\n            _.options.centerMode = false;\n        }\n\n        if (_.options.infinite === true && _.options.fade === false) {\n\n            slideIndex = null;\n\n            if (_.slideCount > _.options.slidesToShow) {\n\n                if (_.options.centerMode === true) {\n                    infiniteCount = _.options.slidesToShow + 1;\n                } else {\n                    infiniteCount = _.options.slidesToShow;\n                }\n\n                for (i = _.slideCount; i > (_.slideCount -\n                        infiniteCount); i -= 1) {\n                    slideIndex = i - 1;\n                    $(_.$slides[slideIndex]).clone(true).attr('id', '')\n                        .attr('data-slick-index', slideIndex - _.slideCount)\n                        .prependTo(_.$slideTrack).addClass('slick-cloned');\n                }\n                for (i = 0; i < infiniteCount; i += 1) {\n                    slideIndex = i;\n                    $(_.$slides[slideIndex]).clone(true).attr('id', '')\n                        .attr('data-slick-index', slideIndex + _.slideCount)\n                        .appendTo(_.$slideTrack).addClass('slick-cloned');\n                }\n                _.$slideTrack.find('.slick-cloned').find('[id]').each(function() {\n                    $(this).attr('id', '');\n                });\n\n            }\n\n        }\n\n    };\n\n    Slick.prototype.interrupt = function( toggle ) {\n\n        var _ = this;\n\n        if( !toggle ) {\n            _.autoPlay();\n        }\n        _.interrupted = toggle;\n\n    };\n\n    Slick.prototype.selectHandler = function(event) {\n\n        var _ = this;\n\n        var targetElement =\n            $(event.target).is('.slick-slide') ?\n                $(event.target) :\n                $(event.target).parents('.slick-slide');\n\n        var index = parseInt(targetElement.attr('data-slick-index'));\n\n        if (!index) index = 0;\n\n        if (_.slideCount <= _.options.slidesToShow) {\n\n            _.setSlideClasses(index);\n            _.asNavFor(index);\n            return;\n\n        }\n\n        _.slideHandler(index);\n\n    };\n\n    Slick.prototype.slideHandler = function(index, sync, dontAnimate) {\n\n        var targetSlide, animSlide, oldSlide, slideLeft, targetLeft = null,\n            _ = this, navTarget;\n\n        sync = sync || false;\n\n        if (_.animating === true && _.options.waitForAnimate === true) {\n            return;\n        }\n\n        if (_.options.fade === true && _.currentSlide === index) {\n            return;\n        }\n\n        if (_.slideCount <= _.options.slidesToShow) {\n            return;\n        }\n\n        if (sync === false) {\n            _.asNavFor(index);\n        }\n\n        targetSlide = index;\n        targetLeft = _.getLeft(targetSlide);\n        slideLeft = _.getLeft(_.currentSlide);\n\n        _.currentLeft = _.swipeLeft === null ? slideLeft : _.swipeLeft;\n\n        if (_.options.infinite === false && _.options.centerMode === false && (index < 0 || index > _.getDotCount() * _.options.slidesToScroll)) {\n            if (_.options.fade === false) {\n                targetSlide = _.currentSlide;\n                if (dontAnimate !== true) {\n                    _.animateSlide(slideLeft, function() {\n                        _.postSlide(targetSlide);\n                    });\n                } else {\n                    _.postSlide(targetSlide);\n                }\n            }\n            return;\n        } else if (_.options.infinite === false && _.options.centerMode === true && (index < 0 || index > (_.slideCount - _.options.slidesToScroll))) {\n            if (_.options.fade === false) {\n                targetSlide = _.currentSlide;\n                if (dontAnimate !== true) {\n                    _.animateSlide(slideLeft, function() {\n                        _.postSlide(targetSlide);\n                    });\n                } else {\n                    _.postSlide(targetSlide);\n                }\n            }\n            return;\n        }\n\n        if ( _.options.autoplay ) {\n            clearInterval(_.autoPlayTimer);\n        }\n\n        if (targetSlide < 0) {\n            if (_.slideCount % _.options.slidesToScroll !== 0) {\n                animSlide = _.slideCount - (_.slideCount % _.options.slidesToScroll);\n            } else {\n                animSlide = _.slideCount + targetSlide;\n            }\n        } else if (targetSlide >= _.slideCount) {\n            if (_.slideCount % _.options.slidesToScroll !== 0) {\n                animSlide = 0;\n            } else {\n                animSlide = targetSlide - _.slideCount;\n            }\n        } else {\n            animSlide = targetSlide;\n        }\n\n        _.animating = true;\n\n        _.$slider.trigger('beforeChange', [_, _.currentSlide, animSlide]);\n\n        oldSlide = _.currentSlide;\n        _.currentSlide = animSlide;\n\n        _.setSlideClasses(_.currentSlide);\n\n        if ( _.options.asNavFor ) {\n\n            navTarget = _.getNavTarget();\n            navTarget = navTarget.slick('getSlick');\n\n            if ( navTarget.slideCount <= navTarget.options.slidesToShow ) {\n                navTarget.setSlideClasses(_.currentSlide);\n            }\n\n        }\n\n        _.updateDots();\n        _.updateArrows();\n\n        if (_.options.fade === true) {\n            if (dontAnimate !== true) {\n\n                _.fadeSlideOut(oldSlide);\n\n                _.fadeSlide(animSlide, function() {\n                    _.postSlide(animSlide);\n                });\n\n            } else {\n                _.postSlide(animSlide);\n            }\n            _.animateHeight();\n            return;\n        }\n\n        if (dontAnimate !== true) {\n            _.animateSlide(targetLeft, function() {\n                _.postSlide(animSlide);\n            });\n        } else {\n            _.postSlide(animSlide);\n        }\n\n    };\n\n    Slick.prototype.startLoad = function() {\n\n        var _ = this;\n\n        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {\n\n            _.$prevArrow.hide();\n            _.$nextArrow.hide();\n\n        }\n\n        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {\n\n            _.$dots.hide();\n\n        }\n\n        _.$slider.addClass('slick-loading');\n\n    };\n\n    Slick.prototype.swipeDirection = function() {\n\n        var xDist, yDist, r, swipeAngle, _ = this;\n\n        xDist = _.touchObject.startX - _.touchObject.curX;\n        yDist = _.touchObject.startY - _.touchObject.curY;\n        r = Math.atan2(yDist, xDist);\n\n        swipeAngle = Math.round(r * 180 / Math.PI);\n        if (swipeAngle < 0) {\n            swipeAngle = 360 - Math.abs(swipeAngle);\n        }\n\n        if ((swipeAngle <= 45) && (swipeAngle >= 0)) {\n            return (_.options.rtl === false ? 'left' : 'right');\n        }\n        if ((swipeAngle <= 360) && (swipeAngle >= 315)) {\n            return (_.options.rtl === false ? 'left' : 'right');\n        }\n        if ((swipeAngle >= 135) && (swipeAngle <= 225)) {\n            return (_.options.rtl === false ? 'right' : 'left');\n        }\n        if (_.options.verticalSwiping === true) {\n            if ((swipeAngle >= 35) && (swipeAngle <= 135)) {\n                return 'down';\n            } else {\n                return 'up';\n            }\n        }\n\n        return 'vertical';\n\n    };\n\n    Slick.prototype.swipeEnd = function(event) {\n\n        var _ = this,\n            slideCount,\n            direction;\n\n        _.dragging = false;\n        _.interrupted = false;\n        _.shouldClick = ( _.touchObject.swipeLength > 10 ) ? false : true;\n\n        if ( _.touchObject.curX === undefined ) {\n            return false;\n        }\n\n        if ( _.touchObject.edgeHit === true ) {\n            _.$slider.trigger('edge', [_, _.swipeDirection() ]);\n        }\n\n        if ( _.touchObject.swipeLength >= _.touchObject.minSwipe ) {\n\n            direction = _.swipeDirection();\n\n            switch ( direction ) {\n\n                case 'left':\n                case 'down':\n\n                    slideCount =\n                        _.options.swipeToSlide ?\n                            _.checkNavigable( _.currentSlide + _.getSlideCount() ) :\n                            _.currentSlide + _.getSlideCount();\n\n                    _.currentDirection = 0;\n\n                    break;\n\n                case 'right':\n                case 'up':\n\n                    slideCount =\n                        _.options.swipeToSlide ?\n                            _.checkNavigable( _.currentSlide - _.getSlideCount() ) :\n                            _.currentSlide - _.getSlideCount();\n\n                    _.currentDirection = 1;\n\n                    break;\n\n                default:\n\n\n            }\n\n            if( direction != 'vertical' ) {\n\n                _.slideHandler( slideCount );\n                _.touchObject = {};\n                _.$slider.trigger('swipe', [_, direction ]);\n\n            }\n\n        } else {\n\n            if ( _.touchObject.startX !== _.touchObject.curX ) {\n\n                _.slideHandler( _.currentSlide );\n                _.touchObject = {};\n\n            }\n\n        }\n\n    };\n\n    Slick.prototype.swipeHandler = function(event) {\n\n        var _ = this;\n\n        if ((_.options.swipe === false) || ('ontouchend' in document && _.options.swipe === false)) {\n            return;\n        } else if (_.options.draggable === false && event.type.indexOf('mouse') !== -1) {\n            return;\n        }\n\n        _.touchObject.fingerCount = event.originalEvent && event.originalEvent.touches !== undefined ?\n            event.originalEvent.touches.length : 1;\n\n        _.touchObject.minSwipe = _.listWidth / _.options\n            .touchThreshold;\n\n        if (_.options.verticalSwiping === true) {\n            _.touchObject.minSwipe = _.listHeight / _.options\n                .touchThreshold;\n        }\n\n        switch (event.data.action) {\n\n            case 'start':\n                _.swipeStart(event);\n                break;\n\n            case 'move':\n                _.swipeMove(event);\n                break;\n\n            case 'end':\n                _.swipeEnd(event);\n                break;\n\n        }\n\n    };\n\n    Slick.prototype.swipeMove = function(event) {\n\n        var _ = this,\n            edgeWasHit = false,\n            curLeft, swipeDirection, swipeLength, positionOffset, touches;\n\n        touches = event.originalEvent !== undefined ? event.originalEvent.touches : null;\n\n        if (!_.dragging || touches && touches.length !== 1) {\n            return false;\n        }\n\n        curLeft = _.getLeft(_.currentSlide);\n\n        _.touchObject.curX = touches !== undefined ? touches[0].pageX : event.clientX;\n        _.touchObject.curY = touches !== undefined ? touches[0].pageY : event.clientY;\n\n        _.touchObject.swipeLength = Math.round(Math.sqrt(\n            Math.pow(_.touchObject.curX - _.touchObject.startX, 2)));\n\n        if (_.options.verticalSwiping === true) {\n            _.touchObject.swipeLength = Math.round(Math.sqrt(\n                Math.pow(_.touchObject.curY - _.touchObject.startY, 2)));\n        }\n\n        swipeDirection = _.swipeDirection();\n\n        if (swipeDirection === 'vertical') {\n            return;\n        }\n\n        if (event.originalEvent !== undefined && _.touchObject.swipeLength > 4) {\n            event.preventDefault();\n        }\n\n        positionOffset = (_.options.rtl === false ? 1 : -1) * (_.touchObject.curX > _.touchObject.startX ? 1 : -1);\n        if (_.options.verticalSwiping === true) {\n            positionOffset = _.touchObject.curY > _.touchObject.startY ? 1 : -1;\n        }\n\n\n        swipeLength = _.touchObject.swipeLength;\n\n        _.touchObject.edgeHit = false;\n\n        if (_.options.infinite === false) {\n            if ((_.currentSlide === 0 && swipeDirection === 'right') || (_.currentSlide >= _.getDotCount() && swipeDirection === 'left')) {\n                swipeLength = _.touchObject.swipeLength * _.options.edgeFriction;\n                _.touchObject.edgeHit = true;\n            }\n        }\n\n        if (_.options.vertical === false) {\n            _.swipeLeft = curLeft + swipeLength * positionOffset;\n        } else {\n            _.swipeLeft = curLeft + (swipeLength * (_.$list.height() / _.listWidth)) * positionOffset;\n        }\n        if (_.options.verticalSwiping === true) {\n            _.swipeLeft = curLeft + swipeLength * positionOffset;\n        }\n\n        if (_.options.fade === true || _.options.touchMove === false) {\n            return false;\n        }\n\n        if (_.animating === true) {\n            _.swipeLeft = null;\n            return false;\n        }\n\n        _.setCSS(_.swipeLeft);\n\n    };\n\n    Slick.prototype.swipeStart = function(event) {\n\n        var _ = this,\n            touches;\n\n        _.interrupted = true;\n\n        if (_.touchObject.fingerCount !== 1 || _.slideCount <= _.options.slidesToShow) {\n            _.touchObject = {};\n            return false;\n        }\n\n        if (event.originalEvent !== undefined && event.originalEvent.touches !== undefined) {\n            touches = event.originalEvent.touches[0];\n        }\n\n        _.touchObject.startX = _.touchObject.curX = touches !== undefined ? touches.pageX : event.clientX;\n        _.touchObject.startY = _.touchObject.curY = touches !== undefined ? touches.pageY : event.clientY;\n\n        _.dragging = true;\n\n    };\n\n    Slick.prototype.unfilterSlides = Slick.prototype.slickUnfilter = function() {\n\n        var _ = this;\n\n        if (_.$slidesCache !== null) {\n\n            _.unload();\n\n            _.$slideTrack.children(this.options.slide).detach();\n\n            _.$slidesCache.appendTo(_.$slideTrack);\n\n            _.reinit();\n\n        }\n\n    };\n\n    Slick.prototype.unload = function() {\n\n        var _ = this;\n\n        $('.slick-cloned', _.$slider).remove();\n\n        if (_.$dots) {\n            _.$dots.remove();\n        }\n\n        if (_.$prevArrow && _.htmlExpr.test(_.options.prevArrow)) {\n            _.$prevArrow.remove();\n        }\n\n        if (_.$nextArrow && _.htmlExpr.test(_.options.nextArrow)) {\n            _.$nextArrow.remove();\n        }\n\n        _.$slides\n            .removeClass('slick-slide slick-active slick-visible slick-current')\n            .attr('aria-hidden', 'true')\n            .css('width', '');\n\n    };\n\n    Slick.prototype.unslick = function(fromBreakpoint) {\n\n        var _ = this;\n        _.$slider.trigger('unslick', [_, fromBreakpoint]);\n        _.destroy();\n\n    };\n\n    Slick.prototype.updateArrows = function() {\n\n        var _ = this,\n            centerOffset;\n\n        centerOffset = Math.floor(_.options.slidesToShow / 2);\n\n        if ( _.options.arrows === true &&\n            _.slideCount > _.options.slidesToShow &&\n            !_.options.infinite ) {\n\n            _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');\n            _.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');\n\n            if (_.currentSlide === 0) {\n\n                _.$prevArrow.addClass('slick-disabled').attr('aria-disabled', 'true');\n                _.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');\n\n            } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow && _.options.centerMode === false) {\n\n                _.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');\n                _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');\n\n            } else if (_.currentSlide >= _.slideCount - 1 && _.options.centerMode === true) {\n\n                _.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');\n                _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');\n\n            }\n\n        }\n\n    };\n\n    Slick.prototype.updateDots = function() {\n\n        var _ = this;\n\n        if (_.$dots !== null) {\n\n            _.$dots\n                .find('li')\n                .removeClass('slick-active')\n                .attr('aria-hidden', 'true');\n\n            _.$dots\n                .find('li')\n                .eq(Math.floor(_.currentSlide / _.options.slidesToScroll))\n                .addClass('slick-active')\n                .attr('aria-hidden', 'false');\n\n        }\n\n    };\n\n    Slick.prototype.visibility = function() {\n\n        var _ = this;\n\n        if ( _.options.autoplay ) {\n\n            if ( document[_.hidden] ) {\n\n                _.interrupted = true;\n\n            } else {\n\n                _.interrupted = false;\n\n            }\n\n        }\n\n    };\n\n    $.fn.slick = function() {\n        var _ = this,\n            opt = arguments[0],\n            args = Array.prototype.slice.call(arguments, 1),\n            l = _.length,\n            i,\n            ret;\n        for (i = 0; i < l; i++) {\n            if (typeof opt == 'object' || typeof opt == 'undefined')\n                _[i].slick = new Slick(_[i], opt);\n            else\n                ret = _[i].slick[opt].apply(_[i].slick, args);\n            if (typeof ret != 'undefined') return ret;\n        }\n        return _;\n    };\n\n}));\n"

/***/ })
/******/ ]);