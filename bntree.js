// Purpose: Create the Barnes-Hut tree and perform all necessary calculations
// on the obejcts in the tree

// minimum and maximum values for printing objects and adding random objects
let minimumMass = 1e2;
let maximumMass = 1e10;

// gravitational constant
let constG = 1e-5;

// maximum depth of the tree just so it doesn't get too large
let maxTreeDepth = 50;

// default change in time for calculations
let dt = 0.01;

// array of objects, where all objects are stored
let bods;

// variable checked by bnAddBody()
let allowCollisions = false;

// distance an object has to be away for a collision to occur (in pixels)
let collisionConst = 5;

// Canvas Context
let c;

// data values for the tree to print
let bnRoot;
let bnDepth=0;
let bnNumNodes=0;
let bnNumLeafs=0;

// variables for pausing and startign the simulation
let sysTimer;
let sysRunning = false;

// option for realistic physics values, checked by makeRealistic() in userInput.js
let realisticValues = false;

// power that the radius is taken to when calculating force
let exponent = 1.3;

// current system time
let T = 0;
let stepTime;

// resets the tree to initial data
function resetBodies() {
	// clear each of the attributes
	if (bods) {
		bods.pos = null;
		bods.vel = null;
		bods.mass = null;
	}

	bods = {pos:{x:new Array(),y:new Array()},
		vel:{x:new Array(),y:new Array()},
		acc:{x:new Array(),y:new Array()},
		mass:new Array(),
		N:0};
}

// Called by HTML, clears data
function initBN(canvasId) {
	canvasElement = document.getElementById(canvasId);
	c = canvasElement.getContext("2d");

	resetBodies();
	resetCanvas();
}

// called by addNrandomBodies() in HTML
function addNrandomBodies(){
	// get the value from the input box
	n = document.getElementById("bodiesToAdd").value;

	for (var i = 0; i < n; i++) {
		addRandomBody();
	}
	refreshGraphics();
}

// called by addNrandomBodies()
function addRandomBody() {
	addBody(
		Math.random()*canvasElement.width,
		Math.random()*canvasElement.height,
		Math.random()*10-5,
		Math.random()*10-5,
		Math.random()*(maximumMass-minimumMass)+minimumMass
	);
}

// add a body with specific values
function addBody(x,y,vx,vy,m) {
	bods.pos.x [bods.N] = x;
	bods.pos.y [bods.N] = y;
	bods.vel.x [bods.N] = vx;
	bods.vel.y [bods.N] = vy;
	bods.acc.x [bods.N] = 0;
	bods.acc.y [bods.N] = 0;
	bods.mass [bods.N] = m;
	bods.N = bods.N + 1;
	refreshGraphics();

	if (!sysRunning) {bnBuildTree();}
}

// add a specific body with user-inputted values
function addSpecificObject() {
	bods.pos.x [bods.N] = parseInt(document.getElementById("xPosInput").value);
	bods.pos.y [bods.N] = parseInt(document.getElementById("yPosInput").value);
	bods.vel.x [bods.N] = parseInt(document.getElementById("xVelPosInput").value);
	bods.vel.y [bods.N] = parseInt(document.getElementById("yVelPosInput").value);
	bods.acc.x [bods.N] = 0;
	bods.acc.y [bods.N] = 0;
	bods.mass [bods.N] = parseInt(document.getElementById("massInput").value) * 10e9;
	bods.N = bods.N + 1;
	refreshGraphics();

	if (!sysRunning) {bnBuildTree();}
}


// Barnes-Hut Tree Functions

// reset stats on the tree to print
function bnSetTreeStats() {
	bnDepth=0, bnNumNodes=0, bnNumLeafs=0;
	bnSetTreeStatsRecurse(bnRoot,0);
}

// traverse the tree to get the stats for bnSetTreeStats()
function bnSetTreeStatsRecurse(node,depth) {
	bnNumNodes += 1;
	bnDepth = Math.max(depth,bnDepth);

	if ( node.b.length > 0 ) {
		if (node.b != "PARENT") {
			bnNumLeafs += 1;
		}

		// recursively count the rest of the tree
		for (var i=0;i<4;i++){
			var child = node.nodes[i];
			if (child) { bnSetTreeStatsRecurse(child,depth+1) }
		}
	}
}

// shortcut to delete the entire tree
function bnDeleteTree() {
	if (bnRoot) {
		bnRoot = bnDeleteNode(bnRoot);
	}
}

// delete a specified node and all its children
function bnDeleteNode(node) {
	node.b = null;
	node.box = null;
	// For each child
	for (var i=0;i<4;i++) {
		if (node.nodes[i]) { // If child exists
			node.nodes[i] = bnDeleteNode(node.nodes[i]);
		}
	}
	return null;
}

// 
function bnBuildTree() {
	// intially delete the old tree
	bnDeleteTree(bnRoot);

	bnRoot = {b: [], // Body
		leaf:true, // is a leaf
		CoM: null, // center of mass
		nodes:[null,null,null,null], // four sections that the leaf is divided into
		// x y x2 y2
		box:[0, 0, canvasElement.width, canvasElement.height]};
	
	// Add each body to tree
	for (var i=0;i<bods.N;i++) {
		if (pointInBBOX(bods.pos.x[i],bods.pos.y[i],bnRoot.box)) {
			bnAddBody(bnRoot,i,0);
		}
	}
	bnSetTreeStats(); // Update bn tree stats
}

// function to place the node into the right subtree
// checks the x and y values of the subsection compared to the x and y value of the node being added
function pointInBBOX(x,y,BBOX) {
	if (x >= BBOX[0] && x <= BBOX[2] && y >= BBOX[1] && y <= BBOX[3]) {return true;}
	else {return false;}
}

// add a new body into the tree
function bnAddBody(node,i,depth) {
	// if node has body already
	if ( node.b.length > 0 ) { // not empty
		// Check if hit max depth
		if (depth > maxTreeDepth) {
			node.b [node.b.length] = i; // Add body to same node since already at max depth
		} 
		else {
			var subBodies;
			if (!node.leaf) { // Same as saying node.b = "PARENT"
				// Node is a parent with children
				subBodies = [i];
			} else {
				// Node is a leaf node (no children), turn to parent
				subBodies = [node.b,i];
			}
			for (var k=0;k<subBodies.length;k++) {
				// Add body to children too		
				var quad = getQuad(subBodies[k], node.box);
				var child = node.nodes[quad];
				if (child) {
					// if collisions is on, check distance to nearest existing child
					if (allowCollisions) {
						// if th distance between the node being added and an existing node is less than the given distance
						if (getDist(node.CoM[1], node.CoM[2], bods.pos.x[i], bods.pos.y[i]) < collisionConst) {
							// find the index of the existing element
							index = bods.pos.x.findIndex(element => element == child.CoM[1]);
							// combine the two elements and add the new one to the tree
							combineBodies(index, i);
							// remove the old element from the list
							removeBody(i);
						}
					}
					// if quad has child, recurse with child
					bnAddBody(child,subBodies[k],depth+1);
				} else {
					// else add body to child
					node = bnMakeNode(node,quad,subBodies[k]);
				}
			}
			node.b = ["PARENT"];
			node.leaf = false; // Always going to turn into a parent if not already
		}
		// Update center of mass
		node.CoM[1] = (node.CoM[1]*node.CoM[0] + bods.pos.x[i]*bods.mass[i])/(node.CoM[0]+bods.mass[i]);
		node.CoM[2] = (node.CoM[2]*node.CoM[0] + bods.pos.y[i]*bods.mass[i])/(node.CoM[0]+bods.mass[i]);
		node.CoM[0] += bods.mass[i];
	} else { // else if node empty, add body
		node.b = [i];
		node.CoM = [bods.mass[i], bods.pos.x[i],bods.pos.y[i]]; // Center of Mass set to the position of single body
	}
}

// function called by bnAddBody() to combine two bodies if they collide
function combineBodies(i1, i2) {
	// get the momentum of the two objects
	var mom1x = bods.mass[i1] * bods.vel.x[i1];
	var mom2x = bods.mass[i2] * bods.vel.x[i2];
	var mom1y = bods.mass[i1] * bods.vel.y[i1];
	var mom2y = bods.mass[i2] * bods.vel.y[i2];

	// combine the momentums
	var totalMomX = mom1x + mom2x;
	var totalMomY = mom1y + mom2y;

	// combine the masses
	bods.mass[i1] += bods.mass[i2];

	// set the velocity of the new object
	bods.vel.x[i1] = totalMomX / bods.mass[i1];
	bods.vel.y[i1] = totalMomY / bods.mass[i1];
}

// function called by bnAddBody() to remove a body from the list
function removeBody(i) {
	bods.pos.x.splice(i, 1);
	bods.pos.y.splice(i, 1);
	bods.vel.x.splice(i, 1);
	bods.vel.y.splice(i, 1);
	bods.acc.x.splice(i, 1);
	bods.vel.y.splice(i, 1);
	bods.mass.splice(i, 1);
	bods.N -= 1;
}

// function called by bnAddBody()
// returns which box a point should be in
function getQuad(i,box) {
	var mx = (box[0]+box[2])/2;
	var my = (box[1]+box[3])/2;
	if (bods.pos.x[i] < mx) { // Left
		if (bods.pos.y[i] < my) {return 0;} // Top
		else {return 2;} // Bottom
	}
	else { // right
		if (bods.pos.y[i] < my) {return 1;} // Top
		else {return 3;} // Bottom}
	}
}

// creates a new child node in the tree
function bnMakeNode(parent,quad,child) {
	// create the child object
	var child = {b:[child],
		leaf:true,
		CoM : [bods.mass[child], bods.pos.x[child],bods.pos.y[child]], // Center of Mass set to the position of single body
		nodes:[null,null,null,null],
		box:[0,0,0,0]};

	// return value of getQuad
	// places the object into the correct subsesction
	switch (quad) {
		case 0: // Top Left
			child.box = [parent.box[0],
				parent.box[1],
				(parent.box[0]+parent.box[2])/2, 
				(parent.box[1]+parent.box[3])/2];
			break;
		case 1: // Top Right
			child.box = [(parent.box[0]+parent.box[2])/2,
				parent.box[1],
				parent.box[2], 
				(parent.box[1]+parent.box[3])/2];
			break;
		case 2: // Bottom Left
			child.box = [parent.box[0],
				(parent.box[1]+parent.box[3])/2,
				(parent.box[0]+parent.box[2])/2, 
				parent.box[3]];
			break;
		case 3: // Bottom Right
			child.box = [(parent.box[0]+parent.box[2])/2,
				(parent.box[1]+parent.box[3])/2,
				parent.box[2], 
				parent.box[3]];
			break;
	}
	parent.nodes[quad] = child;
	return parent;
}

function doBNtree(bI) {
	doBNtreeRecurse(bI,bnRoot);
}

// called by doBNTree()
// recursively get the acceleration for objects of a subsection
function doBNtreeRecurse(bI,node) {
	if (node.leaf) {
		// If node is a leaf node
		for (var k=0;k<node.b.length;k++) {
			if (bI != node.b[k]) { // Skip self
				setAccel(bI,node.b[k],false);
			}
		}
	}
	else {
		var s = Math.max( node.box[2]-node.box[0] , node.box[3]-node.box[1] ); // Biggest side of box
		var d = getDist(bods.pos.x[bI],bods.pos.y[bI],
			node.CoM[1],node.CoM[2]);
		if (s/d < 0.5) {
			setAccelDirect(bI,node.CoM[0],node.CoM[1],node.CoM[2]);
		}
		else {
			// Recurse for each child
			for (var k=0;k<4;k++) {
				if (node.nodes[k]) {doBNtreeRecurse(bI,node.nodes[k]);}
			}
		}
	}
}

function getDist(x,y,x2,y2) {
	return Math.sqrt(Math.pow(x2-x,2)+Math.pow(y2-y,2));
}

// Update accelerations using BN tree
function forceBNtree() {
	bnBuildTree(); // Build BN tree based on current pos
	for (var i=0;i<bods.N;i++) {
		// For each body
		doBNtree(i);
	}
}

// do_Both defaults true: Updates acceleration of bods[j] also (negative of bods[i])
function setAccel(i,j,do_Both) {
	do_Both = typeof(do_Both) != 'undefined' ? do_Both : true;
	
	// Get Force Vector between bodies i, j
	var force = getForceVec(i,j);

	// a = F/m
	// Body i
	bods.acc.x[i] += force[0]/bods.mass[i];
	bods.acc.y[i] += force[1]/bods.mass[i];
	
	if (do_Both) {
		// Body j, equal and opposite force
		bods.acc.x[j] -= force[0]/bods.mass[j];
		bods.acc.y[j] -= force[1]/bods.mass[j];
	}
}

// Set's accel according to given mass
function setAccelDirect(i,m,x,y) {

	// get Force Vector between body i
	// and a virtual mass
	// with mass m, at position cx,cy
	var force = getForceVecDirect(
		bods.mass[i],bods.pos.x[i],bods.pos.y[i],
		m,x,y);
	
	// Update acceleration of body
	bods.acc.x[i] += force[0]/bods.mass[i];
	bods.acc.y[i] += force[1]/bods.mass[i];
}

function getForceVec(i,j) {
	return getForceVecDirect(
		bods.mass[i],bods.pos.x[i],bods.pos.y[i],
		bods.mass[j],bods.pos.x[j],bods.pos.y[j]);
}

// Determines force interaction between
// bods[i] and bods[j], an adds to bods[i]
function getForceVecDirect(m,x,y,m2,x2,y2) {
	var dx = x2-x;
	var dy = y2-y;
	var r = (getDist(x,y,x2,y2)+10) * 2;
	var force = constG*m*m2/Math.pow(r, exponent);

	return [ force*dx/r , force*dy/r ];
}

// Set accelerations of bodies based on gravity
function doForces() {
	// Zero accelerations
	for (var i=0;i<bods.N;i++) {
		bods.acc.x[i]=0;
		bods.acc.y[i]=0;
	}
	bnBuildTree();
	forceBNtree();
	
}

// Basic update system step by time step dt
function step() {
	var startTime = (new Date()).getTime();

	// Use integration method to step once by global dt
	leapfrog();

	stepTime = (new Date()).getTime()-startTime;

	T += dt;
	if (!sysRunning) {refreshGraphics();} // Refresh graphics if paused
	
}

function leapfrog() {
	updatePos(0.5*dt); // Move half step
	doForces(); // Set/Update accelerations
	updateVel(dt); // Move Velocities full step
	updatePos(0.5*dt); // Move half step
}

// Update body positions based on velocities
function updatePos(dt_step) {
	for (var i=0;i<bods.N;i++) {
		bods.pos.x[i] += bods.vel.x[i]*dt_step;
		bods.pos.y[i] += bods.vel.y[i]*dt_step;
	}
}

// Update body velocities based on accelerations
function updateVel(dt_step) {
	for (var i=0;i<bods.N;i++) {
		bods.vel.x[i] += bods.acc.x[i]*dt_step;
		bods.vel.y[i] += bods.acc.y[i]*dt_step;
	}
}


function startStopSys() {
	button = document.getElementById("startStopButton");
	if (!sysRunning) {
		sysTimer = setInterval(step,10);
		gfxTimer = setInterval(refreshGraphics,1/60.0*1000);
		sysRunning = true;
		button.innerHTML = "Pause";
		refreshGraphics();
	} else {
		clearInterval(sysTimer);
		clearInterval(gfxTimer);
		sysRunning = false;
		button.innerHTML = "Play";
		refreshGraphics();
	}
}