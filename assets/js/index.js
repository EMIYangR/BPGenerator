(function (window, $) {
	'use strict';

	var DATA_URL = 'assets/json/data.json';
	var COOKIE_DAYS = 7;
	var SELECTOR_TEXT = 'input[type="text"]';

	var GROUPS = [
		{ label: 'Team1Picks:', i18n: 'Team1Picks', prefix: 't1h' },
		{ label: 'Team2Picks:', i18n: 'Team2Picks', prefix: 't2h' },
		{ label: 'Team1Bans:', i18n: 'Team1Bans', prefix: 't1b' },
		{ label: 'Team2Bans:', i18n: 'Team2Bans', prefix: 't2b' }
	];
	var SWAPPED_GROUPS = [GROUPS[1], GROUPS[0], GROUPS[3], GROUPS[2]];

	var state = { heroes: [] };
	var statusTimer = null;

	$(function () {
		var stored = HeroStore.load();

		bindToolbar();
		bindModal();
		bindLanguage();
		restorePreferences();
		renderInputGroups();
		checkToolbox();
		loadHeroes(stored);
	});

	function loadHeroes(stored) {
		$.ajax({ url: DATA_URL, type: 'GET', dataType: 'json' })
			.done(function (remote) {
				applyHeroes(HeroStore.sync(remote));
			})
			.fail(function (xhr, status, error) {
				console.error('英雄数据加载失败：', status, error);
				applyHeroes(stored.heroes || []);
				showStatus(I18n.t('dataLoadFailed', 'Hero data failed to load, please open this page through an HTTP server'), 5000);
			});
	}

	function applyHeroes(heroes) {
		state.heroes = heroes;
		HeroAutocomplete.setData(heroes);
		renderHeroOptions();
		renderInputGroups();
		checkToolbox();
		ShowBanNum();
	}

	function findHero(value) {
		return state.heroes.filter(function (hero) { return hero.value === value; })[0] || null;
	}

	function renderInputGroups() {
		var $container = $('#inputs-container');

		var previous = {};
		$container.find('input').each(function () {
			var $input = $(this);
			previous[this.id] = {
				value: this.value,
				pickedValue: $input.data('pickedValue') || '',
				pickedText: $input.data('pickedText') || ''
			};
		});

		$container.empty();

		(isChangeSide() ? SWAPPED_GROUPS : GROUPS).forEach(function (group, index) {
			var $block = $('<div class="bp-group"></div>').attr('id', 'BPDiv' + (index + 1));
			$('<b class="bp-label"></b>')
				.attr('data-i18n', group.i18n)
				.text(group.label)
				.appendTo($block);

			var $row = $('<div class="bp-row"></div>');
			for (var i = 1; i <= 5; i++) {
				var id = group.prefix + i;
				var old = previous[id] || { value: '', pickedValue: '', pickedText: '' };
				var $input = $('<input type="text" autocomplete="off" class="txtBorder">')
					.attr({ id: id, placeholder: id })
					.val(old.value)
					.appendTo($row);
				if (old.pickedValue) {
					$input.data('pickedValue', old.pickedValue).data('pickedText', old.pickedText);
				}
			}
			$block.append($row).appendTo($container);
			HeroAutocomplete.attach($row.find('input'));
		});

		I18n.apply();
		checkDuplicates();
	}

	function ShowBanNum() {
		var banNum = parseInt($('#ChooseBans').val(), 10) || 5;
		for (var i = 1; i <= 5; i++) {
			$('#t1b' + i + ', #t2b' + i).toggle(i <= banNum);
		}
		checkDuplicates();
	}

	function currentMode() {
		var value = $('input[name="bpMode"]:checked').val();
		if (!value || value === 'standard') { return 'all'; }
		return value;
	}

	function checkToolbox() {
		var mode = currentMode();
		var showPicks = mode !== 'bans';
		var showBans = mode === 'bans' || mode === 'banpicks' || mode === 'all';
		$('#BPDiv1, #BPDiv2').toggle(showPicks);
		$('#BPDiv3, #BPDiv4').toggle(showBans);
		checkDuplicates();
	}

	function bindToolbar() {
		$('#team1side').on('click', function () {
			setSide($('#team1side').val() === 'blue' ? 'red' : 'blue');
		});
		$('#winner').on('click', function () {
			setWinner($('#winner').val() === '1' ? '2' : '1');
		});

		$('#minutes, #seconds')
			.on('input', function () { this.value = this.value.replace(/\D/g, '').slice(0, 2); })
			.on('blur', function () { this.value = OutputBuilder.pad2(this.value); });

		$(document)
			.on('focus', SELECTOR_TEXT, function () { this.select(); })
			.on('mouseup', SELECTOR_TEXT, function (event) {
				if (!$(this).data('selectGuard')) {
					event.preventDefault();
					$(this).data('selectGuard', true);
				}
			})
			.on('blur', SELECTOR_TEXT, function () { $(this).removeData('selectGuard'); });

		$('#ChooseBans').on('change', function () {
			ShowBanNum();
			Cookies.set('banNums', $(this).val(), { expires: COOKIE_DAYS });
		});

		$('.mode-check').on('change', function () {
			Cookies.set('mode', currentMode(), { expires: COOKIE_DAYS });
			checkToolbox();
		});

		$('#isGameInProgress').on('change', function () {
			Cookies.set('isGameInProgress', $(this).prop('checked') ? 'true' : 'false', { expires: COOKIE_DAYS });
		});

		$('#isWithoutSpace').on('change', function () {
			var checked = $(this).prop('checked');
			Cookies.set('isWithoutSpace', checked ? 'true' : 'false', { expires: COOKIE_DAYS });
			HeroAutocomplete.setOptions({ ignoreSpaces: checked });
			checkDuplicates();
		});

		$('#changeSide').on('click', function () {
			swapTeamData();
			setChangeSide(!isChangeSide());
		});

		$('#generateButton').on('click', generateAndCopy);
		$('#inputs-container').on('input', 'input', checkDuplicates);

		$('#clearCookies').on('click', function () {
			document.cookie.split(';').forEach(function (cookie) {
				var name = cookie.split('=')[0].trim();
				if (name) { Cookies.remove(name); }
			});
			location.reload();
		});

		$('#RemoveLocalStorage').on('click', function () {
			var zh = I18n.language() === 'zh';
			var question = zh
				? '此操作将删除所有本地存储的英雄数据，且无法恢复。确定要继续吗？'
				: 'This will delete all locally stored hero data and cannot be undone. Continue?';
			if (!window.confirm(question)) { return; }
			try {
				localStorage.removeItem('HeroData');
			} catch (error) {
				console.error('清空本地存储失败：', error);
				showStatus(I18n.t('storageClearFailed', 'Failed to clear local storage'), 4000);
				return;
			}
			location.reload();
		});
	}

	var LEGACY_MODE = [
		{ cookie: 'isUltimateBattle', mode: 'ultimate' },
		{ cookie: 'isOnlyBans', mode: 'bans' },
		{ cookie: 'isOnlyPicks', mode: 'picks' },
		{ cookie: 'isOnlyBanPicks', mode: 'banpicks' }
	];

	function restoreMode() {
		var saved = Cookies.get('mode');
		if (!saved) {
			saved = LEGACY_MODE.filter(function (item) { return Cookies.get(item.cookie) === 'true'; })
				.map(function (item) { return item.mode; })[0] || 'all';
		}
		$('input[name="bpMode"]').each(function () {
			var mode = this.value === 'standard' ? 'all' : this.value;
			$(this).prop('checked', mode === saved);
		});
	}

	function restorePreferences() {
		var side = Cookies.get('team1side');
		$('#team1side').val(side === 'red' ? 'red' : 'blue');
		$('#winner').val(Cookies.get('winner') === '2' ? '2' : '1');
		if (Cookies.get('banNums')) { $('#ChooseBans').val(Cookies.get('banNums')); }

		setChangeSide(Cookies.get('isChangeSide') === 'true');
		restoreMode();
		['isGameInProgress', 'isWithoutSpace'].forEach(function (id) {
			if (Cookies.get(id) !== undefined) {
				$('#' + id).prop('checked', Cookies.get(id) === 'true');
			}
		});
		HeroAutocomplete.setOptions({ ignoreSpaces: withoutSpace() });

		updateSideButton();
		updateWinnerButton();
	}

	function setSide(value) {
		$('#team1side').val(value);
		updateSideButton();
		Cookies.set('team1side', value, { expires: COOKIE_DAYS });
	}

	function updateSideButton() {
		var side = $('#team1side').val() === 'red' ? 'red' : 'blue';
		var key = side === 'blue' ? 'Blue' : 'Red';
		$('#team1side').attr('data-side', side).text(I18n.t(key, key));
	}

	function setWinner(value) {
		$('#winner').val(value);
		updateWinnerButton();
		Cookies.set('winner', value, { expires: COOKIE_DAYS });
	}

	function updateWinnerButton() {
		var key = $('#winner').val() === '2' ? 'Team2' : 'Team1';
		$('#winner').text(I18n.t(key, key));
	}

	function swapTeamData() {
		['h', 'b'].forEach(function (kind) {
			for (var i = 1; i <= 5; i++) {
				swapInputPair($('#t1' + kind + i), $('#t2' + kind + i));
			}
		});
		checkDuplicates();
	}

	function swapInputPair($a, $b) {
		if (!$a.length || !$b.length) { return; }

		var valueA = $a.val();
		var pickedValueA = $a.data('pickedValue') || '';
		var pickedTextA = $a.data('pickedText') || '';
		var valueB = $b.val();
		var pickedValueB = $b.data('pickedValue') || '';
		var pickedTextB = $b.data('pickedText') || '';

		$a.val(valueB).removeData('pickedValue').removeData('pickedText');
		$b.val(valueA).removeData('pickedValue').removeData('pickedText');
		if (pickedValueB) { $a.data('pickedValue', pickedValueB).data('pickedText', pickedTextB); }
		if (pickedValueA) { $b.data('pickedValue', pickedValueA).data('pickedText', pickedTextA); }
	}

	function isChangeSide() {
		return $('#changeSide').attr('data-swapped') === 'true';
	}

	function withoutSpace() {
		return $('#isWithoutSpace').prop('checked');
	}

	function setChangeSide(swapped) {
		swapped = !!swapped;
		$('#changeSide').attr('data-swapped', swapped ? 'true' : 'false');

		if (swapped && $('#team1side').val() === 'blue') { setSide('red'); }
		if (!swapped && $('#team1side').val() === 'red') { setSide('blue'); }

		Cookies.set('isChangeSide', swapped ? 'true' : 'false', { expires: COOKIE_DAYS });
		renderInputGroups();
		checkToolbox();
		ShowBanNum();
	}

	function updateChangeSideButton() {
		$('#changeSide').text(I18n.t('ChangeSide', 'Change Side?'));
	}

	function bindLanguage() {
		$('#switchToEnglish').on('click', function () {
			Cookies.set('lang', 'en', { expires: COOKIE_DAYS });
			applyLanguage('en');
		});
		$('#switchToChinese').on('click', function () {
			Cookies.set('lang', 'zh', { expires: COOKIE_DAYS });
			applyLanguage('zh');
		});

		applyLanguage(Cookies.get('lang') === 'zh' ? 'zh' : 'en');
	}

	function applyLanguage(language) {
		var afterLoad = function () {
			var current = I18n.language();
			document.documentElement.lang = current === 'zh' ? 'zh-CN' : 'en';
			$('body').toggleClass('lang-zh', current === 'zh');
			$('#switchToEnglish').toggle(current === 'zh');
			$('#switchToChinese').toggle(current !== 'zh');
			updateSideButton();
			updateWinnerButton();
			updateChangeSideButton();
			checkDuplicates();
		};
		I18n.load(language).then(afterLoad, afterLoad);
	}

	function readPick(inputId) {
		var $input = $('#' + inputId);
		var raw = String($input.val() || '').trim();
		var pickedValue = $input.data('pickedValue');
		var pickedText = $input.data('pickedText');
		var result;

		if (raw === '') {
			result = { value: '', status: 'empty' };
		} else if (pickedValue && raw === pickedText) {
			result = { value: pickedValue, status: 'picked' };
		} else {
			result = HeroStore.resolve(state.heroes, raw, { ignoreSpaces: withoutSpace() });
		}

		$input.removeClass('is-invalid is-ambiguous').removeAttr('title');
		if (result.status === 'none') {
			$input.addClass('is-invalid').attr('title', I18n.t('heroNotMatched', 'No matching hero'));
		} else if (result.status === 'ambiguous') {
			$input.addClass('is-ambiguous').attr('title', I18n.t('heroAmbiguous', 'Multiple matches, pick one from the list'));
		}
		return result.value;
	}

	function readPickList(prefix) {
		return [1, 2, 3, 4, 5].map(function (index) { return readPick(prefix + index); });
	}

	function activeHeroInputs() {
		var mode = currentMode();
		var showPicks = mode !== 'bans';
		var showBans = mode === 'bans' || mode === 'banpicks' || mode === 'all';
		var banNum = parseInt($('#ChooseBans').val(), 10) || 5;
		var inputs = [];

		[['t1h', 5], ['t2h', 5], ['t1b', banNum], ['t2b', banNum]].forEach(function (group) {
			var prefix = group[0];
			var limit = group[1];
			var isBan = prefix.charAt(2) === 'b';
			if (isBan ? !showBans : !showPicks) { return; }

			for (var i = 1; i <= limit; i++) {
				var $input = $('#' + prefix + i);
				if ($input.length) { inputs.push($input); }
			}
		});

		return inputs;
	}

	function heroKey($input) {
		var raw = String($input.val() || '').trim();
		if (raw === '') { return ''; }

		var ignoreSpaces = withoutSpace();
		var pickedValue = $input.data('pickedValue');
		var pickedText = $input.data('pickedText');
		var value = (pickedValue && raw === pickedText)
			? pickedValue
			: HeroStore.resolve(state.heroes, raw, { ignoreSpaces: ignoreSpaces }).value;

		return value || 'text:' + HeroStore.normalizeText(raw, ignoreSpaces);
	}

	function heroLabel(key, $input) {
		if (key.indexOf('text:') === 0) { return String($input.val() || '').trim(); }
		var hero = findHero(key);
		return hero ? hero.text : String($input.val() || '').trim();
	}

	function checkDuplicates() {
		var groups = {};
		var order = [];

		activeHeroInputs().forEach(function ($input) {
			$input.removeClass('is-duplicate');
			var key = heroKey($input);
			if (key === '') { return; }
			if (!groups[key]) {
				groups[key] = { label: heroLabel(key, $input), inputs: [] };
				order.push(key);
			}
			groups[key].inputs.push($input);
		});

		var repeated = [];
		order.forEach(function (key) {
			var group = groups[key];
			if (group.inputs.length < 2) { return; }
			group.inputs.forEach(function ($input) { $input.addClass('is-duplicate'); });
			repeated.push(group.label + ' ×' + group.inputs.length);
		});

		var $hint = $('#duplicateHint');
		if (repeated.length === 0) {
			$hint.text('').prop('hidden', true);
			return;
		}
		$hint
			.text(I18n.t('duplicateHint', 'Duplicate entries:') + ' ' + repeated.join(' / '))
			.prop('hidden', false);
	}

	function generateAndCopy() {
		var text = OutputBuilder.build({
			team1side: $('#team1side').val(),
			minutes: $('#minutes').val(),
			seconds: $('#seconds').val(),
			winner: $('#winner').val(),
			banNums: $('#ChooseBans').val(),
			gameInProgress: $('#isGameInProgress').prop('checked'),
			mode: currentMode(),
			picks: {
				t1h: readPickList('t1h'),
				t2h: readPickList('t2h'),
				t1b: readPickList('t1b'),
				t2b: readPickList('t2b')
			}
		});

		copyText(text);
	}

	function copyText(text) {
		if (!text) { return; }

		var onCopied = function () { showStatus(I18n.t('copied', 'Copied to clipboard')); };
		var onFailed = function () { showStatus(I18n.t('copyFailed', 'Copy failed, select the text below')); };

		if (navigator.clipboard && navigator.clipboard.writeText) {
			navigator.clipboard.writeText(text).then(onCopied).catch(function () {
				legacyCopy(text) ? onCopied() : onFailed();
			});
			return;
		}
		legacyCopy(text) ? onCopied() : onFailed();
	}

	function legacyCopy(text) {
		var $area = $('<textarea></textarea>')
			.val(text)
			.css({ position: 'fixed', top: '-1000px', left: '-1000px' })
			.appendTo('body');
		$area[0].select();
		var ok = false;
		try { ok = document.execCommand('copy'); } catch (error) { ok = false; }
		$area.remove();
		return ok;
	}

	function showStatus(message, duration) {
		if (statusTimer) { clearTimeout(statusTimer); }
		var $status = $('#actionStatus').text(message);
		statusTimer = setTimeout(function () { $status.text(''); }, duration || 2000);
	}

	function bindModal() {
		$('#SearchHeroAlias').on('click', function () {
			$('#HeroNamesSelect').prop('selectedIndex', 0);
			$('#showHeroAlies').val('');
			$('#Modal').addClass('is-open');
		});
		$('#Modal .close').on('click', closeModal);
		$('#Modal').on('click', function (event) {
			if (event.target === this) { closeModal(); }
		});
		$(document).on('keydown', function (event) {
			if (event.key === 'Escape' && $('#Modal').hasClass('is-open')) { closeModal(); }
		});

		$('input[name="mode"]').on('change', function () {
			var isSearch = $(this).val() === 'search';
			$('#Search').toggle(isSearch);
			$('#Add').toggle(!isSearch);
		});

		$('#HeroNamesSelect').on('change', function () {
			var hero = findHero($(this).val());
			if (!hero) { $('#showHeroAlies').val(''); return; }
			var alias = Array.isArray(hero.alias)
				? hero.alias.slice().sort(function (a, b) { return String(a).localeCompare(String(b)); })
				: String(hero.alias || '');
			$('#showHeroAlies').val(Array.isArray(alias) ? alias.join('\n') : alias);
			resizeAliasBox();
		});

		$('#updateAliasButton').on('click', function () {
			var hero = findHero($('#HeroNamesSelect').val());
			if (!hero) { console.warn('未找到选中的英雄。'); return; }
			hero.alias = $('#showHeroAlies').val().split('\n')
				.map(function (alias) { return alias.trim(); })
				.filter(Boolean);
			HeroStore.save(state.heroes);
			HeroAutocomplete.setData(state.heroes);
			resizeAliasBox();
		});

		$('#DeleteHeroButton').on('click', function () {
			var value = $('#HeroNamesSelect').val();
			var index = -1;
			state.heroes.forEach(function (hero, position) {
				if (index === -1 && hero.value === value) { index = position; }
			});
			if (index === -1) { return; }
			state.heroes.splice(index, 1);
			HeroStore.save(state.heroes);
			HeroAutocomplete.setData(state.heroes);
			$('#HeroNamesSelect option').filter(function () { return this.value === value; }).remove();
			$('#showHeroAlies').val('');
		});

		$('#insertAliasButton').on('click', insertHero);
	}

	function closeModal() {
		$('#Modal').removeClass('is-open');
	}

	function resizeAliasBox() {
		var $box = $('#showHeroAlies');
		$box.height(0).height($box[0].scrollHeight);
	}

	function insertHero() {
		var $name = $('#newHeroName');
		var $value = $('#newHeroValue');
		var name = String($name.val() || '').trim();
		var value = String($value.val() || '').trim();

		$name.add($value).removeClass('is-invalid');
		if (name === '') { $name.addClass('is-invalid'); }
		if (value === '') { $value.addClass('is-invalid'); }
		if (name === '' || value === '') { return; }

		var hero = {
			value: value,
			text: name,
			alias: String($('#newHeroAlias').val() || '').split('\n')
				.map(function (alias) { return alias.trim(); })
				.filter(Boolean)
		};

		state.heroes.push(hero);
		HeroStore.save(state.heroes);
		HeroAutocomplete.setData(state.heroes);

		$('#HeroNamesSelect').append($('<option></option>').val(hero.value).text(hero.text));
		sortHeroOptions();
		$('#HeroNamesSelect').val(hero.value).trigger('change');

		$('#newHeroName').val('');
		$('#newHeroValue').val('');
		$('#newHeroAlias').val('');
	}

	function sortHeroOptions() {
		var $select = $('#HeroNamesSelect');
		var sorted = $select.find('option').slice(1).get().sort(function (a, b) {
			return $(a).text().localeCompare($(b).text());
		});
		$select.append(sorted);
	}

	function renderHeroOptions() {
		var $select = $('#HeroNamesSelect');
		$select.find('option').slice(1).remove();
		state.heroes
			.filter(function (hero) { return hero.value !== '' && hero.value !== 'none'; })
			.slice()
			.sort(function (a, b) { return String(a.text).localeCompare(String(b.text)); })
			.forEach(function (hero) {
				$('<option></option>').val(hero.value).text(hero.text).appendTo($select);
			});
	}
})(window, jQuery);
