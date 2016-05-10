(function(){
	$(document).ready(function(){
		var agents = [/(opr|opera)/gim,/(chrome)/gim,/(firefox)/gim,/(safari)/gim,/(msie[\s]+[\d]+)/gim,/(trident).*rv:(\d+)/gim];
		var agent = navigator.userAgent.toLocaleLowerCase();
		for(var ag in agents){
			if(agent.match(agents[ag])){
				$(document.body).addClass(String(RegExp.$1+RegExp.$2).replace(/opr/,'opera').replace(/trident/,'msie').replace(/\s+/,''));
				break;
			}
		}
	});
})();



/* local storage */
(function(window) {
  var items = {};

  function MemoryStorage() {}

  MemoryStorage.prototype.getItem = function(key) {
    return items[key];
  };

  MemoryStorage.prototype.setItem = function(key, value) {
    items[key] = value;
  };

  MemoryStorage.prototype.key = function(index) {
    return Object.keys(items)[index];
  };

  MemoryStorage.prototype.get = function() {
    return items;
  };

  Object.defineProperty(MemoryStorage.prototype, "length", {
    get: function length() {
        return Object.keys(items).length;
    }
  });

  window.memoryStorage = new MemoryStorage();
})(window);

function getStorage(storage) {
  var x = '__storage_test__';
  try {
    storage.setItem(x, x);
    storage.removeItem(x);
    return storage;
  } catch (e) {
    return getStorage.prototype.FALLBACK_STORAGE;
  }
}

getStorage.prototype.FALLBACK_STORAGE = memoryStorage;



/* native linker */
var NativeLinker = (function ($) {
	var scope,
		$linker,
		_device,
		init = function() {
			$linker = $('[data-navigation]');

			_device = yincLS.getItem("device");

			initLayout();
			initEvent();
		};

	function initLayout() {

	}

	function initEvent() {
		$linker.on('click', function(e) {
			e.preventDefault();

			var $linker = $(this);
			var action = $linker.data("navigation");
			var url = $linker.attr("href");

			_handleNavigation(action, url);
		});
	}


	function _pushNavigation(url) {
		if( _device == "ios" ) {
			window.webkit.messageHandlers.pushNavigation.postMessage({url: url});
		} else if( _device == "android" ) {
			window.android.pushNavigation({url: url});
		} else {
			window.location.href = url;
		}
	}

	function _presentModal(url) {
		if( _device == "ios" ) {
			window.webkit.messageHandlers.presentModal.postMessage({url: url});
		} else if( _device == "android" ) {
			window.android.presentModal({url: url});
		} else {
			window.location.href = url;
		}
	}

	function _handleNavigation(action, url) {
		console.log("action : " + action + ", url : " + url);
		switch(action) {
			case "modal":
				_presentModal(url);
				break;
			case "push":
				_pushNavigation(url);
				break;
			default:
				_pushNavigation(url);
		}
	}


	// token request
	function _handleRequestCredential() {
		if( _device == "ios" ) {
			window.webkit.messageHandlers.requestCredential.postMessage({callback: "NativeLinker.reloadWithCredential"});
		} else if( _device == "android" ) {
			window.android.requestCredential({callback: "NativeLinker.reloadWithCredential"}); 
		}
	}

	// token response
	function _handleReloadWithCredential(token) {
		console.log("token reload : " + token);
	}

	function _handleRequestInitInfo() {
		if( _device == "ios" ) {
			window.webkit.messageHandlers.requestInitInfo.postMessage({callback: "NativeLinker.reloadWithInitInfo"});
		} else if( _device == "android" ) {
			window.android.requestInitInfo({callback: "NativeLinker.reloadWithInitInfo"}); 
		}
	}

	function _handleReloadWithInitInfo(data) {
		console.log("data reload : " + data);
	}

	return {
		init: function () {
			scope = this;

			init();
		},
		requestCredential: function() {
			_handleRequestCredential();
		},
		reloadWithCredential: function() {
			_handleReloadWithCredential();
		},
		requestInitInfo: function() {
			_handleRequestInitInfo();
		},
		reloadWithInitInfo: function() {
			_handleReloadWithInitInfo();
		}
	};
}(jQuery));



$(document).ready(function (e) {
	yincLS.init();
	yincLS.setItem("navigationHeight", 44);
	yincLS.setItem("device", null);


	CompanyList.init();
	Company.init();
	NativeLinker.init();
});




/* Company List */
var CompanyList = (function ($) {
	var scope,
		$listContainer,
		$oldVisible,
		init = function () {
			$listContainer = $('.list-company');
			$items = $listContainer.find('.company-item');
			$oldVisible = null;

			initLayout();
			initEvent();
		};//end init

	function initLayout() {
		_updateSubInfo();
	}

	function initEvent() {
		$(window).on('scroll', function(e) {
			_updateSubInfo();
		});
	}

	function _updateSubInfo() {
		var $visible = _elementVisible();
		if( $visible === undefined ) return;
		if( !$visible.hasClass('is-opened') ) {
			$visible.addClass('is-opened');
			if( $oldVisible !== null ) {
				$oldVisible.removeClass('is-opened');
			}
		}
		$oldVisible = $visible;
	}

	function _elementVisible() {
		var $visible;
		$items.each(function() {
			if( $(this).visible(false, false, 'vertical') ) {
				$visible = $(this);
				return false;
			}
		});

		return $visible;
	}

	return {
		init: function () {
			scope = this;

			init();
		}
	};
}(jQuery));




/* Company info */
var Company = (function ($) {
	var scope,
		swipe,
		$companyContainer,
		$companyHeader,
		$tabs,
		$sliderContainer,
		$tabContents,
		$cpContainer,
		$cpItems,
		init = function () {
			$companyContainer = $('.contents.company');
			$companyHeader = $companyContainer.find('> .company-info');
			$tabs = $companyContainer.find('.tabs');
			$tabItems = $tabs.find('> a');
			$sliderContainer = $companyContainer.find('.slider-container');
			$tabContents = $companyContainer.find('.tab-contents');
			$cpContainer = $companyContainer.find('.scroll .list-checks');
			$cpItems = $cpContainer.find('.item-checks');

			if( $companyContainer.length <= 0 ) return;
			initLayout();
			initEvent();
		};//end init

	function initLayout() {
		$cpItems.height(_calcMaxHeight($cpItems));
	}

	function initEvent() {
		$(window).on('scroll', function(e) {
			if( $('body').hasClass('safari') ) {
				return;
			}

			var scrollTop = $(this).scrollTop() + parseInt(yincLS.getItem("navigationHeight"));
			var headerHeight = $companyHeader.outerHeight();
			
			// console.log('scrollTop : ' + scrollTop + ', headerHeight : ' + headerHeight);
			if( scrollTop > headerHeight ) {
				$tabs.addClass("fixed");
				$tabs.css('top', parseInt(yincLS.getItem("navigationHeight")));
				$tabContents.css('marginTop', $tabs.outerHeight());
			} else {
				$tabs.removeClass("fixed");
				$tabContents.css('marginTop', 0);
			}
		});


		/* tab slider */
		swipe = Swipe($("#swipe").get(0), {
			continuous: true,
			callback: function(index, element) {
				var target = $(element).attr("id");
				swipe.updateHeight();
			},
			transitionEnd: function(index, element) {
				var target = $(element).attr("id");
				_updateTabLabel(index);
			}
		});

		$tabItems.on('click', function(e) {
			e.preventDefault();

			_slideToHash($(this).attr("href"));
		});

		// check point slider
		$cpContainer.slick({
			infinite: false,
			dots: false,
			arrows: false,
			slidesToShow: 1,
			slidesToScroll: 1,
			stopPropagation: true,
			slide: 'li'
		});

		if( window.location.hash ) {
			var hash = window.location.hash;
			_slideToHash(hash);
		} else {
			_slideToHash("#summary");
		}
	}

	function _updateTabLabel(index) {
		$tabItems.attr("data-state", "");
		$tabItems.eq(index).attr("data-state", "selected");
	}

	function _slideToHash(hash) {
		var target = hash.split("#")[1];
		var index = $('.tab-contents').index($('section[id="' + target + '"]'));
		swipe.slide(index, 0);
		_updateTabLabel(index);
	}

	function _calcMaxHeight($elements) {
		return Math.max.apply(null, $elements.map(function (){
			return $(this).height();
		}).get());
	}

	return {
		init: function () {
			scope = this;

			init();
		}
	};
}(jQuery));




/* yinc local storage */
var yincLS = (function ($) {
	var scope,
		yinc,
		storage,
		init = function() {
			yinc = {};
			storage = getStorage(yinc);
		};

	function _setItem(key, value) {
		storage.setItem(key, value);
	}

	function _getItem(key) {
		return storage.getItem(key);
	}

	return {
		init: function () {
			scope = this;

			init();
		},
		setItem: function(key, value) {
			_setItem(key, value);
		},
		getItem: function(key) {
			return _getItem(key);
		}
	};
}(jQuery));


