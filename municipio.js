$(document).ready(function() {
	
	// Sidenav configuration
	$('.sidenav').sidenav();

	$.getJSON('data/municipio-dataset.geojson', function(data) {
		// Map chart
		am4core.useTheme(am4themes_frozen);
		var chart = am4core.create('chart-map', am4maps.MapChart);
		chart.projection = new am4maps.projections.Mercator();
		chart.geodata = am4geodata_BrazilStates;
		chart.zoomControl = new am4maps.ZoomControl();
		chart.events.on('ready', function() {
			$('#loading').hide();
		});

		// Home button
		var homeButton = new am4core.Button();
		homeButton.icon = new am4core.Sprite();
		homeButton.padding(7, 5, 7, 5);
		homeButton.width = 30;
		homeButton.icon.path = 'M16,8 L14,8 L14,16 L10,16 L10,10 L6,10 L6,16 L2,16 L2,8 L0,8 L8,0 L16,8 Z M16,8';
		homeButton.marginBottom = 10;
		homeButton.parent = chart.zoomControl;
		homeButton.insertBefore(chart.zoomControl.plusButton);
		homeButton.events.on('hit', function() {
			chart.goHome();
		});

		// Center brazil
		chart.homeZoomLevel = 0;
		chart.homeGeoPoint = { longitude: -48.69140625, latitude: -13.496472765758952 };

		// Brazil map
		var brazilSeries = chart.series.push(new am4maps.MapPolygonSeries());
		brazilSeries.name = 'Brazil';
		brazilSeries.useGeodata = true;
		brazilSeries.exclude = data;
		brazilSeries.fillOpacity = 0.8;
		brazilSeries.hiddenInLegend = true;
		brazilSeries.mapPolygons.template.nonScalingStroke = true;

		// Create map polygon series
		var polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
		polygonSeries.heatRules.push({
			property: 'fill',
			target: polygonSeries.mapPolygons.template,
			min: chart.colors.getIndex(1).brighten(1),
			max: chart.colors.getIndex(1).brighten(-0.3)
		});

		// Make map load polygon data from GeoJSON
		polygonSeries.useGeodata = true;
		polygonSeries.geodata = data;

		// Set up heat legend
		let heatLegend = chart.createChild(am4maps.HeatLegend);
		heatLegend.series = polygonSeries;
		heatLegend.valign = 'top';
		heatLegend.align = 'right';
		heatLegend.width = am4core.percent(25);
		heatLegend.marginRight = am4core.percent(4);
		heatLegend.minValue = 0;
		heatLegend.maxValue = 1;

		// Set up custom heat map legend labels using axis ranges
		var minRange = heatLegend.valueAxis.axisRanges.create();
		minRange.value = heatLegend.minValue;
		minRange.label.text = 'Risco baixo';
		var maxRange = heatLegend.valueAxis.axisRanges.create();
		maxRange.value = heatLegend.maxValue;
		maxRange.label.text = 'Risco alto';

		// Blank out internal heat legend value axis labels
		heatLegend.valueAxis.renderer.labels.template.adapter.add('text', function(labelText) {
			return '';
		});

		// Configure series tooltip
		var polygonTemplate = polygonSeries.mapPolygons.template;
		polygonTemplate.tooltipText = "[bold]{title} ({state}):[/]\nTrabalhadores: {workers_total.formatNumber('#,###.')}\nTrabalhadores em risco: {workers_risk.formatNumber('#,###.')}\nRisco de impacto: {value.formatNumber('#.##%')}";
		polygonTemplate.nonScalingStroke = true;
		polygonTemplate.strokeWidth = 0.5;

		// Create hover state and set alternative fill color
		var hs = polygonTemplate.states.create('hover');
		hs.properties.fill = chart.colors.getIndex(1).brighten(-0.5);

		// Datatable configuration
		var datatable = $('#datatable').DataTable({
			responsive: true,
			paging: true,
			data: data.features,
	        columns: [
	            { title: 'Município', data: 'properties.title' },
	            { title: 'Estado', data: 'properties.state' },
	            { title: 'Trabalhadores', data: 'properties.workers_total', render: function (data, type, row) {
					if(type == 'display') {
						var formatter = new Intl.NumberFormat('pt-BR', {
							style: 'decimal'
						});
						return formatter.format(data);
					} else {
						return data;
					}
	            }},
	            { title: 'Trabalhadores em risco', data: 'properties.workers_risk', render: function (data, type, row) {
					if(type == 'display') {
						var formatter = new Intl.NumberFormat('pt-BR', {
							style: 'decimal'
						});
						return formatter.format(data);
					} else {
						return data;
					}
	            }},
	            { title: 'Risco', data: 'properties.value', render: function (data, type, row) {
					if(type == 'display') {
						return Number(data * 100).toFixed(2) + '%';
					} else {
						return data;
					}
	            }}
	        ],
	        'columnDefs': [
				{ 'width': '80px', 'targets': 4 }
			],
	        order: [[ 4, 'desc' ]],
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
	});

});