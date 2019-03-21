async function getChase() {
	const chase = "https://www.chase.com/";
	const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();

  /* Go to Chase*/
  await page.goto(chase, { waitUntil: 'networkidle2' });
  //enter sign in
  await page.evaluate(() => {
  		document.querySelector("a[data-pt-name=hd_signin]").click();
  });
  await page.waitFor(6000);
  //sign in
  await page.evaluate(() => {
  		console.log("hmmm123");
		if(document.querySelector("input[name=UserID]"))
		{
			document.querySelector("input[name=UserID]").value = "aaroniniguez1";
		}
		if(document.querySelector("input[name=userId]"))
		{
			console.log("hmmm");
			document.querySelector("input[name=userId]").value = "aaroniniguez1";
		}
		if(document.querySelector("input[name=Password]"))
		{
			document.querySelector("input[name=Password]").value = "iniguez1!";
		}
		if(document.querySelector("input[name=password]"))
		{
			document.querySelector("input[name=password]").value = "iniguez1!";
		}
		if(document.querySelector("input[id=logon]"))
		{
			console.log("testing");
			document.querySelector("input[id=logon]").click();
		}
		if(document.querySelector("button"))
		{
			console.log("testing123");
			document.querySelector("button").click();
		}
  });
  //get balance
  await page.waitFor(24000);
  
  let chaseData = await page.evaluate(() => {
		var cash = document.querySelectorAll("span.balance")[0].textContent;
		return cash;
  });
  console.log("Bank Balance: "+chaseData);
  
	await browser.close();
	return;
}
getChase().catch(function(error)
{
	console.log(error);	
});
