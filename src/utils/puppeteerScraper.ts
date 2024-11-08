import puppeteer from 'puppeteer';

let browser: any = null;

async function getBrowser() {
    if (!browser) {
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1920x1080'
            ]
        });
    }
    return browser;
}

export async function fetchWithPuppeteer(url: string) {
    const browser = await getBrowser();
    const page = await browser.newPage();

    try {
        // Set user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36');

        // Set extra headers
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        });

        // Navigate to URL
        await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // Wait for content to load
        await page.waitForSelector('body');

        // Get page content
        const content = await page.content();

        return content;
    } catch (error) {
        console.error('Puppeteer error:', error);
        throw error;
    } finally {
        await page.close();
    }
}

// Clean up browser on process exit
process.on('exit', async () => {
    if (browser) {
        await browser.close();
    }
}); 