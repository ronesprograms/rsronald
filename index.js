const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const puppeteer = require('puppeteer');


var aes = require("crypto-js/aes");
var encHex = require("crypto-js/enc-hex");
var padZeroPadding = require("crypto-js/pad-zeropadding");
var CryptoJS = require("crypto-js");

const app = express();
// const port = 8080;

app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var browser
var page
const xx = async function edmi() {
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36');
    await page.goto('https://e-consultaruc.sunat.gob.pe/cl-ti-itmrconsruc/FrameCriterioBusquedaWeb.jsp');
}()

// app.get('/ruc/:numero', async function (req, res) {
app.get('/', async function (req, res) {
    try {
        // const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        // const page = await browser.newPage();
        // await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36');
        // await page.goto('https://e-consultaruc.sunat.gob.pe/cl-ti-itmrconsruc/FrameCriterioBusquedaWeb.jsp');


        // let nroruc = req.get('authorization')
        // let nroruc = req.params.numero
        // let ruc = desencriptar(nroruc)
        // let ruc = nroruc
        let ruc = "20607574252"
        // console.log(ruc)
        if (!(ruc.length == 11 && !isNaN(ruc))) {
            res.send(JSON.stringify({ "error": "Por favor, ingrese número de RUC válido.x" }))
        }


        let datos = await getDataRuc(ruc, page)

        // let datos = await getDataRuc(ruc)
        // res.send('[GET]Saludos desde express' + req.params.nroruc);
        let datos1 = JSON.stringify(datos).replace(/'/g, "\"");
        // console.log(datos1)
        page.goto('https://e-consultaruc.sunat.gob.pe/cl-ti-itmrconsruc/FrameCriterioBusquedaWeb.jsp');
        res.send(datos1)
        // res.send({"hola":"respuesta del servidor"})
    } catch (error) {
        console.log("fff" + error)

    }

});

app.listen(5000, () => {
    console.log("Running on port 5000.");
});
// app.listen(port, () => console.log(`Hello world app listening on port ${port}!`));
// Export the Express API
module.exports = app;

/**
 * desencrita el RUC que viene encriptado
 * @param {datoEncriptado} encriptado 
 * @returns datoDesencriptado
 */
function desencriptar(encriptado) {
    try {
        // let key = encHex.parse("0123456789abcdef0123456789abcdef");
        // let iv = encHex.parse("abcdef9876543210abcdef9876543210");
        let key = encHex.parse("56789abcdef0123456789abcdef01234");
        let iv = encHex.parse("abcdef9876543210abcdef9876543210");

        let decryted = aes.decrypt(encriptado, key, { iv: iv, padding: padZeroPadding }).toString(CryptoJS.enc.Utf8);
        return decryted;
    } catch (e) {
        return ""
    }
}

/**
 * scrapea la pagina de consulta de RUC de sunat.
 * @param {numero de ruc} nroRuc 
 * @returns los datos del ruc en formato json.
 */
async function getDataRuc(nroRuc, page) {

    try {
        function delay(time) {
            return new Promise(function (resolve) {
                setTimeout(resolve, time)
            });
        }
        page.on('dialog', async dialog => {
            // console.log(dialog.message());
            await dialog.dismiss();

            if (dialog.message().indexOf("número de RUC válido") >= 0) {
                // console.log("asdfasdf")
                // await page.close();
                // await browser.close();
                return ({ 'error': 'intente de nuevo' })

            }
        });
    }
    catch (e) {
        // console.log(e);

        return ("{'error': e}")
    }

    // await page.screenshot({ path: 'example2.png' });
    const title = await page.title();
    // console.log(title + " " + nroRuc);
    // functions.logger.info(title + " " + nroRuc, { structuredData: true })
    try {
        await page.waitForSelector('#txtRuc')
        await page.focus('#txtRuc')
        await page.keyboard.type(nroRuc)
    } catch (e1) {
        return ({ "error": "keyboard" })
    }

    try {
        await page.focus('#btnAceptar')
        await page.click('#btnAceptar')
    } catch (e2) {
        return ({ "error": "error click" })
    }
    // await delay(4000)
    await page.waitForSelector('.list-group')
    try {

        const extractedText = await page.$eval('*', (el) => el.innerText);
        return ({ "ruc": extractedText })

    } catch (e3) {
        return ({ "error": "listGroup" })
    }




}