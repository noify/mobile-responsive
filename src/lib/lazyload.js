
var callCallback = function callCallback(callback, argument) {
	if (callback) {
		callback(argument);
	}
};

var getTopOffset = function getTopOffset(element) {
	return element.getBoundingClientRect().top + window.pageYOffset - element.ownerDocument.documentElement.clientTop;
};

var isBelowViewport = function isBelowViewport(element, container, threshold) {
	var fold = container === document ? window.innerHeight + window.pageYOffset : getTopOffset(container) + container.offsetHeight;
	return fold <= getTopOffset(element) - threshold;
};

var getLeftOffset = function getLeftOffset(element) {
	return element.getBoundingClientRect().left + window.pageXOffset - element.ownerDocument.documentElement.clientLeft;
};

var isAtRightOfViewport = function isAtRightOfViewport(element, container, threshold) {
	var documentWidth = window.innerWidth;
	var fold = container === document ? documentWidth + window.pageXOffset : getLeftOffset(container) + documentWidth;
	return fold <= getLeftOffset(element) - threshold;
};

var isAboveViewport = function isAboveViewport(element, container, threshold) {
	var fold = container === document ? window.pageYOffset : getTopOffset(container);
	return fold >= getTopOffset(element) + threshold + element.offsetHeight;
};

var isAtLeftOfViewport = function isAtLeftOfViewport(element, container, threshold) {
	var fold = container === document ? window.pageXOffset : getLeftOffset(container);
	return fold >= getLeftOffset(element) + threshold + element.offsetWidth;
};

var isInsideViewport = function isInsideViewport(element, container, threshold) {
	return !isBelowViewport(element, container, threshold) && !isAboveViewport(element, container, threshold) && !isAtRightOfViewport(element, container, threshold) && !isAtLeftOfViewport(element, container, threshold);
};

var dataPrefix = 'data-';

var getData = function getData(element, attribute) {
	return element.getAttribute(dataPrefix + attribute);
};

var setData = function setData(element, attribute, value) {
	return element.setAttribute(dataPrefix + attribute, value);
};

var LazyLoad = function LazyLoad(instanceSettings) {
		this._settings = Object.assign({}, {
			elements_selector: 'img',
			container: document,
			threshold: 300,
			throttle: 150,
			data_src: 'src',
			data_srcset: 'srcset',
			skip_invisible: true,
			callback_load: null,
			callback_error: null,
			callback_set: null,
			callback_enter: null
		}, instanceSettings);

		this._previousLoopTime = 0;
		this._loopTimeout = null;
		this._boundHandleScroll = this.handleScroll.bind(this);
		
		window.addEventListener('resize', this._boundHandleScroll);
		this.update();
};

LazyLoad.prototype = {

	_reveal: function _reveal(element) {
		var settings = this._settings,
				src = getData(element, settings.data_src),
				srcset = getData(element, settings.data_srcset),
				devicePixelRatio = parseInt(window.devicePixelRatio) || 1;

		var errorCallback = function errorCallback() {
			if (!settings) {
				return;
			}
			element.removeEventListener('load', loadCallback);
			element.removeEventListener('error', errorCallback);
			setData(element, 'lazyload', 'error');
			callCallback(settings.callback_error, element);
		};

		var loadCallback = function loadCallback() {
			if (!settings) {
				return;
			}
			setData(element, 'lazyload', 'loaded');
			element.removeEventListener('load', loadCallback);
			element.removeEventListener('error', errorCallback);
			callCallback(settings.callback_load, element);
		};

		callCallback(settings.callback_enter, element);
		element.addEventListener('load', loadCallback);
		element.addEventListener('error', errorCallback);
		setData(element, 'lazyload', 'loading');
		if(src){
			element.setAttribute('src', src);
		}
		if(srcset){
			srcset.trim().split(',').forEach(src => {
				src = src.trim().split(' ');
				if(devicePixelRatio + 'x' === src[1].toLocaleLowerCase()){
					element.setAttribute('src', src[0]);
					return;
				}
			});
		}
		callCallback(settings.callback_set, element);
	},

	_loopThroughElements: function _loopThroughElements() {
		var _this = this,
			settings = this._settings;

			this._elements = this._elements.filter(function (element) {
			if (!(settings.skip_invisible && element.offsetParent === null) && isInsideViewport(element, settings.container, settings.threshold)) {
				_this._reveal(element);
			}
			return !getData(element, 'lazyload');
		});
		if (_this._elements.length === 0) {
			_this._stopScrollHandler();
		}
	},

	_startScrollHandler: function _startScrollHandler() {
		if (!this._isHandlingScroll) {
			this._isHandlingScroll = true;
			this._settings.container.addEventListener('scroll', this._boundHandleScroll);
		}
	},

	_stopScrollHandler: function _stopScrollHandler() {
		if (this._isHandlingScroll) {
			this._isHandlingScroll = false;
			this._settings.container.removeEventListener('scroll', this._boundHandleScroll);
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
		
		this._elements = Array.prototype.slice.call(settings.container.querySelectorAll(settings.elements_selector)).filter(function (element) {
			return !getData(element, 'lazyload');
		});
		this._loopThroughElements();
		this._startScrollHandler();
	},

	destroy: function destroy() {
		window.removeEventListener('resize', this._boundHandleScroll);
		if (this._loopTimeout) {
			clearTimeout(this._loopTimeout);
			this._loopTimeout = null;
		}
		this._stopScrollHandler();
		this._elements = null;
		this._settings = null;
	}
};

export default LazyLoad;
