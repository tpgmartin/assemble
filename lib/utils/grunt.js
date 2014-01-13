/**
 * Assemble
 *
 * Assemble <http://assemble.io>
 * Created and maintained by Jon Schlinkert and Brian Woodward
 *
 * Copyright (c) 2013 Upstage.
 * Licensed under the MIT License (MIT).
 */

var async = require('async');
var fs = require('fs-utils');
var _ = require('lodash');

var File = require('../models/file');

var g = module.exports = {};

g.mapFiles = function (task, done) {

  done = done || function (err, files) {
    throw new Error('done must be defined to get list of files.');
  };

  var files = [];

  // convert the files object into a list of files for assemble to consume
  async.each(
    task.files,

    function (filePair, nextFilePair) {

      async.each(
        filePair.src,
        function (src, nextSrc) {

          var dest = '';
          var raw = fs.readFileSync(src);
          var content = raw;

          var file = new File({
            src: src,
            dest: dest,
            raw: raw,
            content: content,
            metadata: {}
          });

          files.push(file);
          nextSrc();
        },
        nextFilePair
      );
    },

    function (err) {
      if (err) {
        done(err);
      } else {
        done(null, files);
      }
    });

};

/**
 * Given a grunt task, return the options
 *
 * @param  {Object} task - grunt.task
 * @return {Object}
 */
g.mapData = function (task, defaults, grunt) {
  defaults = defaults || {};
  grunt = grunt || require('grunt');
  var options = task.options(defaults);

  // merge task and target arrays together
  options = _.mapValues(options, function (value, key) {
    if (_.isArray(value)) {
      return g.mergeOptions(key, grunt);
    }
    return value;
  });

  return options;
};

/**
 * Merge options at the task and target levels. Normal
 * behavior is for target-level options to overwrite
 * task-level options.
 */
g.mergeOptions = function (name, grunt) {
  grunt = grunt || require('grunt');
  var task = grunt.task.current;
  var taskArray = grunt.config([task.name, 'options', name]) || [];
  var targetArray = grunt.config([task.name, task.target, 'options', name]) || [];
  return _.union(taskArray, targetArray);
};