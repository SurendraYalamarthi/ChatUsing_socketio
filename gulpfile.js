var gulp = require('gulp');
var war = require('gulp-war');
var zip = require('gulp-zip');

gulp.task('war', function () {
    gulp.src(["*.js", "*.md", "test/*.js","*.ejs"])
        .pipe(war({
            welcome: 'index.html',
            displayName: 'Grunt WAR',
        }))
        .pipe(gulp.dest("./dist"));
 
});