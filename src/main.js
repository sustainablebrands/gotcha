import chalk from 'chalk';
import puppeteer from 'puppeteer';
import process from 'process';
import console from 'console';
import slugify from 'slugify';
import Sitemapper from 'sitemapper';
import { URL } from 'url';

/**
 * A (somewhat sloppy) 'slugify' implmentation to make URLs safe(r) to appear
 * in a filename.
 * 
 * - Runs through slugify().
 * - Removes forward slashes with '-'
 * - Removes the lead and ending '-', né '/'.
 * 
 * @param String theURL 
 */
function cleanUrlForFilename(theURL) {
    let workingurl = new URL(theURL);
    workingurl = workingurl.pathname;
    if (null == workingurl) {
        return Date.now() + "_unknownpath";
    }
    workingurl = workingurl.replace(/\//g, '-').substring(1, workingurl.length);
    if (workingurl.substring(workingurl.length-1) == '-') {
        workingurl = workingurl.substring(0, workingurl.length-1);
    }
    return slugify(
        workingurl,
        {
            remove: /[*+~.()'"!:@]/g,
            lower: true,
            replacement: '-',
        }
    );
}

/**
 * Automates the capture of an entire sitemap file by retrieving it, and then
 * stepping through each item, calling getByURL().
 * 
 * @param {*} options 
 */
async function getBySitemap(options) {
    console.log('-> Fetching sitemap at %s...', chalk.blue(options.url));
    let sitemap = new Sitemapper({
        url: options.url,
        timeout: 15000,
    });
    sitemap.fetch()
        .then(
            async function(data) {
                console.log(chalk.green('OK'));
                var len = data.sites.length;
                console.log('Processing %s URLs...', len);
                for (var i = 0; i < len; i++) {
                    options.url = data.sites[i];
                    await getByURL(options);
                }
            }
        ).catch(
            function(error){
                console.log(error);
            }
        );

}

/**
 * Takes the options object and extracts the URL to a png.
 * 
 * @param {*} options 
 */
async function getByURL(options) {
    console.log('-> Capturing %s...', options.url);
    const filename = cleanUrlForFilename(options.url) + ".png";
    const path = options.directory + '/' + filename;

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

/**
 * The main routing that determines whether we want to grab a single URL, or a
 * full sitemap.
 * 
 * @param {*} options 
 */
export async function mainRoutine(options) {
    options = {
        ...options,
        directory: process.cwd(),
    };
    
    switch (options.mode) {
        case 'url': 
            await getByURL(options);
            break;
        case 'sitemap':
            await getBySitemap(options);
            break;
        default:
            console.log('Make sure to enter a URL and choose how to capture it.');
    }
}