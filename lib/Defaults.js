class Defaults {
    constructor(jsonObj) {
        this.credentials = {
            "username":jsonObj.username,
            "password":jsonObj.password
        }
        this.message = jsonObj.message
    }
}
module.exports = Defaults