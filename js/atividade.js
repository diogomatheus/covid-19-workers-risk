$(document).ready(function() {

	// Sidenav configuration
	$('.sidenav').sidenav();

	$.getJSON('dataset/cnae-dataset.json', function(data) {
		// Bubble chart
		am4core.useTheme(am4themes_frozen);
		var chart = am4core.create('chart-bubble-activities', am4charts.XYChart);
		chart.language.locale = am4lang_pt_BR;
		chart.cursor = new am4charts.XYCursor();
		chart.cursor.behavior = 'zoomXY';
		chart.scrollbarX = new am4core.Scrollbar();
		chart.scrollbarY = new am4core.Scrollbar();
		/*
		chart.legend = new am4charts.Legend();
		chart.legend.labels.template.fontSize = 12;
	    chart.legend.useDefaultMarker = true;
	    */
	    chart.events.on('ready', function() {
			$('#loading').hide();
		});

	    // X and Y configuration
		var valueAxisX = chart.xAxes.push(new am4charts.ValueAxis());
		valueAxisX.title.text = 'Trabalhadores em risco (%)';
		valueAxisX.renderer.ticks.template.disabled = true;
		valueAxisX.renderer.axisFills.template.disabled = true;
	  	valueAxisX.max = 100;
	  	var valueAxisY = chart.yAxes.push(new am4charts.ValueAxis());
		valueAxisY.title.text = 'Índice de Risco de Contágio';
		valueAxisY.renderer.ticks.template.disabled = true;
		valueAxisY.renderer.axisFills.template.disabled = true;
		valueAxisY.max = 100;

	  	// Marker configuration
	    /*
	    var marker = chart.legend.markers.template.children.getIndex(0);
	    marker.width = 20;
	    marker.height = 20;
	    marker.cornerRadius(12, 12, 12, 12);
	    */

	    // Brazilian data
		var brazil_data = data;

		// Insert filtered data
		var dataset = brazil_data.filter(function(item) {
			return item.score >= 50 && item.score <= 100
		});
		addChartSeries(chart, dataset);

		// Build slider
		var slider = document.getElementById('slider');
		noUiSlider.create(slider, {
			orientation: 'horizontal',
			tooltips: [true, true],
			connect: true,
			start: [50, 100],
			range: {
				'min': 0,
				'max': 100
			},
			step: 1,
	    	format: {
		        to: function (value) { return value + '%'; },
		        from: function (value) { return Number(value.replace('%', '')); }
		    }
		});

		// Datatable configuration
		var datatable = $('#datatable').DataTable({
			responsive: true,
			paging: true,
			data: dataset,
	        columns: [
	            { title: 'Atividade', data: 'name' },
	            { title: 'Trabalhadores', data: 'workers', render: function (data, type, row) {
					if(type == 'display') {
						var formatter = new Intl.NumberFormat('pt-BR', {
							style: 'decimal'
						});
						return formatter.format(data);
					} else {
						return data;
					}
				}},
				{ title: 'Trabalhadores em risco', data: 'workers_risk', render: function (data, type, row) {
					if(type == 'display') {
						var formatter = new Intl.NumberFormat('pt-BR', {
							style: 'decimal'
						});
						var value = formatter.format(data);
						value += ' (' + Number(row.workers_risk_percentage).toFixed(2).replace('.', ',') + '%)';
						return value;
					} else {
						return data;
					}
				}},
	            { title: 'Risco', data: 'score', render: function (data, type, row) {
					if(type == 'display')
						return Number(data).toFixed(2).replace('.', ',') + '%';
					else
						return data;
	            }}
	        ],
	        'columnDefs': [
				{ 'width': '80px', 'targets': 3 }
			],
	        order: [[ 3, 'desc']],
	        'language': {
			    'sEmptyTable': 'Nenhum registro encontrado',
			    'sInfo': 'Mostrando de _START_ até _END_ de _TOTAL_ registros',
			    'sInfoEmpty': 'Mostrando 0 até 0 de 0 registros',
			    'sInfoFiltered': '(Filtrados de _MAX_ registros)',
			    'sInfoPostFix': '',
			    'sInfoThousands': '.',
			    'sLengthMenu': '_MENU_ resultados por página',
			    'sLoadingRecords': 'Carregando...',
			    'sProcessing': 'Processando...',
			    'sZeroRecords': 'Nenhum registro encontrado',
			    'sSearch': 'Pesquisar',
			    'oPaginate': {
			        'sNext': 'Próximo',
			        'sPrevious': 'Anterior',
			        'sFirst': 'Primeiro',
			        'sLast': 'Último'
			    },
			    'oAria': {
			        'sSortAscending': ': Ordenar colunas de forma ascendente',
			        'sSortDescending': ': Ordenar colunas de forma descendente'
			    },
			    'select': {
			        'rows': {
			            '_': 'Selecionado %d linhas',
			            '0': 'Nenhuma linha selecionada',
			            '1': 'Selecionado 1 linha'
			        }
			    },
			    'thousands': '.',
			    'decimal': ','
			}
		});

		// Tooltip configuration
		$('.tooltipped').tooltip({ html: true });

		// Tooltip configuration based on datatables events
		datatable.on('draw', function () {
	    	$('.tooltipped').tooltip({ html: true });
		});

		// Update interface after slider change
		slider.noUiSlider.on('change', function (values, handle) {
			var sliderValues = slider.noUiSlider.get();
			var unavailableSeries = [];
			chart.series.each(function(series) {
				if(!series.visible) unavailableSeries.push(series.name);
				series.data = brazil_data.filter(function(item) {
					return item.score >= parseInt(sliderValues[0]) && 
						   item.score <= parseInt(sliderValues[1]) && 
						   series.name === 'Default';
				});
			});

			var datatable_dataset = brazil_data.filter(function(item) {
				return item.score >= parseInt(sliderValues[0]) && 
					   item.score <= parseInt(sliderValues[1]) && 
					   unavailableSeries.indexOf(item.group) === -1;
			});
			datatable.clear();
		    datatable.rows.add(brazil_data);
		    datatable.draw();
		});

		// Update infertace after legend hit
		/*
		chart.legend.itemContainers.template.events.on('hit', function(ev) {
			var sliderValues = slider.noUiSlider.get();
			var unavailableSeries = [];	
			chart.series.each(function(series) {
				var visible = !series.visible;
				if(series.name === ev.target.dataItem.dataContext.name) visible = !visible;
				if(visible) unavailableSeries.push(series.name);
			});
			var dataset = brazil_data.filter(function(item) {
				return item.score >= parseInt(sliderValues[0]) && 
					   item.score <= parseInt(sliderValues[1]) && 
					   unavailableSeries.indexOf(item.group) === -1;
			});

			datatable.clear();
		    datatable.rows.add(dataset);
		    datatable.draw();
		});
		*/

	});

});

function addChartSeries(chart, dataset) {
	var chartSeries = [
		{ name: 'Default', color: '#e53935' }
	];
	chartSeries.forEach(function(series) {
		createChartSeries(chart, series.name, series.color, dataset);
	});
}

function createChartSeries(chart, name, color, data) {
	var series = chart.series.push(new am4charts.LineSeries());
	series.dataFields.valueX = 'workers_risk_percentage';
	series.dataFields.valueY = 'score';
	series.dataFields.value = 'workers';
	series.strokeOpacity = 0;
	series.name = name;
	series.data = data;
	series.fill = am4core.color(color);
	series.stroke = am4core.color(color);
	series.tooltip.pointerOrientation = 'down';

	var bullet = series.bullets.push(new am4core.Circle());
	bullet.fill = am4core.color('#e53935');
	// bullet.propertyFields.fill = "group_color";
	bullet.fillOpacity = 0.4;
	bullet.strokeOpacity = 0.5;
	bullet.strokeWidth = 1;
	bullet.hiddenState.properties.opacity = 0;
	bullet.tooltipText = "[bold]{name}[/]\nTrabalhadores: {workers.formatNumber('#,###.')}\nTrabalhadores em risco: {workers_risk.formatNumber('#,###.')} ({workers_risk_percentage.formatNumber('##.00')}%)\nRisco: {score.formatNumber('##.00')}%";
	bullet.showTooltipOn = 'hit';
	// bullet.propertyFields.stroke = 'group_color';

	var hoverState = bullet.states.create('hover');
	hoverState.properties.fillOpacity = 0.6;
	hoverState.properties.strokeOpacity = 0.7;

	series.heatRules.push({ target: bullet, min: 5, max: 30, property: 'radius' });
	bullet.adapter.add('tooltipY', function (tooltipY, target) {
	    return -target.radius;
	});
}