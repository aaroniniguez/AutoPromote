import axios from 'axios';
import fs from "fs";
import { create } from 'domain';
//create temp folder for images
function createImageName(url: string) {
   return url.replace("https://autopromoteimages.s3.us-east-2.amazonaws.com/", "").replace(/\//g, '-');
}
let imageUrl = "https://autopromoteimages.s3.us-east-2.amazonaws.com/tradenet/Payouts/AprilPayout.png";
axios.get(imageUrl, {responseType: 'stream'})
    .then(async function (response) {
        let filestream = fs.createWriteStream(createImageName(imageUrl));
        response.data.pipe(filestream);
        response.data.on('end', () => {
            console.log('done..');
            fs.unlink(createImageName(imageUrl), (err) => {
                if (err) throw err;
                console.log('successfully deleted file');
            });
        });
    })
    .catch(e => {console.log(e)});
