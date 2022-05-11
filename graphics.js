// Purpose: handle canvas interactions and drawings

// Circle Sizes
let MINRADIUS = 1;
let MAXRADIUS = 5;

// Canvas Context
let canvasElement;

// Graphics refresh timer
let gfxTimer=0;

// opacity of the layers to redraw over the canvas
let opacity = 1;

// default color of the citcle
let circleColor = "66, 135, 245";

// bool to show extra data on the left
let showingData = false;

// ratio of length of mouse drag to the length of the velocity vector being drawn
let arrowLengthRatio = 2;

// resize the canvas every time the window size changes
window.addEventListener('resize', function() {
	canvasElement = document.getElementById("bnCanvas");
	canvasElement.width = window.innerWidth;
	canvasElement.height = window.innerHeight;
	refreshGraphics();
})

// a function to parse hex color input, returns an rbg object
function hexToRgb(hex) {
	// regex to read hex
	let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return {
	  r: parseInt(result[1], 16),
	  g: parseInt(result[2], 16),
	  b: parseInt(result[3], 16)
	};
}

// sets the color of the objects on the canvas from the user input from HTML
function setCircleColor() {
	inputColor = document.getElementById("colorpicker").value;
	rgb = hexToRgb(inputColor);
	circleColor = "" + rgb['r'] + ", " + rgb['g'] + ", " + rgb['b'];
}

// set canvas elements from HTML
function initGraphics(dataId){
	canvasElement = document.getElementById("bnCanvas");
	c = canvasElement.getContext("2d");
	data = document.getElementById(dataId);
}

// Updates extra data text on HTML page
function updateData() {
	if (showingData == true) {
		data = document.getElementById("data");
		data.innerHTML = "<p><b>Running: "+(sysRunning?"yes":"no")+"</b><br/>\n\
			Number of Objects: "+bods.N+"<br/>\n\
			</p>";
	
		data.innerHTML += "\n\
			<p>\n\
			<b>Tree Data</b><br/>\n\
			Depth: "+bnDepth+"<br/>\n\
			Nodes: "+bnNumNodes+"<br/>\n\
			Leafs: "+bnNumLeafs+"<br/>\n\
			</p>\n";
	}
}

// clear the vcanvas completely
function resetCanvas() {
	c.clearRect(0,0,canvasElement.width,canvasElement.height);
}

// called every time the canvas needs to be updated
function refreshGraphics() {
	// fill the canvas with an overlay, opacity variable creates the trails
	c.fillStyle = "rgba(42, 42, 42, " + opacity + ")";
	c.fillRect(0, 0, canvasElement.width, canvasElement.height);

	// draw the new updated circle
	fillColor = "rgba(" + circleColor + ", " + 1 + ")";

	if (isDrag) {
		drawCircle(dragx,dragy,massToRadius(dragm), fillColor);
		// only draw the velocity lines if no opacity, otherwise it looks weird... 
		if (opacity == 1) {
			drawVelocityLine(dragx,dragy,dragx2,dragy2);
		}
	}

	// draw each of the objects in the list
	for(let i=0;i<bods.N;i++){
		drawCircle(bods.pos.x[i],bods.pos.y[i],massToRadius(bods.mass[i]), fillColor);
	}

	updateData();
}

// calculates how big to draw the object depending on its mass
function massToRadius(mass) {
	return MINRADIUS+(mass-minimumMass)/(maximumMass-minimumMass)*(MAXRADIUS-MINRADIUS);
}

// draw the circle in the context
function drawCircle(x, y, r, color) {
	c.beginPath();
	c.arc(x, y, r, 0, 2*Math.PI, 0);
	c.fillStyle = color;
	c.fill();
}

// draw the green velocity line on the canvas when clicking to add an object
function drawVelocityLine(x,y,x2,y2) {
	color = '#42f578';

	c.strokeStyle = color;
	c.fillStyle = color;
	c.lineWidth = "0";
	c.lineWidth = 2;

	c.beginPath();
	c.moveTo(x,y);
	c.lineTo(x2,y2);
	c.closePath();
    c.stroke();
}