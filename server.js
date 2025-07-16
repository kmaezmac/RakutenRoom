const puppeteer = require("puppeteer-core");
const express = require("express");
require('dotenv').config();
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 8080;

const sleep = milliseconds =>
  new Promise(resolve =>
    setTimeout(resolve, milliseconds)
  );

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
      }
    }
  }).catch((error) => {
    console.log(error);
    return;
  });
}

async function post(itemCode, description, itemName, catchcopy, userId, password) {
  try {
    const browser = await puppeteer.launch({
      headless: true, 
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome-stable',
      defaultViewport: {
        width: 1000, height: 800
      },
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
        "--disable-features=site-per-process",
        "--disable-dev-shm-usage"
      ],
    });
    
    const page = await browser.newPage();

    const url = `https://room.rakuten.co.jp/mix?itemcode=${itemCode}&scid=we_room_upc60`;
    console.log("ああああ");
    console.log(url);
    
    await page.setDefaultNavigationTimeout(30000);
    await page.goto(url);
    console.log("いいいい");
    
    console.log("あかさたな" + userId, password)
    const xpathId = "xpath=/html/body/form/div/div[3]/div/div/div/div[2]/div/div/div[2]/div[2]/div/div/div[1]/div/label/div/input"
    await page.waitForSelector(xpathId, {visible: true});
    await page.focus(xpathId);
    await page.type(xpathId, userId);
    await page.click('xpath=/html/body/form/div/div[3]/div/div/div/div[2]/div/div/div[2]/div[4]');
    const xpathPassword = "xpath=/html/body/form/div/div[3]/div/div/div/div[2]/div/div/div[2]/div[2]/div/div[1]/div/div/div/label/div/input"
    await page.waitForSelector(xpathPassword, {timeout: 5000});
    await page.focus(xpathPassword);
    await page.type(xpathPassword, password);
    await page.click("xpath=/html/body/form/div/div[3]/div/div/div/div[2]/div/div/div[2]/div[5]");
    console.log("うううう");
    
    await page.waitForSelector("#collect-content", {
      visible: true,
    });
    console.log("ええええ");

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
    
    await page.waitForSelector("#collect-content", {
      visible: true,
    });
    await page.click("#collect-content");
    await page.type("#collect-content", descriptionCut);

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

app.get("/", async (req, res) => {
  try {
    var args = [20, 30, 40];
    var age = args[Math.floor(Math.random() * args.length)];
    
    var random = Math.floor(Math.random() * 34) + 1;
    var requestUrl = "https://app.rakuten.co.jp/services/api/IchibaItem/Ranking/20220601?applicationId=" + process.env.RAKUTEN_APP_ID
      + "&age=" + age + "&sex=1&carrier=0&page=" + random;
    const userId = process.env.RAKUTEN_USER_ID;
    const password = process.env.RAKUTEN_PASSWORD;
    await test(requestUrl, userId, password);
    
    var random2 = Math.floor(Math.random() * 34) + 1;
    var requestUrl2 = "https://app.rakuten.co.jp/services/api/IchibaItem/Ranking/20220601?applicationId=" + process.env.RAKUTEN_APP_ID2
      + "&age=" + age + "&sex=1&carrier=0&page=" + random2;
    const userId2 = process.env.RAKUTEN_USER_ID2;
    const password2 = process.env.RAKUTEN_PASSWORD2;
    await test(requestUrl2, userId2, password2);
    
    res.status(200).json({ message: 'スクレイピング完了' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'エラーが発生しました' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});