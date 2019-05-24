const IN_FILE = 'xyds_2018-03.txt';
const OUT_FILE = IN_FILE + '.all.txt';
const FROM_DATE = 20180301;
const TO_DATE = 20180328;
const CUTOFF = 2;

const TY = 1, YH = 2, MD = 3, BH = 4, YJ = 5;
const NAMES = [null, 'TY', 'YH', 'MD', 'BH', 'YJ'];
const times = [null,  2.5,  6,    20,   10,   3];

const readline = require('readline');
const fs = require('fs');

const intf = readline.createInterface({
  input: fs.createReadStream(IN_FILE),
  crlfDelay: Infinity
});

var prev = null;
var data = [null, {sum: 0}, {sum: 0}, {sum: 0}, {sum: 0}, {sum: 0}];

(function() {
	let i;

	for (i = TY; i <= YJ; i++) {
		data[i][1] = 0;
		data[i][2] = 0;
	}

})();

intf.on('line', (line) => {
	let strs = line.split(' ')
		.filter((e) => (e.length !== 0))
		.map((e) => parseInt(e, 10));
	let round;

	// skip empty lines
	if (strs.length == 0)
		return;
	
	if (prev !== null && strs[0] >= FROM_DATE && strs[0] <= TO_DATE) {
		for (let i = TY; i <= YJ; i++) {
			if (strs[i] === 0) {
				data[i].sum += 1;
				round = Math.min(prev[i] + 1, CUTOFF + 1);
				if (!data[i][round])
					data[i][round] = 1;
				else
					data[i][round] += 1;
			}
		}
	}

	prev = strs;
});

intf.on('close', (_) => {
	let fd = fs.openSync(OUT_FILE, 'a+');
	let title = new Date().toLocaleString('en-US', {timeZone: 'Asia/Shanghai'})
			+ ' ' + `${FROM_DATE}-${TO_DATE}`;
	let profit;

	fs.appendFileSync(fd, title + '\r\n');
	for (let i = TY; i <= YJ; i++) {
		for (let x in data[i]) {
			profit = 0;
			for (let y in data[i]) {
				if (y === 'sum' || y < x)
					continue;
				if (y === x)
					profit = data[i][y] * (times[i] - 1);
				else if (y > x)
					profit -= data[i][y];
			}
			fs.appendFileSync(fd,
				`${NAMES[i]}[${x}]: ${data[i][x]}, profit=${profit}\r\n`);
		}
		fs.appendFileSync(fd, '\r\n');
	}
	fs.closeSync(fd);
});
