$(function () {
    
    const uri = route('sts', 'egvs');
    const formEgvs = $('#form-egvs');
    const spinner = $('#spiner-html').html();
    const ctx = document.getElementById('egvsChart').getContext('2d');
    
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
              beginAtZero: true,
              steps: 10,
              stepValue: 5,
              max: 400,
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
    
        
    $('.js-btn-fetch-egvs', formEgvs).on('click', function (e) {
      e.preventDefault();
      
      $('.js-average-egvs').html(spinner);
      
      let startDate = moment( $('[name=startDate]', formEgvs).val(), 'DD.MM.YYYY HH:mm:ss', true ).format('YYYY-MM-DD\TH:m:s');
      let utcStartDate = moment(startDate, 'YYYY-MM-DD\THH:mm:ss').utc().format('YYYY-MM-DD\THH:mm:ss');
      
      let endDate = moment( $('[name=endDate]', formEgvs).val(), 'DD.MM.YYYY HH:mm:ss', true ).format('YYYY-MM-DD\TH:m:s');
      let utcEndDate = moment(endDate, 'YYYY-MM-DD\THH:mm:ss').utc().format('YYYY-MM-DD\THH:mm:ss');
      
      getEgvs( uri, {startDate: utcStartDate, endDate: utcEndDate} );

    });
    
    
    function getEgvs(url, data) {

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
              datasets.high.data.push(180);
              datasets.low.data.push(50);
            }
            
            average += egvs[i]['value'];
          }
          
          chartConfig.data.labels.forEach(function(label) {
            
            datasets.egvs.data.push( Math.round(dataValue[label]['value']/dataValue[label]['len']) );
          });
          
          Object.keys(datasets).forEach(function(key) {
            
            chartConfig.data.datasets.push(datasets[key]);
          });

          $('.js-average-egvs').html( Math.round(average/egvs.length) );
          
          const chart = new Chart(ctx, chartConfig);
        }
      }).fail(function (error) {
        console.log(error);
      });
    }
    
});
