/**
 * x² - y² = 1
 *
 * @class HyperbolaCurve
 * @property {V3} center
 * @property {V3} f1
 * @property {V3} f2
 * @property {V3} normal
 * @property {M4} matrix
 * @property {M4} inverseMatrix
 */
class HyperbolaCurve extends Curve {
	/**
	 *
	 * @param {V3} center
	 * @param {V3} f1
	 * @param {V3} f2
	 */
	constructor(center, f1, f2) {
		super()
		assertVectors(center, f1, f2)
		this.center = center
		this.f1 = f1
		this.f2 = f2
		this.normal = f1.cross(f2).normalized()
		this.matrix = M4.forSys(f1, f2, this.normal, center)
		this.inverseMatrix = this.matrix.inversed()
	}

	toSource() {
		return `new HyperbolaCurve(${this.center} ${this.f1} ${this.f2})`
	}

	at(t) {
		return this.center.plus(this.f1.times(Math.cosh(t))).plus(this.f2.times(Math.sinh(t)))
	}

	at2(xi, eta) {
		return this.center.plus(this.f1.times(xi)).plus(this.f2.times(eta))
	}

	tangentAt(t) {
		assertNumbers(t)
		return this.f1.times(Math.sinh(t)).plus(this.f2.times(Math.cosh(t)))
	}

	ddt(t) {
		assertNumbers(t)
		return this.f1.times(Math.cosh(t)).plus(this.f2.times(Math.sinh(t)))
	}

	tangentAt2(xi, eta) {
		return this.f1.times(eta).plus(this.f2.times(xi))
	}

	isCircular() {
		return NLA.equals(this.f1.length(), this.f2.length())
	}

	equals(curve) {
		return curve.constructor == HyperbolaCurve
			&& this.center.like(curve.center)
			&& this.f1.like(curve.f1)
			&& this.f2.like(curve.f2)
	}

	/**
	 *
	 * @param {Curve} curve
	 * @returns {boolean}
	 */
	isColinearTo(curve) {
		if (curve.constructor != HyperbolaCurve) {
			return false
		}
		if (!curve.center || !this.center.like(curve.center)) {
			return false
		}
		if (this === curve) {
			return true
		}
		assert(false)
		var {f1: f1, f2: f2} = this.rightAngled(), {f1: c1, f2: c2} = curve.rightAngled()
		return NLA.equals(f1.lengthSquared(), Math.abs(f1.dot(c1)))
			&& NLA.equals(f2.lengthSquared(), Math.abs(f2.dot(c2)))
	}

	normalAt(t) {
		return this.tangentAt(t).cross(this.normal)
	}

	pointLambda(p, hint) {
		assertVectors(p)
		var p2 = this.inverseMatrix.transformPoint(p)
		return Math.asinh(p2.y)
	}

	isOrthogonal(p) {
		return this.f1.isPerpendicularTo(this.f2)
	}

	/**
	 *
	 * @returns {HyperbolaCurve}
	 */
	rightAngled() {
		var f1 = this.f1, f2 = this.f2, a = f1.dot(f2), b = f2.lengthSquared() + f1.lengthSquared()
		if (NLA.isZero(a)) {
			return this
		}
		var g1 = 2 * a, g2 = b + Math.sqrt(b * b - 4 * a * a)
		var {x1: xi, y1: eta} = intersectionUnitHyperbolaLine(g1, g2, 0)
		return new HyperbolaCurve(this.center, f1.times(xi).plus(f2.times(eta)), f1.times(eta).plus(f2.times(xi)))
	}

	transform(m4) {
		return new HyperbolaCurve(m4.transformPoint(this.center), m4.transformVector(this.f1), m4.transformVector(this.f2))
	}

	/**
	 *
	 * @returns {number}
	 */
	eccentricity() {
		var mainAxes = this.mainAxes()
		var f1length = mainAxes.f1.length(), f2length = mainAxes.f1.length()
		var [a, b] = f1length > f2length ? [f1length, f2length] : [f2length, f1length]
		return Math.sqrt(1 + b * b / a / a)
	}

	isTsWithSurface(surface) {
		assert(false)
	}

	/**
	 * @inheritDoc
	 */
	isTsWithPlane(plane) {
		assert(false)
	}

	getPlane() {
		return P3.normalOnAnchor(this.normal, this.center)
	}

	containsPoint(p) {
		var localP = this.inverseMatrix.transformPoint(p)
		return localP.x > 0 && NLA.isZero(localP.z) && NLA.equals(1, localP.x * localP.x - localP.y * localP.y)
	}

	static forAB(a, b, center) {
		return new HyperbolaCurve(center || V3.ZERO, V3(a, 0, 0), V3(0, b, 0))
	}
}

HyperbolaCurve.UNIT = new HyperbolaCurve(V3.ZERO, V3.X, V3.Y)