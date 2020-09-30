// Generated on 2016-06-01 using generator-angular-fullstack 3.7.4
'use strict';

import _ from 'lodash';
import del from 'del';
import gulp from 'gulp';
import grunt from 'grunt';
import path from 'path';
import gulpLoadPlugins from 'gulp-load-plugins';
import http from 'http';
import open from 'open';
import lazypipe from 'lazypipe';
import {stream as wiredep} from 'wiredep';
import nodemon from 'nodemon';
import {Server as KarmaServer} from 'karma';
import runSequence from 'run-sequence';
import {protractor, webdriver_update} from 'gulp-protractor';
import {Instrumenter} from 'isparta';

var plugins = gulpLoadPlugins();
var config;

const clientPath = require('./bower.json').appPath || 'client';
const serverPath = 'server';
const backendPath = 'backend';
const paths = {
    client: {
        assets: `${clientPath}/assets/**/*`,
        images: `${clientPath}/assets/images/**/*`,
        scripts: [
            //`${clientPath}/**/!(*.spec|*.mock).js`,
            `${clientPath}/**/*.js`,
            `!${clientPath}/bower_components/**/*`
        ],
        styles: [`${clientPath}/{styles}/**/*.scss`],
        mainStyle: `${clientPath}/styles/app.scss`,
        views: `${clientPath}/{app,components}/**/*.html`,
        mainView: `${clientPath}/index.html`,
        test: [`${clientPath}/{app,components}/**/*.{spec,mock}.js`],
        e2e: ['e2e/**/*.spec.js'],
        bower: `${clientPath}/bower_components/`
    },
	backend: {
       assets: `${backendPath}/assets/**/*`,
       images: `${backendPath}/assets/images/**/*`,
       scripts: [
           `${backendPath}/**/*.js`,
           `!${backendPath}/bower_components/**/*`,
           `!${backendPath}/assets/**/*`
       ],
       styles: [`${backendPath}/{styles}/**/*.scss`],
       mainStyle: `${backendPath}/styles/app.scss`,
       views: `${backendPath}/{app,components}/**/*.html`,
       mainView: `${backendPath}/index.html`,
       test: [`${backendPath}/{app,components}/**/*.{spec,mock}.js`],
       e2e: ['e2e/**/*.spec.js'],
       bower: `${backendPath}/bower_components/`
   },
    server: {
        scripts: [
          `${serverPath}/**/!(*.spec|*.integration).js`,
          `!${serverPath}/config/local.env.sample.js`
        ],
        json: [`${serverPath}/**/*.json`],
        test: {
          integration: [`${serverPath}/tests/**/*.integration.js`, 'mocha.global.js'],
          unit: [`${serverPath}/tests/**/*.spec.js`, 'mocha.global.js']
        }
    },
    karma: 'karma.conf.js',
    dist: 'dist'
};

/********************
 * Helper functions
 ********************/

function onServerLog(log) {
    console.log(plugins.util.colors.white('[') +
        plugins.util.colors.yellow('nodemon') +
        plugins.util.colors.white('] ') +
        log.message);
}

function checkAppReady(cb) {
    var options = {
        host: 'localhost',
        port: config.port
    };
    http
        .get(options, () => cb(true))
        .on('error', () => cb(false));
}

// Call page until first success
function whenServerReady(cb) {
    var serverReady = false;
    var appReadyInterval = setInterval(() =>
        checkAppReady((ready) => {
            if (!ready || serverReady) {
                return;
            }
            clearInterval(appReadyInterval);
            serverReady = true;
            cb();
        }),
        100);
}

function sortModulesFirst(a, b) {
    var module = /\.module\.js$/;
    var aMod = module.test(a.path);
    var bMod = module.test(b.path);
    // inject *.module.js first
    if (aMod === bMod) {
        // either both modules or both non-modules, so just sort normally
        if (a.path < b.path) {
            return -1;
        }
        if (a.path > b.path) {
            return 1;
        }
        return 0;
    } else {
        return (aMod ? -1 : 1);
    }
}

/********************
 * Reusable pipelines
 ********************/

let lintClientScripts = lazypipe()
    .pipe(plugins.jshint, `${clientPath}/.jshintrc`)
    .pipe(plugins.jshint, `${backendPath}/.jshintrc`)
    .pipe(plugins.jshint.reporter, 'jshint-stylish');

let lintServerScripts = lazypipe()
    .pipe(plugins.jshint, `${serverPath}/.jshintrc`)
    .pipe(plugins.jshint.reporter, 'jshint-stylish');

let lintServerTestScripts = lazypipe()
    .pipe(plugins.jshint, `${serverPath}/.jshintrc-spec`)
    .pipe(plugins.jshint.reporter, 'jshint-stylish');

let styles = lazypipe()
    .pipe(plugins.sourcemaps.init)
    .pipe(plugins.sass)

    .pipe(plugins.autoprefixer, {browsers: ['last 1 version']})
    .pipe(plugins.sourcemaps.write, '.');

let transpileClient = lazypipe()
    .pipe(plugins.sourcemaps.init)
    .pipe(plugins.babel)
    .pipe(plugins.sourcemaps.write, '.');

let transpileServer = lazypipe()
    .pipe(plugins.sourcemaps.init)
    .pipe(plugins.babel, {
        plugins: [
            'transform-class-properties',
            'transform-runtime'
        ]
    })
    .pipe(plugins.sourcemaps.write, '.');

let mocha = lazypipe()
    .pipe(plugins.mocha, {
        reporter: 'spec',
        timeout: 5000,
        require: [
            './mocha.conf'
        ]
    });

let istanbul = lazypipe()
    .pipe(plugins.istanbul.writeReports)
    .pipe(plugins.istanbulEnforcer, {
        thresholds: {
            global: {
                lines: 80,
                statements: 80,
                branches: 80,
                functions: 80
            }
        },
        coverageDirectory: './coverage',
        rootDirectory : ''
    });

/********************
 * Env
 ********************/

gulp.task('env:all', () => {
    let localConfig;
    try {
        localConfig = require(`./${serverPath}/config/local.env`);
    } catch (e) {
        localConfig = {};
    }
    plugins.env({
        vars: localConfig
    });
});
gulp.task('env:test', () => {
    plugins.env({
        vars: {NODE_ENV: 'test'}
    });
});
gulp.task('env:prod', () => {
    plugins.env({
        vars: {NODE_ENV: 'production'}
    });
});

/********************
 * Tasks
 ********************/

gulp.task('inject', cb => {
    runSequence(['inject:js', 'inject:css', 'inject:scss'], cb);
});

gulp.task('inject:js', () => {
    return gulp.src(paths.client.mainView)
        .pipe(plugins.inject(
            gulp.src(_.union(paths.client.scripts, [`!${clientPath}/**/*.{spec,mock}.js`, `!${clientPath}/app/app.js`]), {read: false})
                .pipe(plugins.sort(sortModulesFirst)),
            {
                starttag: '<!-- injector:js -->',
                endtag: '<!-- endinjector -->',
                transform: (filepath) => '<script src="' + filepath.replace(`/${clientPath}/`, '') + '"></script>'
            }))
        .pipe(gulp.dest(clientPath));
});

gulp.task('inject:css', () => {
    return gulp.src(paths.client.mainView)
        .pipe(plugins.inject(
            gulp.src(`${clientPath}/{app,components}/**/*.css`, {read: false})
                .pipe(plugins.sort()),
            {
                starttag: '<!-- injector:css -->',
                endtag: '<!-- endinjector -->',
                transform: (filepath) => '<link rel="stylesheet" href="' + filepath.replace(`/${clientPath}/`, '').replace('/.tmp/', '') + '">'
            }))
        .pipe(gulp.dest(clientPath));
});

gulp.task('inject:scss', () => {
    return gulp.src(paths.client.mainStyle)
        .pipe(plugins.inject(
            gulp.src(_.union(paths.client.styles, ['!' + paths.client.mainStyle]), {read: false})
                .pipe(plugins.sort()),
            {
                transform: (filepath) => {
                    let newPath = filepath
                        .replace(`/${clientPath}/app/`, '')
                        .replace(`/${clientPath}/components/`, '../components/')
                        .replace(/_(.*).scss/, (match, p1, offset, string) => p1)
                        .replace('.scss', '');
                    return `@import '${newPath}';`;
                }
            }))
        .pipe(gulp.dest(`${clientPath}/app`));
});

gulp.task('styles', cb => runSequence(['styles:client', 'styles:backend'], cb));

gulp.task('styles:client', () => {
    return gulp.src(paths.client.mainStyle)
        .pipe(styles())
        .pipe(gulp.dest('.tmp/app'));
});

gulp.task('styles:backend', () => {
    return gulp.src(paths.backend.mainStyle)
        .pipe(styles())
        .pipe(gulp.dest('.tmpbackend/app'));
});

gulp.task('transpile:client', cb => runSequence(['transpile:client:client', 'transpile:client:backend'], cb));

gulp.task('transpile:client:client', () => {
    return gulp.src(paths.client.scripts)
        .pipe(transpileClient())
        .pipe(gulp.dest('.tmp'));
});
gulp.task('transpile:client:backend', () => {
    return gulp.src(paths.backend.scripts)
        .pipe(transpileClient())
        .pipe(gulp.dest('.tmpbackend'));
});

gulp.task('transpile:server', () => {
    return gulp.src(_.union(paths.server.scripts, paths.server.json))
        .pipe(transpileServer())
        .pipe(gulp.dest(`${paths.dist}/${serverPath}`));
});

gulp.task('lint:scripts', cb => runSequence(['lint:scripts:client', 'lint:scripts:server'], cb));

gulp.task('lint:scripts:client', () => {
    return gulp.src(_.union(
        paths.client.scripts,
        _.map(paths.client.test, blob => '!' + blob),
        [`!${clientPath}/app/app.constant.js`]
    ))
        .pipe(lintClientScripts());
});

gulp.task('lint:scripts:server', () => {
    return gulp.src(_.union(paths.server.scripts, _.map(paths.server.test, blob => '!' + blob)))
        .pipe(lintServerScripts());
});

gulp.task('lint:scripts:clientTest', () => {
    return gulp.src(paths.client.test)
        .pipe(lintClientScripts());
});

gulp.task('lint:scripts:serverTest', () => {
    return gulp.src(paths.server.test)
        .pipe(lintServerTestScripts());
});

gulp.task('jscs', () => {
  return gulp.src(_.union(paths.client.scripts, paths.server.scripts))
      .pipe(plugins.jscs())
      .pipe(plugins.jscs.reporter());
});

gulp.task('clean:tmp', cb => runSequence(['clean:tmp:client', 'clean:tmp:backend'], cb));
gulp.task('clean:tmp:client', () => del(['.tmp/**/*'], {dot: true}));
gulp.task('clean:tmp:backend', () => del(['.tmpbackend/**/*'], {dot: true}));

gulp.task('start:client', cb => {
    whenServerReady(() => {
        open('http://localhost:' + config.port);
        cb();
    });
});

gulp.task('start:server', () => {
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';
    config = require(`./${serverPath}/config/environment`);
    nodemon(`-w ${serverPath} ${serverPath}`)
        .on('log', onServerLog);
});

gulp.task('start:server:prod', () => {
    process.env.NODE_ENV = process.env.NODE_ENV || 'production';
    config = require(`./${paths.dist}/${serverPath}/config/environment`);
    nodemon(`-w ${paths.dist}/${serverPath} ${paths.dist}/${serverPath}`)
        .on('log', onServerLog);
});

gulp.task('start:inspector', () => {
    gulp.src([])
        .pipe(plugins.nodeInspector());
});

gulp.task('start:server:debug', () => {
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';
        config = require(`./${serverPath}/config/environment`);
    nodemon(`-w ${serverPath} --debug-brk ${serverPath}`)
        .on('log', onServerLog);
});

gulp.task('watch', () => {
    var testFiles = _.union(paths.client.test, paths.server.test.unit, paths.server.test.integration);

    plugins.livereload.listen();

    plugins.watch(paths.client.styles, () => {  //['inject:scss']
        gulp.src(paths.client.mainStyle)
            .pipe(plugins.plumber())
            .pipe(styles())
            .pipe(gulp.dest('.tmp/app'))
            .pipe(plugins.livereload());
    });

    plugins.watch(paths.client.views)
        .pipe(plugins.plumber())
        .pipe(plugins.livereload());

    plugins.watch(paths.client.scripts) //['inject:js']
        .pipe(plugins.plumber())
        .pipe(transpileClient())
        .pipe(gulp.dest('.tmp'))
        .pipe(plugins.livereload());

    plugins.watch(_.union(paths.server.scripts, testFiles))
        .pipe(plugins.plumber())
        .pipe(lintServerScripts())
        .pipe(plugins.livereload());

    gulp.watch('bower.json', ['wiredep:client']);
});

gulp.task('serve', cb => {
    runSequence(['clean:tmp', 'constant', 'env:all'],
        ['lint:scripts', 'inject'],
        ['wiredep:client'],
        ['transpile:client', 'styles'],
        ['start:server', 'start:client'],
        'watch',
        cb);
});

gulp.task('serve:dist', cb => {
    runSequence(
        'build',
        'env:all',
        'env:prod',
        ['start:server:prod', 'start:client'],
        cb);
});

gulp.task('serve:debug', cb => {
    runSequence(['clean:tmp', 'constant'],
        ['lint:scripts', 'inject'],
        ['wiredep:client'],
        ['transpile:client', 'styles'],
        'start:inspector',
        ['start:server:debug', 'start:client'],
        'watch',
        cb);
});

gulp.task('test', cb => {
    return runSequence('test:server', 'test:client', cb);
});

gulp.task('test:server', cb => {
    runSequence(
        'env:all',
        'env:test',
        'mocha:unit',
        'mocha:integration',
        'mocha:coverage',
        cb);
});

gulp.task('mocha:unit', () => {
    return gulp.src(paths.server.test.unit)
        .pipe(mocha());
});

gulp.task('mocha:integration', () => {
    return gulp.src(paths.server.test.integration)
        .pipe(mocha());
});

gulp.task('test:client', ['wiredep:test', 'constant'], (done) => {
    new KarmaServer({
      configFile: `${__dirname}/${paths.karma}`,
      singleRun: true
    }, done).start();
});

// inject bower components
gulp.task('wiredep:client', cb => runSequence('wiredep:client:client', 'wiredep:client:backend', cb));
gulp.task('wiredep:client:client', () => {
    return gulp.src(paths.client.mainView)
        .pipe(wiredep({
            exclude: [
                /bootstrap.js/,
                '/json3/',
                '/es5-shim/',
                /font-awesome\.css/,
                /bootstrap\.css/,
                /bootstrap-sass-official/,
                /bootstrap-social\.css/
            ],
            ignorePath: clientPath
        }))
        .pipe(gulp.dest(`${clientPath}/`));
});
gulp.task('wiredep:client:backend', () => {
    return gulp.src(paths.backend.mainView)
        .pipe(wiredep({
            exclude: [
                /bootstrap.js/,
                '/json3/',
                '/es5-shim/',
                /font-awesome\.css/,
                /bootstrap\.css/,
                /bootstrap-sass-official/,
                /bootstrap-social\.css/
            ],
            ignorePath: clientPath
        }))
        .pipe(gulp.dest(`${backendPath}/`));
});

gulp.task('wiredep:test', () => {
    return gulp.src(paths.karma)
        .pipe(wiredep({
            exclude: [
                /bootstrap.js/,
                '/json3/',
                '/es5-shim/',
                /font-awesome\.css/,
                /bootstrap\.css/,
                /bootstrap-sass-official/,
                /bootstrap-social\.css/
            ],
            devDependencies: true
        }))
        .pipe(gulp.dest('./'));
});

/********************
 * Build
 ********************/

//FIXME: looks like font-awesome isn't getting loaded
gulp.task('build', cb => {
    runSequence(
        [
            'clean:dist',
            'clean:dist:client',
            'clean:dist:backend',
            'clean:tmp'
        ],
        'inject',
        'wiredep:client',
        [
            'build:images',
            'copy:extras',
            'copy:extras:backend',
            'copy:fonts',
            'copy:customfonts',
            'copy:customfontsapp',
            'copy:fonts:backend',
      			'copy:bower:backend',
      			'copy:style:backend',
            'copy:assets',
            'copy:uploads',
            'copy:assets:backend',
            'copy:assets:fonts:backend',
            'copy:server',
            'transpile:server',
            'build:client'
        ],
        cb);
});

gulp.task('clean:dist', () => del([`${paths.dist}/!(.git*|.openshift|Procfile)**`], {dot: true}));
gulp.task('clean:dist:client', () => del([
  `${paths.dist}/${clientPath}/!(.git*|.openshift|Procfile|uploads*)**`
], {dot: true}));
gulp.task('clean:dist:backend', () => del([`${paths.dist}/${backendPath}/!(.git*|.openshift|Procfile)**`], {dot: true}));

gulp.task('build:client', cb => {
  runSequence(['transpile:client', 'styles', 'html', 'constant', 'build:images'],
'build:client:backend', 'build:client:client', cb);
});

gulp.task('build:client:client', () => {
    var manifest = gulp.src(`${paths.dist}/${clientPath}/assets/rev-manifest.json`);

    var appFilter = plugins.filter('**/app.js', {restore: true});
    var jsFilter = plugins.filter('**/*.js', {restore: true});
    var cssFilter = plugins.filter('**/*.css', {restore: true});
    var htmlBlock = plugins.filter(['**/*.!(html)'], {restore: true});

    return gulp.src(paths.client.mainView)
        .pipe(plugins.useref())
            .pipe(appFilter)
                .pipe(plugins.addSrc.append('.tmp/templates.js'))
                .pipe(plugins.concat('app/app.js'))
            .pipe(appFilter.restore)
            .pipe(jsFilter)
                .pipe(plugins.ngAnnotate())
                .pipe(plugins.uglify())
            .pipe(jsFilter.restore)
            .pipe(cssFilter)
                .pipe(plugins.cleanCss({
                    processImportFrom: ['!fonts.googleapis.com']
                }))
            .pipe(cssFilter.restore)
            .pipe(htmlBlock)
                .pipe(plugins.rev())
            .pipe(htmlBlock.restore)
        .pipe(plugins.revReplace({manifest}))
        .pipe(gulp.dest(`${paths.dist}/${clientPath}`));
});

gulp.task('build:client:backend', () => {

    var manifest = gulp.src(`${paths.dist}/${backendPath}/assets/rev-manifest.json`);

    var appFilter = plugins.filter('**/app.js', {restore: true});
    var jsFilter = plugins.filter('**/*.js', {restore: true});
    var cssFilter = plugins.filter('**/*.css', {restore: true});
    var htmlBlock = plugins.filter(['**/*.!(html)'], {restore: true});

    return gulp.src(paths.backend.mainView)
        .pipe(plugins.useref())
            .pipe(appFilter)
                .pipe(plugins.addSrc.append('.tmpbackend/templates.js'))
                .pipe(plugins.concat('app/app.js'))
            .pipe(appFilter.restore)
            .pipe(jsFilter)
                .pipe(plugins.ngAnnotate())
                .pipe(plugins.uglify())
            .pipe(jsFilter.restore)
            .pipe(cssFilter)
                .pipe(plugins.cleanCss({
                    processImportFrom: ['!fonts.googleapis.com']
                }))
            .pipe(cssFilter.restore)
            .pipe(htmlBlock)
                .pipe(plugins.rev())
            .pipe(htmlBlock.restore)
        .pipe(plugins.revReplace({manifest}))
        .pipe(gulp.dest(`${paths.dist}/${backendPath}`));
});

gulp.task('html', cb => runSequence(['html:client', 'html:backend'], cb));

gulp.task('html:client', function() {
    return gulp.src(`${clientPath}/{app,components}/**/*.html`)
        .pipe(plugins.angularTemplatecache({
            module: 'xMember'
        }))
        .pipe(gulp.dest('.tmp'));
});

gulp.task('html:backend', function() {
    return gulp.src(`${backendPath}/{app,components}/**/*.html`)
        .pipe(plugins.angularTemplatecache({
            module: 'xMember'
        }))
        .pipe(gulp.dest('.tmpbackend'));
});

gulp.task('constant', cb => runSequence(['constant:client', 'constant:backend'], cb));

gulp.task('constant:client', function() {
  let sharedConfig = require(`./${serverPath}/config/environment/shared`);
  return plugins.ngConstant({
    name: 'xMember.constants',
    deps: [],
    wrap: true,
    stream: true,
    constants: { appConfig: sharedConfig }
  })
    .pipe(plugins.rename({
      basename: 'app.constant'
    }))
    .pipe(gulp.dest(`${clientPath}/app/`))
});

gulp.task('constant:backend', function() {
  let sharedConfig = require(`./${serverPath}/config/environment/shared`);
  return plugins.ngConstant({
    name: 'xMember.constants',
    deps: [],
    wrap: true,
    stream: true,
    constants: { appConfig: sharedConfig }
  })
    .pipe(plugins.rename({
      basename: 'app.constant'
    }))
    .pipe(gulp.dest(`${backendPath}/app/`))
});

gulp.task('build:images', cb => runSequence(['build:images:client', 'build:images:backend'], cb));

gulp.task('build:images:client', () => {
    return gulp.src(paths.client.images)
        .pipe(plugins.imagemin({
            optimizationLevel: 5,
            progressive: true,
            interlaced: true
        }))
        .pipe(plugins.rev())
        .pipe(gulp.dest(`${paths.dist}/${clientPath}/assets/images`))
        .pipe(plugins.rev.manifest(`${paths.dist}/${clientPath}/assets/rev-manifest.json`, {
            base: `${paths.dist}/${clientPath}/assets`,
            merge: true
        }))
        .pipe(gulp.dest(`${paths.dist}/${clientPath}/assets`));
});

gulp.task('build:images:backend', () => {
    return gulp.src(paths.backend.images)
        .pipe(plugins.imagemin({
            optimizationLevel: 5,
            progressive: true,
            interlaced: true
        }))
        .pipe(plugins.rev())
        .pipe(gulp.dest(`${paths.dist}/${backendPath}/assets/images`))
        .pipe(plugins.rev.manifest(`${paths.dist}/${backendPath}/assets/rev-manifest.json`, {
            base: `${paths.dist}/${backendPath}/assets`,
            merge: true
        }))
        .pipe(gulp.dest(`${paths.dist}/${backendPath}/assets`));
});


gulp.task('copy:extras', () => {
    return gulp.src([
        `${clientPath}/favicon.ico`,
        `${clientPath}/robots.txt`,
        `${clientPath}/.htaccess`
    ], { dot: true })
        .pipe(gulp.dest(`${paths.dist}/${clientPath}`));
});

gulp.task('copy:extras:backend', () => {
    return gulp.src([
        `${backendPath}/favicon.ico`,
        `${backendPath}/robots.txt`,
        `${backendPath}/.htaccess`
    ], { dot: true })
        .pipe(gulp.dest(`${paths.dist}/${backendPath}`));
});

gulp.task('copy:fonts', () => {
    return gulp.src(`${clientPath}/bower_components/{bootstrap,font-awesome}/fonts/**/*`, { dot: true })
        .pipe(gulp.dest(`${paths.dist}/${clientPath}/bower_components`));
});
gulp.task('copy:customfonts', () => {
    return gulp.src([
      `${clientPath}/assets/font-awesome/fonts/**/*`,
      `${clientPath}/bower_components/angular-ui-carousel/dist/fonts/**/*`
    ], { dot: true })
      .pipe(gulp.dest(`${paths.dist}/${clientPath}/fonts`));
});
gulp.task('copy:customfontsapp', () => {
    return gulp.src([
      `${clientPath}/bower_components/angular-ui-carousel/dist/fonts/**/*`
    ], { dot: true })
      .pipe(gulp.dest(`${paths.dist}/${clientPath}/app/fonts`));
});
gulp.task('copy:fonts:backend', () => {
    return gulp.src(`${backendPath}/bower_components/{bootstrap,font-awesome}/fonts/**/*`, { dot: true })
        .pipe(gulp.dest(`${paths.dist}/${backendPath}/bower_components`));
});
gulp.task('copy:assets:fonts:backend', () => {
    return gulp.src([
      `${backendPath}/assets/font-awesome/fonts/**/*`,
      `${backendPath}/assets/fonts/**/*`
    ], {
      dot: true
    })
    .pipe(gulp.dest(`${paths.dist}/${backendPath}/fonts`))
    .pipe(gulp.dest(`${paths.dist}/${backendPath}/app/fonts`));
});
gulp.task('copy:bower:backend', () => {
    return gulp.src(`${backendPath}/bower_components/**/*`, { dot: true })
        .pipe(gulp.dest(`${paths.dist}/${backendPath}/bower_components`));
});
gulp.task('copy:style:backend', () => {
    return gulp.src(`${backendPath}/styles/**/*`, { dot: true })
        .pipe(gulp.dest(`${paths.dist}/${backendPath}/styles`));
});
gulp.task('copy:assets', () => {
    return gulp.src([paths.client.assets, '!' + paths.client.images])
        .pipe(gulp.dest(`${paths.dist}/${clientPath}/assets`));
});
gulp.task('copy:uploads', () => {
    return gulp.src([
      `${clientPath}/uploads/**/*`
    ], { dot: true })
    .pipe(gulp.dest(`${paths.dist}/${clientPath}/uploads`));
});

gulp.task('copy:assets:backend', () => {
    return gulp.src([paths.backend.assets, '!' + paths.backend.images])
        .pipe(gulp.dest(`${paths.dist}/${backendPath}/assets`));
});

gulp.task('copy:server', () => {
    return gulp.src([
        'package.json',
        'bower.json',
        '.bowerrc',
        'server/views/**/*'
    ], {cwdbase: true})
        .pipe(gulp.dest(paths.dist));
});

gulp.task('coverage:pre', () => {
  return gulp.src(paths.server.scripts)
    // Covering files
    .pipe(plugins.istanbul({
        instrumenter: Instrumenter, // Use the isparta instrumenter (code coverage for ES6)
        includeUntested: true
    }))
    // Force `require` to return covered files
    .pipe(plugins.istanbul.hookRequire());
});

gulp.task('coverage:unit', () => {
    return gulp.src(paths.server.test.unit)
        .pipe(mocha())
        .pipe(istanbul())
        // Creating the reports after tests ran
});

gulp.task('coverage:integration', () => {
    return gulp.src(paths.server.test.integration)
        .pipe(mocha())
        .pipe(istanbul())
        // Creating the reports after tests ran
});

gulp.task('mocha:coverage', cb => {
  runSequence('coverage:pre',
              'env:all',
              'env:test',
              'coverage:unit',
              'coverage:integration',
              cb);
});

// Downloads the selenium webdriver
gulp.task('webdriver_update', webdriver_update);

gulp.task('test:e2e', ['env:all', 'env:test', 'start:server', 'webdriver_update'], cb => {
    gulp.src(paths.client.e2e)
        .pipe(protractor({
            configFile: 'protractor.conf.js',
        })).on('error', err => {
            console.log(err)
        }).on('end', () => {
            process.exit();
        });
});

/********************
 * Grunt ported tasks
 ********************/

grunt.initConfig({
    buildcontrol: {
        options: {
            dir: paths.dist,
            commit: true,
            push: true,
            connectCommits: false,
            message: 'Built %sourceName% from commit %sourceCommit% on branch %sourceBranch%'
        },
        heroku: {
            options: {
                remote: 'heroku',
                branch: 'master'
            }
        },
        openshift: {
            options: {
                remote: 'openshift',
                branch: 'master'
            }
        }
    }
});

grunt.loadNpmTasks('grunt-build-control');

gulp.task('buildcontrol:heroku', function(done) {
    grunt.tasks(
        ['buildcontrol:heroku'],    //you can add more grunt tasks in this array
        {gruntfile: false}, //don't look for a Gruntfile - there is none. :-)
        function() {done();}
    );
});
gulp.task('buildcontrol:openshift', function(done) {
    grunt.tasks(
        ['buildcontrol:openshift'],    //you can add more grunt tasks in this array
        {gruntfile: false}, //don't look for a Gruntfile - there is none. :-)
        function() {done();}
    );
});
