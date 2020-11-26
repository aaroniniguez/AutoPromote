require('dotenv').config({ path: '/Users/aaroniniguez/AutoPromote/.env'})
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

export function sendMessage(message: string) {
	client.messages
	.create({
		body: message,
		from: process.env.TWILIO_PHONE,
		to: '+19165178775'
	})
	.then((message: any) => console.log(message.sid))
	.catch((e: any) => console.log(e));
}