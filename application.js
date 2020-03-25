am4core.ready(function() {

	// Build the chart
	am4core.useTheme(am4themes_frozen);
	var chart = am4core.create("chart", am4charts.XYChart);
	chart.language.locale = am4lang_pt_BR;

	var valueAxisY = chart.yAxes.push(new am4charts.ValueAxis());
	valueAxisY.title.text = "Exposição à doenças ou infecções";
	valueAxisY.renderer.ticks.template.disabled = true;
	valueAxisY.renderer.axisFills.template.disabled = true;

	var valueAxisX = chart.xAxes.push(new am4charts.ValueAxis());
	valueAxisX.title.text = "Proximidade física";
	valueAxisX.renderer.ticks.template.disabled = true;
	valueAxisX.renderer.axisFills.template.disabled = true;

	var series = chart.series.push(new am4charts.LineSeries());
	series.dataFields.valueY = "exposed_to_disease_or_infections";
	series.dataFields.valueX = "physical_proximity";
	series.dataFields.value = "employment";
	series.strokeOpacity = 0;
	series.sequencedInterpolation = true;
	series.tooltip.pointerOrientation = "vertical";

	var bullet = series.bullets.push(new am4core.Circle());
	bullet.fill = am4core.color("#e53935");
	bullet.propertyFields.fill = "color";
	bullet.strokeOpacity = 0.5;
	bullet.strokeWidth = 2;
	bullet.fillOpacity = 0.5;
	bullet.stroke = am4core.color("#b71c1c");
	bullet.hiddenState.properties.opacity = 0;
	bullet.tooltipText = "[bold]{title}:[/]\nTrabalhadores: {employment.formatNumber('#,###.')}\nMédia salarial: R$ {average_salary.formatNumber('#,###.##')}\nExposição à doenças: {exposed_to_disease_or_infections}\nProximidade física: {physical_proximity}";

	var hoverState = bullet.states.create("hover");
	hoverState.properties.fillOpacity = 0.5;
	hoverState.properties.strokeOpacity = 0.5;

	series.heatRules.push({ target: bullet, min: 10, max: 50, property: "radius" });

	bullet.adapter.add("tooltipY", function (tooltipY, target) {
	    return -target.radius;
	})

	chart.cursor = new am4charts.XYCursor();
	chart.cursor.behavior = "zoomXY";

	chart.scrollbarX = new am4core.Scrollbar();
	chart.scrollbarY = new am4core.Scrollbar();
	var brazil_data = JSON.parse(data);
	var dataset = brazil_data.filter(function(item) {
		return item.score >= 80 && item.score <= 100
	});

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
    	limit: 50,
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
        order: [[ 3, "desc" ]],
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
	slider.noUiSlider.on('update', function (values, handle) {
		var dataset = brazil_data.filter(function(item) {
			var min = Number(values[0].replace('%', ''));
			var max = Number(values[1].replace('%', ''));
			return item.score >= min && item.score <= max
		});
		chart.data = dataset;
		datatable.clear();
	    datatable.rows.add(dataset);
	    datatable.draw();
	});

});