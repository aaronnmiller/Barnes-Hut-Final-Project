// Purpose: handle all user input from the HTML page

// Variables for dragging the mouse
let isDrag = false;
let dragx,dragy;
let dragx2,dragy2;

// default value for mass when clicking to add an object
let dragm = (minimumMass+maximumMass)/2;

// initialize canvas elements
function initUI(canvasId){
	canvasElement = document.getElementById(canvasId);
	canvasElement.onmousedown = mouseDown;
	canvasElement.onmouseup = mouseUp;
	canvasElement.onmousemove = mouseMove;
	
	// default value for speed
	setDT(-2);
}

// get x and y values from a mouse click event
function mouseClick(e) {
	let mouseX, mouseY;
	mouseX = e.offsetX;
	mouseY = e.offsetY;

	// add an object at that position
	addBody(mouseX,mouseY,0,0);
}

// get position at the beginning of a mouse drag
function mouseDown(e) {
	isDrag = true;

	let mouseX, mouseY;
	mouseX = e.offsetX;
	mouseY = e.offsetY;

	dragx = mouseX;
	dragy = mouseY;
	dragx2 = mouseX;
	dragy2 = mouseY;
	refreshGraphics();
}

// used when drawing the velocity line to continue updating the line while dragging
function mouseMove(e) {
	if (isDrag) {
		let mouseX, mouseY;
		mouseX = e.offsetX; 
		mouseY = e.offsetY;

		dragx2 = mouseX;
		dragy2 = mouseY;

		dragx2 = (mouseX-dragx)/arrowLengthRatio + dragx;
		dragy2 = (mouseY-dragy)/arrowLengthRatio + dragy;
		refreshGraphics();
	}
}

// get the position at the end of a mouse drag
function mouseUp(e) {
	if (isDrag) {
		isDrag = false;

		let mouseX, mouseY;
		mouseX = e.offsetX; 
		mouseY = e.offsetY;
		
		mouseX = (mouseX-dragx)/arrowLengthRatio + dragx;
		mouseY = (mouseY-dragy)/arrowLengthRatio + dragy;
		
		addBody(dragx,dragy,mouseX-dragx,mouseY-dragy,dragm);
		refreshGraphics();
	}
}

// reset absolutely everything, called by Reset button in HTML
function resetSys() {
	resetCanvas();
	resetBodies();
	bnDeleteTree();
	refreshGraphics();
}

// a too complicated function that I found on stack overflow that somehow works nicely to scale the opacity slider
function setOpacity(val) {
	// invert the number because im dumb and don't want to fix it the other way
	val = 100 - val;

	// position will be between 0 and 100
	let minp = 0;
	let maxp = 100;
  
	let minv = Math.log(1);
	let maxv = Math.log(1.5);
  
	// calculate adjustment factor
	let scale = (maxv-minv) / (maxp-minp);
  
	opacity = (Math.exp(minv + scale*(val-minp))) - 1;

	// just cut it off at the low end of the scale
	if (opacity >= 0.5) {
		opacity = 1;
	}
}

// called by Allow Collisions checkbox in HTML
function changeCollisions() {
	allowCollisions = !allowCollisions;
}

// show the extra data on the lefthand side of the window
// called by Show Additional Data button in HTML
function showData() {
	if (showingData == false) {
		showingData = !showingData
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
	} else {
		data = document.getElementById("data");
		data.innerHTML = "";
		showingData = false;
	}
}

// scale the user input for the change in time per step, only if realistic physics is off
function setDT(val) {
	if (realisticValues == false) {
		dt = Math.pow(10,val);
	}
};

// change the values when flipping between visually appealing physics and realistic physics
function makeRealistic() {
	if (realisticValues == false) {
		realisticValues = true;
		constG = 6.67e-11;
		exponent = 2;
		dt = 0.01;

		// only show the time slider if realistic physics is off
		document.getElementById("realisticPhysicsLabel").innerHTML = "";
		document.getElementById("realisticPhysicsSlider").innerHTML = "";
	} else {
		realisticValues = false;
		constG = 1e-5;
		exponent = 1.3;

		document.getElementById("realisticPhysicsLabel").innerHTML = "<td><hr>Speed Factor</td>";
		document.getElementById("realisticPhysicsSlider").innerHTML = `
		<td>
		0.0001
		<input id="opacitySlider" type="range" min="-4" max="0.5" value="0.01" step=0.0001 onchange="setDT(this.value)" />
		10
		</td>`;
	}
}