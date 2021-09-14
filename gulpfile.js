const gulp = require('gulp');
const plumber = require('gulp-plumber');
const sourceMap = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const htmlMin = require('gulp-htmlmin');
const autoPrefixer = require('autoprefixer');
const csso = require('postcss-csso');
const rename = require('gulp-rename');
const imageMin = require('gulp-imageMin');
const webp = require('gulp-webp');
const svgStore = require('gulp-svgstore');
const del = require('del');
const browserSync = require('browser-sync').create();
const cheerio = require('gulp-cheerio');

// Styles
const stylesTask = () => {
  return gulp
    .src('source/sass/style.scss')
    .pipe(plumber())
    .pipe(sourceMap.init())
    .pipe(sass())
    .pipe(rename('style.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(postcss([autoPrefixer(), csso()]))
    .pipe(rename('style.min.css'))
    .pipe(sourceMap.write('.'))
    .pipe(gulp.dest('build/css'))
    .pipe(browserSync.stream());
};

exports.stylesTask = stylesTask;

//HTML
const htmlTask = () => {
  return gulp
    .src('source/*.html')
    .pipe(htmlMin({ collapseWhitespace: true }))
    .pipe(gulp.dest('build'))
    .pipe(browserSync.stream());
};

exports.htmlTask = htmlTask;

//Images
const optimizeImages = () => {
  return gulp
    .src('source/img/**/*.{jpg,png,svg}')
    .pipe(
      imageMin([
        imageMin.optipng({ optimizationLevel: 3 }),
        imageMin.mozjpeg({ progressive: true }),
        imageMin.svgo(),
      ]),
    )
    .pipe(gulp.dest('build/img'));
};

exports.optimizeImages = optimizeImages;

//Webp
const createWebp = () => {
  return gulp
    .src('build/img/**/*.{jpg,png}')
    .pipe(webp({ quality: 90 }))
    .pipe(gulp.dest('build/img'));
};
exports.createWebp = createWebp;

//Sprite
const spriteTask = () => {
  return gulp
    .src('build/img/icons/*.svg')
    .pipe(
      cheerio({
        run: function ($) {
          $('[fill]').removeAttr('fill');
        },
        parserOptions: { xmlMode: true },
      }),
    )
    .pipe(
      svgStore({
        inlineSvg: true,
        prefix: false,
      }),
    )
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'));
};
exports.spriteTask = spriteTask;

//Clean
const clean = () => {
  return del('build');
};
exports.clean = clean;

// Watcher
const watcherFiles = () => {
  browserSync.init({
    server: {
      baseDir: './build',
    },
  });
  gulp.watch('./source/sass/**/*.scss', stylesTask);
  gulp.watch('./source/*.html', htmlTask);
};
exports.watcherFiles = watcherFiles;

//Build
const build = gulp.series(
  clean,
  optimizeImages,
  gulp.parallel(stylesTask, htmlTask, spriteTask, createWebp),
);

exports.build = build;

//Default
exports.default = gulp.series(
  clean,
  optimizeImages,
  gulp.parallel(stylesTask, htmlTask, spriteTask, createWebp),
  watcherFiles,
);
