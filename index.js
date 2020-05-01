$(document).ready(function() {

	// Sidenav configuration
	$('.sidenav').sidenav();

	$.getJSON('data/cbo-dataset.json', function(data) {
		// Bubble chart
		am4core.useTheme(am4themes_frozen);
		var chart = am4core.create('chart-bubble', am4charts.XYChart);
		chart.language.locale = am4lang_pt_BR;
		chart.cursor = new am4charts.XYCursor();
		chart.cursor.behavior = 'zoomXY';
		chart.scrollbarX = new am4core.Scrollbar();
		chart.scrollbarY = new am4core.Scrollbar();
		chart.legend = new am4charts.Legend();
		chart.legend.labels.template.fontSize = 12;
	    chart.legend.useDefaultMarker = true;
	    chart.events.on('ready', function() {
			$('#loading').hide();
		});

	    // Y and X configuration
		var valueAxisY = chart.yAxes.push(new am4charts.ValueAxis());
		valueAxisY.title.text = 'Exposição à doenças ou infecções';
		valueAxisY.renderer.ticks.template.disabled = true;
		valueAxisY.renderer.axisFills.template.disabled = true;
		valueAxisY.max = 100;
		var valueAxisX = chart.xAxes.push(new am4charts.ValueAxis());
		valueAxisX.title.text = 'Proximidade física';
		valueAxisX.renderer.ticks.template.disabled = true;
		valueAxisX.renderer.axisFills.template.disabled = true;
	  	valueAxisX.max = 100;

	  	// Marker configuration
	    var marker = chart.legend.markers.template.children.getIndex(0);
	    marker.width = 20;
	    marker.height = 20;
	    marker.cornerRadius(12, 12, 12, 12);

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
		        to: function (value) { return value + ' pts'; },
		        from: function (value) { return Number(value.replace(' pts', '')); }
		    }
		});

		// Datatable configuration
		var datatable = $('#datatable').DataTable({
			responsive: true,
			paging: true,
			data: dataset,
	        columns: [
	            { title: 'Ocupação', data: 'title', render: function (data, type, row) {
	            	if(type == 'display') {
						return data + ' <i class="material-icons tiny tooltipped" data-tooltip="Ocupação SOC: ' + row.soc_title + '">info_outline</i>';
					} else {
						return data;
					}
	            }},
	            { title: 'Categoria', data: 'group' },
	            { title: 'Trabalhadores', data: 'employment', render: function (data, type, row) {
					if(type == 'display') {
						var formatter = new Intl.NumberFormat('pt-BR', {
							style: 'decimal'
						});
						return formatter.format(data);
					} else {
						return data;
					}
	            }},
	            { title: 'Média salarial', data: 'average_salary', render: function (data, type, row) {
					if(type == 'display') {
						var formatter = new Intl.NumberFormat('pt-BR', {
							style: 'currency',
							currency: 'BRL',
						});
						return formatter.format(data);
					} else {
						return data;
					}
	            }},
	            { title: 'Risco', data: 'score', render: function (data, type, row) {
					if(type == 'display') {
						var text = 'Exposição à doenças: ' + row.exposed_to_disease_or_infections;
		            	text += '<br />Proximidade física: ' + row.physical_proximity;
		            	text += '<br />Contato com outras pessoas: ' + row.contact_with_others;
		            	var tooltip = ' <i class="material-icons tiny tooltipped" data-tooltip="' + text + '">info_outline</i>';
		                return Number(data).toFixed(2).replace('.', ',') + ' pts' + tooltip;
					} else {
						return data;
					}
	            }}
	        ],
	        'columnDefs': [
				{ 'width': '80px', 'targets': 4 }
			],
	        order: [[ 4, 'desc']],
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
						   series.name === item.group;
				});
			});

			var datatable_dataset = brazil_data.filter(function(item) {
				return item.score >= parseInt(sliderValues[0]) && 
					   item.score <= parseInt(sliderValues[1]) && 
					   unavailableSeries.indexOf(item.group) === -1;
			});
			datatable.clear();
		    datatable.rows.add(datatable_dataset);
		    datatable.draw();
		});

		// Update infertace after legend hit
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

	});

});

function addChartSeries(chart, dataset) {
	var chartSeries = [
		{ name: 'Alimentação', color: '#e03a71' },
		{ name: 'Agropecuária e pesca', color: '#10540a' },
		{ name: 'Artes, Entretenimento e Mídia', color: '#9e8b75' },
		{ name: 'Ciências, Engenharia e Computação', color: '#8debe0' },
		{ name: 'Comércio', color: '#abf051' },
		{ name: 'Construção e Extração', color: '#8a8a8a' },
		{ name: 'Educação', color: '#deb147' },
		{ name: 'Indústria', color: '#314b6b' },
		{ name: 'Jurídico e Serviço Social', color: '#4acc3b' },
		{ name: 'Negócios, Finanças e Gestão', color: '#343deb' },
		{ name: 'Saúde', color: '#e03a3a' },
		{ name: 'Serviços', color: '#d051f0' },
		{ name: 'Transportes', color: '#f7b78f' }
	];
	chartSeries.forEach(function(series) {
		createChartSeries(chart, series.name, series.color, dataset.filter(function(item) {
			return item.group == series.name
		}));
	});
}

function createChartSeries(chart, name, color, data) {
	var series = chart.series.push(new am4charts.LineSeries());
	series.dataFields.valueY = 'exposed_to_disease_or_infections';
	series.dataFields.valueX = 'physical_proximity';
	series.dataFields.value = 'employment';
	series.strokeOpacity = 0;
	series.name = name;
	series.data = data;
	series.fill = am4core.color(color);
	series.stroke = am4core.color(color);
	series.tooltip.pointerOrientation = 'down';

	var bullet = series.bullets.push(new am4core.Circle());
	bullet.fill = am4core.color('#e53935');
	bullet.propertyFields.fill = "group_color";
	bullet.fillOpacity = 0.4;
	bullet.strokeOpacity = 0.5;
	bullet.strokeWidth = 1;
	bullet.hiddenState.properties.opacity = 0;
	bullet.tooltipText = "[bold]{title}[/]\nCategoria: {group}\nTrabalhadores: {employment.formatNumber('#,###.')}\nMédia salarial: R$ {average_salary.formatNumber('#,###.##')}\nExposição à doenças: {exposed_to_disease_or_infections}\nProximidade física: {physical_proximity}\nContato com outras pessoas: {contact_with_others}\nRisco: {score.formatNumber('##.00')} pts";
	bullet.showTooltipOn = 'hit';
	bullet.propertyFields.stroke = 'group_color';

	var hoverState = bullet.states.create('hover');
	hoverState.properties.fillOpacity = 0.6;
	hoverState.properties.strokeOpacity = 0.7;

	series.heatRules.push({ target: bullet, min: 5, max: 30, property: 'radius' });
	bullet.adapter.add('tooltipY', function (tooltipY, target) {
	    return -target.radius;
	});
}