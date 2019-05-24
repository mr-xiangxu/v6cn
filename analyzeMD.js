const IN_FILE = 'xyds_2018-07.txt'; // 原始数据文件名
const FROM_DATE = 20180701; // 开始日期
const TO_DATE = 20180731; // 结束日期

const CUTOFF = 2; //1 - 9
const OUT_FILE = IN_FILE + '.md.txt';

const readline = require('readline');
const fs = require('fs');

const intf = readline.createInterface({
  input: fs.createReadStream(IN_FILE),
  crlfDelay: Infinity
});

var prev = -1;
const data = {sum: 0};
data[1] = 0;
data[2] = 0;

intf.on('line', (line) => {
	let nums = line.split(' ')
		.filter((e) => (e.length !== 0))
		.map((e) => parseInt(e, 10));
	let round;

	// skip empty lines
	if (nums.length == 0)
		return;
	
	if (prev !== -1 && nums[0] >= FROM_DATE && nums[0] <= TO_DATE) {
		if (nums[3] === 0) {
			data.sum += 1;
			round = Math.min(prev + 1, CUTOFF + 1);
			if (!data[round])
				data[round] = 1;
			else
				data[round] += 1;
		}
	}

	prev = nums[3];
});

intf.on('close', (_) => {
	let fd = fs.openSync(OUT_FILE, 'a+');
	let title = new Date().toLocaleString('en-US', {timeZone: 'Asia/Shanghai'})
			+ ' ' + `${FROM_DATE}-${TO_DATE}`;
	let profit;

	fs.appendFileSync(fd, title + '\r\n');

	for (let x in data) {
		profit = 0;
		for (let y in data) {
			if (y === 'sum' || y < x)
				continue;
			if (y === x)
				profit = data[y] * 19;
			else if (y > x)
				profit -= data[y];
		}
		fs.appendFileSync(fd, `MD[${x}]: ${data[x]}, profit=${profit}\r\n`);
	}

	fs.appendFileSync(fd, '\r\n');
	fs.closeSync(fd);
});
