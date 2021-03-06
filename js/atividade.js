document.addEventListener("DOMContentLoaded", function(event) {

	// Materialize sidenav
	M.Sidenav.init(document.querySelectorAll('.sidenav'));

	$.getJSON('dataset/brazilian-economic-activities-class.json', function(data) {
		// Bubble chart
		am4core.useTheme(am4themes_frozen);
		var chart = am4core.create('chart-activities', am4charts.XYChart);
		chart.language.locale = am4lang_pt_BR;
		chart.cursor = new am4charts.XYCursor();
		chart.cursor.behavior = 'zoomXY';
		chart.scrollbarX = new am4core.Scrollbar();
		chart.scrollbarY = new am4core.Scrollbar();
		chart.legend = new am4charts.Legend();
		chart.legend.labels.template.fontSize = 12;
	    chart.legend.useDefaultMarker = true;
	    chart.events.on('ready', function() {
			document.getElementById('loading').style.display = 'none';
		});

		// Marker configuration (legend)
	    var marker = chart.legend.markers.template.children.getIndex(0);
	    marker.width = 20;
	    marker.height = 20;
	    marker.cornerRadius(12, 12, 12, 12);

	    // X and Y configuration
		var valueAxisX = chart.xAxes.push(new am4charts.ValueAxis());
		valueAxisX.title.text = 'Trabalhadores em risco (%)';
		valueAxisX.renderer.ticks.template.disabled = true;
		valueAxisX.renderer.axisFills.template.disabled = true;
	  	valueAxisX.max = 100;
	  	valueAxisX.title.fontSize = 14;
		valueAxisX.renderer.labels.template.fontSize = 12;
	  	var valueAxisY = chart.yAxes.push(new am4charts.ValueAxis());
		valueAxisY.title.text = 'Índice de risco de contágio';
		valueAxisY.renderer.ticks.template.disabled = true;
		valueAxisY.renderer.axisFills.template.disabled = true;
		valueAxisY.max = 80;
		valueAxisY.title.fontSize = 14;
		valueAxisY.renderer.labels.template.fontSize = 12;

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
	            { title: 'Categoria', data: 'group' },
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

		// Materialize tooltip init
		materializeTooltipInit();
		datatable.on('draw', function () {
	    	materializeTooltipInit();
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
		{ name: 'Administração Pública, Defesa e Seguridade Social', color: '#8a5a3a' },
		{ name: 'Agricultura, Pecuária, Produção Florestal, Pesca e Aquicultura', color: '#10540a' },
		{ name: 'Água, Esgoto, Atividades de Gestão de Resíduos e Descontaminação', color: '#f242f5' },
		{ name: 'Alojamento e Alimentação', color: '#e03a71' },
		{ name: 'Artes, Cultura, Esporte e Recreação', color: '#9e8b75' },
		{ name: 'Atividades Administrativas e Serviços Complementares', color: '#343deb' },
		{ name: 'Atividades Financeiras, Seguros e Serviços Relacionados', color: '#f5e642' },
		{ name: 'Atividades Imobiliárias', color: '#9000ff' },
		{ name: 'Atividades Profissionais, Científicas e Técnicas', color: '#8debe0' },
		{ name: 'Comércio & Reparação de Veículos Automotores e Motocicletas', color: '#abf051' },
		{ name: 'Construção', color: '#8a8a8a' },
		{ name: 'Educação', color: '#deb147' },
		{ name: 'Eletricidade e Gás', color: '#3a8a7f' },
		{ name: 'Indústrias de Transformação', color: '#314b6b' },
		{ name: 'Indústrias Extrativas', color: '#4acc3b' },
		{ name: 'Informação e Comunicação', color: '#f58742' },
		{ name: 'Organismos Internacionais e Outras Instituições Extraterritoriais', color: '#000000' },
		{ name: 'Outras Atividades de Serviços', color: '#d051f0' },
		{ name: 'Saúde Humana e Serviços Sociais', color: '#e03a3a' },
		{ name: 'Serviços Domésticos', color: '#cfa7a7' },
		{ name: 'Transporte, Armazenagem e Correio', color: '#f7b78f' }
	];
	chartSeries.forEach(function(series) {
		createChartSeries(chart, series.name, series.color, dataset.filter(function(item) {
			return item.group == series.name
		}));
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
	series.tooltip.fontSize = 13;
	series.tooltip.pointerOrientation = 'down';

	var bullet = series.bullets.push(new am4core.Circle());
	bullet.fill = am4core.color('#e53935');
	bullet.propertyFields.fill = "group_color";
	bullet.fillOpacity = 0.4;
	bullet.strokeOpacity = 0.5;
	bullet.strokeWidth = 1;
	bullet.hiddenState.properties.opacity = 0;
	bullet.tooltipText = "[bold]{name}[/]\nTrabalhadores: {workers.formatNumber('#,###.')}\nTrabalhadores em risco: {workers_risk.formatNumber('#,###.')} ({workers_risk_percentage.formatNumber('##.00')}%)\nRisco: {score.formatNumber('##.00')}%";
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

function materializeTooltipInit() {
	var elems = document.querySelectorAll('.tooltipped');
    var instances = M.Tooltip.init(elems, { html: true });
}