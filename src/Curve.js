/**
 * @template T
 * @extends Transformable.<T>
 */
class Curve extends Transformable {

	/**
	 * Returns curve parameter t for point p on curve.
	 * @abstract
	 * @param {V3} p
	 * @returns {number}
	 */
	pointLambda(p) {
		assert(false, "Not implemented on " + this.constructor.name)
	}

	/**
	 * So different edges on the same curve do not have different vertices, they are always generated
	 * on fixed points this.at(k * this.tIncrement), with k taking integer values
	 *
	 * @param {number} aT
	 * @param {number} bT
	 * @param {V3} a
	 * @param {V3} b
	 * @param {boolean} reversed
	 * @param {boolean} includeFirst
	 * @returns {Array.<V3>}
	 */
	calcSegmentPoints(aT, bT, a, b, reversed, includeFirst) {
		assert(this.tIncrement, "tIncrement not defined on " + this)
		var split = 4 * 62, inc = this.tIncrement
		var verts = []
		if (includeFirst) verts.push(a)
		if (!reversed) {
			assert(aT < bT)
			let start = Math.ceil((aT + NLA.PRECISION) / inc)
			let end = Math.floor((bT - NLA.PRECISION) / inc)
			for (let i = start; i <= end; i++) {
				verts.push(this.at(i * inc))
			}
		} else {
			assert(bT < aT)
			let start = Math.floor((aT - NLA.PRECISION) / inc)
			let end = ceil((bT + NLA.PRECISION) / inc)
			for (let i = start; i >= end; i--) {
				verts.push(this.at(i * inc))
			}
		}
		verts.push(b)
		return verts
	}

	/**
	 *
	 * @param {V3} p
	 * @returns {number}
	 */
	distanceToPoint(p) {
		return this.at(this.closestTToPoint(p)).distanceTo(p)
	}

	/**
	 *
	 * @abstract
	 * @param curve
	 * @returns {{tThis:number, tOther:number, p:V3}[]}
	 */
	isInfosWithCurve(curve) {
		assert(false, "Not implemented on " + this.constructor.name)
	}

	/**
	 *
	 * @abstract
	 * @param {number} t
	 * @returns {V3}
	 */
	at(t) {
		assert(false, "Not implemented on " + this.constructor.name)
	}

	/**
	 *
	 * @abstract
	 * @param {number} t
	 * @returns {V3}
	 */
	tangentAt(t) {
		assert(false, "Not implemented on " + this.constructor.name)
	}

	/**
	 * Derivative of tangentAt(t) for parameter t
	 * @abstract
	 * @param {number} t
	 * @returns {V3}
	 */
	ddt(t) {
		assert(false, "Not implemented on " + this.constructor.name)
	}

	/**
	 * @abstract
	 * @param {V3} p
	 * @returns {boolean}
	 */
	containsPoint(p) {
		assert(false, "Not implemented on " + this.constructor.name)
	}

	/**
	 *
	 * @abstract
	 * @param {Surface} surface
	 * @returns {number[]}
	 */
	isTsWithSurface(surface) {
		assert(false, "Not implemented on " + this.constructor.name)
	}

	/**
	 *
	 * @abstract
	 * @param {P3} plane
	 * @returns {number[]}
	 */
	isTsWithPlane(plane) {
		assert(false, "Not implemented on " + this.constructor.name)
	}

	/**
	 * Should really be abstract, but it works for all teh conic is curves, so it's here.
	 * @param mesh
	 * @param bufferName
	 */
	debugToMesh(mesh, bufferName) {
		mesh[bufferName] || mesh.addVertexBuffer(bufferName, bufferName)
		for (var t = -Math.PI; t < Math.PI; t += 0.1) {
			var p = this.at(t);
			mesh[bufferName].push(p, p.plus(this.tangentAt(t).toLength(1)))
			mesh[bufferName].push(p, p.plus(this.normalAt(t).toLength(1)))
		}
		mesh[bufferName].push(this.center, this.center.plus(this.f1.times(1.2)))
		mesh[bufferName].push(this.center, this.center.plus(this.f2))
		mesh[bufferName].push(this.center, this.center.plus(this.normal))
	}

	arcLength(startT, endT, steps) {
		assert(startT < endT, 'startT < endT')
		return gaussLegendreQuadrature24(t => this.tangentAt(t).length(), startT, endT)
		//return integrateCurve(this, startT, endT, steps || 1024)
	}

	/**
	 *
	 * iff for any t, this.at(t) == curve.at(t)
	 *
	 * @abstract
	 * @param {Curve} curve
	 * @returns {boolean}
	 */
	likeCurve(curve) {
		assert(false, "Not implemented on " + this.constructor.name)
	}

	/**
	 * Return whether the curves occupy the same points in space. They do
	 * not necessarily need to share the same parameter values.
	 *
	 *
	 * iff for every t, there is an s so that this.at(t) == curve.at(s)
	 * and for every s, there is a t so that curve.at(s) == this.a(t)
	 *
	 * @abstract
	 * @param {Curve} curve
	 * @returns {boolean}
	 */
	isColinearTo(curve) {
		assert(false, "Not implemented on " + this.constructor.name)
	}
}
Curve.hlol = 0