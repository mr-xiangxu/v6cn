const {Builder, By, Key, until} = require('selenium-webdriver');
const readLastLines = require('read-last-lines');
const fs = require('fs');

const SCAN_SIZE = 5;
const PERIOD = (SCAN_SIZE - 1) * 40 * 1000;
var driver = new Builder().forBrowser('chrome').build();
var records = [];

main();

function main() {
	driver.manage().window().maximize()
	.then(_ => driver.get('http://yyaamm.com/6867/'))
	.then(_ => loadHistory())
	.then(_ => loop())
}

function loadHistory() {
	return loadPage()
	.then(_ => readRows(600, 780, SCAN_SIZE))
	.then(_ => writeRows())
	.then(_ => readRows(400, 605, SCAN_SIZE))
	.then(_ => writeRows())
	.then(_ => readRows(200, 405, SCAN_SIZE))
	.then(_ => writeRows())
	.then(_ => readRows(0, 205, SCAN_SIZE))
	.then(_ => writeRows());
}

async function loop() {
	while (true) {
		try {
			await loadPage();
			await readRows(0, 0, SCAN_SIZE);
			await writeRows();
			await driver.sleep(PERIOD);
		} catch(err) {
			console.log('loop: ' + err);
		}
	}
}

function loadPage() {
	return driver.wait(until.elementLocated(By.css('#tbody > tr')), 30*1000)
	.then(_ => driver.sleep(1000));
}

function readRows(start, end, pace) {
	//console.log(`readRows(${start}, ${end})`);
	return driver.findElements(By.css('#tbody > tr'))
	.then(trs => {
		//console.log(`found "#tbody > tr": ${trs.length}`);

		return Promise.all(
			trs.slice(start, start + pace).map(tr => tr.findElements(By.css('td')))
		);
	})
	.then(tdArrs => {
		//console.log(`items scanned: ${pace}`);

		let pIds = tdArrs.map(tdArr => tdArr[0].getAttribute('id'));
		let p1s = tdArrs.map(tdArr => tdArr[1].getText());
		let p2s = tdArrs.map(tdArr => tdArr[2].getText());
		let p3s = tdArrs.map(tdArr => tdArr[3].getText());
		let p4s = tdArrs.map(tdArr => tdArr[4].getText());
		let p5s = tdArrs.map(tdArr => tdArr[5].getText());

		return Promise.all([...pIds, ...p1s, ...p2s, ...p3s, ...p4s, ...p5s]);
	})
	.then(arr => {
		//console.log(`arr(${arr.length}): ${arr}`);

		let len = arr.length / 6;
		let tr;
		let trs = new Array(len).fill(0).map((_, i) => {
			let str = arr[i].substr('dwy_mark_time2_'.length);
			let time = str.substr(0, '20180102'.length) + '-'
				+ str.substr('20180102'.length, 2) + ':'
				+ str.substr('2018010203'.length, 2) + ':'
				+ str[str.length - 1] + 'x';
			return {
				'time': time,
				'ty': parseInt(arr[len + i], 10) || 0,
				'yh': parseInt(arr[2 * len + i], 10) || 0,
				'md': parseInt(arr[3 * len + i], 10) || 0,
				'bh': parseInt(arr[4 * len + i], 10) || 0,
				'yj': parseInt(arr[5 * len + i], 10) || 0,
			};
		});

		// add table rows to the records
		while (records.length > 0 &&
		       trs[0].time.localeCompare(records[records.length - 1].time) >= 0) {
			trs.shift();
		}
		records.push(...trs);

		//console.log(`cached items: ${records.length}`);

		// recursion
		if (start < end)
			return readRows(start + pace, end, pace);
	});
}

function writeRows() {
	let fname = genFileName();
	let fd = fs.openSync(fname, 'a+');
	fs.closeSync(fd);

	return readLastLines.read(fname, 1).then(last => {
		let fd = fs.openSync(fname, 'a+');
		let lastTime;
		let start = records.length;
		let printLine;

		//console.log(`lastline: [${last}]`);

		if (last.trim().length != 0) {
			lastTime = last.substr(0, '20180215-13:51:5x'.length);
			for (start = 0; start < records.length; start++) {
				if (lastTime >= records[start].time)
					break;
			}
		}
		//console.log(`infile:[${lastTime}]  cached:[${records[0].time}]`);

		for (let i = start - 1; i >= 0; i--) {
			printLine = records[i].time + ' ';
			//console.log(`append: [${printLine}]`);

			for (let name of ['ty', 'yh', 'md', 'bh', 'yj']) {
				printLine += records[i][name].toString().padStart(5, ' ');
			}

			fs.appendFileSync(fd, '\r\n' + printLine);
		}
		fs.closeSync(fd);

		records = [];
	});
}

function genFileName() {
	let today = new Date();
	let formats = today.toLocaleDateString('en-US', {
		year: 'numeric',
		month: '2-digit',
		timeZone: 'Asia/Shanghai'
	}).split('/');
	return `xyds_${formats[1]}-${formats[0]}.txt`;
}
