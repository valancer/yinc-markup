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
yincLS.init();



/* native linker */
var NativeLinker = (function ($) {
	var scope,
		$linker,
		_device,
		init = function() {
			$linker = $('[data-navigation]');
			_device = $_GET('device');
			yincLS.setItem("device", _device);

			initLayout();
			initEvent();
		};

	function _reinit() {
		$linker = $('[data-navigation]');
		_device = $_GET('device');
		yincLS.setItem("device", _device);

		initEvent();
	}

	function initLayout() {
		// 초기 데이터 요청
		_handleRequestInitInfo();
		// _handleRequestCredential();
	}

	function initEvent() {
//		if( !_device ) alert("device 값이 설정되지 않았습니다. 네이티브에서 확인 부탁드립니다.");

		$linker.off('click').on('click', function(e) {
			e.preventDefault();

			var action = $(this).data("navigation");
			var url = $(this).attr("href");
			var title = $(this).data("native-title");
			var barType = $(this).data("bar-type");

			_handleNavigation(action, url, title, barType);
		});
	}

	function _openBrowser(url) {
		if( _device == "ios" ) {
			window.webkit.messageHandlers.presentModal.postMessage({url: url});
		} else if( _device == "android" ) {
			window.android.presentModal('{url: "' + url + '"}');
		} else {
			window.location.href = url;
		}
	}

	function _presentModal(url, title, barType) {
		if( _device == "ios" ) {
			window.webkit.messageHandlers.presentModal.postMessage({url: url, title: title, barType: barType});
		} else if( _device == "android" ) {
			window.android.presentModal('{url: "' + url + '", title: "' + title + '", barType: "' + barType + '"}');
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

	function _pushNavigation(url, title, barType) {
		if( _device == "ios" ) {
			window.webkit.messageHandlers.pushNavigation.postMessage({url: url, title: title, barType: barType});
		} else if( _device == "android" ) {
			window.android.pushNavigation('{url: "' + url + '", title: "' + title + '", barType: "' + barType + '"}');
		} else {
			window.location.href = url;
		}
	}

	function _popNavigation() {
		if( _device == "ios" ) {
			window.webkit.messageHandlers.popNavigation.postMessage();
		} else if( _device == "android" ) {
			window.android.popNavigation();
		} else {
			// alert("popnavigation");
		}
	}


	function _handleNavigation(action, url, title, barType) {
		if( barType === undefined ) barType = 0;

		if( url.indexOf("https://") < 0 ) {
			url = "http://" + window.location.host + url;
		}

		switch(action) {
			case "external":
				// 디폴트 브라우져로 이동
				_openBrowser(url);
				break;
			case "modal":
				// present modal view controller
				_presentModal(url, title, barType);
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
				_pushNavigation(url, title, barType);
				break;
			default:
				_pushNavigation(url, title, barType);
		}
	}


	// token request
	function _handleRequestCredential() {
		if( _device == "ios" ) {
			window.webkit.messageHandlers.requestCredential.postMessage({callback: "NativeLinker.reloadWithCredential"});
		} else if( _device == "android" ) {
			window.android.requestCredential('{callback: "NativeLinker.reloadWithCredential"}');
		} else {
			// temp
			// yincLS.setItem("userId", 1);
		}
	}

	// token response
	function _handleReloadWithCredential(data) {
		yincLS.setItem("token", data.token);
		yincLS.setItem("userId", data.userId);
	}

	function _handleRequestInitInfo() {
		if( _device == "ios" ) {
			window.webkit.messageHandlers.requestInitInfo.postMessage({callback: "NativeLinker.reloadWithInitInfo"});
		} else if( _device == "android" ) {
			window.android.requestInitInfo('{callback: "NativeLinker.reloadWithInitInfo"}');
		} else {
			$.ajax({
				url:"http://182.162.100.61:8070/api/mobile/auth/login?IsPersistent=true&email=1price@limited40.com&password=111qqq!",
				// url:"http://amp.limited40.com:8060/api/mobile/auth/login?IsPersistent=true&email=1price@limited40.com&password=111qqq!",
				type:"POST",
				// async: false,
				dataType: 'json',
				timeout:5000,
				cache: false,
				success: function(result, status, xhr){
					console.log(result);
					_handleReloadWithCredential(result);
				}.bind(this),
					error: function(xhr, status, err) {
					alert('데이터를 로드할 수 없습니다.' + status +': '+ err);
				}.bind(this)
			});
		}
	}

	function _handleReloadWithInitInfo(data) {
		yincLS.setItem("token", data.token);
		yincLS.setItem("userId", data.userId);
		yincLS.setItem("navigationHeight", data.navHeight);
		yincLS.setItem("appVersion", data.appVersion);
		
		// $('#logging').append("<p>" + data + "</p>");
	}

	return {
		init: function () {
			scope = this;

			init();
		},
		reinit: function() {
			_reinit();
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
		},
		popNavigation: function() {
			_popNavigation();
		}
	};
}(jQuery));
NativeLinker.init();



/* native Popup */
var NativePopup = (function ($) {
	var scope,
		_device,
		init = function() {
			_device = $_GET('device');
		};

	function _open(title, content) {
		if( _device == "ios" ) {
			window.webkit.messageHandlers.showAlert.postMessage({title: title, content: content});
		} else if( _device == "android" ) {
			window.android.showAlert('{title: ' + title + ', content: ' + content + '}');
		} else {
			window.alert(title + " : " + content);
		}
	}

	return {
		init: function () {
			scope = this;

			init();
		},
		open: function(title, content) {
			_open(title, content);
		}
	};
}(jQuery));
NativePopup.init();



$(document).ready(function (e) {
	CompanyList.init();
	Company.init();

	Invest.init();
	NativeLinker.reinit();
	CS.init();

	// set body background color
	$('body').addClass($('article.contents').data("bg"));
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
		},
		reinit: function() {
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
			$toggleItems = $companyContainer.find('.list-folding dt > a');

			if( $companyContainer.length <= 0 ) return;
			
			initLayout();
			initEvent();
		};//end init

	function initLayout() {
		$cpItems.height(_calcMaxHeight($cpItems));
	}

	function initEvent() {
		$(window).on('scroll', function(e) {
			var device = yincLS.getItem("device");
			var scrollTop = $(this).scrollTop() + parseInt(yincLS.getItem("navigationHeight"));
			var headerHeight = $companyHeader.outerHeight();
			
			// console.log('scrollTop : ' + scrollTop + ', headerHeight : ' + headerHeight);
			if( scrollTop > headerHeight ) {
				if( device == "android" ) {
					$tabs.addClass("fixed");
					$tabs.css('top', parseInt(yincLS.getItem("navigationHeight")));
					$tabContents.css('marginTop', $tabs.outerHeight());
					window.android.setTitleVisible('{visible: "true"}');
				}

				if( device == "ios" ) {
					$tabs.css('top', parseInt(yincLS.getItem("navigationHeight")));
				}
			} else {
				if( device == "android" ) {
					$tabs.removeClass("fixed");
					$tabContents.css('marginTop', 0);
					window.android.setTitleVisible('{visible: "false"}');
				}
				if( device == "ios" ) {
					$tabs.css('top', 0);
				}
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
			}
		});

		$tabItems.on('click', function(e) {
			e.preventDefault();

			_slideToHash($(this).attr("href"));
		});

		// check point slider
		if( $cpContainer.length > 0 ) {
			$cpContainer.slick({
				infinite: false,
				dots: false,
				arrows: false,
				slidesToShow: 1,
				slidesToScroll: 1,
				stopPropagation: true,
				slide: 'li'
			});
		}

		if( window.location.hash ) {
			var hash = window.location.hash;
			_slideToHash(hash);
		} else {
			_slideToIndex(0);
		}


		// communication - toggle
		$toggleItems.on('click', function(e) {
			e.preventDefault();
			e.stopPropagation();

			var $this = $(this).closest('dt');
			if( $this.is($lastToggleItem) && $this.hasClass("is-open") ) {
				$this.removeClass("is-open");
				return;
			}

			if( $lastToggleItem !== null ) {
				$lastToggleItem.removeClass("is-open");
			}

			$this.addClass('is-open');
			swipe.updateHeight();
			$lastToggleItem = $this;
		});
	}

	function _updateTabLabel(index) {
		$tabItems.attr("data-state", "");
		$tabItems.eq(index).attr("data-state", "selected");
	}

	function _slideToHash(hash) {
		var target = hash.split("#")[1];
		var index = $('.tab-contents').index($('section[id="' + target + '"]'));

		if( swipe === undefined ) return;
		swipe.slide(index, 0);
		_updateTabLabel(index);
	}

	function _slideToIndex(index) {
		if( swipe === undefined ) return;
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
		},
		reinit: function() {
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



/* Company info */
var CS = (function ($) {
	var scope,
		$csContainer,
		$tabs,
		swipe,
		$toggleItems,
		$lastToggleItem = null,
		init = function () {
			$csContainer = $('.contents.cs');
			$tabs = $csContainer.find('.tabs');
			$tabItems = $tabs.find('a');
			$sliderContainer = $csContainer.find('.slider-container');
			$tabContents = $csContainer.find('.tab-contents');

			// communication
			$toggleItems = $csContainer.find('.list-folding dt > a');

			if( $csContainer.length <= 0 ) return;
			
			initLayout();
			initEvent();
		};//end init

	function initLayout() {
	}

	function initEvent() {
		/* tab slider */
		if( swipe === undefined ) {
			swipe = Swipe($("#swipe").get(0), {
				continuous: false,
				callback: function(index, element) {
					var target = $(element).attr("id");
					swipe.updateHeight();
				},
				transitionEnd: function(index, element) {
					var target = $(element).attr("id");
				}
			});
		}

		$tabItems.off('click').on('click', function(e) {
			if( swipe === undefined ) return;
			e.preventDefault();

			_slideToHash($(this).attr("href"));
		});


		// communication - toggle
		$toggleItems.off('click').on('click', function(e) {
			e.preventDefault();
			e.stopPropagation();

			var $this = $(this).closest('dt');
			if( $this.is($lastToggleItem) && $this.hasClass("is-open") ) {
				$this.removeClass("is-open");
				return;
			}

			if( $lastToggleItem !== null ) {
				$lastToggleItem.removeClass("is-open");
			}

			$this.addClass('is-open');
			if( swipe !== undefined ) swipe.updateHeight();
			$lastToggleItem = $this;
		});


		if( window.location.hash ) {
			var hash = window.location.hash;
			_slideToHash(hash);
		} else {
			_slideToIndex(0);
		}
	}

	function _updateTabLabel(index) {
		$tabItems.attr("data-state", "");
		$tabItems.eq(index).attr("data-state", "selected");

		if( $tabs.hasClass("fixed") ) {
			var $this = $tabItems.eq(index);
			var offsetX = $this.offset().left - $tabs.offset().left;
			if( !$tabItems.eq(index).visible(false, false, 'horizontal') ) {
				$tabs.animate({scrollLeft: offsetX}, 300);
			}
		}
	}

	function _slideToHash(hash) {
		var target = hash.split("#")[1];
		var index = $('.tab-contents').index($('section[id="' + target + '"]'));

		if( swipe === undefined ) return;
		swipe.slide(index, 0);
		_updateTabLabel(index);
	}

	function _slideToIndex(index) {
		if( swipe === undefined ) return;
		swipe.slide(index, 0);
		_updateTabLabel(index);
	}

	return {
		init: function () {
			scope = this;

			init();
		},
		reinit: function() {
			init();
		}
	};
}(jQuery));

