am4core.ready(function() {

	// Build the chart
	am4core.useTheme(am4themes_frozen);
	var chart = am4core.create("chart", am4charts.XYChart);
	chart.language.locale = am4lang_pt_BR;

	var valueAxisY = chart.yAxes.push(new am4charts.ValueAxis());
	valueAxisY.title.text = "Exposição à doenças ou infecções";
	valueAxisY.renderer.ticks.template.disabled = true;
	valueAxisY.renderer.axisFills.template.disabled = true;
	valueAxisY.max = 110;

	var valueAxisX = chart.xAxes.push(new am4charts.ValueAxis());
	valueAxisX.title.text = "Proximidade física";
	valueAxisX.renderer.ticks.template.disabled = true;
	valueAxisX.renderer.axisFills.template.disabled = true;
  	valueAxisX.max = 110;

	chart.cursor = new am4charts.XYCursor();
	chart.cursor.behavior = "zoomXY";
	chart.scrollbarX = new am4core.Scrollbar();
	chart.scrollbarY = new am4core.Scrollbar();
	chart.legend = new am4charts.Legend();
    chart.legend.useDefaultMarker = true;
    var marker = chart.legend.markers.template.children.getIndex(0);
    marker.width = 20;
    marker.height = 20;

	var brazil_data = JSON.parse(data);
	var dataset = brazil_data.filter(function(item) {
		return item.score >= 80 && item.score <= 100
	});

	// Create series
	generate_chart_series(chart, dataset);

	// Build the slider
	var slider = document.getElementById('slider');
	noUiSlider.create(slider, {
		orientation: 'horizontal',
		tooltips: [true, true],
		connect: true,
		start: [80, 100],
		range: {
			'min': 0,
			'max': 100
		},
		step: 1,
    	format: {
	        to: function (value) {
	            return value + '%';
	        },
	        from: function (value) {
	            return Number(value.replace('%', ''));
	        }
	    }
	});

	var datatable = $('#datatable').DataTable({
		responsive: true,
		paging: true,
		data: dataset,
        columns: [
            { title: 'Ocupação', data: "title" },
            { title: 'Categoria', data: "group" },
            { title: 'Trabalhadores', data: "employment", render: function (data, type, row) {
                var formatter = new Intl.NumberFormat('pt-BR', {
					style: 'decimal'
				});

				return formatter.format(data);
            }},
            { title: 'Média salarial', data: "average_salary", render: function (data, type, row) {
                var formatter = new Intl.NumberFormat('pt-BR', {
					style: 'currency',
					currency: 'BRL',
				});

				return formatter.format(data);
            }},
            { title: 'Risco', data: "score", render: function (data, type, row) {
                return Number(data).toFixed(2) + '%';
            }}
        ],
        order: [[ 4, "desc" ]],
        "language": {
		    "sEmptyTable": "Nenhum registro encontrado",
		    "sInfo": "Mostrando de _START_ até _END_ de _TOTAL_ registros",
		    "sInfoEmpty": "Mostrando 0 até 0 de 0 registros",
		    "sInfoFiltered": "(Filtrados de _MAX_ registros)",
		    "sInfoPostFix": "",
		    "sInfoThousands": ".",
		    "sLengthMenu": "_MENU_ resultados por página",
		    "sLoadingRecords": "Carregando...",
		    "sProcessing": "Processando...",
		    "sZeroRecords": "Nenhum registro encontrado",
		    "sSearch": "Pesquisar",
		    "oPaginate": {
		        "sNext": "Próximo",
		        "sPrevious": "Anterior",
		        "sFirst": "Primeiro",
		        "sLast": "Último"
		    },
		    "oAria": {
		        "sSortAscending": ": Ordenar colunas de forma ascendente",
		        "sSortDescending": ": Ordenar colunas de forma descendente"
		    },
		    "select": {
		        "rows": {
		            "_": "Selecionado %d linhas",
		            "0": "Nenhuma linha selecionada",
		            "1": "Selecionado 1 linha"
		        }
		    },
		    "thousands": ".",
		    "decimal": ","
		}
	});

	/*
	// Select one row and display on chart
	$('#datatable tbody').on('click', 'tr', function () {
        if($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        } else {
            datatable.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        }
    });
    */

	// Update the chart when change the slider
	slider.noUiSlider.on('change', function (values, handle) {
		var dataset = brazil_data.filter(function(item) {
			var min = Number(values[0].replace('%', ''));
			var max = Number(values[1].replace('%', ''));
			return item.score >= min && item.score <= max
		});

		// Create series
		chart.series.removeIndex(0).dispose();
		chart.series.removeIndex(0).dispose();
		chart.series.removeIndex(0).dispose();
		chart.series.removeIndex(0).dispose();
		chart.series.removeIndex(0).dispose();
		chart.series.removeIndex(0).dispose();
		chart.series.removeIndex(0).dispose();
		chart.series.removeIndex(0).dispose();
		chart.series.removeIndex(0).dispose();
		chart.series.removeIndex(0).dispose();
		chart.series.removeIndex(0).dispose();
		chart.series.removeIndex(0).dispose();
		chart.series.removeIndex(0).dispose();
		generate_chart_series(chart, dataset);

		datatable.clear();
	    datatable.rows.add(dataset);
	    datatable.draw();
	});

});

function generate_chart_series(chart, dataset) {
	create_chart_series(chart, "Alimentação", "#e03a71", dataset.filter(function(item) {
		return item.group == "Alimentação"
	}));
	create_chart_series(chart, "Agropecuária e pesca", "#10540a", dataset.filter(function(item) {
		return item.group == "Agropecuária e pesca"
	}));
	create_chart_series(chart, "Artes, Entretenimento e Mídia", "#9e8b75", dataset.filter(function(item) {
		return item.group == "Artes, Entretenimento e Mídia"
	}));
	create_chart_series(chart, "Ciências, Engenharia e Computação", "#8debe0", dataset.filter(function(item) {
		return item.group == "Ciências, Engenharia e Computação"
	}));
	create_chart_series(chart, "Comércio", "#abf051", dataset.filter(function(item) {
		return item.group == "Comércio"
	}));
	create_chart_series(chart, "Construção e Extração", "#8a8a8a", dataset.filter(function(item) {
		return item.group == "Construção e Extração"
	}));
	create_chart_series(chart, "Educação", "#deb147", dataset.filter(function(item) {
		return item.group == "Educação"
	}));
	create_chart_series(chart, "Indústria", "#314b6b", dataset.filter(function(item) {
		return item.group == "Indústria"
	}));
	create_chart_series(chart, "Jurídico e Serviço Social", "#4acc3b", dataset.filter(function(item) {
		return item.group == "Jurídico e Serviço Social"
	}));
	create_chart_series(chart, "Negócios, Finanças e Gestão", "#343deb", dataset.filter(function(item) {
		return item.group == "Negócios, Finanças e Gestão"
	}));
	create_chart_series(chart, "Saúde", "#e03a3a", dataset.filter(function(item) {
		return item.group == "Saúde"
	}));
	create_chart_series(chart, "Serviços", "#d051f0", dataset.filter(function(item) {
		return item.group == "Serviços"
	}));
	create_chart_series(chart, "Transportes", "#f7b78f", dataset.filter(function(item) {
		return item.group == "Transportes"
	}));
}

function create_chart_series(chart, name, color, data) {
	var series = chart.series.push(new am4charts.LineSeries());
	series.dataFields.valueY = "exposed_to_disease_or_infections";
	series.dataFields.valueX = "physical_proximity";
	series.dataFields.value = "employment";
	series.strokeOpacity = 0;
	series.name = name;
	series.data = data;
	series.fill = am4core.color(color);

	var bullet = series.bullets.push(new am4core.Circle());
	bullet.fill = am4core.color("#e53935");
	bullet.propertyFields.fill = "group_color";
	bullet.fillOpacity = 0.4;
	bullet.strokeOpacity = 0.5;
	bullet.strokeWidth = 1;
	bullet.hiddenState.properties.opacity = 0;
	bullet.tooltipText = "[bold]{title}:[/]\nTrabalhadores: {employment.formatNumber('#,###.')}\nMédia salarial: R$ {average_salary.formatNumber('#,###.##')}\nExposição à doenças: {exposed_to_disease_or_infections}\nProximidade física: {physical_proximity}";
	bullet.showTooltipOn = "hit";
	bullet.propertyFields.stroke = "group_color";

	var hoverState = bullet.states.create("hover");
	hoverState.properties.fillOpacity = 0.6;
	hoverState.properties.strokeOpacity = 0.7;

	series.heatRules.push({ target: bullet, min: 5, max: 40, property: "radius" });
	bullet.adapter.add("tooltipY", function (tooltipY, target) {
	    return -target.radius;
	});
}