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



var navigationHeight = 44;
$(document).ready(function (e) {
	Company.init();
});


/* Company */
var Company = (function ($) {
	var scope,
		$companyContainer,
		$companyHeader,
		$tabs,
		$tabContents,
		init = function () {
			$companyContainer = $('.contents.company');
			$companyHeader = $companyContainer.find('> .company-info');
			$tabs = $companyContainer.find('.tabs');
			$tabContents = $companyContainer.find('.tab-contents');

			initLayout();
			initEvent();
		};//end init

	function initLayout() {
	}

	function initEvent() {
		$(window).on('scroll', function(e) { 
			if( $('body').hasClass('safari') ) {
				console.log('safari');
				return;
			}

			var scrollTop = $(this).scrollTop() + navigationHeight;
			var headerHeight = $companyHeader.outerHeight();
			
			console.log('scrollTop : ' + scrollTop + ', headerHeight : ' + headerHeight);
			if( scrollTop >= headerHeight ) {
				$tabs.addClass("fixed");
				$tabContents.css('marginTop', navigationHeight);
			} else {
				$tabs.removeClass("fixed");
				$tabContents.css('marginTop', 0);
			}
		});
	}

	return {
		init: function () {
			scope = this;

			init();
		}
	};
}(jQuery));





