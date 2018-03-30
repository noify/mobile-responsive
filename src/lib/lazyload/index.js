(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : global.LazyLoad = factory();
})(this, function () {
	'use strict';

	var callCallback = function callCallback(callback, argument) {
		if (callback) {
			callback(argument);
		}
	};

	// 获取元素顶部偏移值
	var getTopOffset = function getTopOffset(element) {
		return element.getBoundingClientRect().top + window.pageYOffset - element.ownerDocument.documentElement.clientTop;
	};

	// 是否在 Viewport 下面
	var isBelowViewport = function isBelowViewport(element, container, threshold) {
		var fold = container === document ? window.innerHeight + window.pageYOffset : getTopOffset(container) + container.offsetHeight;
		return fold <= getTopOffset(element) - threshold;
	};

	// 获取元素左偏移值
	var getLeftOffset = function getLeftOffset(element) {
		return element.getBoundingClientRect().left + window.pageXOffset - element.ownerDocument.documentElement.clientLeft;
	};

	// 是否在 Viewport 右面
	var isAtRightOfViewport = function isAtRightOfViewport(element, container, threshold) {
		var documentWidth = window.innerWidth;
		var fold = container === document ? documentWidth + window.pageXOffset : getLeftOffset(container) + documentWidth;
		return fold <= getLeftOffset(element) - threshold;
	};

	// 是否在 Viewport 上面
	var isAboveViewport = function isAboveViewport(element, container, threshold) {
		var fold = container === document ? window.pageYOffset : getTopOffset(container);
		return fold >= getTopOffset(element) + threshold + element.offsetHeight;
	};

	// 是否在 Viewport 左面
	var isAtLeftOfViewport = function isAtLeftOfViewport(element, container, threshold) {
		var fold = container === document ? window.pageXOffset : getLeftOffset(container);
		return fold >= getLeftOffset(element) + threshold + element.offsetWidth;
	};

	// 是否在 Viewport 中
	var isInsideViewport = function isInsideViewport(element, container, threshold) {
		return !isBelowViewport(element, container, threshold) && !isAboveViewport(element, container, threshold) && !isAtRightOfViewport(element, container, threshold) && !isAtLeftOfViewport(element, container, threshold);
	};

	var dataPrefix = "data-";

	var getData = function getData(element, attribute) {
		return element.getAttribute(dataPrefix + attribute);
	};

	var setData = function setData(element, attribute, value) {
		return element.setAttribute(dataPrefix + attribute, value);
	};

	var setSources = function setSources(element, srcDataAttribute) {
		element.setAttribute("src", getData(element, srcDataAttribute));
	};

	var LazyLoad = function LazyLoad(instanceSettings) {
			this._settings = Object.assign({}, {
				elements_selector: "img",
				container: document,
				threshold: 300,
				throttle: 150,
				data_src: "src",
				skip_invisible: true,
				class_loading: "loading",
				class_loaded: "loaded",
				class_error: "error",
				callback_load: null,
				callback_error: null,
				callback_set: null,
				callback_enter: null
			}, instanceSettings);

			this._previousLoopTime = 0;
			this._loopTimeout = null;
			this._boundHandleScroll = this.handleScroll.bind(this);

			window.addEventListener("resize", this._boundHandleScroll);
			this.update();
	};

	LazyLoad.prototype = {

		_reveal: function _reveal(element) {
			var settings = this._settings;

			var errorCallback = function errorCallback() {
				/* As this method is asynchronous, it must be protected against external destroy() calls */
				if (!settings) {
					return;
				}
				element.removeEventListener("load", loadCallback);
				element.removeEventListener("error", errorCallback);
				setData(element, 'lazyload', settings.class_error);
				callCallback(settings.callback_error, element);
			};

			var loadCallback = function loadCallback() {
				/* As this method is asynchronous, it must be protected against external destroy() calls */
				if (!settings) {
					return;
				}
				setData(element, 'lazyload', settings.class_loaded);
				element.removeEventListener("load", loadCallback);
				element.removeEventListener("error", errorCallback);
				callCallback(settings.callback_load, element);
			};

			callCallback(settings.callback_enter, element);
			element.addEventListener("load", loadCallback);
			element.addEventListener("error", errorCallback);
			setData(element, 'lazyload', settings.class_loading);
			setSources(element, settings.data_src);
			callCallback(settings.callback_set, element);
		},

		_loopThroughElements: function _loopThroughElements() {
			var settings = this._settings,
					elements = this._elements,
					elementsLength = !elements ? 0 : elements.length;
			var i = void 0;

			for (i = 0; i < elementsLength; i++) {
				var element = elements[i];
				/* If must skip_invisible and element is invisible, skip it */
				if (settings.skip_invisible && element.offsetParent === null) {
					continue;
				}

				if ((!("onscroll" in window) || /glebot/.test(navigator.userAgent)) || isInsideViewport(element, settings.container, settings.threshold)) {
					/* Start loading the image */
					this._reveal(element);
				}
			}
			/* Removing processed elements from this._elements. */
			elements = elements.filter(function (element) {
				return !getData(element, "lazyload");
			});
			/* Stop listening to scroll event when 0 elements remains */
			if (elementsLength === 0) {
				this._stopScrollHandler();
			}
		},

		_startScrollHandler: function _startScrollHandler() {
			if (!this._isHandlingScroll) {
				this._isHandlingScroll = true;
				this._settings.container.addEventListener("scroll", this._boundHandleScroll);
			}
		},

		_stopScrollHandler: function _stopScrollHandler() {
			if (this._isHandlingScroll) {
				this._isHandlingScroll = false;
				this._settings.container.removeEventListener("scroll", this._boundHandleScroll);
			}
		},
		
		handleScroll: function handleScroll() {
			var throttle = this._settings.throttle;

			if (throttle !== 0) {
				var now = Date.now();
				var remainingTime = throttle - (now - this._previousLoopTime);
				if (remainingTime <= 0 || remainingTime > throttle) {
					if (this._loopTimeout) {
							clearTimeout(this._loopTimeout);
							this._loopTimeout = null;
					}
					this._previousLoopTime = now;
					this._loopThroughElements();
				} else if (!this._loopTimeout) {
					this._loopTimeout = setTimeout(function () {
						this._previousLoopTime = Date.now();
						this._loopTimeout = null;
						this._loopThroughElements();
					}.bind(this), remainingTime);
				}
			} else {
				this._loopThroughElements();
			}
		},

		update: function update() {
			var settings = this._settings
			// Converts to array the nodeset obtained querying the DOM from _queryOriginNode with elements_selector
			this._elements = Array.prototype.slice.call(settings.container.querySelectorAll(settings.elements_selector)).filter(function (element) {
				return !getData(element, "lazyload");
			});
			this._loopThroughElements();
			this._startScrollHandler();
		},

		destroy: function destroy() {
			window.removeEventListener("resize", this._boundHandleScroll);
			if (this._loopTimeout) {
				clearTimeout(this._loopTimeout);
				this._loopTimeout = null;
			}
			this._stopScrollHandler();
			this._elements = null;
			this._settings = null;
		}
	};

	return LazyLoad;
});