class Defaults {
    constructor(jsonObj) {
        this.credentials = {
            "username":jsonObj.username,
            "password":jsonObj.password
        }
        this.promo = jsonObj.promo
    }
}
module.exports = Defaults