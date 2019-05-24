const {By, Key, until, Capabilities} = require('selenium-webdriver');
const {
	buildSafariDriver, log
} = require('./libV6cn');
const {
	waitForRecorder, getLastResult,
	waitForBidder, selectCoin, selectFlower, putMoney
} = require('./libBid');
const {user1} = require('./config');

const RECORDER = buildSafariDriver();
const drBidder = buildSafariDriver();

log('===== Game Started =====');

Promise.all([waitForRecorder(RECORDER), waitForBidder(drBidder, user1)])
.then(_ => main(drBidder, user1));

function main(driver, user) {
	driver.findElement(By.className('p-alert'))
	.then(pAlert => {
		driver.wait(until.elementTextIs(pAlert, '开始参与'), 60*1000)
		.then(_ => driver.sleep(2000))
		.then(_ => selectCoinSafari(driver, user))
		.then(_ => loop(driver, user, pAlert));
	});
}

function selectCoinSafari(driver, user) {
	return driver.sleep(2000)
	.then(_ => driver.findElement(By.className('p-empty')))
	.then(pEmpty => pEmpty.findElement(By.className('p-footer')))
	.then(pFooter => pFooter.findElement(By.className('p-coin-select')))
	.then(pCoinSelect => pCoinSelect.findElements(By.css('a')))
	.then(coins => {
		if (user.coin === '100')
			return coins[0];
		if (user.coin === '10')
			return coins[1];
		if (user.coin === '1')
			return coins[2];
	})
	.then(coin => driver.executeScript('arguments[0].click();', coin));
}

async function loop(driver, user, pAlert) {
	while (true) {
		try {
			await recur(driver, user, pAlert);
		} catch(err) {
			log('loop: ' + err);
		}
	}
}

function recur(driver, user, pAlert) {
	return driver.wait(until.elementTextContains(pAlert, '等待开始'), 60*1000)
	.then(_ => driver.wait(until.elementTextIs(pAlert, '开始参与'), 10*1000))
	.then(_ => driver.sleep(2000))
	.then(_ => selectFlower(driver, user))
	.then(_ => getLastResult(RECORDER, user))
	.then(lastResult => {
		if (lastResult === '')
			return putMoney(driver, user, 0);
	})
	.then(_ => driver.sleep(10*1000));
}
