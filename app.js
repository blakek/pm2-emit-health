var pmx = require('pmx');
var fs = require('fs');
var express = require('express');
var ipfilter = require('ipfilter');
var cpuStats = require('cpu-stats');
var shelljs = require('shelljs');

pmx.initModule({

  widget : {

    logo : 'https://mdn.mozillademos.org/files/3563/HTML5_Logo_128.png',

    theme : ['#262E35', '#1B2228', '#807C7C', '#807C7C'],

    el : {
      probes  : true,
      actions : true
    },
    block : {
      actions : false,
      issues  : true,
      meta    : true,
      main_probes : []
    }

  }

}, function(err, conf) {
  var status_val = 1400, cpu_used = 0, mem_used = 0;
  var app = express();
  setInterval(function() {

    //CPU retrieval
    cpuStats(100, function(error, result) {

      if(error) return console.error('Fail: could not retrieve cpu metrics', error);

      var cpu = 0;
      var number_cpu = result.length;

      result.forEach(function(value) {
        cpu += value.cpu;
      });

      cpu_used = (cpu/number_cpu).toFixed(2);

    });
    //Mem retrieval
    var usedMemProc = shelljs.exec('cat /proc/meminfo | head -5', { async : true, silent:true}, function(err, out) {

      if (err) return console.error('Fail: could not retrieve mem metrics', err);

      var result_memory = (out.match(/\d+/g));
      var total_mem = result_memory[0];
      free_mem = parseInt(result_memory[1]) + (parseInt(result_memory[3]) + parseInt(result_memory[4]));
      var total_mem_gb = (total_mem/1024/1024).toFixed(1) + 'GB';
      var free_mem_pour = (100 * (1 - free_mem / total_mem)).toFixed(1);
      mem_used = free_mem_pour;
    });
    status_val = 1400 * (100 - (cpu_used * 2/3 + mem_used * 1/3)) / 100;
  }, 1000);

  //POST
  if (conf.ips !== "")
    app.use(ipfilter(conf.ips.join(','), {mode: 'allow'}));
  app.get('/', function(req, res) {
    console.log(status_val);
    res.json(status_val);
  });
  app.listen(conf.port);
});
