/*
 * universe.js
 * 
 * Description:
 * 		A simple canvas experiment - universe "simulation".
 * 		Click on the universe to add a new planet.
 * 		Planets grow and shrink size depending on the neighbors satellites.
 * 		
 * Author: Edbali Ossama
 * 
 */

Universe = new function() {
	
	// =================
	// === VARIABLES ===
	// =================
	
	var SCREEN_WIDTH = window.innerWidth;
	var SCREEN_HEIGHT = window.innerHeight;
	var RADIUS = 70;
	var FPS = 20;
	var INITIAL_SATELLITES = 10;
	var INITIAL_PLANETS = 3;
	
	var mouseX = SCREEN_WIDTH / 2;
	var mouseY = SCREEN_HEIGHT / 2;
	var target = null;
	
	var canvas;
	var planets = [];
	var satellites = [];
	
	// Shadows
	var planetShadow = {
		    color: 'rgba(100, 120, 230, 1)',
		    blur: 20, 
		    fillShadow: true, 
		    strokeShadow: true 
		}
	var satelliteShadow = {
		    color: 'rgba(255, 255, 255, 1)',
		    blur: 10,
		    fillShadow: true, 
		    strokeShadow: true 
		}
	
	// ================================
	// === INITIALIZATION FUNCTIONS ===
	// ================================
	
	this.init = function() {
		canvas = new fabric.StaticCanvas("universe", {
			backgroundColor: '#121212'
		});
		
		// Event listeners
		window.addEventListener('mousemove', documentMouseMoveHandler, false);
	    window.addEventListener('mousedown', documentMouseDownHandler, false);
	    window.addEventListener('mouseup', documentMouseUpHandler, false);
	    window.addEventListener('resize', windowResizeHandler, false);
	    
	    // Canvas size
		canvas.setWidth(SCREEN_WIDTH);
		canvas.setHeight(SCREEN_HEIGHT);
		
		// Initialization
		initPlanets();
		initSatellites();
      	windowResizeHandler();
      	setInterval(loop, FPS); // Start loop
	}
	
	function initSatellites() {		
		for(var i = 0; i < INITIAL_SATELLITES; i++) {
			var s = new fabric.Circle({
				fill: satelliteShadow.color,
				radius: 0.5 + Math.random() * 2,
				left: mouseX,
				top: mouseY,
				offset: { x: 0, y: 0 },
				mov: { x: mouseX, y: mouseY },
				speed: 0.01 + Math.random() * 0.05, // 0.01 --> global speed
				orbit: RADIUS * 0.7 + (RADIUS * 0.5 * Math.random()),
				planet: planets[Math.floor(Math.random() * planets.length)],
			});
			s.setShadow(satelliteShadow);
			
		    canvas.add(s);
      		satellites.push(s);
		}
	}
	
	function initPlanets() {	
		for(var i = 0; i < INITIAL_PLANETS; i++) {
			var p = new fabric.Circle({
				fill: planetShadow.color,
				radius: 10,
				left: Math.random() * SCREEN_WIDTH,
				top: Math.random() * SCREEN_HEIGHT
			});
			p.setShadow(planetShadow);
			
			canvas.add(p);
			planets.push(p);
		}
	}
	
	function createPlanet(x, y) {
		
		// Planet creation
		var p = new fabric.Circle({
			fill: planetShadow.color,
			radius: 10,
			left: x,
			top: y
		});
		p.setShadow(planetShadow);
		
		canvas.add(p);
		planets.push(p);
		
		// Adding planet satellites
		var toAdd = 5;
		for(var i = 0; i < toAdd; i++) {
			var s = new fabric.Circle({
				fill: "#eaeaea",
				radius: 0.5 + Math.random() * 2,
				left: p.left,
				top: p.top,
				offset: { x: 0, y: 0 },
				mov: { x: p.left, y: p.top },
				speed: 0.01 + Math.random() * 0.05, // 0.01 --> global speed
				orbit: RADIUS * 0.7 + (RADIUS * 0.5 * Math.random()),
				planet: p,
			});
			s.setShadow(satelliteShadow);
			
		    canvas.add(s);
      		satellites.push(s);
		}
	}
	
	// ======================
	// === EVENT HANDLERS ===
	// ======================
	
	function documentMouseMoveHandler(event) {
		mouseX = event.clientX - (window.innerWidth - SCREEN_WIDTH) * .5;
		mouseY = event.clientY - (window.innerHeight - SCREEN_HEIGHT) * .5;
	}
	
	function documentMouseDownHandler(event) {
		for(var i = 0; i < planets.length; i++) {
			var p = planets[i];
			
			if(event.clientX >= p.left - p.radius - 10 && 
				event.clientX <= p.left + p.radius + 10 && 
				event.clientY >= p.top - p.radius - 10 && 
				event.clientY <= p.top + p.radius + 10) {
				target = p;
				break;
			}
		}
		
		if(target == null)
			target = "canvas";
	}
	
	function documentMouseUpHandler(event) {
		target = null;
	}
	
	function windowResizeHandler() {
		SCREEN_WIDTH = window.innerWidth;
    	SCREEN_HEIGHT = window.innerHeight;
    
    	canvas.setWidth(SCREEN_WIDTH);
    	canvas.setHeight(SCREEN_HEIGHT);
	}
	
	// =============
	// === UTILS ===
	// =============
	
	function distance(c1, c2) {
		var x1 = c1.left;
		var x2 = c2.left;
		var y1 = c1.top;
		var y2 = c2.top;
		
		return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
	}
	
	function numberOfSatellites(planet) {
		var count = 0;
		
		for(var i = 0; i < satellites.length; i++)
			if(satellites[i].planet == planet)
				count++;
		
		return count;
	}
	
	function setSize() {
		for(var i = 0; i < planets.length; i++) {
			var p = planets[i];
			var neighbors = numberOfSatellites(p);
			
			p.radius += ((neighbors) - p.radius) * 0.025;
      		p.radius = Math.max(p.radius, 2);
		}
	}
	
	// =================
	// === MAIN LOOP ===
	// =================
	
	function loop() {
		if(target) {
			target.left = mouseX;
			target.top = mouseY;	
		}
		
		if(target == "canvas")
			createPlanet(mouseX, mouseY);
		
		for(var i = 0; i < satellites.length; i++) {
			var s = satellites[i];
			
			// Rotation
			s.offset.x += s.speed;
			s.offset.y += s.speed;
			
			// Movement Effect
			s.mov.x += (s.planet.left - s.mov.x) * s.speed;
			s.mov.y += (s.planet.top - s.mov.y) * s.speed;
			
			// Change position
			s.left = s.mov.x + Math.cos(i + s.offset.x) * (s.orbit);
			s.top = s.mov.y + Math.sin(i + s.offset.y) * (s.orbit);
			
			// Check "attraction"
			for(var j = 0; j < planets.length; j++) {
				var p = planets[j];
				
				if(s.planet != p) {
					var d1 = distance(p, s);
					var d2 = distance(s.planet, s);
					
					if(d1 < d2)
						s.planet = p;
				}
			}
		}
		
		setSize();
		
		canvas.renderAll();
	}
};

window.onload = Universe.init;
