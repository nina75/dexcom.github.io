$(function () {
    
    const uri = route('sts', 'egvs');
    const formEgvs = $('#form-egvs');
    const spinner = $('#spiner-html').html();
    
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
    
    
    $('.js-btn-fetch-egvs', formEgvs).on('click', function (e) {
      e.preventDefault();
      
      $('.js-average-egvs').html(spinner);
      
      let startDate = moment( $('[name=startDate]', formEgvs).val(), 'DD.MM.YYYY HH:mm:ss', true ).format('YYYY-MM-DD\TH:m:s');      
      let utcStartDate = moment(startDate).utc().format('YYYY-MM-DD\THH:mm:ss');
      let endDate = moment( $('[name=endDate]', formEgvs).val(), 'DD.MM.YYYY HH:mm:ss', true ).format('YYYY-MM-DD\TH:m:s');
      let utcEndDate = moment(endDate).utc().format('YYYY-MM-DD\THH:mm:ss');
      
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

          for(let i = 0; i < egvs.length; i++) {
            
            average += egvs[i]['value'];
          }

          $('.js-average-egvs').html( Math.round(average/egvs.length) );
        }
      }).fail(function (error) {
        console.log('------error-----')
        console.log(error);
        console.log('------end error------');
      });
    }
});

//~ google.charts.load('current', {'packages':['corechart']});
      //~ google.charts.setOnLoadCallback(drawChart);

      //~ function drawChart() {
        //~ var data = google.visualization.arrayToDataTable([
          //~ ['Year', 'Sales', 'Expenses'],
          //~ ['2013',  1000,      400],
          //~ ['2014',  1170,      460],
          //~ ['2015',  660,       1120],
          //~ ['2016',  1030,      540]
        //~ ]);

        //~ var options = {
          //~ title: 'Company Performance',
          //~ hAxis: {title: 'Year',  titleTextStyle: {color: '#333'}},
          //~ vAxis: {minValue: 0}
        //~ };

        //~ var chart = new google.visualization.AreaChart(document.getElementById('chart_div'));
        //~ chart.draw(data, options);
      //~ }
      