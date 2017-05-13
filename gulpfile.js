var gulp = require('gulp');


gulp.task('travis', ['build'], function() {
    process.exit(0);
});

gulp.task('build', function() {
    return;
});