/************************************************************************
 * Multiplayer Tower Defense Demo Client
 * Copyright (C) 2011, Corey Edmunds
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA
 ************************************************************************/

MultiDefense.Utilities = {};

MultiDefense.Utilities.Vec = function Vec(x, y) {
	this.x = x;
	this.y = y;
	
	this.equals = function(p) {
		return p && this.x == p.x && this.y == p.y;
	}
	
	this.subtract = function(o) {
		return new Vec(this.x-o.x, this.y-o.y);
	}
	
	this.add = function(o) {
		return new Vec(this.x+o.x, this.y+o.y);
	}
	
	this.magnitude = function() {
		return Math.sqrt(this.x*this.x+this.y*this.y);
	}
	
	this.normalize = function(o) {
		var mag = this.magnitude();
		return new Vec(this.x/mag, this.y/mag);
	}
	
	this.scale = function(scale) {
		return new Vec(this.x*scale, this.y*scale);
	}
}

MultiDefense.Utilities.log = function log(msg) {
    setTimeout(function() {
        throw new Error("" + new Date() + ": " + msg);
    }, 0);
}


MultiDefense.Utilities.cursorPosition = function(e) {
    var x;
    var y;

    if (e.pageX || e.pageY) {
      x = e.pageX;
      y = e.pageY;
    } else {
      x = e.clientX + document.body.scrollLeft +
           document.documentElement.scrollLeft;
      y = e.clientY + document.body.scrollTop +
           document.documentElement.scrollTop;
    }
    
    block = e.currentTarget;
    
 		while (block) {
 			x -= block.offsetLeft;
 			y -= block.offsetTop;
 			block = block.offsetParent;
 		}   
    
    return [x,y];
}
