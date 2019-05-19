const gulp = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const browserSync = require('browser-sync').create();

gulp.task('build', () => {
    gulp
        .src('src/frame.js')
        .pipe(babel({ presets: ['env'] }))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

// Run build command when any file in src folder is changed
gulp.task('watch', () => {
    browserSync.init({ server: { baseDir: './' } });
    gulp.watch('src/*', ['build']).on('change', browserSync.reload);
});

gulp.task('default', ['build']);
