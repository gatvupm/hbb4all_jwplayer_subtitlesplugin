 /**
 **************************************************************************************************************************
 * @file plugin-jwplayer-subtitlesebuttd.js
 *
 *  @brief Plugin for presenting Subtitles for EBU-TT-D format in JWPlayer 
 *
 *  Class that read an XML file with subtitles in EBU-TT-D format and present them over the screen
 *  Copyright 2016 GaTV. Universidad Politecnica de Madrid
 *
 *  @author Juan Pedro López Velasco
 *  @contact jlv@gatv.ssr.upm.es
 *  @date 09.2016
 *
 *  For more information:
 *  HBB4ALL: Hybrid Broadcast Broadband For ALL Project - http://www.hbb4all.eu/
 *
 **************************************************************************************************************************
 **/
jwplayer().registerPlugin('pluginjwplayersubtitlesebuttd', '6.0', function(player, config, slowmo){
	function setup(evt){
		//alert("Rendering HTML5 1");
		if (player.getRenderingMode() == "html5"){
			
			var usedWidth = player.getWidth();
			var usedHeight = player.getHeight();
			var usedLineHeightDiv = "normal";
			var usedLineHeightP = "normal";
			var usedLineHeightSpan = "normal";
			
			var cambioFontSize = "default";
			var fontSizesMatriz = ["default", "100%", "125%", "150%", "200%"];
			var cambioTipoLetra = "default";
			var fontTypesMatriz = ["default", "serif", "sans-serif", "Arial, Tiresias", "Times New Roman", "Arial", "monospace"];
			var cambioFontColor = "default";
			var cambioFontColorRGB = "default";
			var fontColorsMatriz = ["default", "yellow", "white", "black", "red", "blue", "green"];
			var fontColorsRGBMatriz = ["default", "#ffff00FF", "#ffffffff", "#000000ff", "#ff0000ff", "#0000ffff", "#ff0000ff"];
			var cambioBackgroundColor = "default";
			var fontBackgroundColorsMatriz = ["default", "transparent", "white", "black" ];
			var fontColorsRGBMatriz = ["default", "#00000000", "#ffffffff", "#000000ff" ];
			
			var actualWidthSet = "0"; // Ancho del reproductor actual (se usa en resize)
	    	var actualHeightSet = "0"; // Alto del reproductor actual (se usa en resize)
	    	// Tiempos de subt�tulos y contenido para pruebas
	    	var timeStartArray = [1, 10, 20, 28];
	    	var timeEndArray = [5, 17, 25, 32];
	    	var commentArray = ["Este es un texto para hacer pruebas", "Big Bunny quiere que seas su amigo", "La ardillita va saltando por el campo, es todo una maravilla", "Voy a poner un texto muy largo a ver c�mo reacciona en la pantalla y si se llega a cortar en dos l�neas en alg�n punto"];
	    	var subtituloSeleccionado = -1;
	    	var subtitulosSeleccionados = [];
	    	
	    	// Matrices de datos extraidos del EBU-TT-D
	    	var timeBase = "";
	    	var language = "";
	    	var space = "default";
	    	var cellResolution = "32 15";
	    	var cellResolutionHoriz = 32;
	    	var cellResolutionVert = 15;
	    	var idEstilos = {id:new Array(), direction:new Array(), fontFamily:new Array(), fontSize:new Array(), lineHeight:new Array(), textAlign:new Array(), color:new Array(), backgroundColor:new Array(), fontStyle:new Array(), fontWeight:new Array(), textDecoration:new Array(), unicodeBidi:new Array(), wrapOption:new Array(), multiRowAlign:new Array(), linePadding:new Array()};
	    	var caractEstilos = {caractEstilo:new Array()};
	    	var idRegiones = {id:new Array(), origin:new Array(), extent:new Array(), style:new Array(), displayAlign:new Array(), padding:new Array(), writingMode:new Array(), showBackground:new Array(), overflow:new Array()};
	    	var caractRegiones = {caractRegiones:new Array()};
	    	// La jerararqu�a de los subt�tulos es la siguiente: "Div" contienen "P" y los "P" contienen "Span" 
	    	var idSubtDiv = {id:new Array(), textSubt: new Array(), timeInSubt:new Array(), timeOutSubt:new Array(), timeInSpan:new Array(), timeOutSpan:new Array(), span:new Array(), style: new Array(), region: new Array(), text: new Array() };
	    	var idSubtP = {id:new Array(), id_Div_Parent:new Array(), textSubt: new Array(), timeInSubt:new Array(), timeOutSubt:new Array(), timeInSpan:new Array(), timeOutSpan:new Array(), span:new Array(), style: new Array(), region: new Array(), text: new Array() };
	    	var idSubtSpan = {id:new Array(), id_P_Parent:new Array(), textSubt: new Array(), timeInSubt:new Array(), timeOutSubt:new Array(), timeInSpan:new Array(), timeOutSpan:new Array(), span:new Array(), style: new Array(), region: new Array(), text: new Array() };
	    	
	    	var idSubtitulosP = {id:new Array(), id_Div_Parent:new Array(), textSubt:new Array(), timeBeginSubt:new Array(), timeEndSubt:new Array(), styleSubt:new Array(), regionSubt:new Array(), numBr:new Array(), textSpan0:new Array(), styleSpan0:new Array(), regionSpan0:new Array(), idSpan0:new Array(), textSpan1:new Array(), styleSpan1: new Array(), regionSpan1: new Array(), idSpan1: new Array(),
	    							textSpan2:new Array(), styleSpan2: new Array(), regionSpan2: new Array(), idSpan2: new Array(), textSpan3:new Array(), styleSpan3: new Array(), regionSpan3: new Array(), idSpan3: new Array(), textSpan4:new Array(), styleSpan4: new Array(), regionSpan4: new Array(), idSpan4: new Array(), textSpan5:new Array(), styleSpan5: new Array(), regionSpan5: new Array(), idSpan5: new Array()};
	    	
	    	var timeInSubtArray = [];
	    	var timeOutSubtArray = [];
	    	var textSubtArray = [];
	    	
	    	// Matrices que almacenan la informaci�n de los subt�tulos del v�deo
	    	var matrixCaptionsTrackFiles = [];
	    	var matrixCaptionsLabels = [];
	    	var matrixCaptionsKinds = [];
	    	var matrixCaptionsFormats = [];
	    	// Subt�tulos actualmente seleccionados
	    	var currentCaptionsSet = 0;
	    	var currentCaptionTrackFileSet = 0;
	    	var currentCaptionTrackLabel = 0;
	    	var currentCaptionTrackKind = 0;
	    	// Flag que indica que los subt�tulos son EBU-TT-D
	    	var haySubtitulosEBUTTD = false;
	    	
	    	// Las variables que definen un subt�tulo son las siguientes: style & region, que al final es lo que sacas
	    	// de la matrix de estilos y regiones donde se almacenar�n las caracter�sticas de cada uno de ellos.
	    	var styleSet = "";
	    	var tipoRegionSet = "";
			var subtStartSet = "00:00:04.0";
			var subtEndSet = "00:00:06.0";
	    	
	    	// Caracter�sticas concretas del subt�tulo en cuanto a estilo, tama�o y posici�n
	    	var backgroundColorSet = "transparent";
	    	var colorFontSet = "yellow";
	    	var positionSet = "relative";
	    	var topSet = "-200px";
	    	var leftSet = "10px";
	    	var bottomSet = "0px";
			var maxWidthSet = "0px";
			var maxHeightSet = "0px";
			var tipoPositionSet = "bottom";
			var fontSizeSet = "100%"; // Hay que calcular el tama�o de fuente con este par�metro y la resoluci�n de celda.
			var lineHeightSet = "normal";
			var textAlignSet = "start"; // Esta propiedad difiere en "style", hay que mirarlo bien
			var fontFamilySet = "monoSpaceSansSerif"; // Puede ser gen�rica (monospace, sanserif, etc.) o concreta (Arial, Verdana, etc.)
			var fontStyleSet = "normal"; // Puede ser tambi�n Italic (cursiva)
			var fontWeightSet = "normal"; // Puede ser tambi�n Bold (negrita)
			var textDecorationSet = "none"; // Puede ser Underline (subrayado)
			var unicodeBidiSet = "normal"; // Puede ser embed o bidiOverride
			var wrapOptionSet = "wrap"; // Puede ser tambi�n noWrap - Se corresponde con flexWrap
			var directionSet = "ltr"; // De izquierda a derecha o de derecha a izquierda
	    	var multiRowAlignSet = "start"; // Puede ser start/center/end/auto
	    	var linePaddingSet = "0c"; // Puede ser 0.5c, 1.0c, etc.
	    	
	    	// Caracter�sticas seg�n regiones
			var originSet = "10% 80%";
			var extentSet = "80% 10%";
			var styleRegionSet = "";
			var displayAlignSet = "before"; // Puede ser before, center y after, y se corresponde en vertical-align top, middle, bottom
			var overflowSet = "visible";
			var paddingSet = "10%";
			
			player.onCaptionsChange(
					function captionsChange(event) {
					haySubtitulosEBUTTD = false; // Inicialmente cuando hay cambios en los subt�tulos seleccionados se considera que no hay subt�tulos EBU-TTD;
					//alert("Hola Juanpe 29/04/2015");
					
					borraCaptionsAlmacenadas();
						
					if(player.getCurrentCaptions()==0){
						//player.setCurrentCaptions("0");
						haySubtitulosEBUTTD = false;
						//alert("No hay subtitulos");
						
						var elementCaptions = document.getElementById('myElement_caption');
						if(elementCaptions!=null){
							elementCaptions.style.visibility = 'hidden';
							while (elementCaptions.firstChild) {
								elementCaptions.removeChild(elementCaptions.firstChild);
							}
							//alert("Apago subt�tulos");
						}
						else{
							//alert("No apago subt�tulos");
						}
						
						return;
					}
					
					//extraeCaptions();
					extraeCurrentCaptions();
					cargarArchivoSubtitulos();
					//currentCaptionsSet = player.getCurrentCaptions();
					//alert("Current Captions: " + currentCaptionsSet );
					//
				}
			);
			
			/*player.onFullscreen(
					function jp(event) {
						var tamVideo = document.getElementById("myElement_media");
						
						//tamVideo.style.width = "1000px";
						var widthFS = screen.width;
						var heightFS = screen.height;
						var x=document.getElementsByTagName("video");
						alert(x[0].width);
						var boolChangeFS = player.getFullscreen();
						//alert(widthFS + ":" + heightFS + ":" + tamVideo.style.width);
					}
			);*/
			
			/*player.onSeek(
					function seek(event) {
						borraMyElementCaption();
						//alert("Resize " + event.width + ":" + event.height);
						//setGeneralSizes(event.width, event.height);
					}
			);*/
			
			player.onResize(
					function resize2(event) {
						borraMyElementCaption();
						//alert("Resize " + event.width + ":" + event.height);
						setGeneralSizes(event.width, event.height);
					}
			);
			
			// Funci�n que carga los subt�tulos EBU-TT-D
			cargarArchivoSubtitulos = function(){
				//alert("Hola precabecera");
				cargaCabeceraEBUTTD(); // No funciona
				//alert("Hola postcabecera");
			}
			
			// Funci�n que carga los subt�tulos EBU-TT-D
			function cargaCabeceraEBUTTD(){	
				// Porque me pone de los nervios el audio del v�deo portugu�s, lo muteo
				//player.setMute(true);
				//alert("El archivo de subt�tulos s� es EBU-TT-D");
				//We use the jQuery ajax method to read the EBU-TT-D document. The ajax method is asynchronous, so it may be executed
				//at the same time as other parts of the code.
				//This one is used to extract the tt:tt element in the computer with the jQuery selector find('tt\\:tt'). 
				//It will not find this specific element with this jQuery selector in the TV screen.
				try{
					$.ajax({
						type: "GET",
						url: currentCaptionTrackFileSet, // Metemos la ruta del archivo de subt�tulos detectado para ver si es EBU-TT-D
						dataType: "xml",
						success: xmlParserHeader,
						error: xmlErrorParserHeader
					});
				}
				catch(err){
					alert("Mensaje de error Ajax: " + err.toString());
				}
			}
			
			function xmlErrorParserHeader(data) {
				var currCC = player.getCurrentCaptions();
				borraCaptionsAlmacenadas();
				//playerplayer.setCurrentCaptions(currCC);
				alert("El archivo de subtitulos no es EBU-TT-D");
				//alert("TT:" + $(data));
				haySubtitulosEBUTTD = false;
				var elementCaptions = document.getElementById('myElement_caption');
				if(elementCaptions!=null){
					elementCaptions.style.visibility = 'hidden';
					while (elementCaptions.firstChild) {
						elementCaptions.removeChild(elementCaptions.firstChild);
					}
					//alert("Apago subt�tulos");
				}
				else{
					//alert("No apago subt�tulos");
				}
			}
			
			loadFirefoxStyling = function(tt_tt_styling){
				var tt_style = tt_tt_styling[0].getElementsByTagName('tt:style');
				var textoEstilosAux = "";
				for(var i=0; i<tt_style.length; i++){
					idEstilos.id[i] = tt_style[i].getAttribute('xml:id');
					if(!idEstilos.id[i]){idEstilos.id[i]=undefined;}
					
					idEstilos.direction[i]=tt_style[i].getAttribute('tts:direction');
					if(!idEstilos.direction[i]){idEstilos.direction[i]=undefined;}
					
					idEstilos.fontFamily[i]=tt_style[i].getAttribute('tts:fontFamily');
					if(!idEstilos.fontFamily[i]){idEstilos.fontFamily[i]=undefined;}
					
					idEstilos.fontSize[i]=tt_style[i].getAttribute('tts:fontSize');
					if(!idEstilos.fontSize[i]){idEstilos.fontSize[i]=undefined;}
					
					idEstilos.lineHeight[i]=tt_style[i].getAttribute('tts:lineHeight');
					if(!idEstilos.lineHeight[i]){idEstilos.lineHeight[i]=undefined;}
					
					idEstilos.textAlign[i]=tt_style[i].getAttribute('tts:textAlign');
					if(!idEstilos.textAlign[i]){idEstilos.textAlign[i]=undefined;}
					
					idEstilos.color[i]=tt_style[i].getAttribute('tts:color');
					if(!idEstilos.color[i]){idEstilos.color[i]=undefined;}
					
					idEstilos.backgroundColor[i]=tt_style[i].getAttribute('tts:backgroundColor');
					if(!idEstilos.backgroundColor[i]){idEstilos.backgroundColor[i]=undefined;}
					
					idEstilos.fontStyle[i]=tt_style[i].getAttribute('tts:fontStyle');
					if(!idEstilos.fontStyle[i]){idEstilos.fontStyle[i]=undefined;}
					
					idEstilos.fontWeight[i]=tt_style[i].getAttribute('tts:fontWeight');
					if(!idEstilos.fontWeight[i]){idEstilos.fontWeight[i]=undefined;}
					
					idEstilos.textDecoration[i]=tt_style[i].getAttribute('tts:textDecoration');
					if(!idEstilos.textDecoration[i]){idEstilos.textDecoration[i]=undefined;}
					
					idEstilos.unicodeBidi[i]=tt_style[i].getAttribute('tts:unicodeBidi');
					if(!idEstilos.unicodeBidi[i]){idEstilos.unicodeBidi[i]=undefined;}
					
					idEstilos.wrapOption[i]=tt_style[i].getAttribute('tts:wrapOption');
					if(!idEstilos.wrapOption[i]){idEstilos.wrapOption[i]=undefined;}
					
					idEstilos.multiRowAlign[i]=tt_style[i].getAttribute('ebutts:multiRowAlign');
					if(!idEstilos.multiRowAlign[i]){idEstilos.multiRowAlign[i]=undefined;}
					
					idEstilos.linePadding[i]=tt_style[i].getAttribute('ebutts:linePadding');
					if(!idEstilos.linePadding[i]){idEstilos.linePadding[i]=undefined;}
					
				}
				var x = 0;
				textoEstilosAux += "ID: " + idEstilos.id[x] + "\n";
				textoEstilosAux += "Direction: " + idEstilos.direction[x] + "\n";
				textoEstilosAux += "FontFamily: " + idEstilos.fontFamily[x] + "\n";
				textoEstilosAux += "FontSize: " + idEstilos.fontSize[x] + "\n";
				textoEstilosAux += "LineHeight: " + idEstilos.lineHeight[0] + "\n";
				textoEstilosAux += "TextAlign: " + idEstilos.textAlign[x] + "\n";
				textoEstilosAux += "Color: " + idEstilos.color[x] + "\n";
				textoEstilosAux += "backgroundColor: " + idEstilos.backgroundColor[x] + "\n";
				textoEstilosAux += "fontStyle: " + idEstilos.fontStyle[x] + "\n";
				textoEstilosAux += "fontWeight: " + idEstilos.fontWeight[x] + "\n";
				textoEstilosAux += "textDecoration: " + idEstilos.textDecoration[x] + "\n";
				textoEstilosAux += "UnicodeBidi: " + idEstilos.unicodeBidi[x] + "\n";
				textoEstilosAux += "WrapOption: " + idEstilos.wrapOption[x] + "\n";
				textoEstilosAux += "MultiRowAlign: " + idEstilos.multiRowAlign[x] + "\n";
				textoEstilosAux += "Line Padding: " + idEstilos.linePadding[x] + "\n";
				//alert("Hay estilos: \n" + textoEstilosAux);
			}
			
			borraCaptionsAlmacenadas = function(){
				borraMyElementCaption();
				idEstilos = null;
				caractEstilos = null;
				idRegiones = null;
				caractRegiones = null;
				idSubtDiv = null;
				idSubtP = null;
				idSubtSpan = null;
				idSubtitulosP = null;
				timeInSubtArray = [];
		    	timeOutSubtArray = [];
		    	textSubtArray = [];
		    	idEstilos = {id:new Array(), direction:new Array(), fontFamily:new Array(), fontSize:new Array(), lineHeight:new Array(), textAlign:new Array(), color:new Array(), backgroundColor:new Array(), fontStyle:new Array(), fontWeight:new Array(), textDecoration:new Array(), unicodeBidi:new Array(), wrapOption:new Array(), multiRowAlign:new Array(), linePadding:new Array()};
		    	caractEstilos = {caractEstilo:new Array()};
		    	idRegiones = {id:new Array(), origin:new Array(), extent:new Array(), style:new Array(), displayAlign:new Array(), padding:new Array(), writingMode:new Array(), showBackground:new Array(), overflow:new Array()};
		    	caractRegiones = {caractRegiones:new Array()};
		    	// La jerararqu�a de los subt�tulos es la siguiente: "Div" contienen "P" y los "P" contienen "Span" 
		    	idSubtDiv = {id:new Array(), textSubt: new Array(), timeInSubt:new Array(), timeOutSubt:new Array(), timeInSpan:new Array(), timeOutSpan:new Array(), span:new Array(), style: new Array(), region: new Array(), text: new Array() };
		    	idSubtP = {id:new Array(), id_Div_Parent:new Array(), textSubt: new Array(), timeInSubt:new Array(), timeOutSubt:new Array(), timeInSpan:new Array(), timeOutSpan:new Array(), span:new Array(), style: new Array(), region: new Array(), text: new Array() };
		    	idSubtSpan = {id:new Array(), id_P_Parent:new Array(), textSubt: new Array(), timeInSubt:new Array(), timeOutSubt:new Array(), timeInSpan:new Array(), timeOutSpan:new Array(), span:new Array(), style: new Array(), region: new Array(), text: new Array() };
		    	idSubtitulosP = {id:new Array(), id_Div_Parent:new Array(), textSubt:new Array(), timeBeginSubt:new Array(), timeEndSubt:new Array(), styleSubt:new Array(), regionSubt:new Array(), numBr:new Array(), textSpan0:new Array(), styleSpan0:new Array(), regionSpan0:new Array(), idSpan0:new Array(), textSpan1:new Array(), styleSpan1: new Array(), regionSpan1: new Array(), idSpan1: new Array(), textSpan2:new Array(), styleSpan2: new Array(), regionSpan2: new Array(), idSpan2: new Array()};
		    	
			}
			
			loadFirefoxLayout = function(tt_layout){
				var tt_region = tt_layout[0].getElementsByTagName('tt:region');
				var textoRegionesAux = "";
				for(var i=0; i<tt_region.length; i++){
					idRegiones.id[i] = tt_region[i].getAttribute('xml:id');
					if(!idRegiones.id[i]){idRegiones.id[i]=undefined;}
					
					idRegiones.origin[i]=tt_region[i].getAttribute('tts:origin');
					if(!idRegiones.origin[i]){idRegiones.origin[i]=undefined;}
					
					idRegiones.extent[i]=tt_region[i].getAttribute('tts:extent');
					if(!idRegiones.extent[i]){idRegiones.extent[i]=undefined;}
					
					//idRegiones.style[i]=tt_region[i].getAttribute('tts:style');
					idRegiones.style[i]=tt_region[i].getAttribute('style'); // La etiqueta es "style" a secas
					if(!idRegiones.style[i]){idRegiones.style[i]=undefined;}
					
					idRegiones.displayAlign[i]=tt_region[i].getAttribute('tts:displayAlign');
					if(!idRegiones.displayAlign[i]){idRegiones.displayAlign[i]=undefined;}
					
					idRegiones.padding[i]=tt_region[i].getAttribute('tts:padding');
					if(!idRegiones.padding[i]){idRegiones.padding[i]=undefined;}
					
					idRegiones.writingMode[i]=tt_region[i].getAttribute('tts:writingMode');
					if(!idRegiones.writingMode[i]){idRegiones.writingMode[i]=undefined;}
					
					idRegiones.showBackground[i]=tt_region[i].getAttribute('tts:showBackground');
					if(!idRegiones.showBackground[i]){idRegiones.showBackground[i]=undefined;}
					
					idRegiones.overflow[i]=tt_region[i].getAttribute('tts:overflow');
					if(!idRegiones.overflow[i]){idRegiones.overflow[i]=undefined;}
					textoRegionesAux += idRegiones.id[i] + "\n";
				}
				//alert("Hay regiones: \n" + textoRegionesAux);
			}
			
			loadFirefoxBody = function(tt_bodyAux){
				var idDiv = 0;
				var lastIdDiv = 0;
				var vauxDiv;
				var idP = 0;
				var lastIdP = 0;
				var vauxP;
				var idSpan = 0;
				var lastIdSpan = 0;
				var numSpan = 0;
				var vauxSpan;
				//alert("Legnth Body: " + tt_bodyAux.length);
				var DivAuxAlert = "";
				for (var j=0; j<tt_bodyAux.length; j++)
    			{
					var tt_divAux = tt_bodyAux[j].getElementsByTagName('tt:div');
					if(tt_divAux.length>0){
						//alert("Legnth Div: " + tt_divAux.length);
						
						for(var xDiv=0; xDiv<tt_divAux.length; xDiv++){
							idSubtDiv.id[xDiv] = tt_divAux[xDiv].getAttribute('xml:id');
							//alert("ID INICIAL: " + idSubtDiv.id[xDiv]);
							// La funci�n getAttribute devulve "NULL" no "undefined".
							if(!idSubtDiv.id[xDiv]){
								idDiv = lastIdDiv++;
								lastIdDiv = idDiv;
								vauxDiv = "auxdiv" + idDiv;
								//alert("Nombre divId: " + vauxDiv);
								idSubtDiv.id[xDiv] = vauxDiv;
							}
							//alert("ID FINAL: " + idSubtDiv.id[xDiv]);
							idSubtDiv.style[xDiv] = tt_divAux[xDiv].getAttribute('style');
							idSubtDiv.region[xDiv] = tt_divAux[xDiv].getAttribute('region');
							
							var tt_pAux = tt_divAux[xDiv].getElementsByTagName('tt:p');
							//alert("Legnth P del div " + xDiv + " : " + tt_pAux.length);
							for(var xP=0; xP<tt_pAux.length; xP++){
							//for(var xP=0; xP<2; xP++){ // Uso este para pruebas, Juanpe
								//idSubtitulosP.textSubt[xP] = tt_pAux[xP].text;
								//alert("IDsubtitulosP: " + tt_pAux[xP].data);
								idSubtitulosP.id_Div_Parent[xP] = idSubtDiv.id[xDiv];
								idSubtitulosP.id[xP] = tt_pAux[xP].getAttribute('xml:id');
								if(!idSubtitulosP.id[xP]){
									idP = lastIdP++;
									lastIdP = idP;
									vauxP = "auxP" + idP;
									//alert("Nombre pId: " + vauxP);
									idSubtitulosP.id[xP] = vauxP;
								}
								idSubtitulosP.textSubt[xP] = tt_pAux[xP].data;
								idSubtitulosP.timeBeginSubt[xP] = tt_pAux[xP].getAttribute('begin');
								idSubtitulosP.timeEndSubt[xP] = tt_pAux[xP].getAttribute('end');
								idSubtitulosP.styleSubt[xP] = tt_pAux[xP].getAttribute('style');
								idSubtitulosP.regionSubt[xP] = tt_pAux[xP].getAttribute('region');
								/*alert("TextP: " + idSubtitulosP.textSubt[xP] +
										"\nIdP: " + idSubtitulosP.id[xP] +
										"\nTimeBegin: " + idSubtitulosP.timeBeginSubt[xP] +
										"\nTimeEnd: " + idSubtitulosP.timeEndSubt[xP] +
										"\nStyle: " + idSubtitulosP.styleSubt[xP] +
										"\nRegion: " + idSubtitulosP.regionSubt[xP]
								);*/
								
								//var tt_spanAux2 = tt_pAux[xP].getElementsByTagName('tt:span');
								var tt_brAux = tt_pAux[xP].getElementsByTagName('tt:br');
								idSubtitulosP.numBr[xP] = tt_brAux.length;
								//alert("Br Length: " + idSubtitulosP.numBr[xP]);
								var tt_spanAux = tt_pAux[xP].getElementsByTagName('tt:span');
								for(var xSpan=0; xSpan<tt_spanAux.length; xSpan++){
									if(xSpan==0){
										idSubtitulosP.textSpan0[xP] = tt_spanAux[xSpan].innerHTML;
										if(idSubtitulosP.textSpan0[xP]==undefined){
											idSubtitulosP.textSpan0[xP] = tt_spanAux[xSpan].textContent.toString();
										}
										idSubtitulosP.styleSpan0[xP] = tt_spanAux[xSpan].getAttribute('style');
										idSubtitulosP.regionSpan0[xP] = tt_spanAux[xSpan].getAttribute('region');
										//alert("Busca aqu� Region: " + idSubtitulosP.regionSpan0[xSpan]);
										idSubtitulosP.idSpan0[xP] = tt_spanAux[xSpan].getAttribute('xml:id');
										if(!idSubtitulosP.idSpan0[xP]){
											idSpan = lastIdSpan++;
											lastIdSpan = idSpan;
											vauxSpan = "auxSpan" + xSpan + "_" + xP;
											//alert("Nombre spanId: " + vauxSpan);
											idSubtitulosP.idSpan0[xP] = vauxSpan;
										}
										/*alert("TextSpan: " + idSubtitulosP.textSpan0[xP] +
												"\nIdSpan: " + idSubtitulosP.idSpan0[xP] +
												"\nStyle: " + idSubtitulosP.styleSpan0[xP] +
												"\nRegion: " + idSubtitulosP.regionSpan0[xP]
										);*/
									}
									else if(xSpan==1){
										//alert(tt_spanAux[xSpan].tagName);
										//var ebuttmConformsToStandard = ebuttmDocumentMetadata[j].getElementsByTagName('ebuttm:conformsToStandard');
										idSubtitulosP.textSpan1[xP] = tt_spanAux[xSpan].innerHTML;
										if(idSubtitulosP.textSpan1[xP]==undefined){
											idSubtitulosP.textSpan1[xP] = tt_spanAux[xSpan].textContent.toString();
										}
										idSubtitulosP.styleSpan1[xP] = tt_spanAux[xSpan].getAttribute('style');
										idSubtitulosP.regionSpan1[xP] = tt_spanAux[xSpan].getAttribute('region');
										idSubtitulosP.idSpan1[xP] = tt_spanAux[xSpan].getAttribute('xml:id');
										if(!idSubtitulosP.idSpan1[xP]){
											idSpan = lastIdSpan++;
											lastIdSpan = idSpan;
											vauxSpan = "auxSpan" + xSpan + "_" + xP;
											//alert("Nombre spanId: " + vauxSpan);
											idSubtitulosP.idSpan1[xP] = vauxSpan;
											/*alert("TextSpan: " + idSubtitulosP.textSpan1[xP] +
													"\nIdSpan: " + idSubtitulosP.idSpan1[xP] +
													"\nStyle: " + idSubtitulosP.styleSpan1[xP] +
													"\nRegion: " + idSubtitulosP.regionSpan1[xP]
											);*/
										}
									}
									else if(xSpan==2){
										idSubtitulosP.textSpan2[xP] = tt_spanAux[xSpan].innerHTML;
										if(idSubtitulosP.textSpan2[xP]==undefined){
											idSubtitulosP.textSpan2[xP] = tt_spanAux[xSpan].textContent.toString();
										}
										idSubtitulosP.styleSpan2[xP] = tt_spanAux[xSpan].getAttribute('style');
										idSubtitulosP.regionSpan2[xP] = tt_spanAux[xSpan].getAttribute('region');
										idSubtitulosP.idSpan2[xP] = tt_spanAux[xSpan].getAttribute('xml:id');
										if(!idSubtitulosP.idSpan2[xP]){
											idSpan = lastIdSpan++;
											lastIdSpan = idSpan;
											vauxSpan = "auxSpan" + xSpan + "_" + xP;
											//alert("Nombre spanId: " + vauxSpan);
											idSubtitulosP.idSpan2[xSpan] = vauxSpan;
											/*alert("TextSpan: " + idSubtitulosP.textSpan2[xP] +
													"\nIdSpan: " + idSubtitulosP.idSpan2[xP] +
													"\nStyle: " + idSubtitulosP.styleSpan2[xP] +
													"\nRegion: " + idSubtitulosP.regionSpan2[xP]
											);*/
										}
									}
								}
							}
						}	
					}
    			}
				//alert("Hola");
				escribeSubtitulos();
				cambiaAFormatoTemporal();
			}
			
			loadFirefoxMetadata = function(tt_tt_metadata1){
				for (var i=0; i<tt_tt_metadata1.length; i++){
					var ebuttmDocumentMetadata = tt_tt_metadata1[i].getElementsByTagName('ebuttm:documentMetadata');
					//alert("Longitud Metadata: " + ebuttmDocumentMetadata.length);
					for(var j=0; j<ebuttmDocumentMetadata.length; j++){
						var ebuttmConformsToStandard = ebuttmDocumentMetadata[j].getElementsByTagName('ebuttm:conformsToStandard');
						//alert("Ebuttm: " + ebuttmConformsToStandard[0].innerHTML);
					}
					
    			}
			}
			
			loadFirefoxHeader = function(tt_tt_headerAux){
				for (var i=0; i<tt_tt_headerAux.length; i++)
    			{
    				//Extraction of the ttp:cellResolution attribute.
					cellResolution=tt_tt_headerAux[i].getAttribute('ttp:cellResolution');
    				if(!cellResolution) {
    					cellResolution='32 15';
    				}
    				procesaCellResolution();
    				
    				//Extraction of the ttp:timeBase attribute.
    				timeBase=tt_tt_headerAux[i].getAttribute('ttp:timeBase');
    				if(!timeBase) {
    					timeBase="media";
    				}
    				
    				language = tt_tt_headerAux[i].getAttribute('xml:lang');
    				
    				var xmlns_tt_header = tt_tt_headerAux[i].getAttribute('xmlns:tt');
					var xmlns_ttp_header = tt_tt_headerAux[i].getAttribute('xmlns:ttp');
					var xmlns_tts_header = tt_tt_headerAux[i].getAttribute('xmlns:tts');
					var xmlns_ttm_header = tt_tt_headerAux[i].getAttribute('xmlns:ttm');
					var xmlns_ebuttm_header = tt_tt_headerAux[i].getAttribute('xmlns:ebuttm');
					var xmlns_ebutts_header = tt_tt_headerAux[i].getAttribute('xmlns:ebutts');
					var xmlns_ebuxs = tt_tt_headerAux[i].getAttribute('xmlns:ebuxs');
					var xmlns_xsi_header = tt_tt_headerAux[i].getAttribute('xmlns:xsi');
    				
    				/*alert("Cell Resolution: " + cellResolution + "\nTime Base: " + timeBase +
    						"\nLenguaje: " + language + "\nXmlns TT Header: " + xmlns_tt_header +
    						"\nXmlns TTP Header: " + xmlns_ttp_header + "\nXmlns TTM Header: " + xmlns_ttm_header +
    						"\nXmlns EBUTTM Header: " + xmlns_ebuttm_header + "\nXmlns EBUTTS Header: " + xmlns_ebutts_header +
    						"\nXmlns XS Header: " + xmlns_ebuxs + "\nXmlns XSI Header: " + xmlns_xsi_header
    				);*/
    				
    			}
			}
			
			
			xmlParserHeader = function (data) {
				//alert($data.toString());
				var $tt_ttheader = null;
				var http_request = false;
				var $test;
				
				// Esta funci�n intenta saber el tipo de navegador que usamos.
				var browser = '';
				for(var p in navigator){
					browser += p + '=' + navigator[p] + "\n";
				}
				//alert(browser);

			    if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
			    	http_request = new XMLHttpRequest();
			    	//alert("IE7+, Firefox, Chrome, Opera, Safari... ResponseText" + currentCaptionTrackFileSet + ":" + http_request.responseText);
			    }
			    else{ // code for IE5 and IE6
			    	http_request = new ActiveXObject("Microsoft.XMLHTTP");
			    	//alert("IE5, IE6... ResponseText" + currentCaptionTrackFileSet + ":" + http_request.responseText);
			    }
			    
			    if (http_request.overrideMimeType) {
		    		http_request.overrideMimeType('text/xml');
		    		//alert("Mozilla, Safari...");
		    		// Hola Juanpe, aqu� estamos hoy
		    		
		    		http_request.open('GET', currentCaptionTrackFileSet, false);
		    		http_request.send(null);
		    		var respuestaText;
		    		var respuestaXML;
		    		var navegador = navigator.appName;
		    		//alert("El navegador es: " + navegador);
		    		if(http_request.status == 200){
		    			respuestaText = http_request.responseText;
		    			respuestaXML = http_request.responseXML;
		    			//alert("XML Parse String: " + respuestaText);

		    			// Define la cabecera del documento XML (EBU-TT-D)
		    			var tt_tt_header1 = respuestaXML.getElementsByTagName('tt:tt');
		    			
		    			if(tt_tt_header1){
		    				haySubtitulosEBUTTD = true;
		    				//alert("tt_tt_header1 != undefined. " + tt_tt_header1.length);
		    				if(tt_tt_header1.length>0){
		    					
		    					loadFirefoxHeader(tt_tt_header1);
		    					
		    					
			    				var tt_head_header1 = respuestaXML.getElementsByTagName('tt:head');
			    				if(tt_head_header1){
			    					// Metadata in header
			    					//alert("Hola");
			    					var tt_tt_metadata = tt_head_header1[0].getElementsByTagName('tt:metadata');
			    					if(tt_tt_metadata){
			    						
				    					loadFirefoxMetadata(tt_tt_metadata);
				    				}
			    					//alert("Adi�s");
			    					// Styling (styles) in header
			    					var tt_tt_styling1 = tt_head_header1[0].getElementsByTagName('tt:styling');
				    				if(tt_tt_styling1){
				    					loadFirefoxStyling(tt_tt_styling1);
				    				}
				    				// Layout (regions) in header
				    				var tt_tt_layout1 = tt_head_header1[0].getElementsByTagName('tt:layout');
				    				if(tt_tt_layout1){
				    					loadFirefoxLayout(tt_tt_layout1);
				    				}
			    				}
			    				// Body (cuerpo del XML)
			    				var tt_body1 = respuestaXML.getElementsByTagName('tt:body');
			    				if(tt_body1!=undefined){
			    					//alert("tt_body1 != undefined. " + tt_body1.length);
			    					// Body (div, p and span)
			    					loadFirefoxBody(tt_body1);
			    				}
			    				
			    				// Los m�todos AJAX son as�ncronos, as� que estas dos escrituras dar�n vac�o porque no le ha dado tiempo a leer el archivo EBU-TT-D cuando hace esta lectura
								//escribeSubtitulos();
								cambiaAFormatoTemporal();
		    				}
		    				else{
		    					try{
		    						$(data).find("tt").each(function(){
		    							//alert("TT");
		    							$tt_ttheader = $(this);
		    							//alert("El archivo s� es EBU-TT-D porque tiene en la cabecera la etiqueta TT");
		    							haySubtitulosEBUTTD = true;
		    							
		    							// Juanpe ha omitido esto para probar con la etiqueta "myElement_caption" del propio JWPlayer para los subt�tulos
		    							//player.setCurrentCaptions(0);
		    							
		    							//alert("Los actuales subt�tulos son: " + player.getCurrentCaptions());
		    							//var $ttp_cellResolution = $tt_ttheader.attr('ttp:cellResolution');
		    							//alert( ttp_cellResolution.toString() );
		    							//var xmlns_tt_header = $tt_ttheader.attr('xmlns:tt');
		    							//var xmlns_ttp_header = $tt_ttheader.attr('xmlns:ttp');
		    							//var xmlns_tts_header = $tt_ttheader.attr('xmlns:tts');
		    							//var xmlns_ttm_header = $tt_ttheader.attr('xmlns:ttm');
		    							//var xmlns_ebuttm_header = $tt_ttheader.attr('xmlns:ebuttm');
		    							//var xmlns_ebutts_header = $tt_ttheader.attr('xmlns:ebutts');
		    							//var xmlns_xs = $tt_ttheader.attr('xmlns:ebuxs');
		    							//var xmlns_xsi_header = $tt_ttheader.attr('xmlns:xsi');
		    							//alert(xmlns_tt_header.toString() + ":" + xmlns_ttp_header.toString() + ":" + xmlns_tts_header.toString()+ ":" + xmlns_ttm_header.toString()+ ":" +
		    							//xmlns_ebuttm_header.toString()+ ":" + xmlns_ebutts_header.toString()+ ":" + xmlns_xs_header.toString()+ ":" + xmlns_xsi_header.toString() );
		    							if(haySubtitulosEBUTTD){
		    								//Extraction of the ttp:cellResolution attribute.
		    								if (($tt_ttheader.attr('ttp:cellResolution'))!=undefined) {
		    									cellResolution=$tt_ttheader.attr('ttp:cellResolution');
		    								} 
		    								else {
		    									cellResolution='32 15';
		    								}
		    								procesaCellResolution();
		    								
		    								//Extraction of the ttp:timeBase attribute.
		    								if (($tt_ttheader.attr('ttp:timeBase'))!=undefined) {
		    									timeBase=$tt_ttheader.attr('ttp:timeBase');
		    								} 
		    								else {
		    									timeBase="media";
		    								}
		    								//alert("TimeBase: " + timeBase);
		    								
		    								//Extraction of the xml:lang attribute.
		    								if (($tt_ttheader.attr('xml:lang'))!=undefined) {
		    									language=$tt_ttheader.attr('xml:lang');
		    								} 
		    								else {
		    									language=undefined;
		    								}
		    								//alert("Language: " + language);
		    								
		    								//alert("Carga subtitulos");
		    								//cargaHeaderEBUTTD(); // Carga la cabecera del archivo EBU-TT-D
		    								cargaEstilosEBUTTD(); // Carga los estilos incluidos en el archivo EBU-TT-D
		    								cargaRegionesEBUTTD(); // Carga las regiones incluidos en el archivo EBU-TT-D
		    								cargaCuerpoEBUTTD(); // Carga el cuerpo del EBU-TT-D, que incluye los subt�tulos con sus propierdades (texto, estilo, regi�n y tiempos de inicio/fin)
		    								
		    								// Los m�todos AJAX son as�ncronos, as� que estas dos escrituras dar�n vac�o porque no le ha dado tiempo a leer el archivo EBU-TT-D cuando hace esta lectura
		    								//escribeEstilos();
		    								//escribeRegiones();
		    								//escribeSubtitulos();
		    							}
		    							else
		    								{
		    								alert("No cargo los estilos");
		    							}
		    						});
		    					}
		    					catch(err){
		    						alert("error: "+ err.toString());
		    					}
		    				}
		    				
		    			}
		    		}
		    	}

				
			}
			
			function procesaCellResolution(){
				// Cell Resolution lo componen dos numeros separados por un espacio
				var intEspacioEnString = 0;
				var textCellResolution = "";
				if(cellResolution !=undefined)
					{
					textCellResolution = cellResolution.toString();
					intEspacioEnString = textCellResolution.indexOf(" ");
					cellResolutionHoriz = textCellResolution.substring(0,intEspacioEnString);
					cellResolutionVert = textCellResolution.substring(intEspacioEnString+1,textCellResolution.length);
				}
				else
					{
					// Los valores por defecto
					cellResolution = "32 15";
					cellResolutionHoriz = "32";
					cellResolutionVert = "15";
				}
				//alert("CellResolution Horiz: " + cellResolutionHoriz + ". CellResolution Vert: " + cellResolutionVert);
			}
			
			verCellResolution = function(){
				alert("CellResolution Horiz: " + cellResolutionHoriz + "\nCellResolution Vert: " + cellResolutionVert);
			}
			
			getCellResolutionHoriz = function(){
				return cellResolutionHoriz;
			}
			
			getCellResolutionVert = function(){
				return cellResolutionVert;
			}
			
			// Funci�n que carga los subt�tulos EBU-TT-D
			function cargaRegionesEBUTTD(){		
				//alert("Cargo regiones EBU-TT-D");
				//We use the jQuery ajax method to read the EBU-TT-D document. The ajax method is asynchronous, so it may be executed
				//at the same time as other parts of the code.
				$.ajax({
					type: "GET",
					url: currentCaptionTrackFileSet,
					dataType: "html",
					success: htmlParserRegiones,
					error: htmlErrorParserRegiones
				});
			}
			
			// Funci�n que carga los subt�tulos EBU-TT-D
			function cargaCuerpoEBUTTD(){				
				//alert("Cargo el cuerpo del EBU-TT-D");
				//We use the jQuery ajax method to read the EBU-TT-D document. The ajax method is asynchronous, so it may be executed
				//at the same time as other parts of the code.
				$.ajax({
					type: "GET",
					url: currentCaptionTrackFileSet,
					dataType: "html",
					success: htmlParserCuerpo,
					error: htmlErrorParserCuerpo
				});
			}
			
			verTamanoVideo2 = function(){
				var video = document.getElementById("myElement_media");
				var ancho = video.clientWidth;
				var alto = video.clientHeight;
				alert("Ancho: " + ancho + "\n" + "Alto: " + alto);
			}
			
			verTamanoVideo = function(){
				var video = document.getElementById("myElement_media");
				var ancho = video.clientWidth;
				var alto = video.clientHeight;
				//alert("Ancho: " + ancho + "\n" + "Alto: " + alto);
				return alto;
			}
			
			// Funci�n que carga los posibles estilos de los subt�tulos contenidos en el archivo EBU-TT-D
			function cargaEstilosEBUTTD(){				
				//alert("Cargo estilos EBU-TT-D");
				//We use the jQuery ajax method to read the EBU-TT-D document. The ajax method is asynchronous, so it may be executed
				//at the same time as other parts of the code.
				$.ajax({
					type: "GET",
					url: currentCaptionTrackFileSet,
					dataType: "html",
					success: htmlParserEstilos,
					error: htmlErrorParserEstilos
				});
			}
			
			// Parsea el cuerpo del archivo EBU-TT-D, que contiene el texto de cada subt�tulos y sus propiedades (regi�n, estilo, tiempo de inicio y fin)
			function htmlParserCuerpo(data) {
				//alert(data);
				var i = 0; // Controla los spans
				var j = 0; // Controla los p�rrafos "p"
				var k = 0; // Controla los div's
				
				var idDiv = 0;
				var idP = 0;
				var idSpan = 0;
				
				var lastIdDiv = 0;
				var lastIdP = 0;
				var lastIdSpan = 0;
				
				var vauxDiv = ""; // Nombre de la id del div
				var vauxP = ""; // Nombre de la id del div
				var vauxSpan = ""; // Nombre de la id del div
				
				//alert(data.toString());
				$(data).find('tt\\:body').each(function(){
					var $tt_body = $(this);
					//alert("Body:\n" + data.toString());
					$($tt_body).find('tt\\:div').each(function(){
						var $tt_div = $(this);
						// Si no tiene asignado una id se le asigna una autom�ticamente para que el "p" hijo se pueda referencia al padre
						// y heredar sus caracter�sticas.
						idSubtDiv.id[k] = $tt_div.attr('xml:id');
						if($tt_div.attr('xml:id')==undefined){
							idDiv = lastIdDiv++;
							lastIdDiv = idDiv;
							vauxDiv = "auxdiv" + idDiv;
							//alert(vaux);
							idSubtDiv.id[k] = vauxDiv;
						}
						vaux = idSubtDiv.id[k];
						idSubtDiv.style[k] = $tt_div.attr('style');
						idSubtDiv.region[k] = $tt_div.attr('region');
						idDiv = idSubtDiv.id[k]; // Una id por divisi�n
						if($tt_div.attr('xml:id')==undefined){
							idDiv = lastIdP++;
							lastIdDiv = idDiv;
						}
						//alert("div: " + idDiv);
						$($tt_div).find('tt\\:p').each(function(){
						//$(data).find('tt\\:p').each(function(){
							var $tt_p = $(this);
							// Si no tiene asignado una id se le asigna una autom�ticamente para que el "span" hijo se pueda referencia al padre
							// y heredar sus caracter�sticas.
							idSubtitulosP.id[j] = $tt_p.attr('xml:id');
							idSubtitulosP.timeBeginSubt[j] = $tt_p.attr('begin');
							idSubtitulosP.timeEndSubt[j] = $tt_p.attr('end');
							if($tt_p.attr('xml:id')==undefined){
								idP = lastIdP++;
								lastIdP = idP;
								vauxP = "auxP" + idP;
								idSubtitulosP.id[j] = vauxP;
							}
							//alert("Id del P: " + idSubtitulosP.id[j] + " en j=" + j);
							idSubtitulosP.id_Div_Parent[j] = vaux;
							idSubtitulosP.styleSubt[j] = $tt_p.attr('style');
							idSubtitulosP.regionSubt[j] = $tt_p.attr('region');
							// Esta alert muestra las caracter�sticas de los "p"
							//alert("id: " + idSubtitulosP.id[j].toString() + "\ndivParent: " + idSubtitulosP.id_Div_Parent[j].toString()+"\nStyle: " + idSubtitulosP.styleSubt[j].toString() + "\nRegion: " + idSubtitulosP.regionSubt[j].toString());

							// Cuenta el número de BR del párrafo P
							var tamBrLength = 0;
							$($tt_p).find('tt\\:br').each(function(){
								tamBrLength++;
							});
							idSubtitulosP.numBr[j] = tamBrLength;
							//alert("NumBR: " + idSubtitulosP.numBr[j]);
							
							var numSpan = 0;
							$($tt_p).find('tt\\:span').each(function(){
								var $tt_span = $(this);
								if(numSpan==0){
									idSubtitulosP.idSpan0[j] = $tt_span.attr('xml:id');
									if($tt_span.attr('xml:id')==undefined){
										idSpan = lastIdSpan++;
										lastIdSpan = idSpan;
										vauxSpan = "auxSpan" + numSpan + "_" + j;
										idSubtitulosP.idSpan0[j] = vauxSpan;
									}
									idSubtitulosP.textSpan0[j] = $tt_span.html().toString();
									idSubtitulosP.styleSpan0[j] = $tt_span.attr('style');
									idSubtitulosP.regionSpan0[j] = $tt_span.attr('region');
								}
								
								else if(numSpan==1){
									idSubtitulosP.idSpan1[j] = $tt_span.attr('xml:id');
									if($tt_span.attr('xml:id')==undefined){
										idSpan = lastIdSpan++;
										lastIdSpan = idSpan;
										vauxSpan = "auxSpan" + numSpan + "_" + j;
										idSubtitulosP.idSpan1[j] = vauxSpan;
									}
									idSubtitulosP.textSpan1[j] = $tt_span.html().toString();
									idSubtitulosP.styleSpan1[j] = $tt_span.attr('style');
									idSubtitulosP.regionSpan1[j] = $tt_span.attr('region');
								}
								
								else if(numSpan==2){
									idSubtitulosP.idSpan2[j] = $tt_span.attr('xml:id');
									if($tt_span.attr('xml:id')==undefined){
										idSpan = lastIdSpan++;
										lastIdSpan = idSpan;
										vauxSpan = "auxSpan" + numSpan + "_" + j;
										idSubtitulosP.idSpan2[j] = vauxSpan;
									}
									idSubtitulosP.textSpan2[j] = $tt_span.html().toString();
									idSubtitulosP.styleSpan2[j] = $tt_span.attr('style');
									idSubtitulosP.regionSpan2[j] = $tt_span.attr('region');
								}
								
								//alert("idSpan: "+idSubtitulosP.regionSpan0[j]);
								var textoAlertSpan = "";
								if(numSpan==0){
									textoAlertSpan = "idSpan0: " + idSubtitulosP.idSpan0[j] + "\ntextSpan0: " + idSubtitulosP.textSpan0[j] + "\nStyleSpan0: " + idSubtitulosP.styleSpan0[j] + "\nRegion: " + idSubtitulosP.regionSpan0[j];
								}
								else if(numSpan==1){
									textoAlertSpan = "idSpan1: " + idSubtitulosP.idSpan1[j] + "\ntextSpan1: " + idSubtitulosP.textSpan1[j] + "\nStyleSpan1: " + idSubtitulosP.styleSpan1[j] + "\nRegion: " + idSubtitulosP.regionSpan1[j];
								}
								else if(numSpan==2){
									textoAlertSpan = "idSpan2: " + idSubtitulosP.idSpan2[j] + "\ntextSpan2: " + idSubtitulosP.textSpan2[j] + "\nStyleSpan2: " + idSubtitulosP.styleSpan2[j] + "\nRegion: " + idSubtitulosP.regionSpan2[j];
								}
								// Esta alert muestra las caracter�sticas de los "span"
								//alert(textoAlertSpan);
								numSpan++;
								i++;
								//alert("span: " + idSpan);
							});
							//alert("idSubt: " + timeOutSubtArray[i].toString());
							//i++;
							j++;
						});
						//j++;
					});
					k++;
					
					escribeSubtitulos();
					cambiaAFormatoTemporal();
				});
			}
			
			function htmlParserRegiones(data) {
				//alert($data.toString());
				//alert(data.toString());
				//alert("Parseo Regiones");
				var i=0;
				$(data).find('tt\\:head').each(function(){
					$(data).find('tt\\:region').each(function(){
					var $tt_region = $(this);
					var $id = $tt_region.attr('xml:id');
						idRegiones.id[i]=$tt_region.attr('xml:id');
						idRegiones.origin[i]=$tt_region.attr('tts:origin');
						idRegiones.extent[i]=$tt_region.attr('tts:extent');
						idRegiones.style[i]=$tt_region.attr('style');
						idRegiones.displayAlign[i]=$tt_region.attr('tts:displayAlign');
						idRegiones.padding[i]=$tt_region.attr('tts:padding');
						idRegiones.writingMode[i]=$tt_region.attr('tts:writingMode');
						idRegiones.showBackground[i]=$tt_region.attr('tts:showBackground');
						idRegiones.overflow[i]=$tt_region.attr('tts:overflow');
						//alert($id.toString());
						i++;
					});
					escribeRegiones();
				});
			}
			
			
			function htmlErrorParserCuerpo(data) {
				alert("Error parseando cuerpo");
			}
			
			function htmlErrorParserRegiones(data) {
				alert("Error parseando regiones");
			}
			
			function htmlParserEstilos(data) {
				var i=0;
				$(data).find('tt\\:head').each(function(){
					$(data).find('tt\\:style').each(function(){
						var $tt_style = $(this);
						var $tt_textAlign = $tt_style.attr('xml:textAlign');
						var id2 = $tt_style.attr('xml:id');
						idEstilos.id[i]=$tt_style.attr('xml:id');
						idEstilos.direction[i]=$tt_style.attr('tts:direction');
						idEstilos.fontFamily[i]=$tt_style.attr('tts:fontFamily');
						idEstilos.fontSize[i]=$tt_style.attr('tts:fontSize');
						idEstilos.lineHeight[i]=$tt_style.attr('tts:lineHeight');
						idEstilos.textAlign[i]=$tt_style.attr('tts:textAlign');
						idEstilos.color[i]=$tt_style.attr('tts:color');
						idEstilos.backgroundColor[i]=$tt_style.attr('tts:backgroundColor');
						idEstilos.fontStyle[i]=$tt_style.attr('tts:fontStyle');
						idEstilos.fontWeight[i]=$tt_style.attr('tts:fontWeight');
						idEstilos.textDecoration[i]=$tt_style.attr('tts:textDecoration');
						idEstilos.unicodeBidi[i]=$tt_style.attr('tts:unicodeBidi');
						idEstilos.wrapOption[i]=$tt_style.attr('tts:wrapOption');
						idEstilos.multiRowAlign[i]=$tt_style.attr('ebutts:multiRowAlign');
						idEstilos.linePadding[i]=$tt_style.attr('ebutts:linePadding');
						i++;
					});
					escribeEstilos();
				});
			}
			
			escribeSubtitulos = function() {
				var texto = "";
				var ji=0;
				//alert("length: "+idSubtitulosP.id.length);
				for(ji=0; ji<idSubtitulosP.id.length; ji++){
					
					texto += "Subtitulo " + ji.toString() + " id: " + idSubtitulosP.id[ji] + "; "; 
					texto += "TimeInSubt: " + idSubtitulosP.timeBeginSubt[ji] + "; ";
					texto += "TimeOutSubt: " + idSubtitulosP.timeEndSubt[ji] + "; \n";
					texto += "Id_Div_Parent: " + idSubtitulosP.id_Div_Parent[ji] + "; \n";
					texto += "Id_Subt: " + idSubtitulosP.id[ji] + "; \n";
					if(idSubtitulosP.textSpan0[ji]!=undefined){
						texto += "TextSubt Span0: " + idSubtitulosP.textSpan0[ji] + "; \n";
						texto += "IdSubt Span0: " + idSubtitulosP.idSpan0[ji] + "; \n";
						texto += "StyleSubt Span0: " + idSubtitulosP.styleSpan0[ji] + "; \n";
					}
					if(idSubtitulosP.textSpan1[ji]!=undefined){
						texto += "TextSubt Span1: " + idSubtitulosP.textSpan1[ji] + "; \n";
						texto += "IdSubt Span1: " + idSubtitulosP.idSpan1[ji] + "; \n";
						texto += "StyleSubt Span1: " + idSubtitulosP.styleSpan1[ji] + "; \n";
					}
					if(idSubtitulosP.textSpan2[ji]!=undefined){
						texto += "TextSubt Span2: " + idSubtitulosP.textSpan2[ji] + "; \n";
						texto += "IdSubt Span2: " + idSubtitulosP.idSpan2[ji] + "; \n";
						texto += "StyleSubt Span2: " + idSubtitulosP.styleSpan2[ji] + "; \n";
					}
					
					/*texto += "StyleSubt: " + idSubt.style[ji] + "; ";
					texto += "RegionSubt: " + idSubt.region[ji] + "; ";
					texto += "Span: " + idSubt.span[ji] + "; ";
					texto += "TimeInSpan: " + idSubt.timeInSpan[ji] + ";";
					texto += "TimeOutSpan: " + idSubt.timeOutSpan[ji] + "; ";
					texto += "TextSpan: " + idSubt.fontWeight[ji] + "; ";
					texto += "StyleSpan: " + idSubt.textDecoration[ji] + "; ";
					texto += "RegionSpan: " + idSubt.unicodeBidi[ji] + "; ";
					texto += "WrapOption: " + idSubt.wrapOption[ji] + "; ";
					texto += "MultiRowAlign: " + idSubt.multiRowAlign[ji] + "; ";
					texto += "LinePadding: " + idSubt.linePadding[ji] + ";\n";*/
				}
				
				//alert("Subtitulos\n" + texto);
			} 
			
			escribeEstilos = function() {
				var texto = "";
				var ji=0;
				for(var ji=0; ji<idEstilos.id.length; ji++)
					{
					texto += "Style " + ji.toString() + " id: " + idEstilos.id[ji] + "; "; 
					texto += "Direction: " + idEstilos.direction[ji] + "; ";
					texto += "FontFamily: " + idEstilos.fontFamily[ji] + "; ";
					texto += "FontSize: " + idEstilos.fontSize[ji] + "; ";
					texto += "LineHeight: " + idEstilos.lineHeight[ji] + "; ";
					texto += "TextAlign: " + idEstilos.textAlign[ji] + "; ";
					texto += "Color: " + idEstilos.color[ji] + "; ";
					texto += "BackgroundColor: " + idEstilos.backgroundColor[ji] + ";";
					texto += "FontStyle: " + idEstilos.fontStyle[ji] + "; ";
					texto += "FontWeight: " + idEstilos.fontWeight[ji] + "; ";
					texto += "TextDecoration: " + idEstilos.textDecoration[ji] + "; ";
					texto += "UnicodeBidi: " + idEstilos.unicodeBidi[ji] + "; ";
					texto += "WrapOption: " + idEstilos.wrapOption[ji] + "; ";
					texto += "MultiRowAlign: " + idEstilos.multiRowAlign[ji] + "; ";
					texto += "LinePadding: " + idEstilos.linePadding[ji] + ";\n";
				}
				
				//alert("Estilos\n" + texto);
			} 
			
			escribeRegiones = function() {
				var texto = "";
				var ji=0;
				for(var ji=0; ji<idRegiones.id.length; ji++)
					{
					texto += "Region " + ji.toString() + " id: " + idRegiones.id[ji] + "; "; 
					texto += "Origin: " + idRegiones.origin[ji] + "; ";
					texto += "Extent: " + idRegiones.extent[ji] + "; ";
					texto += "Style: " + idRegiones.style[ji] + "; ";
					texto += "DisplayAlign: " + idRegiones.displayAlign[ji] + "; ";
					texto += "Padding: " + idRegiones.padding[ji] + "; ";
					texto += "WritingMode: " + idRegiones.writingMode[ji] + "; ";
					texto += "ShowBackground: " + idRegiones.showBackground[ji] + ";";
					texto += "Overflow: " + idRegiones.overflow[ji] + ";\n";
				}
				
				//alert("Regiones\n" + texto);
			} 
			
			function htmlErrorParserEstilos(data) {
				alert("Error parseando estilos");
			}
			
			extraeCurrentCaptions = function() {
				extraeCaptions();
				// Si no hay subt�tulos seleccionados ("None"), player.getCurrentCaptions() = 0
				// pero en mi matriz matrixCaptionsTrackFiles[0] contiene lo correspondiente a player.getCurrentCaptions() = 1
				// Almaceno en la variable currentCaptionsSet el �ndice de los subt�tulos seleccionados
				currentCaptionsSet = player.getCurrentCaptions();
				//alert("Current Captions: " + currentCaptionsSet );
				if(currentCaptionsSet != 0)
					{ currentCaptionTrackFileSet = matrixCaptionsTrackFiles[currentCaptionsSet-1]; }
				if(currentCaptionsSet != 0)
					{ currentCaptionKindSet = matrixCaptionsKinds[currentCaptionsSet-1]; }
				if(currentCaptionsSet != 0)
					{ currentCaptionLabelSet = matrixCaptionsLabels[currentCaptionsSet-1]; }
				//alert("Current Caption Track File: " + currentCaptionTrackFileSet );
			}
			
			extraeCaptions = function() {
				var text = "The list of captions tracks is:\n";
				//matrixCaptionsTrackFiles;
		    	//matrixCaptionsLabels;
		    	//matrixCaptionsKinds;
		    	var numLevels = 0;
		    	var numTracks = 0;
		    	var Tracks = "";
				var levels = player.getPlaylist();
				numLevels = levels.length;
				//numTracks  = levels.tracks.length;
				
			    if(levels) { 
			        for (var i=0; i<numLevels; i++) { 
			        	numTracks  = levels[i].tracks.length;
			        	for(var j=0; j<numTracks; j++){
			        			//Tracks  = levels[i].tracks[j].file;
			        			matrixCaptionsLabels[j] = levels[i].tracks[j].label;
			        			matrixCaptionsTrackFiles[j] = levels[i].tracks[j].file;
			        			matrixCaptionsKinds[j] = levels[i].tracks[j].kind;
			        			matrixCaptionsFormats[j] = levels[i].tracks[j].format;
			        			//alert(numLevels.toString() + ":" + matrixCaptionsLabels[j].toString());
			        	}
			        }
			    } else { text += "-  "; }
			    //alert(numLevels.toString() + ":" + matrixCaptionsTrackFiles.toString());
			    numTracks = matrixCaptionsTrackFiles.length;
			    for(var n=0; n<numTracks; n++)
			    	{ text += "Track File " + n.toString() + ": " + matrixCaptionsTrackFiles[n] + "; Label " + n.toString() + ": " + matrixCaptionsLabels[n] + "; Kind "  + n.toString() + ": " + matrixCaptionsKinds[n]  + "\n"; }
				
				//alert( text );
			}
			
			muestraCurrentCaptions = function() {
				//extraeCaptions();
				extraeCurrentCaptions();
				alert("Current Caption Track File: " + currentCaptionTrackFileSet );
			}
			
			muestraCaptions = function() {
				extraeCaptions();
				var text = "The list of captions tracks is:\n";
			    var numTracks = matrixCaptionsTrackFiles.length;
			    for(var n=0; n<numTracks; n++)
			    	{ text += "Track File " + n.toString() + ": " + matrixCaptionsTrackFiles[n] + "; Label " + n.toString() + ": " + matrixCaptionsLabels[n] + "; Kind "  + n.toString() + ": " + matrixCaptionsKinds[n]  + "; Format "  + n.toString() + ": " + matrixCaptionsFormats[n]  + "\n";}
				
				alert( text );
			}
			
			function timeToSeconds(timeExample){
				var firstDosPuntos = timeExample.indexOf(":");
				var secondDosPuntos = timeExample.indexOf(":", firstDosPuntos+1);
				var finalDelStr = timeExample.length;
				var timeHours = timeExample.substring(0, firstDosPuntos);
				var timeMinutes = timeExample.substring(firstDosPuntos+1, secondDosPuntos);
				var timeSeconds = timeExample.substring(secondDosPuntos+1, finalDelStr);
				var timeTotalSeconds = 0;
				timeTotalSeconds = parseFloat(timeHours)*3600 + parseFloat(timeMinutes)*60 + parseFloat(timeSeconds);
				
				//alert("horas: "+timeHours.toString()+". Minutos: "+timeMinutes.toString()+ ". Segundos: "+timeSeconds.toString() + ". Total en segundos: "+timeTotalSeconds.toString() );
				return timeTotalSeconds;
			}
	    	
			addElement = function() { 
				// crea un nuevo elemento div (deber�a ser un "P" p�rrado?) llamado "subtitulo" y le agrega el contenido 
				/*var newDiv = document.createElement('div');
				newDiv.id = 'subtitulo';
				document.body.appendChild(newDiv);
				newDiv.innerHTML = "Prueba de que existo";*/
				
				// Ejemplo de modificaci�n de sus caracter�sticas
				/*var pruebaSubtitulo = document.getElementById("subtitulo");
				positionSet = "bottom";
				pruebaSubtitulo.style.position = positionSet;
				setTipoPosition();
				pruebaSubtitulo.style.color = colorFontSet;
				pruebaSubtitulo.style.backgroundColor = backgroundColorSet;
				pruebaSubtitulo.innerHTML = "";*/
				
				
				
				createSubtitutleLabels();

			}
			
			createSubtitutleLabels = function(){
				if(document.getElementById('myElement_caption')!=null) {
					//alert("Hay element_caption");
					var myElement_caption = document.getElementById("myElement_caption");
					//myElement_caption.removeAttribute('style');
					while (myElement_caption.firstChild) {
						myElement_caption.removeChild(myElement_caption.firstChild);
					}
					var newDivprueba = document.createElement('div');
					newDivprueba.id = 'divaux0';
					myElement_caption.appendChild(newDivprueba);
					
					var newPprueba = document.createElement('p');
					newPprueba.id = 'subtituloP';
					newDivprueba.appendChild(newPprueba);
					
					var newSpan1 = document.createElement('span');
					newSpan1.id = 'subtituloSpan1';
					newSpan1.innerHTML = "Hola, soy span 1";
					newPprueba.appendChild(newSpan1);
					var newBr = document.createElement('br');
					newPprueba.appendChild(newBr);
					var newSpan2 = document.createElement('span');
					newSpan2.id = 'subtituloSpan2';
					newSpan2.innerHTML = "Hola, soy span 2";
					newPprueba.appendChild(newSpan2);
					//alert("Creo nuevo Elemento");
					
					//var myElement_logo = document.getElementById("myElement_logo");
					//myElement_logo.style.visibility = 'hidden';
					//pruebaSubtitulo.innerHTML = "Tengo que poner un texto muy largo para comprobar algunas opciones como el bidi-override y otras cosas como el wrap pero no s� si servir� de algo";
				}
				else
				{
					//alert("No creo nuevo Elemento");
				}
			}
			
			player.onPause(
				function(event) {
					//var myElement_capt = document.getElementById("myElement_capture");
					//myElement_capt.style.visibility = 'visible';
					//alert("Has pausado");
					
					//var myElement_logo = document.getElementById("myElement_logo");
					//myElement_logo.style.visibility = 'hidden';
					//alert("Has apagado el logo");
				}
			);
			
			player.onPlay(
				function(event) {
					//alert("Le has dado a Play, Juanpe!");
					//player.setVolume(0);
					//player.setCurrentCaptions(4);
					//alert(player.getCurrentCaptions());
					//var myElement_logo = document.getElementById("myElement_logo");
					//myElement_logo.style.visibility = 'hidden';
					//extraeCaptions();
					haySubtitulosEBUTTD = false; // Inicialmente cuando hay cambios en los subt�tulos seleccionados se considera que no hay subt�tulos EBU-TTD;
					//alert("Hola Juanpe 29/04/2015");
						
					if(player.getCurrentCaptions()==0){
						haySubtitulosEBUTTD = false;
						//alert("No hay subt�tulos");
						return;
					}
					else{
						//createSubtitutleLabels();
						//extraeCaptions();
						extraeCurrentCaptions();
						cargarArchivoSubtitulos();
					}
				}
			);
			
			player.onResize(
				function(event) {
					//var subtitulado = document.getElementById("subtitulo");
					actualWidthSet = event.width;
					actualHeightSet = event.height;
					//alert("Lo que devuelve el resize: " + actualWidthSet + ":" + actualHeightSet);
					//setFontSize(actualWidthSet, actualHeightSet);
					setDefaultStyles(event.width, event.height);
					//fontSizeSet = "100%";
					//setFontSize();
					setTipoPosition();
					//player.style.position = "relative";
					//player.style.zIndex = 0;
					//subtitulado.style.zIndex = zIndexSet;
					//subtitulado.style.zIndex = 2147483647;
					//alert("Ha habido resize");
					//subtitulado.style.position = "absolute";
					//subtitulado.style.top ="500px";
					//subtitulado.style.left ="500px";
				}
			);
			
			setRegionesSubt = function(numSubtSeleccionado){
				//setDefaultStyles(actualWidthSet, actualHeightSet);
				//alert(numSubtSeleccionado.toString());
				// Si no se especifica una caracter�stica se deja la "por defecto"
				//alert(numSubtSeleccionado.toString());
				
				var regionSeleccionado = idSubtSpan.region[numSubtSeleccionado];
				var regionSeleccionadoP = idSubtP.region[numSubtSeleccionado];
				
				var regionSeleccionadoDiv = idSubtDiv.region[numSubtSeleccionado];
				//alert(estiloSeleccionado + ":" + estiloSeleccionadoP + ":" + estiloSeleccionadoDiv);
				
				var regionesArrayDiv = [];
				try{ regionesArrayDiv = regionSeleccionadoDiv.split(" "); }
				catch(err) {
					regionesArrayDiv[0] = regionSeleccionadoDiv;
					//alert("Error en split: " + regionSeleccionadoDiv );
				}
				//alert("Estilos: " + estilosArray.toString());
				for(var i=0; i<regionesArrayDiv.length; i++){ 
					cambiaRegionesPorSuId(regionesArrayDiv[i]);
				}
				
				var regionesArrayP = [];
				try{ regionesArrayP = regionSeleccionadoP.split(" "); }
				catch(err) {
					regionesArrayP[0] = regionSeleccionadoP;
					//alert("Error en split: " + estiloSeleccionadoP );
				}
				for(var i=0; i<regionesArrayP.length; i++){ 
					cambiaRegionesPorSuId(regionesArrayP[i]);
				}
				
				var regionesArray = [];
				try{ regionesArray = regionSeleccionado.split(" "); }
				catch(err) {
					regionesArray[0] = regionSeleccionado;
					//alert("Error en split: " + estiloSeleccionado );
				}
				for(var i=0; i<regionesArray.length; i++){ 
					cambiaRegionesPorSuId(regionesArray[i]);
				}
				
			}
			
				cambiaRegionesPorSuId3 = function(regionSeleccionado, element, elementDivAux) {
				
				var numRegionSeleccionado = -1;
				try {
					numRegionSeleccionado = idRegiones.id.indexOf(regionSeleccionado); 
				}
				catch(err) {			
					alert("Error: " + err);
					return;
				}
				
				//alert("Region Seleccionada Num: " + numRegionSeleccionado);
				
				//alert("Cargo estilo: " + estiloSeleccionado + ":" + numEstiloSeleccionado);
				if(idRegiones.origin[numRegionSeleccionado]!=undefined){
					//alert("Cambia Origin: " + idRegiones.origin[numRegionSeleccionado]);
					originSet = idRegiones.origin[numRegionSeleccionado];
					//alert("Origin Set Juanpe: " + originSet);
					setOriginDiv(elementDivAux, originSet);
					//setOrigin(element, originSet);
					setOrigin(element, "0px 0px");
				}
				if(idRegiones.extent[numRegionSeleccionado]!=undefined){
					//alert("Cambia extent: " + idRegiones.extent[numRegionSeleccionado]);
					extentSet = idRegiones.extent[numRegionSeleccionado];
					setExtent(elementDivAux, extentSet); // Pongo la amplitud en el Div aux que me he inventado (con position:"absolute")
					setExtent(element, extentSet); // Pongo la amplitud en el Div aux que me he inventado (con position:"relative", para que funcione "vertical-align" con "display:table-cell")
				}
				if(idRegiones.style[numRegionSeleccionado]!=undefined){
					//alert("Cambia estilo: " + idRegiones.style[numRegionSeleccionado]);
					styleRegionSet = idRegiones.style[numRegionSeleccionado];
					cambiaEstilosPorSuId2(styleRegionSet, element);
				}
				if(idRegiones.displayAlign[numRegionSeleccionado]!=undefined){
					//alert("Cambia lineHeight: " + idRegiones.lineHeight[numRegionSeleccionado]);
					displayAlignSet = idRegiones.displayAlign[numRegionSeleccionado];
					setDisplayAlign(element, displayAlignSet); // Juanpe lo quita para que no afecte
				}
				if(idRegiones.padding[numRegionSeleccionado]!=undefined){
					//alert("Cambia textAlign: " + idRegiones.textAlign[numRegionSeleccionado]);
					paddingSet = idRegiones.padding[numRegionSeleccionado]; // Esta propiedad difiere en "style", hay que mirarlo bien
					setPadding(element, paddingSet);
				}
				/*if(idRegiones.writingMode[numRegionSeleccionado]!=undefined){ 
					//alert("Cambia color: " + idRegiones.color[numRegionSeleccionado]);
					writingModeSet=idRegiones.writingMode[numRegionSeleccionado];
					setWritingMode();
				}
				if(idRegiones.showBackground[numRegionSeleccionado]!=undefined){
					//alert("Cambia backgroundColor: " + idRegiones.backgroundColor[numRegionSeleccionado]);
					showBackgroundSet = idRegiones.showBackground[numRegionSeleccionado];
					setShowBackground();
				}
				if(idRegiones.overflow[numRegionSeleccionado]!=undefined){
					//alert("Cambia fontStyle: " + idRegiones.fontStyle[numRegionSeleccionado]);
					fontStyleSet = idRegiones.fontStyle[numRegionSeleccionado];
					setFontStyle();
				}*/
			}
			
			cambiaRegionesPorSuId2 = function(regionSeleccionado, element) {
				
				var numRegionSeleccionado = -1;
				try {
					numRegionSeleccionado = idRegiones.id.indexOf(regionSeleccionado); 
				}
				catch(err) {			
					alert("Error: " + err);
					return;
				}
				
				//alert("Region Seleccionada Num: " + numRegionSeleccionado);
				
				//alert("Cargo estilo: " + estiloSeleccionado + ":" + numEstiloSeleccionado);
				if(idRegiones.origin[numRegionSeleccionado]!=undefined){
					//alert("Cambia Origin: " + idRegiones.origin[numRegionSeleccionado]);
					originSet = idRegiones.origin[numRegionSeleccionado];
					//alert("Origin Set Juanpe: " + originSet);
					setOrigin(element, originSet);
				}
				if(idRegiones.extent[numRegionSeleccionado]!=undefined){
					//alert("Cambia extent: " + idRegiones.extent[numRegionSeleccionado]);
					extentSet = idRegiones.extent[numRegionSeleccionado];
					setExtent(element, extentSet);
				}
				if(idRegiones.style[numRegionSeleccionado]!=undefined){
					//alert("Cambia estilo: " + idRegiones.style[numRegionSeleccionado]);
					styleRegionSet = idRegiones.style[numRegionSeleccionado];
					cambiaEstilosPorSuId2(styleRegionSet, element);
				}
				if(idRegiones.displayAlign[numRegionSeleccionado]!=undefined){
					//alert("Cambia lineHeight: " + idRegiones.lineHeight[numRegionSeleccionado]);
					displayAlignSet = idRegiones.displayAlign[numRegionSeleccionado];
					setDisplayAlign(element, displayAlignSet); // Juanpe lo quita para que no afecte
				}
				if(idRegiones.padding[numRegionSeleccionado]!=undefined){
					//alert("Cambia textAlign: " + idRegiones.textAlign[numRegionSeleccionado]);
					paddingSet = idRegiones.padding[numRegionSeleccionado]; // Esta propiedad difiere en "style", hay que mirarlo bien
					setPadding(element, paddingSet);
				}
				/*if(idRegiones.writingMode[numRegionSeleccionado]!=undefined){ 
					//alert("Cambia color: " + idRegiones.color[numRegionSeleccionado]);
					writingModeSet=idRegiones.writingMode[numRegionSeleccionado];
					setWritingMode();
				}
				if(idRegiones.showBackground[numRegionSeleccionado]!=undefined){
					//alert("Cambia backgroundColor: " + idRegiones.backgroundColor[numRegionSeleccionado]);
					showBackgroundSet = idRegiones.showBackground[numRegionSeleccionado];
					setShowBackground();
				}
				if(idRegiones.overflow[numRegionSeleccionado]!=undefined){
					//alert("Cambia fontStyle: " + idRegiones.fontStyle[numRegionSeleccionado]);
					fontStyleSet = idRegiones.fontStyle[numRegionSeleccionado];
					setFontStyle();
				}*/
			}
			
			function cambiaRegionesPorSuId(regionSeleccionado) {
				
				var numRegionSeleccionado = -1;
				try {
					numRegionSeleccionado = idRegiones.id.indexOf(regionSeleccionado); 
				}
				catch(err) {			
					alert("Error: " + err);
					return;
				}
				
				//alert("Region Seleccionada Num: " + numRegionSeleccionado);
				
				//alert("Cargo estilo: " + estiloSeleccionado + ":" + numEstiloSeleccionado);
				if(idRegiones.origin[numRegionSeleccionado]!=undefined){
					//alert("Cambia Origin: " + idRegiones.origin[numRegionSeleccionado]);
					originSet = idRegiones.origin[numRegionSeleccionado];
					setOrigin();
				}
				if(idRegiones.extent[numRegionSeleccionado]!=undefined){
					//alert("Cambia extent: " + idRegiones.extent[numRegionSeleccionado]);
					extentSet = idRegiones.extent[numRegionSeleccionado];
					setExtent();
				}
				//if(idRegiones.style[numRegionSeleccionado]!=undefined){
					//alert("Cambia fontSize: " + idRegiones.fontSize[numRegionSeleccionado]);
					//fontSizeSet = idRegiones.fontSize[numRegionSeleccionado];
					//setFontSize();
				//}
				if(idRegiones.displayAlign[numRegionSeleccionado]!=undefined){
					//alert("Cambia lineHeight: " + idRegiones.lineHeight[numRegionSeleccionado]);
					displayAlignSet = idRegiones.displayAlign[numRegionSeleccionado];
					setDisplayAlign();
				}
				if(idRegiones.padding[numRegionSeleccionado]!=undefined){
					//alert("Cambia textAlign: " + idRegiones.textAlign[numRegionSeleccionado]);
					paddingSet = idRegiones.padding[numRegionSeleccionado]; // Esta propiedad difiere en "style", hay que mirarlo bien
					setPadding();
				}
				/*if(idRegiones.writingMode[numRegionSeleccionado]!=undefined){ 
					//alert("Cambia color: " + idRegiones.color[numRegionSeleccionado]);
					writingModeSet=idRegiones.writingMode[numRegionSeleccionado];
					setWritingMode();
				}
				if(idRegiones.showBackground[numRegionSeleccionado]!=undefined){
					//alert("Cambia backgroundColor: " + idRegiones.backgroundColor[numRegionSeleccionado]);
					showBackgroundSet = idRegiones.showBackground[numRegionSeleccionado];
					setShowBackground();
				}
				if(idRegiones.overflow[numRegionSeleccionado]!=undefined){
					//alert("Cambia fontStyle: " + idRegiones.fontStyle[numRegionSeleccionado]);
					fontStyleSet = idRegiones.fontStyle[numRegionSeleccionado];
					setFontStyle();
				}*/
			}
			
			setEstilosPSubt = function(numSubtSeleccionado, divPparent){
				//setDefaultStyles(actualWidthSet, actualHeightSet);
				/*
				//alert("Hola Juanpe");
				var divPparent = idSubtitulosP.id_Div_Parent[numSubtSeleccionado];
				//alert("DivParent" + divPparent);
				if(document.getElementById(divPparent)==null) {
					//alert("DivParent=null: " + divPparent);
					var myElement_caption1 = document.getElementById("myElement_caption");	
					//myElement_caption.removeAttribute('style');
					while (myElement_caption1.firstChild) {
						myElement_caption1.removeChild(myElement_caption1.firstChild);
					}
					
					myElement_caption1.style.visibility = "visible";
					// Creo el div
					var myElementDiv = document.createElement('div');
					myElementDiv.id = divPparent;
					myElement_caption1.appendChild(myElementDiv);
					myElement_caption1.className = "myClass";
				}
				else{
					//alert("El div: " + divPparent + " ya est� creado y borro su contenido.");
					var myElementDivAux = document.getElementById(divPparent);
					while (myElementDivAux.firstChild) {
						myElementDivAux.removeChild(myElementDivAux.firstChild);
					}
					var myElement_caption2 = document.getElementById("myElement_caption");	
					myElement_caption2.style.visibility = "visible";
					myElement_caption2.className = "myClass";
				}*/
					
				// Ahora defino el estilo del Div
				var numDivUsed = idSubtDiv.id.indexOf(divPparent);
				var myElementDivAux2 = document.getElementById(divPparent);
				//alert("idDivUsed" + idDivUsed + "\nnumDivUsed" + numDivUsed);
				var estiloSeleccionadoDiv = idSubtDiv.style[numDivUsed];	
				var estilosArrayDiv = [];
				try{ estilosArrayDiv = estiloSeleccionadoDiv.split(" "); }
				catch(err) {
					estilosArrayDiv[0] = estiloSeleccionadoDiv;
				}
					
				//alert("EstilosArrayDiv: " + estilosArrayDiv[0]);
				if(estilosArrayDiv[0]!=undefined){
					for(var i=0; i<estilosArrayDiv.length; i++){
						//alert("He llegado hasta aqu�? " + estilosArrayDiv.length);
						cambiaEstilosPorSuId2(estilosArrayDiv[i], myElementDivAux2);
						//alert("Y hasta aqu�?");
					}
				}

				// Compruebo si el elemento de tipo P existe y si no existe lo creo
				var idPused = idSubtitulosP.id[numSubtSeleccionado];
				var idPAuxUsed = "aux" + idSubtitulosP.id[numSubtSeleccionado];
				//alert(idPAuxUsed);
				
				if(document.getElementById(idPAuxUsed)==null) {
					var myElementPDivUsed = document.createElement('div');
					var myElementPDivAuxUsed = document.getElementById(divPparent);
					myElementPDivUsed.id = idPAuxUsed;
					myElementPDivAuxUsed.appendChild(myElementPDivUsed);
					elementPDivAux = document.getElementById(idPAuxUsed);
				}
				else{
					//alert("El Div del P: " + idPAuxUsed + " ya está creado y borro su contenido.");
					var myElementPAux1 = document.getElementById(idPused);
					while (myElementPAux1.firstChild) {
						myElementPAux1.removeChild(myElementPAux1.firstChild);
					}
				}
				
				var elementPDivAux = document.getElementById(idPAuxUsed);
				if(elementPDivAux!=null) {
					if(document.getElementById(idPused)==null) {
						// Despu�s creo el P dentro del div
						var myElementPUsed = document.createElement('p');
						var myElementDivAux3 = elementPDivAux;
						myElementPUsed.id = idPused;
						myElementPUsed.visibilitty = "visible";
						myElementDivAux3.appendChild(myElementPUsed);
						setLineHeight(myElementPUsed, usedLineHeightP); // Si el parámetro lineHeight va dirigido a Div no funciona correctamente
					}
					else{
						alert("El P: " + idPused + " ya está creado y borro su contenido.");
						var myElementPAux1 = document.getElementById(idPused);
						while (myElementPAux1.firstChild) {
							myElementPAux1.removeChild(myElementPAux1.firstChild);
						}
					}
				}
				
				var elementPaux = document.getElementById(idPused);
				
				// Defino los estilos del P
				if(idSubtitulosP.styleSubt[numSubtSeleccionado]!=undefined) {
					//alert("Activo el estilo: " + idSubtitulosP.styleSubt[numSubtSeleccionado]);
					var estiloSeleccionadoP = idSubtitulosP.styleSubt[numSubtSeleccionado];	
					var estilosArrayP = [];
					try{ estilosArrayP = estiloSeleccionadoP.split(" "); }
					catch(err) {
						estilosArrayP[0] = estiloSeleccionadoP;
					}
					
					for(var i=0; i<estilosArrayP.length; i++){ 
						//alert("Activo el estilo 2: " + estilosArrayP[i] + "en element: " + element);
						//alert("Estilos array " + i + ": " + estilosArrayP[i]);
						cambiaEstilosPorSuId2(estilosArrayP[i], elementPaux);
					}
				}
				
				// Defino las regiones del P
				if(idSubtitulosP.regionSubt[numSubtSeleccionado]!=undefined) {
					var regionSeleccionadoP = idSubtitulosP.regionSubt[numSubtSeleccionado];
					var regionesArrayP = [];
					try{ regionesArrayP = regionSeleccionadoP.split(" "); }
					catch(err) {
						regionesArrayP[0] = regionSeleccionadoP;
						//alert("Error en split: " + estiloSeleccionadoP );
					}
					for(var i=0; i<regionesArrayP.length; i++){ 
						//alert("Regiones: " + idSubtitulosP.regionSubt[numSubtSeleccionado]);
						cambiaRegionesPorSuId3(regionesArrayP[i], elementPaux, elementPDivAux);
					}
				}
				
				if(idSubtitulosP.idSpan0[numSubtSeleccionado]!=undefined) {
					//alert("Voy a cargar estilo span 0: " + idSubtitulosP.idSpan0[numSubtSeleccionado]);
					var elementSpan0 = document.createElement('span');
					//elementSpan0.innerHTML = "Hola Juanpe Soy Span 0";
					elementSpan0.innerHTML = idSubtitulosP.textSpan0[numSubtSeleccionado];
					elementSpan0.id = idSubtitulosP.idSpan0[numSubtSeleccionado];
					elementPaux.appendChild(elementSpan0);
					setLineHeight(elementSpan0, usedLineHeightSpan); // Si el parámetro lineHeight va dirigido a Div no funciona correctamente
					var estiloSeleccionadoSpan0 = idSubtitulosP.styleSpan0[numSubtSeleccionado];
					var estilosArraySpan0 = [];
					try{ estilosArraySpan0 = estiloSeleccionadoSpan0.split(" "); }
					catch(err) {
						estilosArraySpan0[0] = estiloSeleccionadoSpan0;
						//alert("Error en split: " + estiloSeleccionadoP );
					}
					for(var i=0; i<estilosArraySpan0.length; i++){ 
						//alert("Activo el estilo: " + estilosArrayP[i]);
						cambiaEstilosPorSuId2(estilosArraySpan0[i], elementSpan0);
					}
				}
				
				if(idSubtitulosP.numBr[numSubtSeleccionado]>0){
					elementPaux.appendChild(document.createElement('br'));
				}
				
				if(idSubtitulosP.idSpan1[numSubtSeleccionado]!=undefined) {
					//alert("Voy a cargar estilo span 1: " + idSubtitulosP.idSpan0[numSubtSeleccionado]);
					var elementSpan1 = document.createElement('span');
					elementSpan1.id = idSubtitulosP.idSpan1[numSubtSeleccionado];
					//elementSpan1.innerHTML = "Hola Juanpe Soy Span 1";
					elementSpan1.innerHTML = idSubtitulosP.textSpan1[numSubtSeleccionado];
					elementPaux.appendChild(elementSpan1);
					setLineHeight(elementSpan1, usedLineHeightSpan); // Si el parámetro lineHeight va dirigido a Div no funciona correctamente
					var estiloSeleccionadoSpan1 = idSubtitulosP.styleSpan1[numSubtSeleccionado];
					var estilosArraySpan1 = [];
					try{ estilosArraySpan1 = estiloSeleccionadoSpan1.split(" "); }
					catch(err) {
						estilosArraySpan1[0] = estiloSeleccionadoSpan1;
						//alert("Error en split: " + estiloSeleccionadoP );
					}
					for(var i=0; i<estilosArraySpan1.length; i++){ 
						//alert("Activo el estilo: " + estilosArrayP[i]);
						cambiaEstilosPorSuId2(estilosArraySpan1[i], elementSpan1);
					}
				}
				
				// Metemos un br si es necesario
				if(idSubtitulosP.numBr[numSubtSeleccionado]>1){
					elementPaux.appendChild(document.createElement('br'));
				}
				
				if(idSubtitulosP.idSpan2[numSubtSeleccionado]!=undefined) {
					//alert("Voy a cargar estilo span 2: " + idSubtitulosP.idSpan0[numSubtSeleccionado]);
					var elementSpan2 = document.createElement('span');
					elementSpan2.id = idSubtitulosP.idSpan2[numSubtSeleccionado];
					elementSpan2.innerHTML = idSubtitulosP.textSpan2[numSubtSeleccionado];
					elementPaux.appendChild(elementSpan2);
					setLineHeight(elementSpan2, usedLineHeightSpan); // Si el parámetro lineHeight va dirigido a Div no funciona correctamente
					var estiloSeleccionadoSpan2 = idSubtitulosP.styleSpan2[numSubtSeleccionado];
					var estilosArraySpan2 = [];
					try{ estilosArraySpan2 = estiloSeleccionadoSpan2.split(" "); }
					catch(err) {
						estilosArraySpan2[0] = estiloSeleccionadoSpan2;
						//alert("Error en split: " + estiloSeleccionadoP );
					}
					for(var i=0; i<estilosArraySpan2.length; i++){ 
						//alert("Activo el estilo: " + estilosArrayP[i]);
						cambiaEstilosPorSuId2(estilosArraySpan2[i], elementSpan2);
					}
				}
				
				// Metemos un br si es necesario
				if(idSubtitulosP.numBr[numSubtSeleccionado]>2){
					elementPaux.appendChild(document.createElement('br'));
				}
				
				if(idSubtitulosP.idSpan3[numSubtSeleccionado]!=undefined) {
					//alert("Voy a cargar estilo span 2: " + idSubtitulosP.idSpan0[numSubtSeleccionado]);
					var elementSpan3 = document.createElement('span');
					elementSpan3.id = idSubtitulosP.idSpan3[numSubtSeleccionado];
					elementSpan3.innerHTML = idSubtitulosP.textSpan3[numSubtSeleccionado];
					elementPaux.appendChild(elementSpan3);
					setLineHeight(elementSpan3, usedLineHeightSpan); // Si el parámetro lineHeight va dirigido a Div no funciona correctamente
					var estiloSeleccionadoSpan3 = idSubtitulosP.styleSpan3[numSubtSeleccionado];
					var estilosArraySpan3 = [];
					try{ estilosArraySpan3 = estiloSeleccionadoSpan3.split(" "); }
					catch(err) {
						estilosArraySpan3[0] = estiloSeleccionadoSpan3;
						//alert("Error en split: " + estiloSeleccionadoP );
					}
					for(var i=0; i<estilosArraySpan3.length; i++){ 
						//alert("Activo el estilo: " + estilosArrayP[i]);
						cambiaEstilosPorSuId2(estilosArraySpan3[i], elementSpan3);
					}
				}
				
				// Metemos un br si es necesario
				if(idSubtitulosP.numBr[numSubtSeleccionado]>3){
					elementPaux.appendChild(document.createElement('br'));
				}
				
				if(idSubtitulosP.idSpan4[numSubtSeleccionado]!=undefined) {
					//alert("Voy a cargar estilo span 2: " + idSubtitulosP.idSpan0[numSubtSeleccionado]);
					var elementSpan4 = document.createElement('span');
					elementSpan4.id = idSubtitulosP.idSpan4[numSubtSeleccionado];
					elementSpan4.innerHTML = idSubtitulosP.textSpan4[numSubtSeleccionado];
					elementPaux.appendChild(elementSpan4);
					setLineHeight(elementSpan4, usedLineHeightSpan); // Si el parámetro lineHeight va dirigido a Div no funciona correctamente
					var estiloSeleccionadoSpan4 = idSubtitulosP.styleSpan4[numSubtSeleccionado];
					var estilosArraySpan4 = [];
					try{ estilosArraySpan4 = estiloSeleccionadoSpan4.split(" "); }
					catch(err) {
						estilosArraySpan4[0] = estiloSeleccionadoSpan4;
						//alert("Error en split: " + estiloSeleccionadoP );
					}
					for(var i=0; i<estilosArraySpan4.length; i++){ 
						//alert("Activo el estilo: " + estilosArrayP[i]);
						cambiaEstilosPorSuId2(estilosArraySpan4[i], elementSpan4);
					}
				}
				
				// Metemos un br si es necesario
				if(idSubtitulosP.numBr[numSubtSeleccionado]>3){
					elementPaux.appendChild(document.createElement('br'));
				}
				
				if(idSubtitulosP.idSpan5[numSubtSeleccionado]!=undefined) {
					//alert("Voy a cargar estilo span 2: " + idSubtitulosP.idSpan0[numSubtSeleccionado]);
					var elementSpan5 = document.createElement('span');
					elementSpan5.id = idSubtitulosP.idSpan5[numSubtSeleccionado];
					elementSpan5.innerHTML = idSubtitulosP.textSpan5[numSubtSeleccionado];
					elementPaux.appendChild(elementSpan5);
					setLineHeight(elementSpan5, usedLineHeightSpan); // Si el parámetro lineHeight va dirigido a Div no funciona correctamente
					var estiloSeleccionadoSpan5 = idSubtitulosP.styleSpan5[numSubtSeleccionado];
					var estilosArraySpan5 = [];
					try{ estilosArraySpan5 = estiloSeleccionadoSpan5.split(" "); }
					catch(err) {
						estilosArraySpan5[0] = estiloSeleccionadoSpan5;
						//alert("Error en split: " + estiloSeleccionadoP );
					}
					for(var i=0; i<estilosArraySpan5.length; i++){ 
						//alert("Activo el estilo: " + estilosArrayP[i]);
						cambiaEstilosPorSuId2(estilosArraySpan5[i], elementSpan5);
					}
				}
				
				if(idSubtitulosP.numBr[numSubtSeleccionado]>5){
					for(var j=5; j<idSubtitulosP.numBr[numSubtSeleccionado]; j++){
						elementPaux.appendChild(document.createElement('br'));
					}
				}
			}
			
			setEstilosSubt = function(numSubtSeleccionado){
				//setDefaultStyles(actualWidthSet, actualHeightSet);
				//alert(numSubtSeleccionado.toString());
				// Si no se especifica una caracter�stica se deja la "por defecto"
				//alert(numSubtSeleccionado.toString());
				
				var estiloSeleccionado = idSubtSpan.style[numSubtSeleccionado];
				var estiloSeleccionadoP = idSubtP.style[numSubtSeleccionado];
				var estiloSeleccionadoDiv = idSubtDiv.style[numSubtSeleccionado];
				//alert(estiloSeleccionado + ":" + estiloSeleccionadoP + ":" + estiloSeleccionadoDiv);
				
				var estilosArrayDiv = [];
				try{ estilosArrayDiv = estiloSeleccionadoDiv.split(" "); }
				catch(err) {
					estilosArrayDiv[0] = estiloSeleccionadoDiv;
					//alert("Error en split: " + estiloSeleccionadoDiv );
				}
				//alert("Estilos: " + estilosArray.toString());
				for(var i=0; i<estilosArrayDiv.length; i++){ 
					cambiaEstilosPorSuId(estilosArrayDiv[i]);
				}
				
				var estilosArrayP = [];
				try{ estilosArrayP = estiloSeleccionadoP.split(" "); }
				catch(err) {
					estilosArrayP[0] = estiloSeleccionadoP;
					//alert("Error en split: " + estiloSeleccionadoP );
				}
				for(var i=0; i<estilosArrayP.length; i++){ 
					cambiaEstilosPorSuId(estilosArrayP[i]);
				}
				
				var estilosArray = [];
				try{ estilosArray = estiloSeleccionado.split(" "); }
				catch(err) {
					estilosArray[0] = estiloSeleccionado;
					//alert("Error en split: " + estiloSeleccionado );
				}
				for(var i=0; i<estilosArray.length; i++){ 
					cambiaEstilosPorSuId(estilosArray[i]);
				}
				
			}
			
			cambiaEstilosPorSuId2 = function(estiloSeleccionado, element) {
				var numEstiloSeleccionado = -1;
				try {
					numEstiloSeleccionado = idEstilos.id.indexOf(estiloSeleccionado); 
					//alert("Cargo estilo: " + estiloSeleccionado + ":" + numEstiloSeleccionado);
				}
				catch(err) {
					alert("Cargo estilo: " + estiloSeleccionado + ":" + numEstiloSeleccionado + ":" + element);
					return;
				}
				//alert("Cargo estilo: " + estiloSeleccionado + ":" + numEstiloSeleccionado + ":" + element);
				
				//alert("Cargo estilo: " + estiloSeleccionado + ":" + numEstiloSeleccionado + ":" + element);		
				if(idEstilos.direction[numEstiloSeleccionado]!=undefined){
					//alert("Cambia Direction: " + idEstilos.direction[numEstiloSeleccionado]);
				}
				if(idEstilos.fontFamily[numEstiloSeleccionado]!=undefined){
					//alert("Cambia fontFamily: " + idEstilos.fontFamily[numEstiloSeleccionado]);
					fontFamilySet = idEstilos.fontFamily[numEstiloSeleccionado];
					setFontFamily(element, fontFamilySet);
				}
				if(idEstilos.fontSize[numEstiloSeleccionado]!=undefined){
					//alert("Cambia fontSize: " + idEstilos.fontSize[numEstiloSeleccionado]);
					fontSizeSet = idEstilos.fontSize[numEstiloSeleccionado];
					setFontSize(element, fontSizeSet);
				}
				if(idEstilos.lineHeight[numEstiloSeleccionado]!=undefined){
					//alert("Cambia lineHeight: " + idEstilos.lineHeight[numEstiloSeleccionado]);
					lineHeightSet = idEstilos.lineHeight[numEstiloSeleccionado];
					setLineHeight(element, lineHeightSet);
				}
				if(idEstilos.textAlign[numEstiloSeleccionado]!=undefined){
					//alert("Cambia textAlign: " + idEstilos.textAlign[numEstiloSeleccionado]);
					textAlignSet = idEstilos.textAlign[numEstiloSeleccionado]; // Esta propiedad difiere en "style", hay que mirarlo bien
					setTextAlign(element, textAlignSet);
				}
				if(idEstilos.color[numEstiloSeleccionado]!=undefined){ 
					//alert("Cambia color: " + idEstilos.color[numEstiloSeleccionado]);
					colorFontSet=idEstilos.color[numEstiloSeleccionado];
					setColorFont(element, colorFontSet);
				}
				if(idEstilos.backgroundColor[numEstiloSeleccionado]!=undefined){
					//alert("Cambia backgroundColor: " + idEstilos.backgroundColor[numEstiloSeleccionado]);
					backgroundColorSet = idEstilos.backgroundColor[numEstiloSeleccionado];
					setBackgroundColor(element, backgroundColorSet);
				}
				if(idEstilos.fontStyle[numEstiloSeleccionado]!=undefined){
					//alert("Cambia fontStyle: " + idEstilos.fontStyle[numEstiloSeleccionado]);
					fontStyleSet = idEstilos.fontStyle[numEstiloSeleccionado];
					setFontStyle(element, fontStyleSet);
				}
				//alert("Cargo fontWeight:" + idEstilos.fontWeight[numEstiloSeleccionado] + ":" + numEstiloSeleccionado);
				if(idEstilos.fontWeight[numEstiloSeleccionado]!=undefined){
					//alert("Cambia fontWeight: " + idEstilos.fontWeight[numEstiloSeleccionado]);
					fontWeightSet = idEstilos.fontWeight[numEstiloSeleccionado];
					setFontWeight(element, fontWeightSet);
				}
				if(idEstilos.textDecoration[numEstiloSeleccionado]!=undefined){
					//alert("Cambia textDecoration: " + idEstilos.textDecoration[numEstiloSeleccionado]);
					textDecorationSet = idEstilos.textDecoration[numEstiloSeleccionado];
					setTextDecoration(element, textDecorationSet);
				}
				if(idEstilos.unicodeBidi[numEstiloSeleccionado]!=undefined){
					//alert("Cambia unicodeBidi");
				}
				if(idEstilos.wrapOption[numEstiloSeleccionado]!=undefined){
					//alert("Cambia wrapOption");
				}
				if(idEstilos.multiRowAlign[numEstiloSeleccionado]!=undefined){
					//alert("Cambia multiRowAlign");
				}
				if(idEstilos.linePadding[numEstiloSeleccionado]!=undefined){
					//alert("Cambia linePadding");
				}
			}
			
			function cambiaEstilosPorSuId(estiloSeleccionado) {
				
				var numEstiloSeleccionado = -1;
				try {
					numEstiloSeleccionado = idEstilos.id.indexOf(estiloSeleccionado); 
				}
				catch(err) {
					return;
				}
				
				//alert("Cargo estilo: " + estiloSeleccionado + ":" + numEstiloSeleccionado);
				if(idEstilos.direction[numEstiloSeleccionado]!=undefined){
					//alert("Cambia Direction: " + idEstilos.direction[numEstiloSeleccionado]);
				}
				if(idEstilos.fontFamily[numEstiloSeleccionado]!=undefined){
					//alert("Cambia fontFamily: " + idEstilos.fontFamily[numEstiloSeleccionado]);
					fontFamilySet = idEstilos.fontFamily[numEstiloSeleccionado];
					setFontFamily();
				}
				if(idEstilos.fontSize[numEstiloSeleccionado]!=undefined){
					//alert("Cambia fontSize: " + idEstilos.fontSize[numEstiloSeleccionado]);
					fontSizeSet = idEstilos.fontSize[numEstiloSeleccionado];
					setFontSize();
				}
				if(idEstilos.lineHeight[numEstiloSeleccionado]!=undefined){
					//alert("Cambia lineHeight: " + idEstilos.lineHeight[numEstiloSeleccionado]);
					lineHeightSet = idEstilos.lineHeight[numEstiloSeleccionado];
					setLineHeight();
				}
				if(idEstilos.textAlign[numEstiloSeleccionado]!=undefined){
					//alert("Cambia textAlign: " + idEstilos.textAlign[numEstiloSeleccionado]);
					textAlignSet = idEstilos.textAlign[numEstiloSeleccionado]; // Esta propiedad difiere en "style", hay que mirarlo bien
					setTextAlign();
				}
				if(idEstilos.color[numEstiloSeleccionado]!=undefined){ 
					//alert("Cambia color: " + idEstilos.color[numEstiloSeleccionado]);
					colorFontSet=idEstilos.color[numEstiloSeleccionado];
					setColorFont();
				}
				if(idEstilos.backgroundColor[numEstiloSeleccionado]!=undefined){
					//alert("Cambia backgroundColor: " + idEstilos.backgroundColor[numEstiloSeleccionado]);
					backgroundColorSet = idEstilos.backgroundColor[numEstiloSeleccionado];
					setBackgroundColor();
				}
				if(idEstilos.fontStyle[numEstiloSeleccionado]!=undefined){
					//alert("Cambia fontStyle: " + idEstilos.fontStyle[numEstiloSeleccionado]);
					fontStyleSet = idEstilos.fontStyle[numEstiloSeleccionado];
					setFontStyle();
				}
				if(idEstilos.fontWeight[numEstiloSeleccionado]!=undefined){
					//alert("Cambia fontWeight: " + idEstilos.fontWeight[numEstiloSeleccionado]);
					fontWeightSet = idEstilos.fontWeight[numEstiloSeleccionado];
					setFontWeight();
				}
				if(idEstilos.textDecoration[numEstiloSeleccionado]!=undefined){
					//alert("Cambia textDecoration: " + idEstilos.textDecoration[numEstiloSeleccionado]);
					textDecorationSet = idEstilos.textDecoration[numEstiloSeleccionado];
					setTextDecoration();
				}
				if(idEstilos.unicodeBidi[numEstiloSeleccionado]!=undefined){
					//alert("Cambia unicodeBidi");
				}
				if(idEstilos.wrapOption[numEstiloSeleccionado]!=undefined){
					//alert("Cambia wrapOption");
				}
				if(idEstilos.multiRowAlign[numEstiloSeleccionado]!=undefined){
					//alert("Cambia multiRowAlign");
				}
				if(idEstilos.linePadding[numEstiloSeleccionado]!=undefined){
					//alert("Cambia linePadding");
				}
			}
			
			player.onTime(
				function(event) {
				   	//timeStartArray = [1, 10, 20, 28];
				   	//timeEndArray = [5, 17, 25, 32];
					//commentArray = ["Este es un texto para hacer pruebas", "Big Bunny quiere que seas su amigo", "La ardillita va saltando por el campo, es todo una maravilla", "Voy a poner un texto muy largo a ver c�mo reacciona en la pantalla y si se llega a cortar en dos l�neas en alg�n punto"];
				   	var timeStart = 0;
				    var timeEnd = 0;
				    var comment = "";
				    
				    //if( subtituloSeleccionado==(-1) ){
				    	//for (var i = 0; i < timeInSubtArray.length; i++) {
					    for (var i = 0; i < timeInSubtArray.length; i++) {
					    	timeStart = timeInSubtArray[i];
					    	timeEnd = timeOutSubtArray[i];
					    	comment = idSubtitulosP.id[i]; // En comment pongo la id del subtitulo "P" a reproducir
					    	//alert("Subtitulooooo!!");
					    	// Comprueba si el subtítulo ya está seleccionado
					    	var subtituloYaSeleccionado = false;
					    	if(subtitulosSeleccionados.indexOf(comment)!=(-1)){
					    		subtituloYaSeleccionado = true;
					    		//alert("Subtitulooooo!!");
					    	}	
					    	
					    	if ( (event.position >= timeStart) && (event.position <= timeEnd) && (!subtituloYaSeleccionado) ){ 
					        	//alert("Juanpe, subtitulo!");	
					        	subtitulosSeleccionados.push(comment); // Introduce en la matriz la id del <p> seleccionado
					        	//subtitulado.innerHTML = comment;
					        	setText(comment);
					        }
					    	
					    	if(subtituloYaSeleccionado && ( (event.position < timeStart) || (event.position > timeEnd) ) ){
					        	//Desseleccionamos el subtítulo y lo quitamos de la matriz de subtítulos seleccionados
					        	subtitulosSeleccionados = removeElementFromArray(subtitulosSeleccionados, comment); // Quita la matriz la id del <p> ya innecesario
					        	desSetTextNow(comment);
					    	}
					    	
					 }
				    //}
				    
				    
				    // Desselecciona el subt�tulo cuando se ha terminado su tiempo
				    
				    // Si despu�s de mirar todos los subt�tulos, ninguno se ajusta a las condiciones, pone invisible las l�neas de subtitulado.
				    /*if(subtituloSeleccionado<0){
				    	   desSetText();
				    }
				    else{
				    	if( event.position > timeOutSubtArray[subtituloSeleccionado] ){
					    	desSetText();
					    }
				    }*/
				}
			); 
			
			verSubtitulosSeleccionados = function(){
				var text = "";
		    	for(var k=0; k<subtitulosSeleccionados.length; k++){
		    		text += ": " + subtitulosSeleccionados[k];
		    	}
		    	alert("Subtitulos" + text);
			}
			
			borraMyElementCaption = function(){
				var myElement_caption1 = document.getElementById("myElement_caption");
				while (myElement_caption1.firstChild) {
					myElement_caption1.removeChild(myElement_caption1.firstChild);
				}
			}
			
			
			removeElementFromArray = function(array, element) {
			    //array = ["Banana", "Orange", "Mango"];
			    var a = array.indexOf(element);
			    array.splice(a, 1);
			    return array;
			}
			
			desSetText = function(){
				//var subtitulado = document.getElementById("subtitulo"); 
				var subtitulado = document.getElementById("myElement_caption");
				subtitulado.style.visibility = "hidden";
				subtituloSeleccionado = -1;
			}
			
			desSetTextNow = function(text){
				var subtituloDesSelectedNow = idSubtitulosP.id.indexOf(text);
				//var subtitulado = document.getElementById(text);
				
				var elemento = document.getElementById(text);
				elemento.parentNode.removeChild(elemento);
				
				var idPDivAuxUsed = "aux" + text;
				//alert("Des Now: " + subtituloDesSelectedNow + ":" + idPDivAuxUsed);
				var elemento2 = document.getElementById(idPDivAuxUsed);
				elemento2.parentNode.removeChild(elemento2);
			}
			
			setText = function(text) {
				var subtituloSelectedNow = idSubtitulosP.id.indexOf(text);
				//alert("Now: " + subtituloSelectedNow);
				//var myElementPUsed = document.createElement('p');
				var myElementPAux = document.createElement('div');
				
				var divPparent = idSubtitulosP.id_Div_Parent[subtituloSelectedNow];
				if(document.getElementById(divPparent)==null) {
					//alert("DivParent=null: " + divPparent);
					var myElement_caption1 = document.getElementById("myElement_caption");	
					//myElement_caption.removeAttribute('style');
					while (myElement_caption1.firstChild) {
						myElement_caption1.removeChild(myElement_caption1.firstChild);
					}
					
					myElement_caption1.style.visibility = "visible";
					// Creo el div
					var myElementDiv = document.createElement('div');
					myElementDiv.id = divPparent;
					myElement_caption1.appendChild(myElementDiv);
					myElement_caption1.className = "myClass";
					setLineHeight(myElementDiv, usedLineHeightDiv); // Si el parámetro lineHeight va dirigido a Div no funciona correctamente
					//alert("Crea div");
				}
				/*else{
					//alert("El div: " + divPparent + " ya est� creado y borro su contenido.");
					var myElementDivAux = document.getElementById(divPparent);
					while (myElementDivAux.firstChild) {
						myElementDivAux.removeChild(myElementDivAux.firstChild);
					}
					var myElement_caption2 = document.getElementById("myElement_caption");	
					myElement_caption2.style.visibility = "visible";
					myElement_caption2.className = "myClass";
				}*/
				
				
				//var myElementDivAux3 = document.getElementById(divPparent);
				//myElementDivAux3.appendChild(myElementPUsed);
				//myElementPUsed.id = text;
				//myElementPUsed.visibilitty = "visible";
				
				
				//alert("Now: " + divPparent);
				setEstilosPSubt(subtituloSelectedNow, divPparent);
		    }
	    	
			timedCount = function(){
				document.getElementById(player.id).value=c;
				c=c+1;
				if (config.delay == null){
					if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
						t=setTimeout("timedCount()",125);
					} 
					else { t=setTimeout("timedCount()",275); }
				} 
				else { t=setTimeout("timedCount()",config.delay); }
				player.play();
				
			}
			
			// Esta era la que usaba antes
			/*cambiaAFormatoTemporal2 = function(){
				var texto = "";
				var i=0;
				for(i=0; i<idSubtSpan.timeInSubt.length; i++){
					timeInSubtArray[i] = timeToSeconds(idSubtSpan.timeInSubt[i]);
					timeOutSubtArray[i] = timeToSeconds(idSubtSpan.timeOutSubt[i]);
					//alert("El cambio es: de "+ idSubt.timeOutSubt[i].toString() + " a " + timeOutSubtArray[i].toString());
					texto += "TimeIn: " + idSubtSpan.timeInSubt[i].toString() + "; TimeStartInSeconds: " + timeInSubtArray[i].toString() + ";" + " TimeOut: " + idSubtSpan.timeOutSubt[i].toString() + "; TimeEndInSeconds: " + timeOutSubtArray[i].toString() + ";\n";
				}
				alert("Tiempos\n" + texto);
			}*/
			
			cambiaAFormatoTemporal = function(){
				var texto = "";
				var i=0;
				for(i=0; i<idSubtitulosP.timeBeginSubt.length; i++){
					timeInSubtArray[i] = timeToSeconds(idSubtitulosP.timeBeginSubt[i]);
					timeOutSubtArray[i] = timeToSeconds(idSubtitulosP.timeEndSubt[i]);
					//alert("El cambio es: de "+ idSubt.timeOutSubt[i].toString() + " a " + timeOutSubtArray[i].toString());
					texto += "TimeIn: " + idSubtitulosP.timeBeginSubt[i].toString() + "; TimeStartInSeconds: " + timeInSubtArray[i].toString() + ";" + " TimeOut: " + idSubtitulosP.timeBeginSubt[i].toString() + "; TimeEndInSeconds: " + timeOutSubtArray[i].toString() + ";\n";
				}
				//alert("Tiempos\n" + texto);
			}
			
			// Cuando la cuenta del temporizador, vuelve a empezar en plan loop
			stopCount = function(){
				clearTimeout(t);
				player.play();
			}
			
			doTimer = function(){
				if (!timer_is_on){
					timer_is_on=1;
					timedCount();
				} 
				else {
					stopCount();
					timer_is_on=0;
					//player.setMute(false);
				}
			}
			
			cambiaStyle = function(){
				//cambiaFontFamily();
				//cambiaColorFont();
				//cambiaFontSize();
				//cambiaLineHeight();
				//cambiaTextAlign();
				//cambiaBackgroundColor();
				//cambiaFontStyle();
				//cambiaFontWeight();
				//cambiaTextDecoration();
				//cambiaUnicodeBidi();
				//cambiaWrapOption();
				//cambiaDirection();
				//cambiaMultiRowAlign();
				//cambiaLinePadding();
				//cambiaOrigin();
				//cambiaExtent();
				//cambiaDisplayAlign();
				//cambiaOverflow();
				//cambiaPadding();
				// custom OK and Cancel label
				// default: OK, Cancel
				// button labels will be "Accept" and "Deny"
			}
			
			setDefaultStyles = function(Width, Height){
				actualWidthSet = Width;
				actualHeightSet = Height;
				
				fontFamilySet = "monoSpaceSansSerif";
				setFontFamily();
				
				fontSizeSet = "100%";
				setFontSize();
				
				colorFontSet="yellow";
				setColorFont();
				
				textAlignSet = "start"; // Esta propiedad difiere en "style", hay que mirarlo bien
				setTextAlign();
				
				backgroundColorSet = "transparent";
				setBackgroundColor();
				
		    	positionSet = "relative";
		    	//topSet = "-200px";
		    	//leftSet = "10px";
				//maxWidthSet = "0px";
				//maxHeightSet = "0px";
				
				tipoPositionSet = "bottom";
				setTipoPosition();
				
				fontSizeSet = "100%"; // Hay que calcular el tama�o de fuente con este par�metro y la resoluci�n de celda.
				setFontSize();
				
				lineHeightSet = "normal";
				setLineHeight();
				
				fontStyleSet = "normal";
				setFontStyle();
				
				fontWeightSet = "normal";
				setFontWeight();
				
				textDecorationSet = "none";
				setTextDecoration();
				
				unicodeBidiSet = "normal";
				setUnicodeBidi();
				
				originSet = "10% 80%";
				setOrigin();
				
				extentSet = "80% 10%";
				setExtent();
				
				wrapOption = "wrap";
				setWrapOption();
			}
			
			cambiaOverflow = function(){
				// No s� lo que hace exactamente... en la norma de EBU-TT-D pone bidiOverride y aqu� bidi-override (comprobar).
				if(overflowSet=="visible")
				{overflowSet="hidden";}
				else if(overflowSet=="hidden")
				{overflowSet="visible";}
				else
				{overflowSet="visible";}
					
				alert(overflowSet);
				setOverflow();
			}
			
			cambiaDisplayAlign = function(){
				// No s� lo que hace exactamente... en la norma de EBU-TT-D pone bidiOverride y aqu� bidi-override (comprobar).
				if(displayAlignSet=="before")
				{displayAlignSet="center";}
				else if(displayAlignSet=="center")
				{displayAlignSet="after";}
				else if(displayAlignSet=="after")
				{displayAlignSet="before";}
				else
				{displayAlignSet="before";}
					
				alert(displayAlignSet);
				setDisplayAlign();
			}
			
			cambiaLinePadding = function(){
				// No s� lo que hace exactamente... en la norma de EBU-TT-D pone bidiOverride y aqu� bidi-override (comprobar).
				if(linePaddingSet=="0c")
				{linePaddingSet="0.5c";}
				else if(linePaddingSet=="0.5c")
				{linePaddingSet="1.0c";}
				else if(linePaddingSet=="1.0c")
				{linePaddingSet="0c";}
				else
				{linePaddingSet="0c";}
					
				alert(linePaddingSet);
				setLinePadding();
			}
			
			cambiaMultiRowAlign = function(){
				// No s� lo que hace exactamente... en la norma de EBU-TT-D pone bidiOverride y aqu� bidi-override (comprobar).
				if(multiRowAlignSet=="start")
				{multiRowAlignSet="center";}
				else if(multiRowAlignSet=="center")
				{multiRowAlignSet="end";}
				else if(multiRowAlignSet=="end")
				{multiRowAlignSet="auto";}
				else if(multiRowAlignSet=="auto")
				{multiRowAlignSet="start";}
				else
				{multiRowAlignSet="start";}
					
				alert(multiRowAlignSet);
				//setMultiRowAlign();
			}
			
			cambiaDirection = function(){
				// No s� lo que hace exactamente... en la norma de EBU-TT-D pone bidiOverride y aqu� bidi-override (comprobar).
				if(directionSet=="ltr")
				{directionSet="rtl";}
				else if(directionSet=="rtl")
				{directionSet="ltr";}
				else
				{directionSet="ltr";}
					
				alert(directionSet);
				setDirection();
			}
			
			cambiaWrapOption = function(){
				// No s� lo que hace exactamente... en la norma de EBU-TT-D pone bidiOverride y aqu� bidi-override (comprobar).
				if(wrapOptionSet=="wrap")
				{wrapOptionSet="noWrap";}
				else if(wrapOptionSet=="noWrap")
				{wrapOptionSet="wrap";}
				else
				{wrapOptionSet="wrap";}
					
				alert(wrapOptionSet);
				setWrapOption();
			}
			
			cambiaUnicodeBidi = function(){
				// No s� lo que hace exactamente... en la norma de EBU-TT-D pone bidiOverride y aqu� bidi-override (comprobar).
				if(unicodeBidiSet=="normal")
				{unicodeBidiSet="embed";}
				else if(unicodeBidiSet=="embed")
				{unicodeBidiSet="bidiOverride";}
				else if(unicodeBidiSet=="bidiOverride")
				{unicodeBidiSet="normal";}
				else
				{unicodeBidiSet="normal";}
					
				alert(unicodeBidiSet);
				setUnicodeBidi();
				
				// Pruebas
				//document.getElementById("subtitulo").style.unicodeBidi = "bidi-override";
			}
			
			cambiaTextDecoration = function(){
				// Underline no funciona.
				if(textDecorationSet=="none")
				{textDecorationSet="underline";}
				else if(textDecorationSet=="underline")
				{textDecorationSet="none";}
				else
				{textDecorationSet="None";}
					
				alert(textDecorationSet);
				setTextDecorationSet();
				
				// Pruebas
				//document.getElementById("subtitulo").style.textDecoration = "underline";
				//document.getElementById("subtitulo").style.textDecorationLine = "underline";
				//document.getElementById("subtitulo").style.textDecorationColor = colorFontSet;
				//document.getElementById("subtitulo").style.textDecorationStyle = "solid";
			}
			
			cambiaFontStyle = function(){
				// Pruebas de las posibles alineaciones de texto. En la norma pon�a que style no admit�a "start" y "end".
				if(fontStyleSet=="normal")
				{fontStyleSet="italic";}
				else if(fontStyleSet=="italic")
				{fontStyleSet="normal";}
				else
				{fontStyleSet="normal";}
					
				alert(fontStyleSet);
				setFontStyle();
			}
			
			cambiaFontWeight = function(){
				// Pruebas de las posibles alineaciones de texto. En la norma pon�a que style no admit�a "start" y "end".
				if(fontWeightSet=="normal")
				{fontWeightSet="bold";}
				else if(fontWeightSet=="bold")
				{fontWeightSet="normal";}
				else
				{fontWeightSet="normal";}
					
				alert(fontWeightSet);
				setFontWeight();
			}
			
			setDisplayAlign = function(){
				var verticalAlignSet = "top";
				if(displayAlignSet == "before")
				{verticalAlignSet = "top"; }
				else if(displayAlignSet == "center")
				{verticalAlignSet = "middle"; }
				else if(displayAlignSet == "after")
				{verticalAlignSet = "bottom"; }
				else
				{verticalAlignSet = "top"; }
				//alert(verticalAlignSet);
				document.getElementById("subtitulo").style.verticalAlign = verticalAlignSet; 
			}
			
			setDisplayAlign = function(element, displayAlignSet){
				var verticalAlignSet = "bottom";
				if(displayAlignSet == "before")
				{verticalAlignSet = "top"; }
				else if(displayAlignSet == "center")
				{verticalAlignSet = "middle"; }
				else if(displayAlignSet == "after")
				{verticalAlignSet = "bottom"; }
				else
				{verticalAlignSet = "bottom"; }
				//alert(verticalAlignSet);
				var displaySet = "table-cell";
				element.style.display = displaySet;
				element.style.verticalAlign = verticalAlignSet;
			}
			
			setOverflow = function(){ document.getElementById("subtitulo").style.overflow = overflowSet; }
			setLinePadding = function(){ document.getElementById("subtitulo").style.linePadding = linePaddingSet; }
			// Analizar cu�l hace lo mismo
			//setMultiRowAlign = function(){ document.getElementById("subtitulo").style.multiR = directionSet; }
			setDirection = function(){ document.getElementById("subtitulo").style.direction = directionSet; }
			
			setWrapOption = function(){ 
				// Comprobar esta variable
				var wrapOptionHere = wrapOptionSet;
				if(wrapOptionSet=="wrap"){ wrapOptionHere = "normal"; }
				else if(wrapOptionSet=="noWrap"){ wrapOptionHere = "break-word"; }
				document.getElementById("subtitulo").style.wordWrap = wrapOptionHere;
				//document.getElementById("subtitulo").style.flexWrap = wrapOptionSet;
			}
			
			cambiaExtent = function(){
				// Pruebas de las posibles alineaciones de texto. En la norma pon�a que style no admit�a "start" y "end".
				if(extentSet=="10% 10%")
				{extentSet="10% 30%";}
				else if(extentSet=="10% 30%")
				{extentSet="20% 80%";}
				else if(extentSet=="20% 80%")
				{extentSet="0% 0%";}
				else if(extentSet=="0% 0%")
				{extentSet="80% 80%";}
				else if(extentSet=="80% 80%")
				{extentSet="10% 10%";}
				else
				{extentSet="0% 0%";}
					
				alert(extentSet);
				setExtent();
			}
			
			setExtent = function(){
				// originSet es un string con el siguiente formato: "0% 0%" (left% top%), tomando el punto (0,0) como la esquina superior izquierda.
				var Width1 = actualWidthSet;
				var Height1 = actualHeightSet;
				
				var inicioPorcentajeMaxWidth = 0;
				var inicioPorcentajeMaxHeight = 0;
				inicioPorcentajeMaxWidth = extentSet.toString().indexOf("%");
				inicioPorcentajeMaxHeight = extentSet.toString().indexOf("%", inicioPorcentajeMaxWidth+1);
				//alert(inicioPorcentajeMaxWidth + ":" + inicioPorcentajeMaxHeight);
				
				var calculaMaxWidth = "";
				var calculaMaxHeight = "";
				calculaMaxWidth = extentSet.toString().substring(0, inicioPorcentajeMaxWidth);
				calculaMaxHeight = extentSet.toString().substring(inicioPorcentajeMaxWidth+2, inicioPorcentajeMaxHeight);
				//alert(calculaMaxWidth + ":" + calculaMaxHeight);
				
				var calculaMaxWidthInt = 0;
				var calculaMaxHeightInt = 0;
				calculaMaxWidthInt = ( parseInt(calculaMaxWidth)*Width1 )/100;
				calculaMaxHeightInt = ( parseInt(calculaMaxHeight)*Height1 )/100;
				//alert(calculaMaxWidthInt.toString() + ":" + calculaMaxHeightInt.toString());
				
				var calculaMaxWidthStr = "";
				var calculaMaxHeightStr = "";
				calculaMaxWidthStr = calculaMaxWidthInt.toString() + "px";
				calculaMaxHeightStr = calculaMaxHeightInt.toString() + "px";
				//alert(calculaMaxWidthStr.toString() + ":" + calculaMaxHeightStr.toString());
				document.getElementById("subtitulo").style.maxWidth = calculaMaxWidthStr;
				document.getElementById("subtitulo").style.maxHeight = calculaMaxHeightStr;
			}
			
			setGeneralSizes = function(width, height){
				//alert(usedWidth + ":" + usedHeight);
				usedWidth = width;
				usedHeight = height;
				//alert(usedWidth + ":" + usedHeight);
			}
			
			setExtent = function(element, value){
				// originSet es un string con el siguiente formato: "0% 0%" (left% top%), tomando el punto (0,0) como la esquina superior izquierda.
				//var Width1 = player.getWidth();
				//var Height1 = player.getHeight();
				var Width1 = usedWidth;
				var Height1 = usedHeight;
				
				extentSet = value;
				
				var inicioPorcentajeMaxWidth = 0;
				var inicioPorcentajeMaxHeight = 0;
				inicioPorcentajeMaxWidth = extentSet.toString().indexOf("%");
				inicioPorcentajeMaxHeight = extentSet.toString().indexOf("%", inicioPorcentajeMaxWidth+1);
				//alert(inicioPorcentajeMaxWidth + ":" + inicioPorcentajeMaxHeight);
				
				var calculaMaxWidth = "";
				var calculaMaxHeight = "";
				calculaMaxWidth = extentSet.toString().substring(0, inicioPorcentajeMaxWidth);
				calculaMaxHeight = extentSet.toString().substring(inicioPorcentajeMaxWidth+2, inicioPorcentajeMaxHeight);
				//alert(calculaMaxWidth + ":" + calculaMaxHeight);
				
				var calculaMaxWidthInt = 0;
				var calculaMaxHeightInt = 0;
				calculaMaxWidthInt = ( parseInt(calculaMaxWidth)*Width1 )/100;
				calculaMaxHeightInt = ( parseInt(calculaMaxHeight)*Height1 )/100;
				//alert(calculaMaxWidthInt.toString() + ":" + calculaMaxHeightInt.toString());
				
				var calculaMaxWidthStr = "";
				var calculaMaxHeightStr = "";
				calculaMaxWidthStr = calculaMaxWidthInt.toString() + "px";
				calculaMaxHeightStr = calculaMaxHeightInt.toString() + "px";
				//alert(calculaMaxWidthStr.toString() + ":" + calculaMaxHeightStr.toString());
				element.style.width = calculaMaxWidthStr;
				element.style.height = calculaMaxHeightStr;
			}
			
			cambiaPadding = function(){
				// Pruebas de las posibles alineaciones de texto. En la norma pon�a que style no admit�a "start" y "end".
				if(paddingSet=="10%")
				{paddingSet="10% 15%";}
				else if(paddingSet=="10% 15%")
				{paddingSet="10% 15% 20%";}
				else if(paddingSet=="10% 15% 20%")
				{paddingSet="10% 15% 20% 25%";}
				else if(paddingSet=="10% 15% 20% 25%")
				{paddingSet="10%";}
				else
				{paddingSet="10%";}
					
				alert(paddingSet);
				setPadding();
			}
			
			
			cambiaOrigin = function(){
				// Pruebas de las posibles alineaciones de texto. En la norma pon�a que style no admit�a "start" y "end".
				if(originSet=="10% 10%")
				{originSet="10% 30%";}
				else if(originSet=="10% 30%")
				{originSet="20% 80%";}
				else if(originSet=="20% 80%")
				{originSet="0% 0%";}
				else if(originSet=="0% 0%")
				{originSet="10% 10%";}
				else
				{originSet="0% 0%";}
					
				alert(originSet);
				setOrigin();
			}
			
			setOrigin = function(){
				// originSet es un string con el siguiente formato: "0% 0%" (left% top%), tomando el punto (0,0) como la esquina superior izquierda.
				var Width1 = actualWidthSet;
				var Height1 = actualHeightSet;
				
				var inicioPorcentajeLeft = 0;
				var inicioPorcentajeTop = 0;
				inicioPorcentajeLeft = originSet.toString().indexOf("%");
				inicioPorcentajeTop = originSet.toString().indexOf("%", inicioPorcentajeLeft+1);
				//alert(inicioPorcentajeLeft + ":" + inicioPorcentajeTop);
				
				var calculaLeft = "";
				var calculaTop = "";
				calculaLeft = originSet.toString().substring(0, inicioPorcentajeLeft);
				calculaTop = originSet.toString().substring(inicioPorcentajeLeft+2, inicioPorcentajeTop);
				//alert(calculaLeft.toString() + ":" + calculaTop.toString());
				
				var calculaLeftInt = 0;
				var calculaTopInt = 0;
				calculaLeftInt = (parseInt(calculaLeft)*actualWidthSet)/100;
				calculaTopInt = Height1 - ((parseInt(calculaTop)*actualHeightSet)/100);
				//alert(calculaLeftInt.toString() + ":" + calculaTopInt.toString());
				
				var calculaLeftStr = "";
				var calculaTopStr = "";
				calculaLeftStr = calculaLeftInt.toString() + "px";
				calculaTopStr = "-" + calculaTopInt.toString() + "px";
				//alert(calculaLeftStr + ":" + calculaTopStr);
				
				document.getElementById("subtitulo").style.left = calculaLeftStr;
				document.getElementById("subtitulo").style.top = calculaTopStr;
			}
			
			setOrigin = function(element, value){
				// originSet es un string con el siguiente formato: "0% 0%" (left% top%), tomando el punto (0,0) como la esquina superior izquierda.
				//var Width1 = player.getWidth();
				//var Height1 = player.getHeight();
				var Width1 = usedWidth;
				var Height1 = usedHeight;
				//alert("Ancho: " + Width1 + ". Alto: " + Height1);
				
				originSet = value;
				
				var inicioPorcentajeLeft = 0;
				var inicioPorcentajeTop = 0;
				inicioPorcentajeLeft = originSet.toString().indexOf("%");
				inicioPorcentajeTop = originSet.toString().indexOf("%", inicioPorcentajeLeft+1);
				//alert(inicioPorcentajeLeft + ":" + inicioPorcentajeTop);
				
				var calculaLeft = "";
				var calculaTop = "";
				calculaLeft = originSet.toString().substring(0, inicioPorcentajeLeft);
				calculaTop = originSet.toString().substring(inicioPorcentajeLeft+2, inicioPorcentajeTop);
				//alert(calculaLeft.toString() + ":" + calculaTop.toString());
				
				var calculaLeftInt = 0;
				var calculaTopInt = 0;
				var calculaBottomInt = 0;
				calculaLeftInt = (parseInt(calculaLeft)*Width1)/100;
				//calculaTopInt = Height1 - ((parseInt(calculaTop)*Height1)/100);
				calculaTopInt = ((parseInt(calculaTop)*Height1)/100);
				calculaBottomInt = ((parseInt(calculaTop)*Height1)/100);
				//alert(calculaLeftInt.toString() + ":" + calculaTopInt.toString() + ":" + calculaBottomInt.toString());
				
				var calculaLeftStr = "";
				var calculaTopStr = "";
				var calculaBottomStr = "";
				calculaLeftStr = calculaLeftInt.toString() + "px";
				calculaTopStr = "-" + calculaTopInt.toString() + "px";
				calculaTopStr = calculaTopInt.toString() + "px"; // Valor positivo (no negativo)
				calculaBottomStr = calculaBottomInt.toString() + "px"; // Valor de la distancia a abajo (bottom)
				//alert(calculaLeftStr + ":" + calculaTopStr);
				
				//alert("Origin: " + calculaLeftStr.toString() + ":" + calculaBottomStr.toString());
				
				element.style.position = "relative";
				//element.style.position = "fixed";
				element.style.left = calculaLeftStr;
				//element.style.bottom = calculaBottomStr;
				element.style.top = calculaTopStr;
				//element.style.bottom = calculaTopStr;
			}
			
			setOriginDiv = function(element, value){
				// originSet es un string con el siguiente formato: "0% 0%" (left% top%), tomando el punto (0,0) como la esquina superior izquierda.
				//var Width1 = player.getWidth();
				//var Height1 = player.getHeight();
				var Width1 = usedWidth;
				var Height1 = usedHeight;
				//alert("Ancho: " + Width1 + ". Alto: " + Height1);
				
				originSet = value;
				
				var inicioPorcentajeLeft = 0;
				var inicioPorcentajeTop = 0;
				inicioPorcentajeLeft = originSet.toString().indexOf("%");
				inicioPorcentajeTop = originSet.toString().indexOf("%", inicioPorcentajeLeft+1);
				//alert(inicioPorcentajeLeft + ":" + inicioPorcentajeTop);
				
				var calculaLeft = "";
				var calculaTop = "";
				calculaLeft = originSet.toString().substring(0, inicioPorcentajeLeft);
				calculaTop = originSet.toString().substring(inicioPorcentajeLeft+2, inicioPorcentajeTop);
				//alert(calculaLeft.toString() + ":" + calculaTop.toString());
				
				var calculaLeftInt = 0;
				var calculaTopInt = 0;
				var calculaBottomInt = 0;
				calculaLeftInt = (parseInt(calculaLeft)*Width1)/100;
				//calculaTopInt = Height1 - ((parseInt(calculaTop)*Height1)/100);
				calculaTopInt = ((parseInt(calculaTop)*Height1)/100);
				calculaBottomInt = ((parseInt(calculaTop)*Height1)/100);
				//alert(calculaLeftInt.toString() + ":" + calculaTopInt.toString() + ":" + calculaBottomInt.toString());
				
				var calculaLeftStr = "";
				var calculaTopStr = "";
				var calculaBottomStr = "";
				calculaLeftStr = calculaLeftInt.toString() + "px";
				calculaTopStr = "-" + calculaTopInt.toString() + "px";
				calculaTopStr = calculaTopInt.toString() + "px"; // Valor positivo (no negativo)
				calculaBottomStr = calculaBottomInt.toString() + "px"; // Valor de la distancia a abajo (bottom)
				//alert(calculaLeftStr + ":" + calculaTopStr);
				
				//alert("Origin: " + calculaLeftStr.toString() + ":" + calculaBottomStr.toString());
				
				element.style.position = "absolute";
				//element.style.position = "fixed";
				element.style.left = calculaLeftStr;
				//element.style.bottom = calculaBottomStr;
				element.style.top = calculaTopStr;
				//element.style.bottom = calculaTopStr;
			}
			
			setPadding = function(){ document.getElementById("subtitulo").style.padding = paddingSet; }
			
			setPadding = function(element, value){
				paddingSet = value;
				element.style.padding = paddingSet; 
			}
			
			
			setUnicodeBidi = function(){ document.getElementById("subtitulo").style.unicodeBidi = unicodeBidiSet; }
			
			setUnicodeBidi = function(element, value){
				unicodeBidiSet = value;
				element.style.unicodeBidi = unicodeBidiSet; 
			}
			
			setFontStyle = function(){ document.getElementById("subtitulo").style.fontStyle = fontStyleSet; }
			
			setFontStyle = function(element, value){
				fontStyleSet = value;
				element.style.fontStyle = fontStyleSet; 
			}
			
			setFontWeight = function(){ document.getElementById("subtitulo").style.fontWeight = fontWeightSet; }
			
			setFontWeight = function(element, value){ 
				fontWeightSet = value;
				element.style.fontWeight = fontWeightSet; 
			}
			
			setTextDecoration = function(){ document.getElementById("subtitulo").style.textDecoration = textDecorationSet; }
			
			setTextDecoration = function(element, value){ 
				textDecorationSet = value;
				element.style.textDecoration = textDecorationSet; 
			}
			
			cambiaBackgroundColor = function(){
				// Pruebas de las posibles alineaciones de texto. En la norma pon�a que style no admit�a "start" y "end".
				if(backgroundColorSet=="transparent")
				{backgroundColorSet="#000000";}
				else if(backgroundColorSet=="#000000")
				{backgroundColorSet="#FFFFFF";}
				else if(backgroundColorSet=="#FFFFFF")
				{backgroundColorSet="transparent";}
				else
				{backgroundColorSet="transparent";}
					
				alert(backgroundColorSet);
				setBackgroundColor();
			}
			
			setBackgroundColor = function(){ 
				var backgroundColorUsed = backgroundColorSet;
				if(backgroundColorSet.charAt(0)=='#') {
					backgroundColorUsed = backgroundColorSet.substr(0,7);
				}
				//alert("BackgroundColor: " + backgroundColorUsed); 
				document.getElementById("subtitulo").style.backgroundColor = backgroundColorUsed; 
			}
			
			function hexToDec(hexStr) {
				  hexStr = hexStr.toLowerCase();
				  hexDec = parseInt(hexStr, 16).toString(10);
				  // hexadecimal to decimal
				  return hexDec; 
			}
			
			setBackgroundColor = function(element, value){
				if(cambioBackgroundColor!="default"){
					value = cambioBackgroundColor;
				}
				backgroundColorSet = value;
				
				var backgroundColorUsed = backgroundColorSet;
				//alert("Value: " + value.toString());
				if(backgroundColorSet.charAt(0)=='#') {
					if(backgroundColorSet.length == 9)
					{
						var r1 = backgroundColorSet.substr(1,2);
						var g1 = backgroundColorSet.substr(3,2);
						var b1 = backgroundColorSet.substr(5,2);
						var a1 = backgroundColorSet.substr(7,2);
						backgroundColorUsed = "rgba(" + hexToDec(r1) + ", "+ hexToDec(g1) + ", "+ hexToDec(b1) + ", "+ hexToDec(a1) +")";
					}
					else{
						backgroundColorUsed = backgroundColorSet.substr(0,7);
					}
				}
				//alert("BackgroundColor: " + backgroundColorUsed); 
				element.style.backgroundColor = backgroundColorUsed; 
			}
			
			cambiaTextAlign = function(){
				// Pruebas de las posibles alineaciones de texto. En la norma pon�a que style no admit�a "start" y "end".
				if(textAlignSet=="start")
				{textAlignSet="center";}
				else if(textAlignSet=="center")
				{textAlignSet="left";}
				else if(textAlignSet=="left")
				{textAlignSet="end";}
				else if(textAlignSet=="end")
				{textAlignSet="right";}
				else if(textAlignSet=="right")
				{textAlignSet="start";}
				else
				{textAlignSet="start";}
					
				alert(textAlignSet);
				setTextAlign();
			}
			
			setTextAlign = function(){ document.getElementById("subtitulo").style.textAlign = textAlignSet; }
			
			setTextAlign = function(element, value){ 
				textAlignSet = value;
				element.style.textAlign = textAlignSet; 
				//alert(element + ":" + value);
			}
			
			cambiaLineHeight = function(){
				// Pruebas de los posibles tama�os
				if(lineHeightSet=="100%")
				{lineHeightSet="75%";}
				else if(lineHeightSet=="75%")
				{lineHeightSet="125%";}
				else if(lineHeightSet=="125%")
				{lineHeightSet="200%";}
				else if(lineHeightSet=="200%")
				{lineHeightSet="normal";}
				else if(lineHeightSet=="normal")
				{lineHeightSet="100%";}
				else
				{lineHeightSet="normal";}
					
				alert(lineHeightSet);
				setLineHeight();
			}
			
			setLineHeight = function(){ document.getElementById("subtitulo").style.lineHeight = lineHeightSet; }
			
			setLineHeight = function(element, value){ 
				lineHeightSet = value;
				//var span = document.getElementById(element);
				//alert(element.tagName);
				if(element.tagName == "DIV" || element.tagName == "div" || element.tagName == "Div"){
					
				}
				else if(element.tagName == "P" || element.tagName == "p"){
					
				}
				else if(element.tagName == "SPAN" || element.tagName == "span" || element.tagName == "Span"){
					
				}
				//if(value=="normal"){ value="100%"; }
				//var proporc2 = proporcFromCRAndPercentage(value)
				//lineHeightSet = proporc2 + "px";
				
				element.style.lineHeight = lineHeightSet; 
			}
			
			/*cambiaFormatoDef = function(){
				alert("Abrete Sesamo!");
				var auxDiv = document.getElementById("auxdiv0");
				var auxP4 = document.getElementById("sub4");
				var auxSpan1 = document.getElementById("auxSpan0_4");
				var auxSpan2 = document.getElementById("auxSpan1_4");
				auxP4.style.vertical-align = "top";
			}*/
			
			cambiaFontSize = function(){
				// Pruebas de los posibles tama�os
				if(fontSizeSet=="100%")
				{fontSizeSet="75%";}
				else if(fontSizeSet=="75%")
				{fontSizeSet="125%";}
				else if(fontSizeSet=="125%")
				{fontSizeSet="200%";}
				else if(fontSizeSet=="200%")
				{fontSizeSet="100%";}
				else
				{fontSizeSet="100%";}
					
				alert(fontSizeSet);
				setFontSize();
			}
			
			setFontSize = function(){ 
				document.getElementById("subtitulo").style.fontSize = fontSizeSet;
			}
			
			setFontSize = function(element, value){
				if(cambioFontSize!="default"){
					value = cambioFontSize;
				}
				//alert("Font-size: " + value);
				var proporc = proporcFromCRAndPercentage(value);
				
				var altoImagen = verTamanoVideo();
				//alert(proporc + ":" + altoImagen);
				//alert("CRV: " + cellResolutionVert);
				var tamanoLineaPx = altoImagen/cellResolutionVert;
				fontSizeSet = proporc + "px";
				//alert("Alto: " + altoImagen + "\nCell ResolutionVert" +cellResolutionVert + "\nTamaño de línea" + tamanoLineaPx + "px" + "\nProporción:" + fontSizeSet + "\nValue:" + value);
				element.style.fontSize = fontSizeSet; 
			}
			
			proporcFromCRAndPercentage = function(percentage){
				var altoImagen = verTamanoVideo();
				var intPorCientoEnString = percentage.indexOf("%");
				var propValue = percentage.substring(0, intPorCientoEnString);
				var tamanoLineaPx = altoImagen/cellResolutionVert;
				var proporcionPx = (propValue/100) * tamanoLineaPx;
				//alert("Proporcion: " + proporcionPx);
				return proporcionPx;
			}
			
			inicio = function(){
				// Si el div de id:"subtitulo" no existe, lo crea
				if(document.getElementById("subtitulo")==null){
					addElement(); 
					//alert("Crea subtitulo"); 
				}
				else { alert("No crea subtitulo"); }
				
				// Definimos las variables de tama�o del player tal cual est� ahora (en caso de resize se actualizar�n tambi�n)
				actualWidthSet = player.getWidth();
				actualHeightSet = player.getHeight();
				//alert(actualWidthSet + ":" + actualHeightSet);
				setDefaultStyles(player.getWidth(), player.getHeight());
				tipoPositionSet = "bottom";
				setTipoPosition();
				
				// Ponemos el player en "Mute" para no molestar durante las pruebas.
				/*player.setMute(true);
				player.onComplete(function(evt) {
					clearTimeout(t);
					timer_is_on=0;
					//player.setMute(false);
					});*/
				};
			}
			
			cambiaColorFont = function(){
				//alert(colorFontSet);
				if(colorFontSet=="yellow")
				{colorFontSet="white";}
				else if(colorFontSet=="white")
				{colorFontSet="red";}
				else if(colorFontSet=="red")
				{colorFontSet="blue";}
				else if(colorFontSet=="blue")
				{colorFontSet="#ff0000";}
				else if(colorFontSet=="#ff0000")
				{colorFontSet="#FFFFFF";}
				else if(colorFontSet=="#FFFFFF")
				{colorFontSet="yellow";}
				else
				{colorFontSet="yellow";}
					
				setColorFont();
			}
			
			setColorFont = function(){ 
				var colorFontUsed = colorFontSet;
				if(colorFontSet.charAt(0)=='#') {
					colorFontUsed = colorFontSet.substr(0,7);
				}
				document.getElementById("subtitulo").style.color = colorFontUsed; 
			}
			
			setColorFont = function(element, value){
				if(cambioFontColor!="default"){
					value = cambioFontColor;
				}
				colorFontSet = value;
				var colorFontUsed = colorFontSet;
				if(colorFontSet.charAt(0)=='#') {
					if(colorFontSet.length == 9)
					{
						var r2 = colorFontSet.substr(1,2);
						var g2 = colorFontSet.substr(3,2);
						var b2 = colorFontSet.substr(5,2);
						var a2 = colorFontSet.substr(7,2);
						colorFontUsed = "rgba(" + hexToDec(r2) + ", "+ hexToDec(g2) + ", "+ hexToDec(b2) + ", "+ hexToDec(a2) +")";
					}
					else{
						colorFontUsed = colorFontSet.substr(0,7);
					}
				}
				
				element.style.color = colorFontUsed; 
			}
			
			customFontType = function(){
				borraMyElementCaption();
				var indexTipoLetraMatrix = fontTypesMatriz.indexOf(cambioTipoLetra);
				indexTipoLetraMatrix++;
				if(indexTipoLetraMatrix>=fontTypesMatriz.length){indexTipoLetraMatrix=0;}
				cambioTipoLetra = fontTypesMatriz[indexTipoLetraMatrix];
				alert("Custom Tipo Letra: " + cambioTipoLetra);
			}
			
			customFontSize = function(){
				borraMyElementCaption();
				var indexSizeLetraMatrix = fontSizesMatriz.indexOf(cambioFontSize);
				indexSizeLetraMatrix++;
				if(indexSizeLetraMatrix>=fontSizesMatriz.length){indexSizeLetraMatrix=0;}
				cambioFontSize = fontSizesMatriz[indexSizeLetraMatrix];
				alert("Custom Font Size: " + cambioFontSize);
			}
			
			customFontColor = function(){
				borraMyElementCaption();
				var indexColorLetraMatrix = fontColorsMatriz.indexOf(cambioFontColor);
				indexColorLetraMatrix++;
				if(indexColorLetraMatrix>=fontColorsMatriz.length){indexColorLetraMatrix=0;}
				cambioFontColor = fontColorsMatriz[indexColorLetraMatrix];
				alert("Custom Font Color: " + cambioFontColor);
			}
			
			customBackgroundColor = function(){
				borraMyElementCaption();
				var indexBackgroundColorMatrix = fontBackgroundColorsMatriz.indexOf(cambioBackgroundColor);
				indexBackgroundColorMatrix++;
				if(indexBackgroundColorMatrix>=fontBackgroundColorsMatriz.length){indexBackgroundColorMatrix=0;}
				cambioBackgroundColor = fontBackgroundColorsMatriz[indexBackgroundColorMatrix];
				alert("Custom Background Color: " + cambioBackgroundColor);
			}
		
			cambiaFontFamily = function(){
				alert(fontFamilySet);
				if(fontFamilySet=="Arial, Tiresias")
					{fontFamilySet="Times New Roman";}
				else if(fontFamilySet=="Times New Roman")
				{fontFamilySet="default";}
				else if(fontFamilySet=="default")
				{fontFamilySet="monospace";}
				else if(fontFamilySet=="monospace")
				{fontFamilySet="sanserif";}
				else if(fontFamilySet=="sanserif")
				{fontFamilySet="serif";}
				else if(fontFamilySet=="serif")
				{fontFamilySet="monospaceSansSerif";}
				else if(fontFamilySet=="monospaceSansSerif")
				{fontFamilySet="monospaceSerif";}
				else if(fontFamilySet=="monospaceSerif")
				{fontFamilySet="proportionalSerif";}
				else if(fontFamilySet=="proportionalSerif")
				{fontFamilySet="proportionalSansSerif";}
				else if(fontFamilySet=="proportionalSansSerif")
				{fontFamilySet="Arial, Tiresias";}
				else
				{fontFamilySet="monospaceSansSerif";}
				
				setFontFamily();
			}
			
			// Es un detector que comprueba si tenemos una determinada fuente instalada
			var Detector = function() {
			    // se compara cada fuente con las tres fuentes por defecto del sistema: monospace, sans-serif y serif.
			    // Si no coincide con una de estas 3 entonces la fuente no está disponible en el sistema.
			    var baseFonts = ['monospace', 'sans-serif', 'serif'];

			    // para la prueba usamos las letras "w" o "m" porque estos dos caracteres toman el ancho máximo because these two characters take up the maximum width.
			    // Usamos adicionalmente para la prueba los caracteres LLi para que las fuentes coincidan por separado
			    var testString = "mmmmmmmmmmlli";

			    //la prueba se realiza con la fuente a 72px, cuanto más grande sea la fuente más fácil será detectar su existencia en el sistema
			    var testSize = '72px';

			    var h = document.getElementsByTagName("body")[0];

			    // crea un SPAN en el documento para obtener el ancho del texto usado para pruebas
			    var s = document.createElement("span");
			    s.style.fontSize = testSize;
			    s.innerHTML = testString;
			    var defaultWidth = {};
			    var defaultHeight = {};
			    for (var index in baseFonts) {
			        //Adquiere el ancho y el alto del tamaño de las fuentes
			        s.style.fontFamily = baseFonts[index];
			        h.appendChild(s);
			        defaultWidth[baseFonts[index]] = s.offsetWidth; //ancho de la fuente por defecto
			        defaultHeight[baseFonts[index]] = s.offsetHeight; //alto de la fuente por defecto
			        h.removeChild(s);
			    }
			    // Se detecta en el sistema la existencia de una determinada fuente font
				function detect(font) {
			        var detected = false;
			        for (var index in baseFonts) {
			            s.style.fontFamily = font + ',' + baseFonts[index]; // name of the font along with the base font for fallback.
			            h.appendChild(s);
			            var matched = (s.offsetWidth != defaultWidth[baseFonts[index]] || s.offsetHeight != defaultHeight[baseFonts[index]]);
			            h.removeChild(s);
			            detected = detected || matched;
			        }
			        return detected;
			    }

			    this.detect = detect;
			};
			
			setFontFamily = function(){ document.getElementById("subtitulo").style.fontFamily = fontFamilySet; }
			
			setFontFamily = function(element, value){
				if(cambioTipoLetra!="default"){
					value = cambioTipoLetra;
				}
				if(value == "Tiresias"){
					value = "sans-serif";
				}
					
				var d = new Detector();
				var fontdisponible = d.detect(value);
				
				if(fontdisponible == false){
					value = "Sans-serif";
				}
				//alert("Font-family Juanpe 4: " + value + ". Disponible: " + fontdisponible);
				
				fontFamilySet = value;
				element.style.fontFamily = fontFamilySet; 
			}
		
			cambiaPos = function(){
				var Width = player.getWidth();
				var Height = player.getHeight();
				if(tipoPositionSet=="center")
					{tipoPositionSet="left";}
				else if(tipoPositionSet=="left")
					{tipoPositionSet="right";}
				else if(tipoPositionSet=="right")
					{tipoPositionSet="bottom";}
				else if(tipoPositionSet=="bottom")
					{tipoPositionSet="top";}
				else if(tipoPositionSet=="top")
					{tipoPositionSet="center";}
				else
					{tipoPositionSet="bottom";}
				
				setTipoPosition();
			}
			
			setTipoPosition = function(){
				var tipo = tipoPositionSet;
				//alert("Tipo de posicion: " + tipo);
				var subtitulado = document.getElementById("subtitulo");
				var Width = actualWidthSet;
				var Height = actualHeightSet;
				//alert(Width + ":" + Height);
				var calculaLeft = 0;
				var calculaTop = 0;
				var calculaMaxWidth = 0;
				var calculaMaxHeight = 0;
				positionSet = "absolute";
				subtitulado.style.position = positionSet;
				subtitulado.style.fontSize = fontSizeSet;
			
				if(tipo=="top"){
					calculaLeft = (Width * 0.1); 
					calculaMaxWidth = (Width * 0.8); 
					calculaTop = -(Height * 0.9); 
					calculaMaxHeight = (Height * 0.2); 	
					if(player.getFullscreen()){
						subtitulado.style.position = "absolute";
						calculaTop = (Height * 0.1); 
						calculaMaxWidth = (Width * 0.8);
						fontSizeSet="xx-large";
						//alert(leftSet + ":" + maxWidthSet + ":" + topSet + ":" + maxHeightSet);
					}
				}
				else if(tipo=="bottom"){
					calculaLeft = (Width * 0.1); 
					calculaMaxWidth = (Width * 0.8); 
					calculaTop = - (Height * 0.3); 
					calculaMaxHeight = (Height * 0.2); 
					if(player.getFullscreen())
					{
						subtitulado.style.position = "absolute";
						calculaTop = (Height * 0.9); 
						calculaMaxWidth = (Width * 0.8);
						fontSizeSet="xx-large";
						//alert(leftSet + ":" + maxWidthSet + ":" + topSet + ":" + maxHeightSet);
					}
				}
				else if(tipo=="right"){
					calculaLeft = (Width * 0.1); 
					calculaMaxWidth = (Width * 0.8); 
					calculaTop = -(Height * 0.9); 
					calculaMaxHeight = (Height * 0.2); 	
					if(player.getFullscreen())
					{
						subtitulado.style.position = "absolute";
						calculaTop = (Height * 0.9); 
						calculaMaxWidth = (Width * 0.8);
						fontSizeSet="xx-large";
						//alert(leftSet + ":" + maxWidthSet + ":" + topSet + ":" + maxHeightSet);
					}
				}
				else if(tipo=="center"){
					calculaLeft = (Width * 0.1); 
					calculaMaxWidth = (Width * 0.8); 
					calculaTop = -(Height * 0.1); 
					calculaMaxHeight = (Height * 0.2); 
					if(player.getFullscreen())
					{
						subtitulado.style.position = "absolute";
						calculaTop = (Height * 0.9); 	
						calculaMaxWidth = (Width * 0.8);
						fontSizeSet="xx-large";
						//alert(leftSet + ":" + maxWidthSet + ":" + topSet + ":" + maxHeightSet);
					}
				}
				else if(tipo=="left"){
					calculaLeft = (Width * 0.1); 
					calculaMaxWidth = (Width * 0.8); 
					calculaTop = -(Height * 0.9); 
					calculaMaxHeight = (Height * 0.2); 	
					if(player.getFullscreen())
					{
						subtitulado.style.position = "absolute";
						calculaTop = (Height * 0.9); 
						calculaMaxWidth = (Width * 0.8); 
						fontSizeSet="xx-large";
						//alert(leftSet + ":" + maxWidthSet + ":" + topSet + ":" + maxHeightSet);
					}
				}
				else{
					calculaLeft = (Width * 0.1); 
					calculaMaxWidth = (Width * 0.8); 
					calculaTop = -(Height * 0.9); 
					calculaMaxHeight = (Height * 0.2); 	
					if(player.getFullscreen())
					{
						subtitulado.style.position = "absolute";
						calculaTop = (Height * 0.9); 
						calculaMaxWidth = (Width * 0.8);
						fontSizeSet="xx-large";
						//alert(leftSet + ":" + maxWidthSet + ":" + topSet + ":" + maxHeightSet);
					}
				}
				leftSet = parseInt(calculaLeft) + "px";
				maxWidthSet = parseInt(calculaMaxWidth) + "px";
				topSet = parseInt(calculaTop) + "px";
				maxHeightSet = parseInt(calculaMaxHeight) + "px";
				//alert(leftSet + ":" + maxWidthSet + ":" + topSet + ":" + maxHeightSet);
				subtitulado.style.left = leftSet;
				subtitulado.style.top = topSet;
				subtitulado.style.maxWidth = maxWidthSet;
				subtitulado.style.maxHeight = maxHeightSet;
				subtitulado.style.fontSize = fontSizeSet;
			}
			
			setTipoPosition = function(element, value){
				tipoPositionSet = value;
				var tipo = tipoPositionSet;
				//alert("Tipo de posicion: " + tipo);
				var subtitulado = element;
				var Width = actualWidthSet;
				var Height = actualHeightSet;
				//alert(Width + ":" + Height);
				var calculaLeft = 0;
				var calculaTop = 0;
				var calculaBottom = 0;
				var calculaMaxWidth = 0;
				var calculaMaxHeight = 0;
				positionSet = "relative";
				subtitulado.style.position = positionSet;
				subtitulado.style.fontSize = fontSizeSet;
			
				if(tipo=="top"){
					calculaLeft = (Width * 0.1); 
					calculaMaxWidth = (Width * 0.8); 
					calculaTop = -(Height * 0.9);
					calculaBottom = (Height * 0.9);
					calculaMaxHeight = (Height * 0.2); 	
					if(player.getFullscreen()){
						subtitulado.style.position = "absolute";
						calculaTop = (Height * 0.1); 
						calculaMaxWidth = (Width * 0.8);
						fontSizeSet="xx-large";
						//alert(leftSet + ":" + maxWidthSet + ":" + topSet + ":" + maxHeightSet);
					}
				}
				else if(tipo=="bottom"){
					calculaLeft = (Width * 0.1); 
					calculaMaxWidth = (Width * 0.8); 
					calculaTop = - (Height * 0.3); 
					calculaBottom = (Height * 0.3); 
					calculaMaxHeight = (Height * 0.2); 
					if(player.getFullscreen())
					{
						subtitulado.style.position = "absolute";
						calculaTop = (Height * 0.9); 
						calculaMaxWidth = (Width * 0.8);
						fontSizeSet="xx-large";
						//alert(leftSet + ":" + maxWidthSet + ":" + topSet + ":" + maxHeightSet);
					}
				}
				else if(tipo=="right"){
					calculaLeft = (Width * 0.1); 
					calculaMaxWidth = (Width * 0.8); 
					calculaTop = -(Height * 0.9); 
					calculaBottom = (Height * 0.9); 
					calculaMaxHeight = (Height * 0.2); 	
					if(player.getFullscreen())
					{
						subtitulado.style.position = "absolute";
						calculaTop = (Height * 0.9); 
						calculaMaxWidth = (Width * 0.8);
						fontSizeSet="xx-large";
						//alert(leftSet + ":" + maxWidthSet + ":" + topSet + ":" + maxHeightSet);
					}
				}
				else if(tipo=="center"){
					calculaLeft = (Width * 0.1); 
					calculaMaxWidth = (Width * 0.8); 
					calculaTop = -(Height * 0.1); 
					calculaBottom = (Height * 0.1); 
					calculaMaxHeight = (Height * 0.2); 
					if(player.getFullscreen())
					{
						subtitulado.style.position = "absolute";
						calculaTop = (Height * 0.9); 	
						calculaMaxWidth = (Width * 0.8);
						fontSizeSet="xx-large";
						//alert(leftSet + ":" + maxWidthSet + ":" + topSet + ":" + maxHeightSet);
					}
				}
				else if(tipo=="left"){
					calculaLeft = (Width * 0.1); 
					calculaMaxWidth = (Width * 0.8); 
					calculaTop = -(Height * 0.9); 
					calculaBottom = (Height * 0.9); 
					calculaMaxHeight = (Height * 0.2); 	
					if(player.getFullscreen())
					{
						subtitulado.style.position = "absolute";
						calculaTop = (Height * 0.9); 
						calculaMaxWidth = (Width * 0.8); 
						fontSizeSet="xx-large";
						//alert(leftSet + ":" + maxWidthSet + ":" + topSet + ":" + maxHeightSet);
					}
				}
				else{
					calculaLeft = (Width * 0.1); 
					calculaMaxWidth = (Width * 0.8); 
					calculaTop = -(Height * 0.9); 
					calculaBottom = (Height * 0.9); 
					calculaMaxHeight = (Height * 0.2); 	
					if(player.getFullscreen())
					{
						subtitulado.style.position = "absolute";
						calculaTop = (Height * 0.9); 
						calculaMaxWidth = (Width * 0.8);
						fontSizeSet="xx-large";
						//alert(leftSet + ":" + maxWidthSet + ":" + topSet + ":" + maxHeightSet);
					}
				}
				leftSet = parseInt(calculaLeft) + "px";
				maxWidthSet = parseInt(calculaMaxWidth) + "px";
				topSet = parseInt(calculaTop) + "px";
				bottomSet = parseInt(calculaBottom) + "px";
				maxHeightSet = parseInt(calculaMaxHeight) + "px";
				//alert(leftSet + ":" + maxWidthSet + ":" + topSet + ":" + maxHeightSet);
				subtitulado.style.left = leftSet;
				//subtitulado.style.top = topSet;
				subtitulado.style.top = bottomSet;
				subtitulado.style.maxWidth = maxWidthSet;
				subtitulado.style.maxHeight = maxHeightSet;
				subtitulado.style.fontSize = fontSizeSet;
			}
			// A�ade el elemento "subtitulo" en caso de que no exista
				
				//inicio();
				
				//posicionXEsquinaAbsolutaVideo = 0;
				//posicionYEsquinaAbsolutaVideo = -actualHeightSize;
				
				
				// Funci�n doTimer
				
	}
					
	player.onReady(setup);
	/*player.addButton("data:image/png;base64,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", 
	        "Ver Subt Seleccionados", 
	        function() { 
				verSubtitulosSeleccionados(); 
				//player.onReady(setup);
				//setup(this);
			}, 
	        "inicio");
	player.addButton("data:image/png;base64,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", 
	        "Ver Tamaño Vídeo", 
	        function() { 
				verTamanoVideo2(); 
				//player.onReady(setup);
				//setup(this);
			}, 
	        "ver");
	player.addButton("data:image/png;base64,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", 
	        "Ver Cell Resolution", 
	        function() { 
				verCellResolution(); 
				//player.onReady(setup);
				//setup(this);
			}, 
	        "ver Cell Resolution");*/
	/*player.addButton("data:image/png;base64,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", 
	        "Cambia Font Size", 
	        function() { 
				customFontSize(); 
				//player.onReady(setup);
				//setup(this);
			}, 
	        "fontsize");
	player.addButton("data:image/png;base64,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", 
	        "Cambia Font Type", 
	        function() { 
				customFontType(); 
				//player.onReady(setup);
				//setup(this);
			}, 
	        "fonttype");
	player.addButton("data:image/png;base64,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", 
	        "Cambia Font Color", 
	        function() { 
				customFontColor(); 
				//player.onReady(setup);
				//setup(this);
			}, 
	        "fontcolor");
	player.addButton("data:image/png;base64,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", 
	        "Cambia Background Color", 
	        function() { 
				customBackgroundColor(); 
				//player.onReady(setup);
				//setup(this);
			}, 
	        "backgroundcolor");*/
}, './slowmo.swf');