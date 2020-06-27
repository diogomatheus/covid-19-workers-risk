var dataset;
var region = 'Brasil';

document.addEventListener("DOMContentLoaded", function(event) {
	
	// Materialize sidenav
	M.Sidenav.init(document.querySelectorAll('.sidenav'));

	// Materialize select
	M.FormSelect.init(document.querySelectorAll('select'));

	// Load the geojson
	$.getJSON('dataset/brazil-mobility-dataset.json', function(data) {
		am4core.useTheme(am4themes_animated);
		var chart = am4core.create("chart-mobility", am4charts.XYChart);
		chart.language.locale = am4lang_pt_BR;
		chart.legend = new am4charts.Legend();
		chart.legend.labels.template.fontSize = 12;
	    chart.legend.useDefaultMarker = true;
		chart.data = data[region];
		chart.events.on('ready', function() {
			document.getElementById('loading').style.display = 'none';
		});

		// Marker configuration (legend)
	    var marker = chart.legend.markers.template.children.getIndex(0);
	    marker.width = 20;
	    marker.height = 20;
	    marker.cornerRadius(12, 12, 12, 12);

		// Set input format for the dates
		chart.dateFormatter.inputDateFormat = "yyyy-MM-dd";

		// Create axes
		var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
		dateAxis.title.fontSize = 14;
		dateAxis.renderer.labels.template.fontSize = 12;
		var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
		valueAxis.title.fontSize = 14;
		valueAxis.renderer.labels.template.fontSize = 12;

		// Create series list
		var seriesList = addChartSeries(chart);

		// Make a panning cursor
		chart.cursor = new am4charts.XYCursor();
		chart.cursor.behavior = "panXY";
		chart.cursor.xAxis = dateAxis;
		chart.cursor.snapToSeries = seriesList;

		// Create vertical scrollbar and place it before the value axis
		chart.scrollbarY = new am4core.Scrollbar();
		chart.scrollbarY.parent = chart.leftAxesContainer;
		chart.scrollbarY.toBack();

		// Create a horizontal scrollbar with previe and place it underneath the date axis
		chart.scrollbarX = new am4charts.XYChartScrollbar();
		chart.series.each(function(series) {
			chart.scrollbarX.series.push(series);
		});
		chart.scrollbarX.parent = chart.bottomAxesContainer;

		dateAxis.start = 0.79;
		dateAxis.keepSelection = true;

		document.getElementById('region').addEventListener('change', function() {
			region = document.getElementById('region').value;
			chart.data = data[region];
		});
	});

});

function addChartSeries(chart) {
	var seriesList = [
		createChartSeries(chart, 'workplaces', 'Locais de Trabalho', '#dc8431'),
		createChartSeries(chart, 'parks', 'Parques', '#2a8b48'),
		createChartSeries(chart, 'retail_and_recreation', 'Varejo e Recreação', '#689ce4'),
		createChartSeries(chart, 'transit_stations', 'Estações de Trânsito', '#e673b6'),
		createChartSeries(chart, 'residential', 'Residencial', '#9d58d8'),
		createChartSeries(chart, 'grocery_and_pharmacy', 'Mercearia e Farmácia', '#77cbd7')
	];
}

function createChartSeries(chart, name, label, color) {
	// Create series
	var series = chart.series.push(new am4charts.LineSeries());
	series.dataFields.valueY = name;
	series.dataFields.dateX = 'date';	
	series.minBulletDistance = 20;
	series.name = label;
	series.fill = am4core.color(color);
	series.stroke = series.fill;
	series.strokeWidth = 2;
	series.tooltipText = label + ": {" + name + "}%";
	series.tooltip.fontSize = 13;
	series.tooltip.background.cornerRadius = 20;
	series.tooltip.background.strokeOpacity = 0;

	// Make bullets grow on hover
	var bullet = series.bullets.push(new am4charts.CircleBullet());
	bullet.circle.strokeWidth = 2;
	bullet.circle.radius = 4;
	bullet.circle.fill = am4core.color("#fff");

	var bullethover = bullet.states.create("hover");
	bullethover.properties.scale = 1.3;

	return series;
}