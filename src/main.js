import chalk from 'chalk';
import puppeteer from 'puppeteer';
import process from 'process';
import console from 'console';
import slugify from 'slugify';

export async function doScreengrab(options) {
    options = {
        ...options,
        directory: process.cwd(),
    };
    console.log('-> Capturing %s...', options.url);
    const filename = slugify(options.url)
        .replace(':','')
        .replace('/', '')
        .replace('https','')
        .replace('http','') + '.png';
    const path = options.directory + '/' + filename;
    console.log('-> Saving to %s', chalk.blue(path));

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({
        width: 1440,
        height: 900,
    });
    await page.goto(options.url);
    await page.screenshot({
        path: path,
        fullPage: true,
    });
    await browser.close();

}