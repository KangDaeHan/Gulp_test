var gulp = require('gulp');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var browserSync = require('browser-sync').create();
var sourcemaps = require('gulp-sourcemaps');
var fileinclude = require('gulp-file-include');

var useref = require('gulp-useref');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var uglify = require('gulp-uglify');
var del = require('del');
// var autopolyfiller = require('gulp-autopolyfiller');
var spritesmith = require('gulp.spritesmith');
// var spritesmith = require('gulp.spritesmith-multi');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var merge = require('merge-stream');
var buffer = require('vinyl-buffer');
var csso = require('gulp-csso');

// 폴더 정의
var src = 'ui'; //작업 폴더
var dist = 'dist';  // 배포를 위한 파일 저장 폴더
var temp = 'tmp'; //임시 저장 폴더

// 경로
var path = {
  scss: src + '/common/scss/**/*.scss',
  js: src + '/common/js/**/*.js',
  html: src + '/**/*.html',
  img: src + '/**/*.+(jpg|jpeg|gif|svg)',
  imgSprite: src + '/**/*.png',
  font: src + '/common/fonts/**/*.+(eot|woff|woff2|ttf|svg)',
  icon: src + '/common/icon/**/*.+(eot|woff|woff2|ttf|svg)',
  inc: src + '/**/*.inc'
};

// 임시 저장 폴더 (해당폴더 기준으로 서버 생성)
var tmp = {
  css: temp + '/common/css',
  js: temp + '/common/js',
  img: temp + '/img',
  fonts: temp + '/common/fonts',
  html: temp + '/**/*.html'
};

// scss 파일을 css 로 변환
// task 순서 : sourcemap 생성 > sass 실행 > sourcemap 표시 > dest로 복사 > browser reload
// async completion 오류 해결 방법 task function에 async 추가
gulp.task('sass', async function() {
  return gulp.src(path.scss)
  .pipe(sourcemaps.init())
  .pipe(sass())
  .pipe(sourcemaps.write('.',{includeContent: true}))
  .pipe(gulp.dest(tmp.css))
  .pipe(browserSync.reload({
    stream: true
  }))
});

// 변경사항을 실시간 반영
// gulp 4.0 이상 버전 사용시 gulp.watch(path.scss, gulp.series(['sass']) 처럼 테스크 함수지정으로 변경
gulp.task('watch', async function(){
  gulp.watch(path.scss, gulp.series(['sass']));
  gulp.watch(path.js, gulp.series(['copyJs']));
  gulp.watch(path.img, gulp.series(['copyImg']));
  gulp.watch(path.imgSprite, gulp.series(['sprite']));
  gulp.watch(path.html, gulp.series(['html']));
});

// 서버 실행
gulp.task('browserSync', async function(){
  browserSync.init({
	// host: "192.168.1.1", 
	open: "external",
	port: 58080,
	// browser: ["chrome", "firefox", "iexplore"],
    server: {
      baseDir: temp // 기준 경로를 temp(tmp) 로 설정
    }
  })
});

// html include
gulp.task('html', async function(){
  return gulp.src(path.html)
  .pipe(fileinclude({
    prefix: '@@',
    basepath: src
  }))
  .pipe(gulp.dest(temp))
  .pipe(browserSync.reload({
    stream: true
  }))
});

// js copy
gulp.task('copyJs', async function() {
  return gulp.src(path.js)
  .pipe(gulp.dest(tmp.js))
  .pipe(browserSync.reload({
    stream: true
  }))
});

// image sprite
gulp.task('sprite', async function(){
	var spriteData = gulp.src('../ui/**/*.png').pipe(spritesmith({
		// imgPath: '../ui/img/sprite.png',
		imgName: 'sprite.png',
		padding: 10,
		cssName: 'sprite.css'
	  }));
	  
	var imgStream = spriteData.img
		// DEV: We must buffer our stream into a Buffer for `imagemin`
		.pipe(buffer())
		.pipe(imagemin())
		.pipe(gulp.dest('../ui/img/'));
	
	var cssStream = spriteData.css
		.pipe(csso())
		.pipe(gulp.dest('../ui/common/css/'));
	
	return merge(imgStream, cssStream);
});

// img copy
gulp.task('copyImg', async function() {
  return gulp.src(path.img)
  .pipe(gulp.dest(temp))
  .pipe(browserSync.reload({
    stream: true
  }))
});

// img build
gulp.task('buildImg', async function() {
  return gulp.src(path.img)
  .pipe(cache(
		imagemin([
			imagemin.gifsicle({interlaced: true}),
			imagemin.jpegtran({progressive: true}),
			imagemin.optipng({optimizationLevel: 5}),
			imagemin.svgo({
				plugins: [
					{removeViewBox: true},
					{cleanupIDs: false}
				]
			})
		])
	))
  .pipe(gulp.dest(dist))
});

// useref task 추가
gulp.task('useref', async function(){
  return gulp.src(tmp.html)
    .pipe(useref({searchPath:temp}))  // 파일 통합의 기준은 temp 폴더를 기준으로
    .pipe(gulpIf('*.js', uglify()))   // js 파일의 경우 uglify
	.pipe(gulpIf('*.css', cssnano())) // css 파일은 cssnano 로 압축하여
    .pipe(gulp.dest(dist))  // dist 폴더로 이동
});

gulp.task('clear', async function () {
	return cache.clearAll();
});

// clean
gulp.task('clean:dist', async function() {
  return del.sync(dist);
});

// default 
gulp.task('default', gulp.series(
	gulp.parallel('sass', 'copyJs', 'html', 'watch', 'copyImg', 'sprite'),
	'browserSync'
));

// build 
gulp.task('build', gulp.series(
  'clean:dist', 
  'sass',
  gulp.parallel('copyJs','html', 'buildImg'),
  'useref'
));