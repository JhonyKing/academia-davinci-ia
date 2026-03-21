const fs = require('fs');
const https = require('https');
const path = require('path');

const logoUrl = "https://scontent.fntr5-1.fna.fbcdn.net/v/t39.30808-6/518295447_24124124717228130_5862851974391200831_n.jpg?stp=c0.141.1284.1284a_dst-jpg_s160x160_tt6&_nc_cat=111&ccb=1-7&_nc_sid=8a6525&_nc_ohc=O5es_iYVCF0Q7kNvwFTSzFG&_nc_oc=AdmsVAZ-cYca2rjxs54fE3UJIHTFdwVtcDf2Sap8-_t-02t3_gkVP90r5LY3Oo9Dll0&_nc_zt=23&_nc_ht=scontent.fntr5-1.fna&_nc_gid=k2vbVuEDb8eJO_8o6vyx2Q&oh=00_AfppUnFYeLOmaVZYfAt0XQZX6F9SCgV_8cqnWk-LCsGX-A&oe=697C93CF";
const imageUrl = "https://scontent.fntr5-1.fna.fbcdn.net/v/t39.30808-6/476298639_613173488024943_50301050955146684_n.jpg?stp=dst-jpg_s960x960_tt6&_nc_cat=111&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=53S29zd2JUEQ7kNvwECaiBa&_nc_oc=AdlU4aCkkaGyv2R8zgUhNJ3-3DbTzu9D8jPhwenjigAV-jG6IzCijhJjec3N02CdFak&_nc_zt=23&_nc_ht=scontent.fntr5-1.fna&_nc_gid=k2vbVuEDb8eJO_8o6vyx2Q&oh=00_AfoBT1x0O9Gg6io8l_YrwygWtuut_oVBkuvsMzym_qeiBg&oe=697CA1A0";

const download = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
};

const main = async () => {
    try {
        await download(logoUrl, path.join(__dirname, '../public/assets/cuarto_amarillo/logo.jpg'));
        console.log('Downloaded logo.jpg');
        await download(imageUrl, path.join(__dirname, '../public/assets/cuarto_amarillo/image1.jpg'));
        console.log('Downloaded image1.jpg');
    } catch (error) {
        console.error('Error downloading:', error);
    }
};

main();
