var gulp = require('gulp');
var args = require('yargs').argv;
var del = require('del');
var $ = require('gulp-load-plugins')({lazy: true});
var config = require('./gulp.config')();

gulp.task('vet', function() {
    log('Analyzing source with JSHint and JSCS');
    return gulp.src(config.alljs)
    .pipe($.if(args.verbose, $.print()))
    .pipe($.jscs())
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish', {verbose: true}))
    .pipe($.jshint.reporter('fail'));
});

gulp.task('styles', ['clean-styles'], function() {
    log('Compiling LESS --> CSS');

    return gulp.src(config.less)
    .pipe($.plumber()) // error display
    .pipe($.less())
    .pipe($.autoprefixer({browsers: ['last 2 versions', '> 5%']}))
    .pipe(gulp.dest(config.temp));
});

gulp.task('clean-styles', function(done) {
    var files = config.temp + '**/*.css';
    clean(files, done);
});

gulp.task('less-watcher', function() {
    gulp.watch([config.less], ['styles']);
});

gulp.task('wiredep', function() {
    log('Wire up the bower CSS JS and the app js into the html');
    var options = config.getWiredepDefaultOptions();
    var wiredep = require('wiredep').stream;

    return gulp.src(config.index) // get the index file
        .pipe(wiredep(options)) // wire in all bower dependencies in index.html between <!-- bower:css --> and <!-- bower:js --> tags
        .pipe($.inject(gulp.src(config.js))) // get all .js files from config.js locs, add script tags in the <!-- inject:js --> tag
        .pipe(gulp.dest(config.client)); // write out updated index file to config.client location
});

gulp.task('inject', ['wiredep', 'styles'], function() {
    log('Wire up the bower CSS JS and the app js into the html');

    return gulp.src(config.index) // get index.html
        .pipe($.inject(gulp.src(config.css))) // get the .css files and wire up their locations
        .pipe(gulp.dest(config.client)); // write out to client location
});


/////

function clean(path, done) {
    log('Cleaning: ' + $.util.colors.blue(path));
    del(path);
    done();
}

function log(msg) {
    if(typeof(msg) === 'object') {
        for(var item in msg) {
            if(msg.hasOwnProperty(item)) {
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    }
    else {
        $.util.log($.util.colors.blue(msg));
    }
}