const random = require('randomstring');
export default function generateUniqueFlowID() {
    const dt = new Date();
    return random.generate() + dt.toISOString();
}