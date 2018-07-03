import { createInterface, ReadLine } from 'readline';
import { Page } from 'puppeteer';
import chalk from 'chalk';



export const rl = (prompt: string, onLine?: (line: string) => void, onClose?: () => {}) => {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: chalk.green(prompt)
    })
    console.log('start stdin: ' + prompt);
    rl.prompt()
    rl.on('line', (line) => {
        if(!line){
            return;
        }
        try {
            onLine(line);
        } catch (e) {
            console.error(e)
            rl.prompt()
        }
    })
    rl.on('close', () => {
        rl.close()
        onClose();
    });
    return rl;
}