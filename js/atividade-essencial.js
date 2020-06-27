document.addEventListener("DOMContentLoaded", function(event) {

	// Materialize sidenav
	M.Sidenav.init(document.querySelectorAll('.sidenav'));

	$.getJSON('dataset/brazil-essential-activity-dataset.json', function(data) {
		// Decree chart
		am4core.useTheme(am4themes_animated);
		var chart = am4core.create("chart-essential-activities", am4charts.XYChart);
		chart.language.locale = am4lang_pt_BR;
		chart.colors.step = 2;
		chart.maskBullets = false;
		chart.events.on('ready', function() {
			document.getElementById('loading').style.display = 'none';
		});

		// Data
		chart.data = data;

		// Create axes
		var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
		dateAxis.renderer.grid.template.location = 0;
		dateAxis.renderer.grid.template.disabled = true;
		dateAxis.renderer.fullWidthTooltip = true;
		dateAxis.title.fontSize = 14;
		dateAxis.renderer.labels.template.fontSize = 12;

		var workerRiskAxis = chart.yAxes.push(new am4charts.ValueAxis());
		workerRiskAxis.title.text = "Trabalhadores essenciais em risco";
		workerRiskAxis.title.fontSize = 14;
		workerRiskAxis.renderer.labels.template.fontSize = 12;
		workerRiskAxis.max = 8000000;
		
		var totalCaseAxis = chart.yAxes.push(new am4charts.ValueAxis());
		totalCaseAxis.title.text = "Casos confirmados de covid-19 (acumulado)";
		totalCaseAxis.title.fontSize = 14;
		totalCaseAxis.renderer.labels.template.fontSize = 12;
		totalCaseAxis.renderer.grid.template.disabled = true;
		totalCaseAxis.renderer.opposite = true;
		workerRiskAxis.syncWithAxis = totalCaseAxis;

		// Create series
		var workerRiskSeries = chart.series.push(new am4charts.LineSeries());
		workerRiskSeries.dataFields.valueY = "decree_workers_risk";
		workerRiskSeries.dataFields.dateX = "date";
		workerRiskSeries.yAxis = workerRiskAxis;
		workerRiskSeries.name = "Trabalhadores essenciais em risco";
		workerRiskSeries.strokeWidth = 2;
		workerRiskSeries.propertyFields.strokeDasharray = "dashLength";
		workerRiskSeries.tooltipText = "[bold]Decreto: {decree_id}[/]\nTrabalhadores: {decree_workers.formatNumber('#,###.')}\nTrabalhadores em risco: {decree_workers_risk.formatNumber('#,###.')}\nCasos (semana anterior): {decree_week_before.total_case.formatNumber('#,###.')}\nCasos (semana seguinte): {decree_week_after.total_case.formatNumber('#,###.')}";
		workerRiskSeries.tooltip.fontSize = 13;
		workerRiskSeries.showOnInit = true;

		var workerRiskBullet = workerRiskSeries.bullets.push(new am4charts.CircleBullet());
		workerRiskBullet.circle.fill = am4core.color("#fff");
		workerRiskBullet.circle.strokeWidth = 2;
		// workerRiskBullet.circle.propertyFields.radius = "{decree_workers}";

		var workerRiskState = workerRiskBullet.states.create("hover");
		workerRiskState.properties.scale = 1.2;

		var workerRiskLabel = workerRiskSeries.bullets.push(new am4charts.LabelBullet());
		// workerRiskLabel.label.text = "Decreto: {decree_id}";
		workerRiskLabel.label.fontSize = 12;
		workerRiskLabel.label.horizontalCenter = "left";
		workerRiskLabel.label.dx = 14;

		var totalCaseSeries = chart.series.push(new am4charts.ColumnSeries());
		totalCaseSeries.dataFields.valueY = "total_case";
		totalCaseSeries.dataFields.dateX = "date";
		totalCaseSeries.yAxis = totalCaseAxis;
		totalCaseSeries.tooltipText = "Casos (acumulado): {total_case.formatNumber('#,###.')}\nCasos (dia): {daily_case.formatNumber('#,###.')}\nÓbitos (acumulado): {total_deceased.formatNumber('#,###.')}\nÓbitos (dia): {daily_deceased.formatNumber('#,###.')}";
		totalCaseSeries.tooltip.fontSize = 13;
		totalCaseSeries.name = "Casos confirmados de covid-19 (acumulado)";
		totalCaseSeries.columns.template.fillOpacity = 0.7;
		totalCaseSeries.columns.template.propertyFields.strokeDasharray = "dashLength";
		totalCaseSeries.columns.template.propertyFields.fillOpacity = "alpha";
		totalCaseSeries.showOnInit = true;

		var totalCaseState = totalCaseSeries.columns.template.states.create("hover");
		totalCaseState.properties.fillOpacity = 0.9;

		// Add legend
		chart.legend = new am4charts.Legend();
		chart.legend.labels.template.fontSize = 12;

		// Add cursor
		chart.cursor = new am4charts.XYCursor();
		chart.cursor.fullWidthLineX = true;
		chart.cursor.xAxis = dateAxis;
		chart.cursor.lineX.strokeOpacity = 0;
		chart.cursor.lineX.fill = am4core.color("#000");
		chart.cursor.lineX.fillOpacity = 0.1;
	});

});

function getJSON(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = function() {
        if (this.status >= 200 && this.status < 400)
            return JSON.parse(this.response);
    };
    request.send();
}