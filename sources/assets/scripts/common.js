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



var navigationHeight = 0;
$(document).ready(function (e) {
	Company.init();
	CompanyList.init();
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
		$companyContainer,
		$companyHeader,
		$tabs,
		$sliderContainer,
		$tabContents,
		$checkpoint,
		init = function () {
			$companyContainer = $('.contents.company');
			$companyHeader = $companyContainer.find('> .company-info');
			$tabs = $companyContainer.find('.tabs');
			$tabItems = $tabs.find('> a');
			$sliderContainer = $companyContainer.find('.slider-container');
			$tabContents = $companyContainer.find('.tab-contents');
			$checkpoint = $companyContainer.find('.list-checks .item-checks');

			initLayout();
			initEvent();
		};//end init

	function initLayout() {
		$checkpoint.height(_calcMaxHeight($checkpoint));
	}

	function initEvent() {
		$(window).on('scroll', function(e) {
			if( $('body').hasClass('safari') ) {
				return;
			}

			var scrollTop = $(this).scrollTop() + navigationHeight;
			var headerHeight = $companyHeader.outerHeight();
			
			console.log('scrollTop : ' + scrollTop + ', headerHeight : ' + headerHeight);
			if( scrollTop > headerHeight ) {
				$tabs.addClass("fixed");
				$tabContents.css('marginTop', $tabs.outerHeight());
			} else {
				$tabs.removeClass("fixed");
				$tabContents.css('marginTop', 0);
			}
		});


		/* tab slider */
		$tabItems.on('click', function(e) {
			e.preventDefault();

			var target = parseInt($(this).attr("href").split("#")[1]);
			$sliderContainer.slick("slickPause");
			$sliderContainer.slick("slickGoTo", target);

		});

		$sliderContainer.on('afterChange', function(event, slick, currentSlide){
			$tabItems.attr("data-state", "");
			$tabItems.eq(currentSlide).attr("data-state", "selected");
		});

		$sliderContainer.slick({
			infinite: true,
			dots: false,
			arrows: false,
			adaptiveHeight: true,
			slidesToShow: 1,
			slidesToScroll: 1,
			slide: '.tab-contents'
		});
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





