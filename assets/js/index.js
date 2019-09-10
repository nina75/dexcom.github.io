$(function () {
    
    (function() {
      getLatest();
    })();
    
    
    const uri = route('sts', 'egvs');
    const formEgvs = $('#form-egvs');
    const spinner = $('#spinner-html').html();
    const templateCanvas = $('#template-canvas').html();
    
    
    $('#dp-start-date').datetimepicker({
      locale: 'bg',
      format: 'DD.MM.YYYY HH:mm:ss',
      defaultDate: moment(new Date(), 'DD.MM.YYYY HH:mm:ss').subtract(7,'d'),
    });
    
    $('#dp-end-date').datetimepicker({
      locale: 'bg',
      format: 'DD.MM.YYYY HH:mm:ss',
      defaultDate: new Date(),
    });
    
    $('#dp-start-date,#dp-end-date').on('change.datetimepicker', function(e) {
      
      $('input', e.currentTarget).blur().removeAttr('readonly', 'readonly');
    });
    
    $('[name=startDate],[name=endDate]').on('focus', function(e) {
      
      if ( $('.bootstrap-datetimepicker-widget').length > 0 ) {
        
        $(e.currentTarget).attr('readonly', 'readonly');
      }
    });
    
    $('[name=startDate],[name=endDate]').on('focusout', function(e) {
      $(e.currentTarget).removeAttr('readonly');
    });
    
        
    $('.js-btn-fetch-egvs', formEgvs).on('click', function (e) {
      e.preventDefault();
      
      $(e.currentTarget).html(spinner);
      
      let startDate = moment( $('[name=startDate]', formEgvs).val(), 'DD.MM.YYYY HH:mm:ss', true ).format('YYYY-MM-DD\TH:m:s');
      let utcStartDate = moment(startDate, 'YYYY-MM-DD\THH:mm:ss').utc().format('YYYY-MM-DD\THH:mm:ss');
      
      let endDate = moment( $('[name=endDate]', formEgvs).val(), 'DD.MM.YYYY HH:mm:ss', true ).format('YYYY-MM-DD\TH:m:s');
      let utcEndDate = moment(endDate, 'YYYY-MM-DD\THH:mm:ss').utc().format('YYYY-MM-DD\THH:mm:ss');
      
      getEgvs( uri, {startDate: utcStartDate, endDate: utcEndDate} );

    });
    
    
    $('.js-btn-units').on('click', function(e) {
      e.preventDefault();
      
      $('.js-btn-units').removeClass('btn-success');
      
      $(e.currentTarget).addClass('btn-success');
      
      $('.units').addClass('d-none');
      $('.js-average-egvs').addClass('d-none');
      
      
      $( '.js-latest-' + e.currentTarget.dataset.unit ).closest('.units').removeClass('d-none');
      
      $( '.js-average-egvs-' + e.currentTarget.dataset.unit ).closest('.js-average-egvs').removeClass('d-none');
      
      $('div[class^=js-chart-container]').addClass('d-none');
      
      $( '.js-chart-container-' + e.currentTarget.dataset.unit ).removeClass('d-none');
      
    });
    
    
    $('#btn-reload-latest').on('click', function() {
      
      $('p[class*="js-latest"]').html(spinner);
      
      getLatest();
      
    });
    
    
    function getLatest() {
      
      $.ajax({
        type: "GET",
        url: route('sts', 'latest'),
        cache: false,
      }).done(function (response) {
        
        var mmolCont = $('.js-latest-mmol');
        var mgCont = $('.js-latest-mg');
        
        if(response.success) {
          if (response.data.status == 'fail') {
            mmolCont.html(response.data.error_message);
            mgCont.html(response.data.error_message);
          } else {
            mmolCont.html(response.data.mmol + ' ' + response.data.trend_symbol + ' ' + response.data.time);
            mgCont.html(response.data.value + ' ' + response.data.trend_symbol + ' ' + response.data.time);
          }
        }
        
        
      });
      
    }
    
    
    function getEgvs(url, data) {

      let chartConfig = {
        //The type of chart we want to create
        type: 'line',

         //The data for our dataset
        data: {
            labels: [],
            datasets: [],
        },

         //Configuration options goes here
        options: {
          responsive: true,
          legend: {
            display: false,
          },
          scales: {
            yAxes: [{
              ticks: {
                min: 0,
                callback: function(value, index, values) {
                  if (Math.floor(value) === value) {
                      return value;
                  }
                }
              }
            }]
          }
        }
      };
      
      let datasets = {
        egvs: {
          label: 'EGVS',
          fill: false,
          borderColor: 'rgb(0, 0, 0)',
          backgroundColor: 'rgb(0, 0, 0)',
          data: [],
        }, 
        high: {
          label: 'High',
          fill: true,
          backgroundColor: 'rgba(128, 255, 128, 0.3)',
          borderColor: 'rgba(255, 0, 0, 0.5)',
          data: [],
          pointRadius: 0,
        }, 
        low: {
          label: 'Low',
          borderColor: 'rgb(255, 0, 0)',
          backgroundColor: 'rgba(255, 0, 0, 0.5)',
          data: [],
          pointRadius: 0,
        }
      };
      
      let mgDatasets = $.extend(true, {}, datasets);


      $.ajax({
        type: "GET",
        url: url,
        data: data,
        cache: false,
      }).done(function (response) {

        if(response.success) {

          const egvs = response.data.egvs;
          let average = 0;
          let dataValue = {};

          for (let i = egvs.length - 1; i >= 0; i--) {
            
            let cDay = moment(egvs[i]['displayTime'], 'YYYY-MM-DD\THH:mm:ss', true).format('DD.MM');
            
            if ( dataValue[cDay] ) {
              dataValue[cDay]['value'] += egvs[i]['value'];
              dataValue[cDay]['len']++;
            } else {
              dataValue[cDay] = {};
              dataValue[cDay]['value'] = egvs[i]['value'];
              dataValue[cDay]['len'] = 1;
              
              chartConfig.data.labels.push(cDay);
              
              datasets.high.data.push(10);
              datasets.low.data.push(3);
              
              mgDatasets.high.data.push(180);
              mgDatasets.low.data.push(50);
            }
            
            average += egvs[i]['value'];
          }
          
          
          let mgChartConfig = $.extend(true, {}, chartConfig);
          
          
          chartConfig.data.labels.forEach(function(label) {
            let mg = dataValue[label]['value']/dataValue[label]['len'];
            
            datasets.egvs.data.push( Number.parseFloat(mg/18).toFixed(1) );
            mgDatasets.egvs.data.push( Math.round(mg) );
          });
          
          Object.keys(datasets).forEach(function(key) {
            
            chartConfig.data.datasets.push(datasets[key]);
            mgChartConfig.data.datasets.push(mgDatasets[key]);
          });
          
          let averageEgvs = average / egvs.length;

          $('.js-average-egvs-mmol').html( Number.parseFloat(averageEgvs/18).toFixed(1) );
          $('.js-average-egvs-mg').html( Math.round(averageEgvs) );
          $('.js-average-egvs-container').removeClass('d-none');
          
          $('.js-btn-fetch-egvs', formEgvs).html('Fetch');
          
          
          $('.js-chart-container-mmol').html( templateCanvas.replace('#canvasId#', 'mmolChart') );
          $('.js-chart-container-mg').html( templateCanvas.replace('#canvasId#', 'mgChart') );
          
          
          const mmolChart = document.getElementById('mmolChart').getContext('2d');
          const mgChart = document.getElementById('mgChart').getContext('2d');
          
          
          const chart = new Chart(mmolChart, chartConfig);
          const mgLChart = new Chart(mgChart, mgChartConfig);
          
        }
      }).fail(function (error) {
        console.log(error);
      });
    }
    
});
