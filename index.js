const puppeteer = require("puppeteer-core");
const express = require("express");
require('dotenv').config();
const axios = require('axios');

var fs   = require('fs');

async function test(requestUrl, userId, password) {
  console.log(requestUrl);
  await axios.get(requestUrl, {
  }).then(async (response) => {
    if (response.status !== 201) {
      for (var i = 0; i < response.data.Items.length; i++) {
        var itemCode = response.data.Items[i].Item.itemCode;
        var itemName = response.data.Items[i].Item.itemName;
        var catchcopy = response.data.Items[i].Item.catchcopy;
        var description = response.data.Items[i].Item.itemCaption;
        console.log((i + 1).toString() + "件目スタート");
        console.log(itemCode);
        console.log(description);
        await post(itemCode, description, itemName, catchcopy, userId, password);
        console.log("完了");
        await sleep(5000)
        // break
      }
    }
  }).catch((error) => {
    console.log(error);
    return;
  });
}

// test(20);
var args = [
  20,
  30,
  40
]
var age = args[Math.floor(Math.random()* args.length)];
(async () => {
try {
  var random = Math.floor(Math.random() * 34) + 1;
  var requestUrl = "https://app.rakuten.co.jp/services/api/IchibaItem/Ranking/20220601?applicationId=" + process.env.RAKUTEN_APP_ID
  + "&age=" + age + "&sex=1&carrier=0&page=" + random;
  const userId = process.env.RAKUTEN_USER_ID
  const password = process.env.RAKUTEN_PASSWORD;
 await test(requestUrl, userId, password);
  var random2 = Math.floor(Math.random() * 34) + 1;
  var requestUrl2 = "https://app.rakuten.co.jp/services/api/IchibaItem/Ranking/20220601?applicationId=" + process.env.RAKUTEN_APP_ID2
  + "&age=" + age + "&sex=1&carrier=0&page=" + random2;
  const userId2 = process.env.RAKUTEN_USER_ID2
  const password2 = process.env.RAKUTEN_PASSWORD2;
  await test(requestUrl2, userId2, password2);
} catch (error){ 
  // var dateTime = new Date().toISOString() 
  // fs.writeFileSync("." + dateTime + '.txt', error);
}
})();




// test(40);


// function delay(time) {
//   return new Promise(function(resolve) { 
//       setTimeout(resolve, time)
//   });
// }
const sleep = milliseconds =>
  new Promise(resolve =>
    setTimeout(resolve, milliseconds)
  );

async function post(itemCode, description, itemName, catchcopy, userId, password) {
  try {
    const browser = await puppeteer.launch({
      headless: false, 
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      defaultViewport: {
        width: 1000, height: 800
      },
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
        // "--disable-features=site-per-process"
      ],
      // executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
      // executablePath: 
      //   process.env.NODE_ENV === "production"
      //     ? process.env.PUPPETEER_EXECUTABLE_PATH
      //     : puppeteer.executablePath(),
    });
    // await sleep(5000)
    // const page = await browser.newPage("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36");
    const page = await browser.newPage();
    // await page.setUserAgent(
    //   "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
    // );
    // await sleep(5000)
    // await page.setUserAgent()
    // await page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36")

    const url = `https://room.rakuten.co.jp/mix?itemcode=${itemCode}&scid=we_room_upc60`;
    console.log("ああああ");
    console.log(url);
    // await sleep(5000)
    // await page.goto(url, {waitUntil: 'networkidle0'});
    await page.setDefaultNavigationTimeout(30000);
    //await page.waitForTimeout(1000)
    await page.goto(url);
    // await sleep(5000)
    console.log("いいいい");
    // await delay(4000);
    // ログイン処理
    console.log("あかさたな" + userId, password)
    // const xpathId = "xpath=/html/body/div[2]/div/div/div[1]/div/form/div/table/tbody/tr[1]/td[2]/input";
    const xpathId = "xpath=/html/body/form/div/div[3]/div/div/div/div[2]/div/div/div[2]/div[2]/div/div/div[1]/div/label/div/input"
    // const xpathPassword = "xpath=/html/body/div[2]/div/div/div[1]/div/form/div/table/tbody/tr[2]/td[2]/input"
    await sleep(1000)
    await page.waitForSelector(xpathId, {visible: true});
    await page.focus(xpathId);
    await page.type(xpathId, userId, { delay: 50 });
    await page.click('xpath=/html/body/form/div/div[3]/div/div/div/div[2]/div/div/div[2]/div[4]');
    await sleep(5000)
    const xpathPassword = "xpath=/html/body/form/div/div[3]/div/div/div/div[2]/div/div/div[2]/div[2]/div/div[1]/div/div/div/label/div/input"
    await page.waitForSelector(xpathPassword, {timeout: 5000});
    await page.focus(xpathPassword);
    await page.type(xpathPassword, password, { delay: 50 });
    // await page.click('input[value="ログイン"]');
    await page.click("xpath=/html/body/form/div/div[3]/div/div/div/div[2]/div/div/div[2]/div[5]");
    console.log("うううう");
    // ログイン後のページ遷移を待つ
    await page.waitForSelector("#collect-content", {

      visible: true,
    });
    console.log("ええええ");

    // コレ！済みの場合は、処理を終了
    let modalElement = null;
    try {
      await page.waitForSelector(".modal-dialog-container", {
        visible: true,
        timeout: 500,
      });
      modalElement = await page.$(".modal-dialog-container");
      console.log("おおおお");
    } catch (error) { }
    if (modalElement) {
      console.log("「すでにコレしている商品です」のため処理を終了");
      await browser.close();
      return;
    }
    console.log("かかかか");
    var descriptionCut = itemName + catchcopy + description.substring(0, 200) + " #あったら便利 #欲しいものリスト #ランキング #人気 #楽天市場";
    console.log(descriptionCut);
    //　投稿処理
    await page.waitForSelector("#collect-content", {
      visible: true,
    });
    await page.click("#collect-content");
    await page.evaluate((text) => {
      const element = document.querySelector("#collect-content");
      element.value = text;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, descriptionCut);

    await page.waitForSelector("button", { visible: true });
    console.log("きききき");
    await page.click('xpath=//*[@id="scroller"]/div[4]/div[6]/div[1]/button', {
      visible: true,
    });

    await browser.close();
  } catch (error) {
    console.log(error);
    return;
  }


}


// const app = express();

// app.get("/", (req, res) => {
//     try {
//         test()
//         console.log("ログ定期実行")

//     } catch (err) {
//         console.log(err);
//     }
//     res.send('get');
// });


// const PORT = process.env.PORT || 3000;
// app.listen(PORT);