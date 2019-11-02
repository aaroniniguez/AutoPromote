
var errorObject = {
	name: "InvalidCredentials",
	message: "Invalid Credentials"
}
async function followRandomPeople(page) {
	function elementDoesntExist(err) {
		console.log(err);
		console.log(Object.prototype.toString.call(err));
		return page.screenshot({path: 'log/buddy-screenshot.png'});
		//process.exit();
	}
	const followPage = "https://twitter.com/who_to_follow";
	await page.goto(followPage, {waitUntil: 'networkidle2' });
	var selector = "//span[text()='Follow']";
	await page.waitForXPath(selector).catch(elementDoesntExist);
	var results = await page.$x(selector);
	console.log(results.length);
	for(let i = 0; i < results.length; i++) {
		await results[i].click({delay:500}).catch(function(rejection) {
			console.log("Follow Button not clickable: ", rejection);
		});
	}
}
function consoleHandler(page) {
	page.on('console', (log) => {
		if(log._type == "warning")
			return;
			//console.warn(log._text);	
		else if(log._type == "verbose")
			return;
			//console.debug(log._text);
		else
			console[log._type](log._type+":" + log._text);
	});
}
module.exports.postOnTwitter = async function (username, password, data, uploadFile = false, randomFollow = false) {
		function elementDoesntExist(err) {
			console.log(err);
			console.log(Object.prototype.toString.call(err));
			process.exit();
		}
		const validLoginPages = ["https://twitter.com/home", "https://twitter.com/"];
		var typeDelay = {
			delay: 3,
		};
		const puppeteer = require('puppeteer');
		const twitter = "https://twitter.com/";
		//const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  		const browser = await puppeteer.launch({headless: false});
		const page = await browser.newPage();
		//print out console logging in the page
		consoleHandler(page);
		await page.goto(twitter, { waitUntil: 'networkidle2' });
		//enter sign in
		await page.evaluate(() => {
			document.getElementsByClassName("js-nav EdgeButton EdgeButton--medium EdgeButton--secondary StaticLoggedOutHomePage-buttonLogin")[0].click();
		}).catch(elementDoesntExist);
		
		var selector = "input[name='session[username_or_email]']";
		await page.waitFor(3000);
		let EH = await page.waitForSelector(selector).catch(elementDoesntExist);
		await EH.type(username, typeDelay);
		await page.type("input.js-password-field", password, typeDelay).catch(elementDoesntExist);
		await page.waitForXPath("//button[text()='Log in']").then((EH)=>EH.click()).catch(elementDoesntExist);
		//check if user successfully logged in
		//wait for page to load before getting url
		await page.waitFor(3000);
		var url = page.url();
		if(!validLoginPages.includes(url)){
			await browser.close();
			throw errorObject;
		}
		else{
			console.log(url)
		}
		if(randomFollow) {
			await followRandomPeople(page).catch((e)=>{console.log(e);});
		}
		await page.goto(twitter, { waitUntil: 'networkidle2' });
		//assumes logged in...
		await page.keyboard.press('KeyN');
		await page.waitFor(2000);
		await page.keyboard.type(data, typeDelay);
		if(uploadFile){
			const input = await page.$('input[type="file"]');
			await input.uploadFile(uploadFile);
			await page.waitFor(10000);
		}
		await page.keyboard.down('MetaLeft');
		await page.keyboard.press('Enter');
		await page.keyboard.up('MetaLeft');
		await page.waitFor(9000);
		await browser.close();
		return;
};