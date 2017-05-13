var gulp = require('gulp');



// Need to write proper tests for this.
gulp.task('travis', ['build'], function() {
    process.exit(0);
});

gulp.task('build', function() {
    return;
});