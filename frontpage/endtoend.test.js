const puppeteer = require('puppeteer');

test('Test for login', async () => {
    //Makes the dummy browser from which the E2E tests are being made in. 
    const browser = await puppeteer.launch({
        headless: false, //Tells the program to run the test in a browser window
        slowMo: 80, //Tells the program to enter the input slower, giving us a chance to see what happens
        args: ['--window-size=1920,1080'] //The browser window size
    });
    const page = await browser.newPage();

    //If a message window appears while testing the website,
    page.on('dialog', async dialog => {
        await dialog.accept();
    });


    
   
    for(let i = 0; i < 2; i++) {
        await page.goto('http://127.0.0.1');

        let mulleNumber = Math.random();

        console.log("Creating account");
        await page.click('input#username_register');
        await page.type('input#username_register', 'testuser' + mulleNumber)
        await page.click('input#password_register');
        await page.type('input#password_register', '1234');
        await page.click('input#register_button');

        console.log("Logging in");
        await page.click('input#username_login');
        await page.type('input#username_login', 'testuser' + mulleNumber);
        await page.click('input#password_login');
        await page.type('input#password_login', '1234');
        await page.click('input#loign_button');

        let genres = ["horror","action","comedy","romance","sci-fi",
        "fantasy", "thriller", "crime", "drama", "adventure", "musical", "animation",
        "children", "western", "mystery", "documentary"];

        let genres_with_stor_bogstav = ["Horror","Action","Comedy","Romance","Sci-Fi",
        "Fantasy", "Thriller", "Crime", "Drama", "Adventure", "Musical", "Animation",
        "Children", "Western", "Mystery", "Documentary"];

        console.log("Picking 3 random genres from ratemovies1.html");
        await page.click('input#' + genres[(Math.ceil(Math.random() * 100) % 15)]);
        await page.click('input#' + genres[(Math.ceil(Math.random() * 100) % 15)]);
        await page.click('input#' + genres[(Math.ceil(Math.random() * 100) % 15)]);
        await page.click('input#Submit');

        
        const label1 = await page.$x('//*[@id="image_div"]/div/label[5]');
        const label2 = await page.$x('//*[@id="image_div"]/div/label[4]');
        const label3 = await page.$x('//*[@id="image_div"]/div/label[3]');
        const label4 = await page.$x('//*[@id="image_div"]/div/label[2]');
        const label5 = await page.$x('//*[@id="image_div"]/div/label[1]');
        const okButton = await page.$x('//*[@id="image_div"]/center[2]/input');
        /*
        await label1[0].click();
        console.log('1');
        await okButton[0].click();
        console.log('2');
        await label2[0].click();
        console.log('3');
        await okButton[0].click();
        console.log('4');
        await label3[0].click();
        console.log('5');
        await okButton[0].click();
        console.log('6');
        await label4[0].click();
        console.log('7');
        await okButton[0].click();
        console.log('8');
        await label5[0].click();
        console.log('9');
        await label1[0].click();
        console.log('10');
        await okButton[0].click();
        console.log('11');
        await label2[0].click();
        console.log('12');
        await okButton[0].click();
        console.log('13');
        await label4[0].click();
        console.log('14');
        await okButton[0].click();
        console.log('15');
        await label4[0].click();
        console.log('16');
        await okButton[0].click();
        console.log('17');
        await label5[0].click();
        console.log('18');
    */


        console.log("Rating 10 movies from ratemovies2.html");
        let ratedMovies = 0;
        await delay(1000);
        while(ratedMovies < 10) {
            let click_on = (Math.ceil(Math.random() * 100) % 6);
            console.log(click_on);
            
            if(click_on != 0) {
                ratedMovies++;
                await page.click('label#\\3' + click_on);
            }
            else{
                await page.click('input#\\3' + click_on);
            }
        }

        console.log("Rating 16 movies from frontpage");
        await delay(1000);
        let curr_genre = 0;
        while(curr_genre < 16 ) {
            let random_number1 = Math.ceil((Math.random() * 100) % 18);
            let random_number2 = Math.ceil((Math.random() * 100) % 5);
            console.log(random_number1,random_number2, curr_genre);
            const some_label = await page.$x('//*[@id="' + genres_with_stor_bogstav[curr_genre] + '"]/div[' + random_number1 + ']/div/div[2]/label[' + random_number2 + ']');
            await some_label[0].click();

            console.log(curr_genre);    
            curr_genre++;
            await delay(500);
        
        }

        console.log("Resetting account");
        let reset_account_button = await page.$x('/html/body/center/input');
        await reset_account_button[0].click();

        console.log("bruger nummer " + i);
    }
}, 4000000)



function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
 }