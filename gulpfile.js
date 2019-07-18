var gulp = require('gulp');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var browserSync = require('browser-sync').create();
var sourcemaps = require('gulp-sourcemaps');
var fileinclude = require('gulp-file-include');
var useref = require('gulp-useref');
var gulpIf = require('gulp-if');
var cleanCSS = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var del = require('del');
var spritesmith = require('gulp.spritesmith');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var cached = require('gulp-cached');
// var autopolyfiller = require('gulp-autopolyfiller');
var imageminPngquant = require('imagemin-pngquant');
var imageminZopfli = require('imagemin-zopfli');
var imageminGiflossy = require('imagemin-giflossy');
var imageminMozjpeg = require('imagemin-mozjpeg');
var jasmineBrowser = require('gulp-jasmine-browser');

// 폴더 정의
var src = 'ui'; //작업 폴더
var dist = 'dist'; // 배포를 위한 파일 저장 폴더
var temp = 'tmp'; //임시 저장 폴더

// 경로
var path = {
	scss: src + '/common/scss/**/*.scss',
	js: src + '/common/js/**/*.js',
	html: src + '/**/*.html',
	img: src + '/**/*.+(png|jpg|jpeg|gif|svg)',
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

// 변경사항을 실시간 반영
// gulp 4.0 이상 버전 사용시 gulp.watch(path.scss, gulp.series(['sass']) 처럼 테스크 함수지정으로 변경
gulp.task('watch', async function(){
  gulp.watch(path.scss, gulp.series(['sass']));
  gulp.watch(path.js, gulp.series(['copyJs']));
  gulp.watch(path.img, gulp.series(['sprite','copyImg']));
  gulp.watch(path.html, gulp.series(['html']));
});

// image sprite 생성
gulp.task('sprite', async function(){
	var spriteData = gulp.src('./ui/img/*.png').pipe(spritesmith({
		imgName: 'sprite.png',
		cssName: 'sprite.scss',
		cssTemplate: null,
		padding: 10,
		imgPath: './ui/common/img/sprite.png',
		cssFormat: 'css',
		cssVarMap: function (sprite) {
			sprite.name = `sprite-${sprite.name}`;
		}
		// retinaSrcFilter: './dev/data/sprite/*@2x.png',
		// retinaImgName: 'sprite@2x.png',
		// retinaImgPath: '../images/common/sprite@2x.png'
	}));
	spriteData.img.pipe(gulp.dest('./ui/common/img/'));
	spriteData.css.pipe(gulp.dest('./ui/common/scss/'));
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

// img copy
gulp.task('copyImg', async function() {
  return gulp.src(path.img)
  .pipe(gulp.dest(temp))
  .pipe(browserSync.reload({
    stream: true
  }))
});

// scss 파일을 css 로 변환
// task 순서 : sourcemap 생성 > sass 실행 > sourcemap 표시 > dist로 복사 > browser reload
// async completion 오류 해결 방법 task function에 async 추가
gulp.task('sass', async function() {
  return gulp.src(path.scss)
  .pipe(sourcemaps.init())
  .pipe(sass({outputStyle : 'compact'}).on('error', sass.logError))
  .pipe(sourcemaps.write('.',{includeContent: true , addComment : false , sourceRoot: path}))
  .pipe(gulp.dest(tmp.css))
  .pipe(browserSync.reload({
    stream: true
  }))
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

// img build
// 이미지 무손실 용량 압축 실행 후 배포 폴더로 이동
gulp.task('buildImg', async function() {
	return gulp.src(path.img)
	.pipe(
		imagemin([
			imagemin.gifsicle({interlaced: true}),
			imagemin.jpegtran({progressive: true}),
			imagemin.optipng({optimizationLevel: 5}),
			imagemin.svgo({
				plugins: [
					{removeViewBox: false}
				]
			})
		])
	)
	.pipe(gulp.dest(dist))
});

// useref task 추가
gulp.task('useref', async function(){
  return gulp.src(tmp.html)
    .pipe(useref({searchPath:temp}))  // 파일 통합의 기준은 temp 폴더
    .pipe(gulpIf('*.js', uglify()))   // js 파일 uglify로 압축
	.pipe(gulpIf('*.css', cleanCSS())) // css 파일 cleanCSS로 압축
	.pipe(gulp.dest(dist))	// dist 폴더로 이동
});

// dist폴더 clean
gulp.task('clean:dist', async function() {
	return del.sync(dist);
});

// default
gulp.task('default', gulp.series(
	gulp.parallel('sass','copyJs', 'html', 'watch', 'copyImg', 'sprite'),
	'browserSync'
));

// build
gulp.task('build', gulp.series(
	'clean:dist',
	'sass',
	gulp.parallel('copyJs','html', 'buildImg'),
	'useref'
));

gulp.task('jasmine', async function() {
  return gulp.src(['src/**/*.js', 'spec/**/*_spec.js'])
    .pipe(jasmineBrowser.specRunner())
    .pipe(jasmineBrowser.server({port: 58080}));
});