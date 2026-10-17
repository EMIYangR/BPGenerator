window.I18n = (function ($) {
	'use strict';

	var URL = 'assets/json/lang.json';
	var dictionary = {};
	var current = 'en';

	function apply() {
		$('[data-i18n]').each(function () {
			var $node = $(this);
			var key = $node.attr('data-i18n');
			var value = dictionary[key];
			if (typeof value === 'string' && value.length > 0) {
				$node.html(value);
			}
		});
	}

	function load(language) {
		current = language === 'zh' ? 'zh' : 'en';
		return $.getJSON(URL).then(function (bundle) {
			dictionary = bundle[current] || {};
			apply();
			$(document).trigger('i18n:applied', [current]);
			return dictionary;
		});
	}

	function t(key, fallback) {
		var value = dictionary[key];
		return (typeof value === 'string' && value.length > 0) ? value : (fallback || '');
	}

	function language() { return current; }

	return { load: load, apply: apply, t: t, language: language };
})(jQuery);
