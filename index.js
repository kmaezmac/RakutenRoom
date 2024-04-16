const puppeteer = require("puppeteer");
const express = require("express");

const userId = process.env.RAKUTEN_USER_ID
const password = process.env.RAKUTEN_PASSWORD;

async function test(){
    const browser = await puppeteer.launch({ headless: "new", defaultViewport:{
        width:800,height:1600
    }});
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
    );
    const itemCode = "mywit:10008207"
    const url = `https://room.rakuten.co.jp/mix?itemcode=${itemCode}&scid=we_room_upc60`;

    console.log(url);
    
    await page.goto(url, { waitUntil: 'networkidle0' });

    // ログイン処理
    await page.waitForSelector("#loginInner_u", { visible: true });
    await page.type("#loginInner_u", userId);
    await page.waitForSelector("#loginInner_p", { visible: true });
    await page.type("#loginInner_p", password);
    await page.click('input[value="ログイン"]');
    console.log("いいいい");
    // ログイン後のページ遷移を待つ
    await page.waitForSelector("#collect-content", {
      visible: true,
    });
    
    
    const productDescription500 = "これはテストです"
    await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
    console.log(productDescription500);
    //　投稿処理
    await page.waitForSelector("#collect-content", {
      visible: true,
    });
    await page.click("#collect-content");
    await page.type("#collect-content", productDescription500, { delay: 1000 });
    
    await page.waitForSelector("button", { visible: true });
    const buttonToClick = await page.click('xpath=//*[@id="scroller"]/div[4]/div[6]/div[1]/button',{
        visible: true,
      });
    console.log("ああああ");
    // if (buttonToClick.length > 0) {
    //   // @ts-ignore
    //   console.log("あああ")
    //   await buttonToClick[0].click();
    //   console.log("3:" + new Date().toLocaleString());
    //   await page.waitForTimeout(500);
    // }
    
    await browser.close();
}

app.get("/", (req, res) => {
    try {
        test()
        console.log("ログ定期実行")

    } catch (err) {
        console.log(err);
    }
    res.send('get');
});

const app = express();
const PORT = process.env.PORT || 3000;
app.listen(PORT);