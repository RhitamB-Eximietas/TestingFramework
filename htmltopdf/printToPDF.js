const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--start-maximized'
        ]
    });
    const page = await browser.newPage();

    await page.setViewport({
        width: 991,
        height: 544
    });

    const filePath = path.join(__dirname, 'index.html');

    await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0' });

    await sleep(2000);

    const title = await page.title();

    const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    const outputDir = path.resolve(__dirname, '..', 'PDF_Report');

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const uniqueId = uuidv4();

    const pdfPath = path.join(outputDir, `${sanitizedTitle}_${timestamp}_${uniqueId}.pdf`);

    const pdf = await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
    });

    await browser.close();
    return pdf;
})();
