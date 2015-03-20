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
  fingerprint = require('metalsmith-fingerprint'),
  markdown   = require('metalsmith-markdown'),
  templates  = require('metalsmith-templates'),
  sass       = require('metalsmith-sass');

// Function to remove original compiled css files from being copied into destination
// folder since fingerprinting will place its own copy in.
var removeFingerprintOriginals = function() {
  return function (files, metalsmith, done) {
    var metadata = metalsmith.metadata();
    if (_.has(metadata, 'fingerprint')) {
      _.forIn(metadata.fingerprint, function(value, key) {
        if (_.has(files, key)) {
          delete files[key];
        }
      });
    }
    done();
  }
};

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
        .use(sass({outputStyle: 'compressed'}))
        .use(fingerprint({pattern: ['styles/*.css', 'js/*.js']}))
        .use(removeFingerprintOriginals())
        .use(templates({
          engine: 'handlebars'
        }))
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
