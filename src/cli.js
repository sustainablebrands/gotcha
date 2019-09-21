import arg from 'arg';
import inquirer from 'inquirer';
import { doScreengrab } from './main';

function parseArgumentsIntoOptions(rawArgs) {
    const args = arg({}, {argv: rawArgs.slice(2),});
    return {
        url: args._[0],
    };
}

async function promptForMissingOptions(options) {
    const questions = [];
    if (!options.url) {
        questions.push({
            type: 'input',
            name: 'url',
            message: 'Please provide a URL to capture',
        });
    }

    const answers = await inquirer.prompt(questions);
    return {
        ...options,
        url: options.url || answers.url,
    };
}

export async function cli(args) {
    let options = parseArgumentsIntoOptions(args);
    options = await promptForMissingOptions(options);
    await doScreengrab(options);
}