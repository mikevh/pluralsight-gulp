module.exports = function() {
    var client = './src/client/';
    var clientApp = client + 'app/';
    var server = './src/server/';
    var temp = './.tmp/';

    var config = {
        
        /*
         * File paths
         */
        alljs: [
            './src/**/*.js', // all js files in src
            './*.js' // all js files in root
        ],
        client: client,
        css: temp + 'styles.css',
        less: client + 'styles/styles.less',
        index: client + 'index.html',
        js: [
            clientApp + '**/*.module.js',
            clientApp + '**/*.js',
            '!' + clientApp + '**/*.spec.js'
        ],
        server: server,
        temp: temp,

        /*
         * Bower & NPM locations
         */
        bower: {
            json: require('./bower.json'),
            directory: './bower_components',
            ignorePath: '../..'
        },

        /*
         * Node settings
         */
        defaultPort: 7203,
        nodeServer: './src/server/app.js'
    };

    config.getWiredepDefaultOptions = function() {
        return {
            bowerJson: config.bower.json,
            directory: config.bower.directory,
            ignorePath: config.bower.ignorePath,
            overrides: {
                bootstrap: {
                    main: [
                        'dist/js/bootstrap.min.js',
                        'dist/css/bootstrap.min.css'
                    ]
                }
            }
        };
    };

    return config;
};