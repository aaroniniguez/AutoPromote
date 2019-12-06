class Promos {
	constructor() {
		this.imageBasePath = "/Users/aaroniniguez/Desktop/st/Payouts/"
		this.baseWebSitePromo = "\nRead about my experience with them here: tradeforthemoney.com"
		this.hashTags = "#Tefs #Tradenet #tradezero #promo #underPDT\n"
		this.affiliateLink = "http://jump2click.com/visit/?bta=37140&nci=6714"
		this.intro = "$399"
		this.student = "$2,700"
		this.expert = "$5,400"
		this.pro = "$8,100"
		this.ImageQuotes = [
			{
				image: "NovemberPayout.png",
				message: "This was my biggest month ever, literally traded $UVXY this entire month as the market as a whole was on fire!"
			},{
				image: "AprilPayout.png",
				message: "This was only a smaller payout of $1000 but overall not too shabby for the student account :D"
			}, {
				image: "SeptemberPayout.png", 
				message: "This was after 1 month of the student account at tradenet, my initial investment was instantly recouped and after this I was trading with the 'houses' money :D"
			}, {
				image: "OctoberPayout.png",
				message: "Second payout I got on my student account , almost $3000!"
			}
		]
		this.textQuotes = [
			{
				message: `TradeNet , my go to platform for trading US Stocks under PDT is having a monster sale!:\n\n\nIntro for ${this.intro}\nStudent for ${this.student}\nExpert for ${this.expert}\nPro for ${this.pro}\n\n`+this.affiliateLink
			},
			{
				message: "\nMy go to platform for building small accounts and for those under pdt is without a doubt tradenet. Excellent buying power and crazy low comissions - perfect for scalping! Get a discount here:\n"+this.affiliateLink
			}
		]
	}
	getRandomImagePromotion() {
		let length = this.ImageQuotes.length
		let item = this.ImageQuotes[Math.floor(Math.random()*length)];
		item.message = this.hashTags + item.message + this.baseWebSitePromo
		item.image = this.imageBasePath + item.image
		return item;
	}
	getRandomTextPromotion() {
		let length = this.textQuotes.length	
		let item = this.textQuotes[Math.floor(Math.random()*length)]
		item.message = this.hashTags + item.message;
		item.image = false;
		return item;
	}
}
module.exports = new Promos();