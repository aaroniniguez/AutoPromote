require('dotenv').config({ path: '/Users/aaroniniguez/AutoPromote/.env'})
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export function sendText(message: string) {
	client.messages
	.create({
		body: message,
		from: process.env.TWILIO_PHONE,
		to: '+19165178775'
	})
	.catch((e: any) => console.log(e));
}