class ImagePromos {
	constructor() {
		this.imageBasePath = "/Users/aaroniniguez/Desktop/st/Payouts/"
		this.baseWebSitePromo = "\nRead about my experience with them here: tradeforthemoney.com"
		this.hashTags = "#Tefs #Tradenet #suretrader #promo #underPDT "
		this.ImageQuotes = [
			{
				image: "NovemberPayout.png",
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
	}
	getRandomImage() {
		let length = this.ImageQuotes.length
		let item = this.ImageQuotes[Math.floor(Math.random()*length)];
		item.message = this.hashTags + item.message + this.baseWebSitePromo
		item.image = this.imageBasePath + item.image
		return item;
	}
}
module.exports = new ImagePromos();