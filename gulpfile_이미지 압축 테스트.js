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
var imagemin = require('gulp-imagemin');
var imageminPngquant = require('imagemin-pngquant');
var changed = require( 'gulp-changed');
var cache = require('gulp-cache');
var cached = require('gulp-cached');
var imageminZopfli = require('imagemin-zopfli');
var imageminGiflossy = require('imagemin-giflossy');
var imageminMozjpeg = require('imagemin-mozjpeg');
// var image = require('gulp-image');

// 폴더 정의
var src = 'ui'; //작업 폴더
var dist = 'dist';  // 배포를 위한 파일 저장 폴더
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

// Clean Sprite
gulp.task('clean-sprite', async function() {
	return del('./dist/**/*.+(png|jpg|jpeg|gif|svg)');
});

// image sprite
gulp.task('sprite', async function(){
	var spriteData = gulp.src('../gulp-test/ui/img/*.png').pipe(spritesmith({
		imgName: 'sprite.png',
		cssName: 'sprite.css',
		cssTemplate: null,
		// cssSpritesheetName: sprite,
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
	spriteData.img.pipe(gulp.dest('../gulp-test/ui/common/img/'));
	spriteData.css.pipe(gulp.dest('../gulp-test/ui/common/scss/'));
});

// scss 파일을 css 로 변환
// task 순서 : sourcemap 생성 > sass 실행 > sourcemap 표시 > dist로 복사 > browser reload
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
  gulp.watch(path.img, gulp.series(['sprite','copyImg']));
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

// img copy
gulp.task('copyImg', async function() {
  return gulp.src(path.img)
  .pipe(gulp.dest(temp))
  .pipe(browserSync.reload({
    stream: true
  }))
});

// 이미지 압축 테스트 task
gulp.task('imgMin', function() {
  return gulp.src('**/*.+(png|jpg|jpeg|gif|svg)')
  		// .pipe(imagemin(
		// 	// imagemin.gifsicle({interlaced: true}),
		// 	// imagemin.jpegtran({progressive: true}),
		// 		{ plugins: [
		// 			imageminPngquant({
		// 				speed: 1,
		// 				quality: [0.2, 0.7] //lossy settings
		// 			}),
		// 			imageminZopfli({
		// 				more: true
		// 				// iterations: 50 // very slow but more effective
		// 			}),
		// 			imageminGiflossy({
		// 				optimizationLevel: 5,
		// 				optimize: 5, //keep-empty: Preserve empty transparent frames
		// 				lossy: 2
		// 			}),
		// 			imageminMozjpeg({quality: 100})
		// 		]}
		// 	)
		// )

    .pipe(imagemin([
		imagemin.gifsicle({interlaced: true}),
		imagemin.jpegtran({progressive: true}),
		imagemin.optipng({optimizationLevel: 9}),
		imagemin.svgo({
			plugins: [
				{removeViewBox: false}
			]
		})
	]))
    .pipe(gulp.dest(temp));
});

// img build
// 이미지 빌드시 파일 사이즈 압축
gulp.task('buildImg', async function() {
	return gulp.src(path.img)
	// .pipe(cache(
	// 	imagemin([
	// 		imagemin.gifsicle({interlaced: true}),
	// 		imagemin.jpegtran({progressive: true}),
	// 		imagemin.optipng({optimizationLevel: 7})
	// 		// imagemin.svgo({
	// 		// 	plugins: [
	// 		// 		{removeViewBox: false}
	// 		// 	]
	// 		// })
	// 	]), {
	// 		name: 'gulp-test'
	// 	})
	// )

	// var imgSrc = tmp + '*.+(png|jpg|jpeg|gif|svg)';
	// return gulp.src(imgSrc)
	// .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
  	//.pipe(cached('buildImg'))
	//   .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
	//  .pipe(imagemin([
	// 	imageminPngquant({
	// 		quality: [0.9, 1] //lossy settings
	// 	}),
	// 	imageminGiflossy({
	// 		optimizationLevel: 3,
	// 		optimize: 3, //keep-empty: Preserve empty transparent frames
	// 		lossy: 2
	// 	}),
	// 	imagemin.svgo({
	// 		plugins: [{
	// 			removeViewBox: false
	// 		}]
	// 	}),
	// 	imagemin.jpegtran({progressive: true}),
    //     imagemin.gifsicle({interlaced: true}),
    //     imagemin.optipng({optimizationLevel: 5})
    //   ]))
  
	// .pipe(changed(imgSrc))
	// .pipe(cache(
	// 	imagemin([
	// 		imagemin.gifsicle({interlaced: true}),
	// 		imagemin.jpegtran({progressive: true}),
	// 		imagemin.optipng({optimizationLevel: 5}),
	// 		imagemin.svgo({
	// 			plugins: [{
	// 				removeViewBox: false ,
	// 				collapseGroups: true
	// 			}]
	// 		})
	// 		])
	// 	)
	// )

	.pipe(gulp.dest(dist))
});

// useref task 추가
gulp.task('useref', async function(){
  return gulp.src(tmp.html)
    .pipe(useref({searchPath:temp}))  // 파일 통합의 기준은 temp 폴더
    .pipe(gulpIf('*.js', uglify()))   // js 파일 uglify로 압축
	.pipe(gulpIf('*.css', cssnano())) // css 파일 cssnano로 압축
	// .pipe(gulpIf('*.+(png|jpg|jpeg|gif|svg)' , imagemin()))
		// imagemin({
		// 	// optimizationLevel: 7,
        //     progressive: true,
        //     use: [
		// 		imageminPngquant()
		// 		// imageminMozjpeg({quality: 90})
		// 	]
		// })
		
		// imagemin({ optimizationLevel: 7, progressive: true, interlaced: true , verbose: true , use: [] })
		// imagemin([
		// 	imagemin.gifsicle({interlaced: true}),
		// 	imagemin.jpegtran({progressive: true}),
		// 	imagemin.optipng({optimizationLevel: 7}),
		// 	imagemin.svgo({
		// 		plugins: [
		// 			{removeViewBox: true},
		// 			{cleanupIDs: false}
		// 		]
		// 	})
		// ])

		// imagemin(
		// 	// imagemin.gifsicle({interlaced: true}),
		// 	imagemin.jpegtran({progressive: true}),
		// 	{ plugins: [
		// 		imageminPngquant({
		// 			speed: 1,
		// 			quality: [0.2, 0.7] //lossy settings
		// 		}),
		// 		imageminZopfli({
		// 			more: true
		// 			// iterations: 50 // very slow but more effective
		// 		}),
		// 		imageminGiflossy({
		// 			optimizationLevel: 5,
		// 			optimize: 5, //keep-empty: Preserve empty transparent frames
		// 			lossy: 2
		// 		}),
		// 		// imagemin.svgo({
		// 		// 	plugins: [
		// 		// 		{removeViewBox: false},
		// 		// 		{cleanupIDs: false}
		// 		// 	]
		// 		// }),
		// 		//jpg very light lossy, use vs jpegtran
        //     	imageminMozjpeg({quality: 70})
		// 	]}
		// )

	// )

    .pipe(gulp.dest(dist))	// dist 폴더로 이동
});

// clean
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