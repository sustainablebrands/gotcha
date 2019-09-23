import chalk from 'chalk';
import puppeteer from 'puppeteer';
import process from 'process';
import console from 'console';
import slugify from 'slugify';
import Sitemapper from 'sitemapper';
import { URL } from 'url';
import fse from 'fs-extra';

function cleanURLToFileSystem(theURL) {
    let urlObject = new URL(theURL);
    let segments = urlObject.pathname.split('/');
    
    // Loop through and kill all the empty ones.
    for (var i = 0; i < segments.length; i++) {
        if (segments[i] === '') {
            segments.splice(i, 1);
            i--;
        }
    }
    const file = slugify(segments.pop()).replace('.', '-');
    let path = '';
    switch (segments.length) {
        case 0:
            path = '';
            break;
        case 1:
            path = segments[0];
            break;
        default:
            path = segments.join('/');
    }
    return {
        host: urlObject.host,
        path: path,
        file: file,
    };
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
    let fsdata = cleanURLToFileSystem(options.url);
    fsdata.path = options.directory + '/' + fsdata.host + '/' + fsdata.path;
    if (fsdata.file.length == 0) {
        fsdata.file = 'root.png';
    } else {
        fsdata.file = fsdata.file + ".png";
    }
    fsdata.fullpath = (fsdata.path + '/' + fsdata.file).replace('//', '/');

    fse.ensureDirSync(fsdata.path);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({
        width: 1440,
        height: 900,
    });
    await page.goto(options.url, {"waitUntil" : "networkidle2"});
    await page.screenshot({
        path: fsdata.fullpath,
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