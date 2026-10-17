window.OutputBuilder = (function () {
	'use strict';

	var TAB = '        '; // wiki 模板要求 8 个空格缩进
	var PAD = ' ';

	function pad2(value) {
		var digits = String(value === undefined || value === null ? '' : value).replace(/\D/g, '');
		if (digits === '') { return '00'; }
		while (digits.length < 2) { digits = '0' + digits; }
		return digits;
	}

	function withPad(list, lastIndex) {
		return list.map(function (value, index) {
			return index === lastIndex ? value : value + PAD;
		});
	}

	function gameLine(state, length, winner) {
		var side1 = state.team1side === 'red' ? 'red' : 'blue';
		var side2 = side1 === 'blue' ? 'red' : 'blue';
		return TAB + '|team1side=' + side1 + PAD + '|team2side=' + side2 + PAD +
			'|length=' + length + '|winner=' + winner;
	}

	function pickLines(picks) {
		return [
			TAB + '<!-- Hero picks -->',
			TAB + '|t1h1=' + picks.t1h[0] + '|t1h2=' + picks.t1h[1] + '|t1h3=' + picks.t1h[2] +
				'|t1h4=' + picks.t1h[3] + '|t1h5=' + picks.t1h[4],
			TAB + '|t2h1=' + picks.t2h[0] + '|t2h2=' + picks.t2h[1] + '|t2h3=' + picks.t2h[2] +
				'|t2h4=' + picks.t2h[3] + '|t2h5=' + picks.t2h[4]
		];
	}

	function banLines(picks, banNums) {
		var lines = [TAB + '<!-- Hero bans-->'];
		var line1 = TAB;
		var line2 = TAB;
		for (var i = 0; i < banNums; i++) {
			line1 += '|t1b' + (i + 1) + '=' + picks.t1b[i];
			line2 += '|t2b' + (i + 1) + '=' + picks.t2b[i];
		}
		lines.push(line1, line2);
		return lines;
	}

	/**
	 * @param {Object} state
	 *   team1side: 'blue' | 'red'
	 *   minutes / seconds: 字符串
	 *   winner: '1' | '2'
	 *   banNums: 数字
	 *   gameInProgress: 布尔
	 *   mode: 'ultimate' | 'picks' | 'bans' | 'banpicks' | 'all'
	 *   picks: { t1h: [5], t2h: [5], t1b: [5], t2b: [5] }
	 */
	function build(state) {
		var banNums = parseInt(state.banNums, 10) || 5;
		var picks = {
			t1h: withPad(state.picks.t1h, 4),
			t2h: withPad(state.picks.t2h, 4),
			t1b: withPad(state.picks.t1b, banNums - 1),
			t2b: withPad(state.picks.t2b, banNums - 1)
		};
		var length = pad2(state.minutes) + ':' + pad2(state.seconds) + PAD;
		var winner = String(state.winner || '');

		if (state.gameInProgress) {
			length = PAD;
			winner = '';
		}

		var lines = [];
		var mode = state.mode || 'all';

		if (mode === 'ultimate' || mode === 'all') {
			lines.push(gameLine(state, length, winner));
		}
		if (mode === 'ultimate' || mode === 'picks' || mode === 'banpicks' || mode === 'all') {
			lines = lines.concat(pickLines(picks));
		}
		if (mode === 'bans' || mode === 'banpicks' || mode === 'all') {
			lines = lines.concat(banLines(picks, banNums));
		}
		return lines.join('\n');
	}

	return { build: build, pad2: pad2 };
})();
