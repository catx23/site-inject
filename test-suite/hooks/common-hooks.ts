import { Before, BeforeAll, AfterAll, setWorldConstructor, setDefaultTimeout } from 'cucumber';
import { buildLogger, getLogger, ILogger } from '../loggers/common-logger';
import { NoOpLogger } from '../loggers/no-op-logger';
import { SimpleLogger } from '../loggers/simple-logger';
import { cliArgs, ICliArgs } from './command-line-args';
import { getScope } from '../common/Scope';
import { maxSessionWaitingTime } from '../common';

setDefaultTimeout(maxSessionWaitingTime);

const World = function () {
    const world = getScope(cliArgs);
    return world;
}
setWorldConstructor(World);

// tslint:disable:only-arrow-functions                                                                                                                                                                                                                                                  
Before({ tags: '@ignore' }, async function () {
    return 'skipped';
});

Before({ tags: '@debug' }, async function () {
    this.debug = true;
});



/**
 * Before each scenario hook
 */
Before({ tags: '@simpleLogger' }, async function () {
    this.context = {
        ...this.context,
        cliArgs,
        logger: getLogger('@simpleLogger'),
    };
});

/**
 * Before each scenario hook
 */
Before({ tags: '@simpleLogger and @debug' }, async function () {
    this.context = {
        ...this.context,
        cliArgs,
        logger: getLogger('@simpleLogger@verbose'),
    };
});

BeforeAll(async function () {
    await getScope(cliArgs).init();
    buildLogger(SimpleLogger)
        .withName('@simpleLogger')
        .withLevel(cliArgs.logLevel);
    buildLogger(SimpleLogger)
        .withName('@simpleLogger@verbose')
        .withLevel('verbose');
    buildLogger(NoOpLogger)
        .withName('@noOpLogger');
});

AfterAll(async function () {
    if (getScope().args.close !== 'false') {
        await getScope().browser.close();
        console.log('did shutdown browser');
    }
})

export interface ICommonContext {
    cliArgs: ICliArgs;
    logger: ILogger;
}
