import arg from 'arg';
import inquirer from 'inquirer';
import { mainRoutine } from './main';

function parseArgumentsIntoOptions(rawArgs) {
    const args = arg({
        '--sitemap': Boolean,
        '--url': Boolean,
        '-m': '--sitemap',
        '-u':  '--url',
    }, {
        argv: rawArgs.slice(2),
    });
    let rv = {
        url: args._[0],
    };
    if (args['--sitemap']) {
        rv.mode = 'sitemap';
    }
    if (args['--url']) {
        rv.mode = 'url';
    }
    return rv;
}

async function promptForMissingOptions(options) {
    const questions = [];
    const defaultMode = 'url';

    if (!options.url) {
        questions.push({
            type: 'input',
            name: 'url',
            message: 'Please provide a URL to capture',
        });
    }

    if (!options.mode) {
        questions.push({
            type: 'list',
            name: 'mode',
            message: 'What kind of URL is this?',
            choices: [
                {
                    name: 'A Sitemap URL',
                    value: 'sitemap',
                },
                {
                    name: 'A Single URL to Capture',
                    value: 'url',
                }
            ],
            default: defaultMode,
        });
    }

    const answers = await inquirer.prompt(questions);
    
    return {
        ...options,
        url: options.url || answers.url,
        mode: options.mode || answers.mode,
    };
}

export async function cli(args) {
    let options = parseArgumentsIntoOptions(args);
    options = await promptForMissingOptions(options);
    await mainRoutine(options);
}