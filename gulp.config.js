module.exports = function() {
    var config = {
        // all js to vet
        alljs: [
        './src/**/*.js', // all js files in src
        './*.js' // all js files in root
        ]
    };

    return config;
};