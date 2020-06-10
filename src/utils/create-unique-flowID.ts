var random = require('randomstring');
export default function generateUniqueFlowID() {
    var dt = new Date();
    return random.generate() + dt.toISOString();
}