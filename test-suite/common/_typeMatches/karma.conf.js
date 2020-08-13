process.env.CHROME_BIN = require('puppeteer').executablePath();

function getBrowser() {
    for (let i = 0; i < process.argv.length; i++) {
        let arg = process.argv[i];
        if (arg.indexOf('--debug') >= 0) {
            return 'ChromeDebugging';
        }
    }
    return 'ChromeHeadless';
}

module.exports = function (config) {
    config.set({
        basePath: '.',
        specReporter: {
            suppressSkipped: true      // do not print information about skipped tests 
        },
        frameworks: ['browserify', 'karma-typescript', 'jasmine-ajax', 'jasmine', 'jasmine-matchers'],
        exclude: [
            'source/modules/Q_sessionrecorder/_old/**/*.spec.js'
        ],
        files: [
            //'source/**/!(index-*).ts',
            'source/modules/Q_sessionrecorder/transmitter/**/*.spec.js',
            //'source/modules/D_sessionrecorderworker/**/*.spec.js'
        ],
        reporters: ['spec', /*'coverage'*/ 'nunit', 'karma-typescript'],
        preprocessors: {
            'source/**/!(index-*).ts': 'karma-typescript',
            'source/modules/Q_sessionrecorder/**/*.spec.js': ['browserify'],
            'source/modules/D_sessionrecorderworker/**/*.spec.js': ['browserify']
        },
        nunitReporter: {
            outputFile: 'nunitresults.xml',
            suite: ''
        },
        coverageReporter: {
            type: 'text-summary'
        },
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        captureTimeout: 120000,
        /*
        client: {
            captureConsole: false
        },*/
        autoWatch: false,
        browsers: [getBrowser()],
        customLaunchers: {
            ChromeDebugging: {
                base: 'Chrome',
                flags: ['--remote-debugging-port=9333']
            }
        },
        browserNoActivityTimeout: 120000,
        singleRun: true,
        karmaTypescriptConfig: {
            compilerOptions: {
                types: ["jasmine", "jasmine-expect", "jasmine-ajax"]
            },
            remapOptions: {
                exclude: /.*\.js/,
                warn: function () { }
            },
            bundlerOptions: {
                entrypoints: /.*spec\.ts/,
                resolve: {
                    directories: ['node_modules', 'source/core/initCode', 'source/core/asyncCore']
                },
                sourceMap: true
            },
            exclude: [
                'tools/**/*.ts',
                'source/**/index-*.ts'
            ],
            coverageOptions: {
                exclude: [/\.spec\.ts$/i, /.*node_modules.*/]
            }
        },
        browserify: {
            debug: true,
            configure: function (bundle) {
                bundle.once('prebundle', function () {
                    bundle
                        .transform('babelify', {
                            'plugins': [
                                'add-module-exports',
                                'transform-es2015-modules-commonjs',
                                'transform-async-to-generator',
                                'transform-class-properties'
                            ]
                        })
                        .plugin('proxyquireify/plugin')
                        .transform('browserify-istanbul', {
                            ignore: ['**/*.spec.js']
                        });
                });
            }
        }
    });
};
