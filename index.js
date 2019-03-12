const puppeteer = require('puppeteer');
const IMDB_URL = (movie_id) => `https://www.imdb.com/title/${movie_id}/`;
const tefs = 'https://mts.tefsec.com/TradenetLogin.aspx';
const util = require('util')
console.log(IMDB_URL);

(async () => {
  /* Initiate the Puppeteer browser */
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();

  /* Go to the IMDB Movie page and wait for it to load */
  await page.goto(tefs, { waitUntil: 'networkidle2' });

  /* Run javascript inside of the page */
  let data = await page.evaluate(() => {
    document.querySelector('input[name="TitansID"]').value = "CPP04194";
    document.querySelector('input[name="Password"]').value = "Lp4MgxGX";
	document.querySelector('input[name="Singin"]').click();
	});
	await page.waitFor(6000);
	let tefsData = await page.evaluate(() => {
		var countRows = document.querySelectorAll("table.boxContentText")[6].querySelectorAll("td:last-child").length
		var pnl = document.querySelectorAll("table.boxContentText")[6].querySelectorAll("td:last-child")[countRows-1].textContent
		var totalEquity = document.querySelectorAll("table.boxContentText")[4].querySelectorAll("td:last-child")[5].textContent
		var returnObject = 
		{
			totalEquity:totalEquity,
			pnl:pnl
		};
		if(pnl == " Net P&L ") 
		{
			return "Data not available at this time";
		}
		else
		{
			return returnObject;
		}
	});
	console.log(JSON.stringify(tefsData, null, 2));
	await browser.close();
	return;

  /* Outputting what we scraped */

}
)().catch(function(error)
{
	console.log(error);
});
