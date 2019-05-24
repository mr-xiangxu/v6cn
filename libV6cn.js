const {Builder, By, Key, until, Capabilities} = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');

exports.URL_HOME = 'https://www.6.cn/';

exports.buildSafariDriver = function() {
	return new Builder().forBrowser('safari').build();
}

exports.buildFirefoxDriver = function() {
	return new Builder().forBrowser('firefox').build();
}

exports.buildChromeDriver = function() {
	return new Builder().forBrowser('chrome').build();
}

exports.buildChromeFlashDriver = function() {
	let flashOption = new chrome.Options().setUserPreferences({
		"profile.default_content_setting_values.plugins": 1,
		"profile.content_settings.plugin_whitelist.adobe-flash-player": 1,
		"profile.content_settings.exceptions.plugins.*,*.per_resource.adobe-flash-player": 1,
		"PluginsAllowedForUrls": "https://www.6.cn"
	});
	return new Builder().forBrowser('chrome').setChromeOptions(flashOption).build();
}

exports.buildFirefoxFlashDriver = function() {
	let flashOption =  new firefox.Options()
		.setPreference('plugins.flashBlock.enabled', 'false')
		.setPreference('dom.ipc.plugins.enabled.libflashplayer.so', 'true')
		.setPreference('plugin.state.flash', 2);
	return new Builder().forBrowser('firefox').setFirefoxOptions(flashOption).build();
}

exports.login = async function(driver, username, password) {
	try {
		await driver.get(exports.URL_HOME);
		let loginBtn = await driver.wait(until.elementLocated(By.linkText('登录')), 60*1000);
		await loginBtn.click();
		await driver.sleep(1000);
		let usernameInput = await driver.wait(until.elementLocated(By.id('member-login-un')),
																					60*1000);
		await driver.sleep(1000);
		await usernameInput.sendKeys(username);
		await driver.sleep(1000);
		await driver.findElement(By.id('member-login-pd')).sendKeys(password);
		await driver.findElement(By.className('loogerbtn')).click();
		await driver.sleep(1000);
		let linkRoom = await driver.wait(until.elementLocated(By.css('#myAccountTool > a')),
																		 60*1000);
		await driver.sleep(1000);
		let urlRoom = await linkRoom.getAttribute('href');
		await driver.get(urlRoom);
	} catch(err) {
		console.log('login 用户['+username+'] 错误: ' + err);
		throw err;
	}
}

exports.log = function(str) {
	let fd = fs.openSync('log.txt', 'a+');
	let time = new Date().toLocaleString('en-US', {timeZone: 'Asia/Shanghai'});
	fs.appendFileSync(fd, time + ' ' + str + '\r\n');
	fs.closeSync(fd);
}