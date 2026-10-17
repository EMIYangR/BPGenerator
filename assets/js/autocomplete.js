window.HeroAutocomplete = (function ($) {
	'use strict';

	var MAX_ITEMS = 30;
	var heroes = [];
	var $box = null;
	var $activeInput = null;
	var items = [];
	var activeIndex = -1;
	var closeTimer = null;

	function normalize(value) {
		if (value === undefined || value === null) { return ''; }
		return String(value).trim().replace(/\s+/g, ' ').toLowerCase();
	}

	function aliasList(hero) {
		if (Array.isArray(hero.alias)) { return hero.alias; }
		if (typeof hero.alias === 'string' && hero.alias.trim() !== '') { return [hero.alias]; }
		return [];
	}

	function isUsable(hero) {
		return hero && hero.value !== '' && hero.value !== 'none' && typeof hero.text === 'string';
	}

	function setData(list) {
		heroes = Array.isArray(list) ? list : [];
	}

	function attach($inputs) {
		$inputs.off('.heroAutocomplete')
			.on('input.heroAutocomplete', onInput)
			.on('keydown.heroAutocomplete', onKeydown)
			.on('blur.heroAutocomplete', function () {
				closeTimer = setTimeout(close, 120);
			});
	}

	function onInput() {
		var $input = $(this);
		var keyword = normalize($input.val());

		$input.removeData('pickedValue').removeData('pickedText');

		if (keyword === '') { close(); return; }

		var seen = {};
		var matched = [];
		heroes.forEach(function (hero) {
			if (!isUsable(hero) || seen[hero.value]) { return; }
			var text = normalize(hero.text);
			var hit = text.indexOf(keyword) !== -1 || aliasList(hero).some(function (alias) {
				return normalize(alias).indexOf(keyword) !== -1;
			});
			if (!hit) { return; }
			seen[hero.value] = true;
			matched.push(hero);
		});

		matched.sort(function (a, b) {
			var aStarts = normalize(a.text).indexOf(keyword) === 0 ? 0 : 1;
			var bStarts = normalize(b.text).indexOf(keyword) === 0 ? 0 : 1;
			if (aStarts !== bStarts) { return aStarts - bStarts; }
			return a.text.localeCompare(b.text);
		});

		render($input, matched.slice(0, MAX_ITEMS));
	}

	function render($input, list) {
		close();
		$activeInput = $input;
		items = list;
		activeIndex = -1;
		if (list.length === 0) { return; }

		$box = $('<div class="autocomplete-suggestions" role="listbox"></div>');
		list.forEach(function (hero, index) {
			$('<div class="suggestion-item" role="option"></div>')
				.text(hero.text)
				.on('mousedown', function (event) {
					event.preventDefault();
					choose(index);
				})
				.on('mouseenter', function () { highlight(index); })
				.appendTo($box);
		});

		$input.after($box);

		var rect = $input[0].getBoundingClientRect();
		$box.css({
			left: (rect.left + window.pageXOffset) + 'px',
			top: (rect.top + rect.height + window.pageYOffset) + 'px',
			width: rect.width + 'px'
		});
	}

	function highlight(index) {
		if (!$box) { return; }
		activeIndex = index;
		$box.find('.suggestion-item').removeClass('highlighted').eq(index).addClass('highlighted');
		scrollIntoView();
	}

	function scrollIntoView() {
		if (!$box) { return; }
		var $item = $box.find('.suggestion-item').eq(activeIndex);
		if (!$item.length) { return; }
		var itemTop = $item[0].offsetTop;
		var itemBottom = itemTop + $item.outerHeight();
		var viewTop = $box.scrollTop();
		var viewBottom = viewTop + $box.height();
		if (itemTop < viewTop) { $box.scrollTop(itemTop); }
		if (itemBottom > viewBottom) { $box.scrollTop(itemBottom - $box.height()); }
	}

	function choose(index) {
		var hero = items[index];
		if (!hero || !$activeInput) { return; }
		$activeInput
			.val(hero.text)
			.data('pickedValue', hero.value)
			.data('pickedText', hero.text)
			.removeClass('is-invalid is-ambiguous')
			.removeAttr('title');
		close();
	}

	function onKeydown(event) {
		if (!$box) { return; }
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			highlight(items.length === 0 ? -1 : (activeIndex + 1) % items.length);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			highlight(activeIndex <= 0 ? items.length - 1 : activeIndex - 1);
		} else if (event.key === 'Enter') {
			if (activeIndex >= 0) {
				event.preventDefault();
				choose(activeIndex);
			} else {
				close();
			}
		} else if (event.key === 'Escape' || event.key === 'Tab') {
			close();
		}
	}

	function close() {
		if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
		if ($box) { $box.remove(); $box = null; }
		items = [];
		activeIndex = -1;
		$activeInput = null;
	}

	$(document).on('click', function (event) {
		if (!$box) { return; }
		if ($(event.target).closest('.autocomplete-suggestions').length) { return; }
		if ($activeInput && event.target === $activeInput[0]) { return; }
		close();
	});

	$(window).on('resize', close);

	return { setData: setData, attach: attach, close: close };
})(jQuery);
