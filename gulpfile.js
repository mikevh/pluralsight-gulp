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