const {By, Key, until, Capabilities} = require('selenium-webdriver');
const {buildChromeDriver, buildChromeFlashDriver, log} = require('./libV6cn');
const {
	waitForRecorder, getLastResult,
	waitForBidder, selectCoin, selectFlower, putMoney
} = require('./libBid');
const {users} = require('./config');

const RECORDER = buildChromeDriver();
const bidders = [];

main();

async function main() {
	const inits = new Array(users.length + 1);
	let i;

	console.log('===== 游戏初始化... =====');
	log('===== 游戏初始化... =====');

	try {
		for (i = 0; i < users.length; i++) {
			bidders[i] = buildChromeFlashDriver();
			inits[i] = waitForBidder(bidders[i], users[i]);
		}
		inits[i] = waitForRecorder(RECORDER);
		await Promise.all(inits);
	} catch (err) {
		for (i = 0; i < users.length; i++) {
			try {
				await bidders[i].close();
				await bidders[i].quit();
			} catch(err2) {}
		}
    await RECORDER.close();
		await RECORDER.quit();
		console.log('=== 初始化错误 请重新运行脚本 ===');
		process.exit(0);
	}

	// start each game asynchronously
	for (i = 0; i < users.length; i++) {
		init(bidders[i], users[i]);
	}
}

async function init(driver, user) {
	let pAlert;

	try {
		pAlert = await driver.findElement(By.className('p-alert'));
		await driver.wait(until.elementTextIs(pAlert, '开始参与'), 60*1000);
		await driver.sleep(2000);
		await selectCoin(driver, user);
	} catch(err) {
		console.log('init 用户 ['+user.username+'] 错误: ' + err);
		for (i = 0; i < users.length; i++) {
			try {
				await bidders[i].close();
				await bidders[i].quit();
			} catch(err2) {}
		}
    await RECORDER.close();
		await RECORDER.quit();
		console.log('=== 初始化错误 请重新运行脚本 ===');
		process.exit(0);
	}

	console.log('用户 ['+user.username+'] 初始化成功! 从下一局开始游戏');
	loop(driver, user);
}

async function loop(driver, user) {
	let pAlert, result;

	while (true) {
		try {
			pAlert = await driver.findElement(By.className('p-alert'));
			await driver.wait(until.elementTextIs(pAlert, '开始参与'), 60*1000);
			await driver.sleep(2000);
			await selectFlower(driver, user);
			result = await getLastResult(RECORDER, user);
			if (result === '') {
				await putMoney(driver, user);
			}
		} catch(err) {
			log('loop 用户['+user.username+'] 错误: ' + err);
		}
	}
}
