var DOCROOT = 'build',
  SRCROOT = 'src',
  TEMPLATEROOT = 'templates',
  PARTIALSROOT = TEMPLATEROOT + '/partials',
  _ = require('lodash'),
  fs = require('fs'),
  gulp = require('gulp'),
  connect = require('gulp-connect'),
  gulpsmith = require('gulpsmith'),
  gulp_front_matter = require('gulp-front-matter'),
  Handlebars = require('handlebars'),
  markdown   = require('metalsmith-markdown'),
  templates  = require('metalsmith-templates'),
  sass       = require('metalsmith-sass');

gulp.task('build', function() {
  // Register partials, based on filename.
  // E.G.: `header.handlebars` becomes the `header` partial.
  _.each(fs.readdirSync(PARTIALSROOT), function(file){
    var name = file.split(".")[0],
        contents = fs.readFileSync(__dirname + '/' + PARTIALSROOT + '/' + file).toString();
    Handlebars.unregisterPartial(name);
    Handlebars.registerPartial(name, contents);
  });

  gulp.src(SRCROOT + "/**/*")
    .pipe(gulp_front_matter())
    .on("data", function(file) {
      _.assign(file, file.frontMatter);
      delete file.frontMatter;
    })
    .pipe(
      gulpsmith()
        .use(markdown())
        .use(templates({
          engine: 'handlebars'
        }))
        .use(sass({outputStyle: 'compressed'}))
    ).pipe(connect.reload())
    .pipe(gulp.dest("./build"));
});

gulp.task('serve', function() {
  connect.server({
    root: DOCROOT,
    livereload: true
  });
  gulp.watch([SRCROOT + '/**/*', TEMPLATEROOT + '/**/*'], ['build']);
});

gulp.task('default', ['build']);
