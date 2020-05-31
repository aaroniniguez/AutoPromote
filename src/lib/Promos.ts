class Promos {
	textQuotes: {message: string}[];
	baseWebSitePromo: string;
	imageBasePath: string;
	hashTags: string;
	affiliateLink: string;
	intro: string;
	student: string;
	expert: string;
	pro: string;
	ImageQuotes: {image: string, message: string}[];
	constructor() {
		this.imageBasePath = __dirname + "/../../Images/Payouts/";
		this.baseWebSitePromo = "\nRead about my experience with Tradenet here: tradeforthemoney.com"
		this.hashTags = "#Tefs #Tradenet #tradezero #promo #underPDT\n"
		this.affiliateLink = "http://jump2click.com/visit/?bta=37140&nci=6714"
		this.intro = "$399"
		this.student = "$2,700"
		this.expert = "$5,400"
		this.pro = "$8,100"
		this.ImageQuotes = [
			{
				image: "NovemberPayout.png",
				message: "~November 2018 ~ \nThis was my biggest month ever, literally traded $UVXY this entire month as the market as a whole was on fire!"
			},{
				image: "AprilPayout.png",
				message: "This was only a smaller payout of $1000 but overall not too shabby for the student account :D"
			}, {
				image: "SeptemberPayout.png", 
				message: "I made $3,700 with Tradenet in the first month! :D"
			}, {
				image: "OctoberPayout.png",
				message: "Second payout I got on my student account , almost $3000!"
			}
		]
		this.textQuotes = [
			{
				message: `TradeNet , my go to platform for trading US Stocks under PDT is having a monster sale! (dm me for an even better sale ;):\n\n\nIntro for ${this.intro}\nStudent for ${this.student}\nExpert for ${this.expert}\nPro for ${this.pro}\n\n`+this.affiliateLink
			},
			{
				message: "\nMy go to platform for building small accounts and for those under pdt is without a doubt tradenet. Excellent buying power and crazy low comissions - perfect for scalping! Get a discount here:\n"+this.affiliateLink
			}
		]
	}
	/**
	 * test
	 */
	getRandomImagePromotion() {
		let length = this.ImageQuotes.length
		let item = this.ImageQuotes[Math.floor(Math.random()*length)];
		item.message = item.message + this.baseWebSitePromo
		item.image = this.imageBasePath + item.image
		return item;
	}
	getRandomTextPromotion() {
		let length = this.textQuotes.length	
		let quote = this.textQuotes[Math.floor(Math.random()*length)].message
		return {
			message: this.hashTags + quote,
			image: false
		}
	}
}
module.exports = new Promos();