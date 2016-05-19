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



/* get parameter */
function $_GET(param) {
	var vars = {};
	window.location.href.replace( location.hash, '' ).replace( 
		/[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
		function( m, key, value ) { // callback
			vars[key] = value !== undefined ? value : '';
		}
	);

	if ( param ) {
		return vars[param] ? vars[param] : null;	
	}
	return vars;
}



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



/* native linker */
var NativeLinker = (function ($) {
	var scope,
		$linker,
		_device,
		init = function() {
			$linker = $('[data-navigation]');

			_device = $_GET('device');

			initLayout();
			initEvent();
		};

	function initLayout() {
		// 초기 데이터 요청
		_handleRequestInitInfo();
		_handleRequestCredential();
	}

	function initEvent() {
		$linker.on('click', function(e) {
			e.preventDefault();

			var $linker = $(this);
			var action = $linker.data("navigation");
			var url = $linker.attr("href");
			var title = $linker.data("native-title");

			_handleNavigation(action, url, title);
		});
	}


	function _openBrowser(url) {
		if( _device == "ios" ) {
			window.webkit.messageHandlers.presentModal.postMessage({url: url});
		} else if( _device == "android" ) {
			window.android.presentModal('{url: "' + url +'"}');
		} else {
			window.location.href = url;
		}
	}

	function _presentModal(url, title) {
		if( _device == "ios" ) {
			window.webkit.messageHandlers.presentModal.postMessage({url: url, title: title});
		} else if( _device == "android" ) {
			window.android.presentModal('{url: "' + url +'", title: ' + title + '}');
		} else {
			window.location.href = url;
		}
	}

	function _dismissModal() {
		if( _device == "ios" ) {
			window.webkit.messageHandlers.dismissModal.postMessage();
		} else if( _device == "android" ) {
			window.android.dismissModal();
		}
	}

	function _pushNavigation(url, title) {
		if( _device == "ios" ) {
			window.webkit.messageHandlers.pushNavigation.postMessage({url: url, title: title});
		} else if( _device == "android" ) {
			window.android.pushNavigation('{url: "' + url +'", title: ' + title + '}');
		} else {
			window.location.href = url;
		}
	}

	function _popNavigation() {
		if( _device == "ios" ) {
			window.webkit.messageHandlers.popNavigation.postMessage();
		} else if( _device == "android" ) {
			window.android.popNavigation();
		}
	}


	function _handleNavigation(action, url, title) {
		console.log("action : " + action + ", url : " + url + ", title : " + title);
		switch(action) {
			case "external":
				// 디폴트 브라우져로 이동
				_openBrowser(url);
				break;
			case "modal":
				// present modal view controller
				_presentModal(url, title);
				break;
			case "close":
				_dismissModal();
				break;
			case "pop":
				// pop view controller
				_popNavigation();
				break;
			case "push":
				// push view controller
				_pushNavigation(url, title);
				break;
			default:
				_pushNavigation(url, title);
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
		token = "4773-892c-65f070784f78";
		yincLS.setItem("token", token);

	}

	function _handleRequestInitInfo() {
		if( _device == "ios" ) {
			window.webkit.messageHandlers.requestInitInfo.postMessage({callback: "NativeLinker.reloadWithInitInfo"});
		} else if( _device == "android" ) {
			window.android.requestInitInfo({callback: "NativeLinker.reloadWithInitInfo"}); 
		}
	}

	function _handleReloadWithInitInfo(data) {
		alert(data);
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
		reloadWithInitInfo: function(data) {
			_handleReloadWithInitInfo(data);
		}
	};
}(jQuery));




$(document).ready(function (e) {
	yincLS.init();
	yincLS.setItem("navigationHeight", 44);


	CompanyList.init();
	Company.init();
	NativeLinker.init();
	Invest.init();
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
		$toggleItems,
		$lastToggleItem = null,
		init = function () {
			$companyContainer = $('.contents.company');
			$companyHeader = $companyContainer.find('> .company-info');
			$tabs = $companyContainer.find('.tabs');
			$tabItems = $tabs.find('> a');
			$sliderContainer = $companyContainer.find('.slider-container');
			$tabContents = $companyContainer.find('.tab-contents');
			$cpContainer = $companyContainer.find('.scroll .list-checks');
			$cpItems = $cpContainer.find('.item-checks');

			// communication
			$toggleItems = $companyContainer.find('.list-folding dt');

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


		// communication - toggle
		$toggleItems.on('click', function(e) {
			e.preventDefault();

			if( $(this).is($lastToggleItem) && $(this).hasClass("is-open") ) {
				$(this).removeClass("is-open");
				return;
			}

			if( $lastToggleItem !== null ) {
				$lastToggleItem.removeClass("is-open");
			}

			$(this).addClass('is-open');
			swipe.updateHeight();
			$lastToggleItem = $(this);
		});
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



/* Invest */
var Invest = (function ($) {
	var scope,
		$container,
		$checkAllAgreement,
		$checkEnterprise,
		$checkRelation,
		$btnToggleEnterprise,
		$moreEnterprise,
		init = function() {
			$container = $('.contents.invest');

			$checkAllAgreement = $container.find('#all');
			$checkAgreements = $container.find('input[name=agreement]');

			// 기업 관계자 여부
			$checkEnterprise = $container.find('#enterprise');
			$checkRelation = $container.find('#relation');
			$btnToggleEnterprise = $container.find('.btn-toggle-enterprise');
			$moreEnterprise = $container.find('.more-enterprise');

			initLayout();
			initEvent();
		};

	function initLayout() {
	}

	function initEvent() {
		$checkAllAgreement.on('click', function(e) {
			$checkAgreements.prop("checked", $(this).is(":checked"));
		});

		$checkEnterprise.on('click', function(e) {
			if( $(this).is(":checked") ) {
				_toggleMoreEnterprise(true);
			}

			$checkRelation.prop("checked", $(this).is(":checked"));
		});

		$btnToggleEnterprise.on('click', function(e) {
			_toggleMoreEnterprise(!$(this).hasClass("isOpened"));
		});
	}

	function _toggleMoreEnterprise(isOpen) {
		if( isOpen ) {
			$btnToggleEnterprise.addClass("isOpened");
			$moreEnterprise.show();
		} else {
			$btnToggleEnterprise.removeClass("isOpened");
			$moreEnterprise.hide();
		}
	}

	return {
		init: function () {
			scope = this;

			init();
		}
	};
}(jQuery));


