var map;
var infowindow = new google.maps.InfoWindow();

$(document).ready(function() {
	
	// Sidenav configuration
	$('.sidenav').sidenav();

	// Load the geojson
	$.getJSON('data/municipio-dataset.geojson', function(data) {
		// Google maps configuration
		map = new google.maps.Map(document.getElementById('chart-map'), {
			center: { lat: -14.726084296948184, lng: -55.21875 },
			zoom: 4,
			minZoom: 4
		});
		map.data.addGeoJson(data);
	  	map.data.setStyle(function(feature) {
			return {
				fillColor: feature.getProperty('color'),
				strokeColor: feature.getProperty('color'),
				strokeOpacity: 0.5,
				strokeWeight: 0.5
			}
		});
		map.data.addListener('click', function(event) {
			var feature = event.feature;
			var html = '<b>' + feature.getProperty('title') +' (' + feature.getProperty('state') + ')</b>';
			html += '<br />Trabalhadores: ' + new Intl.NumberFormat('pt-BR', { style: 'decimal' }).format(feature.getProperty('workers_total'));
			html += '<br />Trabalhadores em risco: ' + new Intl.NumberFormat('pt-BR', { style: 'decimal' }).format(feature.getProperty('workers_risk'));
			html += '<br />Risco de impacto: ' + new Intl.NumberFormat('pt-BR', { style: 'percent' }).format(feature.getProperty('value'));
			infowindow.setContent(html);
			infowindow.setPosition(event.latLng);
			infowindow.setOptions({ pixelOffset: new google.maps.Size(0,-34) });
			infowindow.open(map);
		});
		map.addListener('tilesloaded', function() {
			$('#loading').hide();
		});

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