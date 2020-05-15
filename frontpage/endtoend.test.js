const puppeteer = require('puppeteer');

test('Test for login', async () => {
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 30,
        args: ['--window-size=1920,1080']
    });
    const page = await browser.newPage();

    page.on('dialog', async dialog => {
        await dialog.accept();
    });

    await page.goto('http://127.0.0.1');
    await page.click('input#username_register');
    await page.type('input#username_register', 'Mulle4')
    await page.click('input#password_register');
    await page.type('input#password_register', '1234');
    await page.click('input#register_button');

    await page.click('input#username_login');
    await page.type('input#username_login', 'Mulle4');
    await page.click('input#password_login');
    await page.type('input#password_login', '1234');
    await page.click('input#loign_button');

    let genres = ["horror","action","comedy","romance","sci-fi",
    "fantasy", "thriller", "crime", "drama", "adventure", "musical", "animation",
    "children", "western", "mystery", "documentary"];

    await page.click('input#' + genres[(Math.ceil(Math.random() * 100) % 15)]);
    await page.click('input#' + genres[(Math.ceil(Math.random() * 100) % 15)]);
    await page.click('input#' + genres[(Math.ceil(Math.random() * 100) % 15)]);
    await page.click('input#Submit');


    let ratedMovies = 0;
    while(ratedMovies < 10) {
        let clickOn = (Math.ceil(Math.random() * 100) % 5);
        console.log("hans " + clickOn);

        if(clickOn != 0) {
            ratedMovies++;
            await page.click('label#\\3' + clickOn);
        }else{
            await page.click('input#\\3' + clickOn);
        }

        //await delay(2000);
    }
  

  
    

}, 100000)


function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
 }