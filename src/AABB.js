
function AABB(min = V3.INF, max = V3.INF.negated()) {
	assertVectors(min)
	assertVectors(max)
	this.min = min
	this.max = max
}
AABB.prototype = {
	addPoint: function (p) {
		assertVectors(p)
		this.min = this.min.min(p)
		this.max = this.max.max(p)
		return this
	},
	addPoints: function (ps) {
		ps.forEach(p => this.addPoint(p))
		return this
	},
	addAABB: function (aabb) {
		assertInst(AABB, aabb)
		this.addPoint(aabb.min)
		this.addPoint(aabb.max)
	},
	/**
	 * Returns the largest AABB contained in this which doesn't overlap with aabb
	 * @param aabb
	 */
	withoutAABB: function (aabb) {
		assertInst(AABB, aabb)
		var min, max
		var volume = this.volume(), size = this.size()
		var remainingVolume = -Infinity
		for (var i = 0; i < 3; i++) {
			var dim = ["x", "y", "z"][i]
			var cond = aabb.min[dim] - this.min[dim] > this.max[dim] - aabb.max[dim]
			var dimMin = cond ? this.min[dim] : Math.max(this.min[dim], aabb.max[dim])
			var dimMax = !cond ? this.max[dim] : Math.min(this.max[dim], aabb.min[dim])
			var newRemainingVolume = (dimMax - dimMin) * volume / size[dim]
			if (newRemainingVolume > remainingVolume) {
				remainingVolume = newRemainingVolume
				min = this.min.withElement(dim, dimMin)
				max = this.max.withElement(dim, dimMax)
			}
		}
		return new AABB(min, max)
	},
	getIntersectionAABB: function (aabb) {
		assertInst(AABB, aabb)
		return new AABB(this.min.max(aabb.min), this.max.min(aabb.max))
	},
	touchesAABB: function (aabb) {
		assertInst(AABB, aabb)
		return !(
		this.min.x > aabb.max.x || this.max.x < aabb.min.x
		|| this.min.y > aabb.max.y || this.max.y < aabb.min.y
		|| this.min.z > aabb.max.z || this.max.z < aabb.min.z)
	},
	intersectsAABB: function (aabb) {
		assertInst(AABB, aabb)
		return !(
		this.min.x >= aabb.max.x || this.max.x <= aabb.min.x
		|| this.min.y >= aabb.max.y || this.max.y <= aabb.min.y
		|| this.min.z >= aabb.max.z || this.max.z <= aabb.min.z)
	},
	intersectsAABB2d: function (aabb) {
		assertInst(AABB, aabb)
		return !(
		this.min.x >= aabb.max.x || this.max.x <= aabb.min.x
		|| this.min.y >= aabb.max.y || this.max.y <= aabb.min.y)
	},
	containsPoint: function (p) {
		assertVectors(p)
		return this.min.x <= p.x && this.min.y <= p.y && this.min.z <= p.z
			 && this.max.x >= p.x && this.max.y >= p.y && this.max.z >= p.z
	},
	containsSphere: function (center, radius) {
		assertVectors(center)
		NLA.assertNumbers(radius)
		return this.distanceToPoint(center) > radius
	},
	intersectsSphere: function (center, radius) {
		assertVectors(center)
		NLA.assertNumbers(radius)
		return this.distanceToPoint(center) <= radius
	},
	distanceToPoint: function (p) {
		assertVectors(p)
		var x = p.x, y = p.y, z = p.z
		var min = this.min, max = this.max
		if (this.containsPoint(p)) {
			return Math.max(
				min.x - x, x - max.x,
				min.y - y, y - max.y,
				min.z - z, z - max.z)
		}
		return p.distanceToPoint(V3(
			NLA.clamp(x, min.x, max.x),
			NLA.clamp(y, min.y, max.y),
			NLA.clamp(z, min.z, max.z)))
	},
	containsAABB: function (aabb) {
		assertInst(AABB, aabb)
		return this.containsPoint(aabb.min) && this.containsPoint(aabb.max)
	},
	likeAABB: function (aabb) {
		assertInst(AABB, aabb)
		return this.min.like(aabb.min) && this.max.like(aabb.max)
	},
	intersectsLine: function (l3) {
		assertInst(L3, l3)
		var maxDim = l3.dir1.absMaxDim()
		var [coord0, coord1] = [['y', 'z'], ['z', 'x'], ['x', 'y']][maxDim]
		var s0 = (this.min[maxDim] - l3.anchor[maxDim]) / l3.dir1[maxDim]
		var s1 = (this.max[maxDim] - l3.anchor[maxDim]) / l3.dir1[maxDim]
		var sMin = Math.min(s0, s1)
		var sMax = Math.max(s0, s1)
		var c = l3.dir1[coord0] * l3.anchor[coord1] - l3.anchor[coord0] * l3.dir1[coord1]
		function lineSide(pCoord0, pCoord1) {
			return l3.dir1[coord1] * pCoord0 + l3.dir1[coord0] * pCoord1 + c
		}
		var sideBL = lineSide()
	},
	hasVolume: function () {
		return this.min.x <= this.max.x && this.min.y <= this.max.y && this.min.z <= this.max.z
	},
	volume: function () {
		if (!this.hasVolume()) {
			return -1
		}
		var v = this.max.minus(this.min)
		return v.x * v.y * v.z
	},
	size: function () {
		return this.max.minus(this.min)
	},
	getCenter: function () {
		return this.min.plus(this.max).div(2)
	},
	transform: function (m4) {
		assertInst(M4, m4)
		assert(m4.isAxisAligned())
		var aabb = new AABB()
		aabb.addPoint(m4.transformPoint(this.min))
		aabb.addPoint(m4.transformPoint(this.max))
		return aabb
	},
	ofTransformed: function (m4) {
		assertInst(M4, m4)
		var aabb = new AABB()
		aabb.addPoints(m4.transformedPoints(this.corners()))
		return aabb
	},
	corners: function () {
		var min = this.min, max = this.max
		return [
			min,
			V3(min.x, min.y, max.z),
			V3(min.x, max.y, min.z),
			V3(min.x, max.y, max.z),

			V3(max.x, min.y, min.z),
			V3(max.x, min.y, max.z),
			V3(max.x, max.y, min.z),
			max
		]
	},

	toString: function () {
		return "new AABB("+this.min.toString()+", "+this.max.toString()+")"
	},
	toSource: function () {
		return this.toString()
	},

	toMesh: function () {
		let matrix = M4.multiplyMultiple(
			M4.translation(this.min),
			M4.scaling(this.size().max(V3(NLA.PRECISION, NLA.PRECISION, NLA.PRECISION))))
		console.log(matrix.str)
		console.log(matrix.inversed().transposed().str)
		let mesh = GL.Mesh.cube()
		console.log(mesh)
		// mesh.vertices = this.corners()
		mesh = mesh.transform(matrix)
		console.log(matrix.transformedPoints(mesh.vertices))
		mesh.compile()

		return mesh
	}
}
NLA.addOwnProperties(AABB.prototype, Transformable.prototype)
console.log(Object.getOwnPropertyNames(Transformable.prototype))

function RangeTree(vals, start, end) {
	start = start || 0
	end = end || vals.length
	var m = (end - start)
	if (m == 1) {
		return new Number(vals[start])
	} else {
		var p = start + Math.floor(m / 2), s = (vals[p-1] + vals[p]) / 2
		this.s = s
		this.left = new RangeTree(vals, start, p)
		this.right = new RangeTree(vals, p, end)
		this.ints = []
		this.containsIntervals = 0
		this.next = this.prev = null
	}
}
RangeTree.prototype.addIntervals = function (intervals) {
	intervals.forEach(int => addTo(this, int))
	function addTo(x, int) {
		if (int.right < x.s) {
			x.containsIntervals++
			addTo(x.left, int)
		} else if (int.left > x.s) {
			x.containsIntervals++
			addTo(x.right, int)
		} else {
			x.containsIntervals++
			x.ints.push(int)
		}
	}
}
var last = null
RangeTree.prototype.removeInterval = function (interval) {
	while (true) {
		if (interval.right < x.s) {
			x.containsIntervals--
			x = x.left
		} else if (interval.left > x.s) {
			x.containsIntervals--
			x = x.right
		} else {
			x.containsIntervals--
			x.ints.remove(interval)
			if (0 == x.containsIntervals) {
				if (x.prev) {
					x.prev.next = x.next
				}
				if (x.next) {
					x.next.prev = x.prev
				} else {
					// x is last in list
					last = x.prev
				}
			}
			break
		}
	}
}
RangeTree.prototype.addInterval = function (interval) {
	var x = this
	function findRightOfRecursiveInOrder (x, s) {
		if (!x.containsIntervals) return null
		var res
		if (x.s > s && (res = findRightOfRecursiveInOrder(x.left, s))) {
			return res
		}
		if (x.s > s && 0 != x.ints.length) return x
		if (res = findRightOfRecursiveInOrder(x.right, s)) {
			return res
		}

	}
	while (true) {
		if (interval.right < x.s) {
			x.containsIntervals++
			x = x.left
		} else if (interval.left > x.s) {
			x.containsIntervals++
			x = x.right
		} else {
			x.containsIntervals++
			x.ints.push(interval)
			if (1 == x.containsIntervals) {
				var nextNode = findRightOfRecursiveInOrder(this, x.s)
				if (nextNode) {
					if (nextNode.prev) {
						x.prev = nextNode.prev
						x.prev.next = x
					}
					nextNode.prev = x
					x.next = nextNode
				} else {
					// this is the (new) last node in the list
					if (last && last != x) {
						x.prev = last
						last.next = x
					}
					last = x
				}
			}
			break
		}
	}
}
RangeTree.prototype.getIntervals = function (interval) {
	var u = this
	function getPath(a, b, u) {
		var P = []
		while (true) {
			P.push(u)
			if (b < u.s) {
				u = u.left
			} else if (u.s < a) {
				u = u.right
			} else {
				break
			}
		}
		return P
	}
	function addIntersections(nodes, result) {
		nodes.forEach(node => {
			if (node.s < interval.left) {
				node.ints.forEach(int => {
					if (int.right >= interval.left) {
						result.push(int)
					}
				})
			} else if (interval.right < node.s) {
				node.ints.forEach(int => {
					if (int.right >= interval.left) {
						result.push(int)
					}
				})
			} else {
				Array.prototype.push.apply(result, node.ints)
			}
		})
	}
	var P1 = getPath(this, interval.left, interval.right)
	var P2 = getPath(u1.left, interval.left, interval.left)
	var P3 = getPath(u1.left, interval.right, interval.right)
	var result = []
	addIntersections(P1, result)
	addIntersections(P2, result)
	addIntersections(P3, result)

}
RangeTree.prototype.toString = function (a) {
	a = a || 0
	return `${this.s} next: ${this.next && this.next.s}, prev: ${this.prev && this.prev.s} `
		+` ${this.containsIntervals}/`+ this.ints.toSource()
		+ "\n" + NLA.repeatString(a + 1, "  ") + (Number.isFinite(this.left) ? this.left : this.left.toString(a + 1))
		+ "\n" + NLA.repeatString(a + 1, "  ") + (Number.isFinite(this.right) ? this.right : this.right.toString(a + 1))
}
/*
var rt = new RangeTree([-2, -1, 0,2,3,4,7-1,7]);
rt.addInterval({left: -1, right: 6})
rt.addInterval({left: -2, right: 3})
rt.addInterval({left: 0, right: 4})
rt.addInterval({left: 2, right: 7})
rt.addInterval({left: 3, right: 4})
rt.addInterval({left: -2, right: -1})
console.log(rt.toString())
NLA.addTransformationMethods(AABB.prototype)
AABB.intersections = function (aabbs) {

}
*/