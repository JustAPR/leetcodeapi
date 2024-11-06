import express, { json } from 'express'
import puppeteer from 'puppeteer';
import cors from 'cors';
const app = express();
const port = process.env.PORT || 5000;
app.use(cors())

async function WebScarpe(username) {
    const browser = await puppeteer.launch({ headless: false});
    try {
        const page = await browser.newPage();
        page.setDefaultTimeout(15000);
        await page.goto(`https://leetcode.com/${username}/`);
        await page.waitForSelector("span[class='text-[30px] font-semibold leading-[32px]']", { visible: true });
        await page.waitForSelector("div[class='absolute inset-0']", { visible: true })
        await page.waitForSelector("span[class='ttext-label-1 dark:text-dark-label-1 font-medium']", { visible: true })
        await page.waitForSelector("span[class='font-medium text-label-2 dark:text-dark-label-2']", { visible: true })
        await page.waitForSelector("div[class='text-label-1 dark:text-dark-label-1 mt-1.5 text-2xl leading-[18px]']", { visible: true })
        await page.waitForSelector("div[class='space-x-1']", { visible: true })
        await page.waitForSelector("span[class='inline-flex items-center px-2 whitespace-nowrap text-xs leading-6 rounded-full bg-fill-3 dark:bg-dark-fill-3 cursor-pointer transition-all hover:bg-fill-2 dark:hover:bg-dark-fill-2 text-label-2 dark:text-dark-label-2']", { visible: true });
        await page.waitForSelector("span[class='pl-1 text-xs text-label-3 dark:text-dark-label-3']", { visible: true })
        await page.waitForSelector("span[class='text-label-1 dark:text-dark-label-1 line-clamp-1 font-medium'",{visible:true})
        const ProfileData = await page.evaluate(() => {
            const Attempted = document.querySelector("span[class='text-[30px] font-semibold leading-[32px]']");
            const MediumAttempted = document.querySelector("div[class='flex h-full w-[90px] flex-none flex-col gap-2']");
            const valueOfBadge = document.querySelector("div[class='text-label-1 dark:text-dark-label-1 mt-1.5 text-2xl leading-[18px]']").textContent.trim()
            const YourRank = document.querySelector("span[class='ttext-label-1 dark:text-dark-label-1 font-medium']");
            const Days = document.querySelector("span[class='font-medium text-label-2 dark:text-dark-label-2']");
            const Skills = document.querySelectorAll("span[class='inline-flex items-center px-2 whitespace-nowrap text-xs leading-6 rounded-full bg-fill-3 dark:bg-dark-fill-3 cursor-pointer transition-all hover:bg-fill-2 dark:hover:bg-dark-fill-2 text-label-2 dark:text-dark-label-2']")
            const elements = document.querySelectorAll("span.pl-1.text-xs.text-label-3.dark\\:text-dark-label-3");
            const Streak = document.querySelector("div[class='space-x-1']")
            const RecentlySolved = document.querySelectorAll("span[class='text-label-1 dark:text-dark-label-1 line-clamp-1 font-medium']")
           
            let images = []
            if (Number(valueOfBadge) !== 0) {
                const BadgesElements = document.querySelectorAll("img[class='h-full w-full cursor-pointer object-contain']");
                images = Array.from(BadgesElements).map(img => img.src);
            }
           
            const extractedNumbers = [];
            elements.forEach(element => {
                const textContent = element.textContent.trim();
                const numberOnly = textContent.match(/\d+/);
                if (numberOnly) {
                    extractedNumbers.push(Number(numberOnly[0]));
                }
            });
            return {
                TotalAttempted: Attempted ? Attempted.textContent : '',
                SectionAttempted: MediumAttempted ? MediumAttempted.textContent.match(/\d+/g).map(Number) : [],
                ProfileRank: YourRank ? Number(YourRank.textContent.replace(/,/g, ''), 10) : 0,
                ActiveDays: Days ? Number(Days.textContent) : 0,
                NumberOfBadges: valueOfBadge ? Number(valueOfBadge) : 0,
                Badges: images,
                MaxStreak: Streak ? Streak.textContent.match(/\d+/g).map(Number) : null,
                Skills: Array.from(Skills).map(skill => skill.textContent),
                elements : extractedNumbers,
                RecentlySolveds: Array.from(RecentlySolved).map(ques => ques.textContent)
            };
        });
        return ProfileData;
    }
    catch (e) {
        console.log("Error while Scrapping " + e)
        throw e;
    }
    finally {
        await browser.close();
    }

}
app.get('/scrape/:username', async (req, res) => {
    try {
        const username = req.params.username;
        const data = await WebScarpe(username);
        return res.json(data)
    }
    catch (error) {
        res.status(500).send("Cannot find for the given Username");
    }
})
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

