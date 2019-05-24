const {By, Key, until, Capabilities} = require('selenium-webdriver');
const {URL_HOME, log, login} = require('./libV6cn');

const URL_RECORDER = 'http://yyaamm.com/6867/';
const URL_BID = URL_HOME + '3501';

exports.waitForRecorder = async function(recorderDriver) {
	try {
		await recorderDriver.manage().window().maximize();
		await recorderDriver.get(URL_RECORDER);
		await recorderDriver.wait(until.elementLocated(By.css('.fruit_window #tbody')),
														  60*1000);
	} catch (err) {
		console.log('waitForRecorder 错误: ' + err);
		throw err;
	}
}

exports.waitForBidder = async function(driver, user) {
	try {
		await driver.manage().window().maximize();
		await login(driver, user.username, user.password);
		await driver.get(URL_BID);
		await driver.wait(until.elementLocated(By.css('#dashangbox .p-empty')), 60*1000);
	} catch (err) {
		console.log('waitForBidder 用户['+user.username+']错误: ' + err);
		throw err;
	}
}

exports.selectCoin = async function(driver, user) {
	let classStr;

	while (true) {
		try {
			// click coint
			await driver.findElement(By.className('p-coin-select'))
				.findElement(By.linkText(user.coin))
				.click();
			// check selection
			classStr = await driver.findElement(By.className('p-coin-select'))
				.findElement(By.linkText(user.coin)).getAttribute('class');
			if (classStr.includes('p-on')) {
				break;
			}
		} catch(err) {
			console.log('selectCoin 用户['+user.username+']错误: ' + err);
		}
		await driver.sleep(1000);
	}
}

exports.selectFlower = async function(driver, user) {
	let classStr;

	while (true) {
		// click flower
		await driver.findElement(By.className(`p-seat${user.flower}`)).click();
		await driver.sleep(500);

		// check selection
		classStr = await driver.findElement(By.className(`p-seat${user.flower}`))
			.getAttribute('class');
		if (classStr.includes('p-seat-on')) {
			break;
		}
		await driver.sleep(500);
	}
}

exports.getLastResult = async function(recorderDriver, user) {
	let tr = await recorderDriver.findElement(By.css('#tbody > tr:first-child'));
	let td = await tr.findElement(By.css(`td:nth-child(${user.flower + 1})`));
	return await td.getText();
}

exports.putMoney = async function(driver, user) {
	let text, amount, givenCnt = 0;

	do {
		await clickGiveBtn(driver, user.count - givenCnt);
		text = await driver.findElement(By.css(`.p-seat${user.flower} > .p-counts`))
			.getText();
		amount = parseInt(text, 10) || 0;
		givenCnt = amount / parseInt(user.coin, 10);
	} while (givenCnt < user.count);
}

async function clickGiveBtn(driver, count) {
	for (let i = 0; i < count; i++) {
		await driver.findElement(By.className('p-give-btn')).click();
		await driver.sleep(1000);
	}
}