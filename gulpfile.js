var gulp = require('gulp');
var args = require('yargs').argv;
var browserSync = require('browser-sync');
var del = require('del');
var $ = require('gulp-load-plugins')({lazy: true});
var config = require('./gulp.config')();
var port = process.env.PORT || config.defaultPort;

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

gulp.task('serve-dev', ['inject'], function() {
    var isDev = true;

    var nodeOptions = {
        script: config.nodeServer,
        delayTime: 1,
        env: {
            'PORT': port,
            'NODE_ENV': isDev ? 'dev' : 'build'
        },
        watch: [config.server]
    };

    return $.nodemon(nodeOptions)
        .on('restart', ['vet'], function(ev) {
            log('** nodemon restarted');
            log('files changed on restart:\n' + ev);
            setTimeout(function() {
                browserSync.notify('Reloading ...');
                browserSync.reload({stream: false});
            }, config.browserReloadDelay);
        })
        .on('start', function() {
            log('** nodemon started');
            startBrowserSync();
        })
        .on('crash', function() {
            log('** nodemon crashed: script crashed for some reason');
        })
        .on('exit', function() {
            log('** nodemon exited ok');
        });
});

/////

function changeEvent(event) {
    var srcPattern = new RegExp('/.*(?=/' + config.source + ')/');
    log('File ' + event.path.replace(srcPattern, '') + ' ')
}

function startBrowserSync() {
    if(args.nosync || browserSync.active) {
        return;
    }
    
    log('Starting browser-sync on port ' + port);

     gulp.watch([config.less], ['styles'])
         .on('change', function(event) { changeEvent(event); });

    var options = {
        proxy: 'localhost:' + port,
        port: 3000,
        files: [
            config.client + '**/*.*',
            '!' + config.less,
            config.temp + '**/*.css'
        ],
        ghostMode: {
            clicks: true,
            location: false,
            forms: true,
            scroll: true
        },
        injectChanges: true,
        logFileChange: true,
        logLevel: 'debug',
        logPrefix: 'browsersync',
        notify: true,
        reloadDelay: 0
    };

    browserSync(options);
}

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