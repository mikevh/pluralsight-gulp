module.exports = function() {
    var client = './src/client/';

    var config = {
        
        /*
         * File paths
         */
        alljs: [
            './src/**/*.js', // all js files in src
            './*.js' // all js files in root
        ],
        less: client + 'styles/styles.less',
        temp: './.tmp/'
    };

    return config;
};