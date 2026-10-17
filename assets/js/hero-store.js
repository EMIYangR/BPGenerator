window.HeroStore = (function (global) {
	'use strict';

	var STORAGE_KEY = 'HeroData';
	var STORAGE_VERSION = 2;
	var EMPTY_BASE = { values: {}, texts: {} };

	var base = { values: {}, texts: {} };

	function normalizeText(value) {
		if (value === undefined || value === null) { return ''; }
		return String(value).trim().replace(/\s+/g, ' ').toLowerCase();
	}

	function isPlaceholder(item) {
		return !item || item.value === '' || item.value === 'none';
	}

	function toAliasList(alias) {
		if (Array.isArray(alias)) {
			return alias.filter(function (item) { return typeof item === 'string' && item.trim() !== ''; });
		}
		if (typeof alias === 'string' && alias.trim() !== '') { return [alias]; }
		return [];
	}

	function unionAlias(remoteAlias, localAlias) {
		var seen = {};
		var merged = [];
		toAliasList(remoteAlias).concat(toAliasList(localAlias)).forEach(function (alias) {
			var key = alias.toLowerCase();
			if (seen[key]) { return; }
			seen[key] = true;
			merged.push(alias);
		});
		return merged.length > 0 ? merged : remoteAlias;
	}

	function parseStored(raw) {
		if (!raw) { return { heroes: [], base: null }; }
		var parsed;
		try {
			parsed = JSON.parse(raw);
		} catch (error) {
			console.error('HeroStore: localStorage 数据无法解析，已忽略。', error);
			return { heroes: [], base: null };
		}
		if (Array.isArray(parsed)) { return { heroes: parsed, base: null }; }
		return {
			heroes: Array.isArray(parsed.heroes) ? parsed.heroes : [],
			base: parsed.base && typeof parsed.base === 'object' ? parsed.base : null
		};
	}

	function buildBase(items) {
		var values = {};
		var texts = {};
		(items || []).forEach(function (item) {
			if (isPlaceholder(item)) { return; }
			values[item.value] = true;
			texts[normalizeText(item.text)] = true;
		});
		return { values: values, texts: texts };
	}

	function hasBase(item) {
		if (isPlaceholder(item)) { return false; }
		return !!((base.values || {})[item.value] || (base.texts || {})[normalizeText(item.text)]);
	}

	function isSameHero(itemA, itemB) {
		if (isPlaceholder(itemA) || isPlaceholder(itemB)) { return false; }
		if (itemA.value === itemB.value) { return true; }
		var keyA = normalizeText(itemA.text);
		return keyA !== '' && keyA === normalizeText(itemB.text);
	}

	function merge(remoteData, localData) {
		var remoteList = Array.isArray(remoteData) ? remoteData : [];
		if (!Array.isArray(localData) || localData.length === 0) { return remoteList; }

		var matchedLocal = {};
		var merged = [];

		remoteList.forEach(function (remoteItem) {
			if (isPlaceholder(remoteItem)) { merged.push(remoteItem); return; }

			var aliasSource = null;
			localData.forEach(function (localItem, index) {
				if (matchedLocal[index] || !isSameHero(localItem, remoteItem)) { return; }
				matchedLocal[index] = true;
				if (!aliasSource) { aliasSource = localItem; }
			});

			if (aliasSource) {
				merged.push({
					value: remoteItem.value,
					text: remoteItem.text,
					alias: unionAlias(remoteItem.alias, aliasSource.alias)
				});
				return;
			}
			if (hasBase(remoteItem)) { return; }
			merged.push(remoteItem);
		});

		localData.forEach(function (localItem, index) {
			if (isPlaceholder(localItem) || matchedLocal[index]) { return; }
			if (hasBase(localItem)) { return; }
			merged.push(localItem);
		});

		return merged;
	}

	function readRaw() {
		try {
			return global.localStorage.getItem(STORAGE_KEY);
		} catch (error) {
			console.error('HeroStore: 无法读取本地存储，本次不启用本地数据。', error);
			return null;
		}
	}

	function writeRaw(value) {
		try {
			global.localStorage.setItem(STORAGE_KEY, value);
			return true;
		} catch (error) {
			console.error('HeroStore: 无法写入本地存储，改动仅在本次会话内有效。', error);
			return false;
		}
	}

	function load() {
		var stored = parseStored(readRaw());
		base = stored.base || EMPTY_BASE;
		return stored;
	}

	function save(heroes) {
		writeRaw(JSON.stringify({
			version: STORAGE_VERSION,
			heroes: heroes,
			base: base
		}));
	}

	function sync(remoteData) {
		var stored = load();
		var merged = merge(remoteData, stored.heroes);
		base = buildBase(remoteData);
		save(merged);
		return merged;
	}

	function resolve(heroes, rawText) {
		var text = normalizeText(rawText);
		var candidates = (heroes || []).filter(function (hero) { return !isPlaceholder(hero); });
		var result = { value: '', status: 'empty' };

		if (text === '') { return result; }

		var exact = candidates.filter(function (hero) { return normalizeText(hero.text) === text; })[0];
		if (exact) { return { value: exact.value, status: 'exact' }; }

		var byAlias = candidates.filter(function (hero) {
			return toAliasList(hero.alias).some(function (alias) { return normalizeText(alias) === text; });
		})[0];
		if (byAlias) { return { value: byAlias.value, status: 'alias' }; }

		var partial = candidates.filter(function (hero) {
			if (normalizeText(hero.text).indexOf(text) !== -1) { return true; }
			return toAliasList(hero.alias).some(function (alias) { return normalizeText(alias).indexOf(text) !== -1; });
		});
		if (partial.length > 0) {
			return { value: partial[0].value, status: partial.length > 1 ? 'ambiguous' : 'partial' };
		}
		return { value: '', status: 'none' };
	}

	return {
		load: load,
		save: save,
		sync: sync,
		merge: merge,
		resolve: resolve,
		normalizeText: normalizeText,
		unionAlias: unionAlias,
		isPlaceholder: isPlaceholder
	};
})(window);
