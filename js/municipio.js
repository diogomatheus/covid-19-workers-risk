var dataset;
var map;
var map_type = 'Risco de Impacto';
var infowindow = new google.maps.InfoWindow();
var datatable;

$(document).ready(function() {
	
	// Sidenav configuration
	$('.sidenav').sidenav();

	// Load the geojson
	$.getJSON('dataset/brazil-city-dataset.geojson', function(data) {
		dataset = data;
		configureMap(dataset);
		configureDatatable(dataset);		
	});

});

function configureMap(data) {
	map = new google.maps.Map(document.getElementById('chart-map'), {
		center: { lat: -14.726084296948184, lng: -55.21875 },
		zoom: 4,
		minZoom: 4,
		mapTypeControl: false,
		streetViewControl: false,
		styles: getGoogleMapStyle()
	});

	// Create the map legend container
	var map_legend_controller = document.createElement('div');
	map_legend_controller.id = 'chart-map-legend-container';
	map_legend_controller.innerHTML = '+ Risco <img src="image/chart-map-legend.jpeg" class="responsive-img"> - Risco';
	map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(map_legend_controller);

	// Create the map type container
	var map_type_container = document.createElement('div');
	map_type_container.id = 'chart-map-type-container';
	map_type_container.innerHTML = '<select id="chart-map-type"><option value="Risco de Impacto" selected="selected">Risco de Impacto</option><option value="Trabalhadores em Risco">Trabalhadores em Risco</option></select>';
	map.controls[google.maps.ControlPosition.LEFT_TOP].push(map_type_container);
	$(map_type_container).change(function() {   
		map_type = $('#chart-map-type').val();
		map.data.forEach(function(feature) { map.data.remove(feature); });
		map.data.addGeoJson(dataset);
		var order_column = (map_type === 'Risco de Impacto') ? 6 : 3;
		datatable.order( [ order_column, 'desc' ] ).draw();
    });

	map.data.addGeoJson(data);
	map.data.setStyle(function(feature) {
		var color = getGoogleMapFeatureColor(feature);
		return {
			fillColor: color,
			fillOpacity: 0.6,
			strokeColor: color,
			strokeOpacity: 1,
			strokeWeight: 0.4
		}
	});

	map.data.addListener('click', function(event) {
		var feature = event.feature;
		var html = '<strong>' + feature.getProperty('title') +' (' + feature.getProperty('state') + ')</strong>';
		html += '<br />Trabalhadores: ' + new Intl.NumberFormat('pt-BR', { style: 'decimal' }).format(feature.getProperty('workers'));
		html += '<br />Trabalhadores em risco: ' + new Intl.NumberFormat('pt-BR', { style: 'decimal' }).format(feature.getProperty('workers_risk'));
		html += ' (' + Number(feature.getProperty('workers_risk_percentage') * 100).toFixed(2).replace('.', ',') + '%)';
		html += '<br />PIB: ' + new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(feature.getProperty('pib'));
		html += '<br />IDHM: ' + new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 3 }).format(feature.getProperty('idhm'));
		html += '<br />Impacto: ' + Number(feature.getProperty('impact_percentage') * 100).toFixed(2).replace('.', ',') + '%';
		infowindow.setContent(html);
		infowindow.setPosition(event.latLng);
		infowindow.setOptions({ pixelOffset: new google.maps.Size(0,-34) });
		infowindow.open(map);
	});

	map.addListener('tilesloaded', function() {
		$('#loading').hide();
	});
}

function getGoogleMapStyle() {
	return [
		{
			elementType: 'geometry.fill',
			stylers: [{color: '#f5f5f5'}]
		},
		{
			elementType: 'labels.icon',
			stylers: [{visibility: 'off'}]
		},
		{
			elementType: 'labels.text.fill',
			stylers: [{color: '#616161'}]
		},
		{
			elementType: 'labels.text.stroke',
			stylers: [{color: '#f5f5f5'}]
		},
		{
			featureType: 'administrative.land_parcel',
			elementType: 'labels.text.fill',
			stylers: [{visibility: 'off'}]
		},
		{
			featureType: 'administrative.locality',
			elementType: 'labels',
			stylers: [{visibility: 'off'}]
		},
		{
			featureType: 'poi',
			elementType: 'geometry',
			stylers: [{visibility: 'off'}]
		},
		{
			featureType: 'poi',
			elementType: 'labels.text.fill',
			stylers: [{visibility: 'off'}]
		},
		{
			featureType: 'poi.park',
			elementType: 'geometry',
			stylers: [{visibility: 'off'}]
		},
		{
			featureType: 'poi.park',
			elementType: 'labels.text.fill',
			stylers: [{visibility: 'off'}]
		},
		{
			featureType: 'road',
			elementType: 'geometry',
			stylers: [{visibility: 'off'}]
		},
		{
			featureType: 'road.arterial',
			elementType: 'labels.text.fill',
			stylers: [{visibility: 'off'}]
		},
		{
			featureType: 'road.highway',
			elementType: 'geometry',
			stylers: [{visibility: 'off'}]
		},
		{
			featureType: 'road.highway',
			elementType: 'labels.text.fill',
			stylers: [{visibility: 'off'}]
		},
		{
			featureType: 'road.local',
			elementType: 'labels.text.fill',
			stylers: [{visibility: 'off'}]
		},
		{
			featureType: 'transit.line',
			elementType: 'geometry',
			stylers: [{visibility: 'off'}]
		},
		{
			featureType: 'transit.station',
			elementType: 'geometry',
			stylers: [{visibility: 'off'}]
		},
		{
			featureType: 'water',
			elementType: 'geometry',
			stylers: [{color: '#c9c9c9'}]
		},
		{
			featureType: 'water',
			elementType: 'labels.text.fill',
			stylers: [{color: '#9e9e9e'}]
		}
	];
}

function getGoogleMapFeatureColor(feature) {
	var scale = [
		'#fc4e2a',
		'#fd8d3c',
		'#fed976',
		'#ffeda0',
		'#ffffcc'
	];
	var risk_level = feature.getProperty('risk_level');
	var workers_risk_level = feature.getProperty('workers_risk_level');
	var level = (map_type === 'Risco de Impacto') ? risk_level : workers_risk_level;
	return scale[level - 1];
}

function configureDatatable(data) {
	// Datatable configuration
	datatable = $('#datatable').DataTable({
		responsive: true,
		paging: true,
		data: data.features,
		columns: [
			{ title: 'Município', data: 'properties.title' },
			{ title: 'Estado', data: 'properties.state' },
			{ title: 'Trabalhadores', data: 'properties.workers', render: function (data, type, row) {
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
					var value = formatter.format(data);
					value += ' (' + Number(row.properties.workers_risk_percentage * 100).toFixed(2).replace('.', ',') + '%)';
					return value;
				} else {
					return data;
				}
			}},
			{ title: 'PIB', data: 'properties.pib', render: function (data, type, row) {
				if(type == 'display') {
					var formatter = new Intl.NumberFormat('pt-BR', {
						style: 'currency', currency: 'BRL'
					});
					return formatter.format(data);
				} else {
					return data;
				}
			}},
			{ title: 'IDHM', data: 'properties.idhm', render: function (data, type, row) {
				if(type == 'display') {
					var formatter = new Intl.NumberFormat('pt-BR', {
						style: 'decimal', minimumFractionDigits: 3
					});
					return formatter.format(data);
				} else {
					return data;
				}
			}},
			{ title: 'Impacto', data: 'properties.impact_percentage', render: function (data, type, row) {
				if(type == 'display') {
					return Number(data * 100).toFixed(2).replace('.', ',') + '%';
				} else {
					return data;
				}
			}}
		],
		'columnDefs': [
			{ 'width': '80px', 'targets': 6 }
		],
		order: [[ 6, 'desc' ]],
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
}