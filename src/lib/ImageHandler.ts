import axios from 'axios';
import fs from "fs";
class ImageHandler {

    public baseName = "https://autopromoteimages.s3.us-east-2.amazonaws.com/";

    createImageName(url: string) {
        return url.replace(this.baseName, "").replace(/\//g, '-');
    }

    /**
     * 
     * @param imageUrl
     * @returns string image file path
     */
    async saveImage(imageUrl: string) : Promise<string> {
        const response = await axios.get(imageUrl, {responseType: 'stream'});
        const filestream = fs.createWriteStream(this.createImageName(imageUrl));
        return await new Promise((resolve, reject) => {
            response.data.pipe(filestream);    
            response.data.on('end', () => {
                resolve(process.cwd() + "/" + this.createImageName(imageUrl));
            });
            response.data.on('error', (error: Error) => {
                reject(error);
            });
        });
    }

    deleteImage(path: string) {
        fs.unlink(path, (err) => {
            if (err) throw err;
            console.log('successfully deleted file');
        });
    }
}

export default new ImageHandler();

// let testing = new ImageHandler();
// (async() => {
//     let fileName = await testing.saveImage("https://autopromoteimages.s3.us-east-2.amazonaws.com/tradenet/Payouts/postmatesFood.jpeg");
//     testing.deleteImage(fileName);
// })();
// testing.deleteImage;