"use strict"


class SketchBezier {
	a: SegmentEndPoint
	b: SegmentEndPoint
	id: number
	name: string
	sketch: Sketch
	points: SegmentEndPoint[]

	constructor(sketch: Sketch, x1?, y1?, x2?, y2?, x3?, y3?, x4?, y4?) {
		assertInst(Sketch, sketch)
		this.sketch = sketch
		this.points = [
			new SegmentEndPoint(x1, y1, this),
			new SegmentEndPoint(x4, y4, this),
			new SegmentEndPoint(x2, y2, this),
			new SegmentEndPoint(x3, y3, this)]
		this.a = this.points[0]
		this.b = this.points[1]
		this.id = globalId++
		this.name = "bezier" + this.id
		this.sketch = sketch
	}

	remove() {
		assert(editingSketch.elements.includes(this))
		this.removeFromSketch(editingSketch)
	}

	distanceToCoords(coords) {
		return this.distanceTo(coords.x, coords.y);
	}

	angleTo(segment) {
		assertInst(SketchLineSeg, segment)
		return segment.angleAB() - this.angleAB()
	}

	toString() {
		return "Bezier #" + this.id;
	}

	angleAB() {
		return atan2(this[3].y - this[0].y, this[3].x - this[0].x);
	}


	getOtherPoint(p) {
		if (p == this.a) return this.b
		if (p == this.b) return this.a
		assert(false)
	}

	distanceTo(x, y) {
		let p = V(x, y, 0)
		const curve = this.getCurve()
		let t = NLA.clamp(curve.closestTToPoint(p), 0, 1)
		return curve.at(t).distanceTo(p)
	}

	getClosestPoint(x, y) {
		assert(false)
	}

	/**
	 *
	 * @returns {BezierCurve}
	 */
	getCurve() {
		let p = this.points
		return new (Function.prototype.bind.apply(BezierCurve, [null, p[0], p[2], p[3], p[1]].map(p => p && p.V3())))
	}

	length() {
		return this.getCurve().arcLength(0, 1)
	}

	toBrepEdge() {
		let curve = this.getCurve()
		return new PCurveEdge(curve,
			this.a.V3(), this.b.V3(),
			0, 1,
			null,
			curve.tangentAt(0), curve.tangentAt(1), this.name + 'Edge')
	}


	static forBezierCurve(bezier, sketch) {
		let sb = new SketchBezier(sketch)
		let newSEPs = bezier.points.map(SegmentEndPoint.fromV3.bind(undefined, sb))
		sb.points = [newSEPs[0], newSEPs[3], newSEPs[1], newSEPs[2]]
		return sb
	}
}
NLA.registerClass(SketchBezier)