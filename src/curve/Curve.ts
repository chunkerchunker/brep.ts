type ISInfo = {tThis: number, tOther: number, p: V3}
abstract class Curve extends Transformable implements Equalable {
	tIncrement: number
	hlol: number

	'constructor':new (...args: any[]) => this

	constructor(readonly tMin: number, readonly tMax: number) {
		super()
		assertNumbers(tMin, tMax)
		assert('number' == typeof tMin && !isNaN(tMin))
		assert('number' == typeof tMax && !isNaN(tMax))
		assert(tMin < tMax)
	}

	toString() {
		return this.toSource()
	}
	toSource(rounder: (x: number) => number = x => x): string {
		return callsce.call(undefined, 'new ' + this.constructor.name, ...this.getConstructorParameters())
	}

	abstract getConstructorParameters(): any[]

	withBounds<T extends Curve>(this: T, tMin = this.tMin, tMax = this.tMax): T {
		assert(this.tMin <= tMin && tMin <= this.tMax)
		assert(this.tMin <= tMax && tMax <= this.tMax)
		assert(this.tMin <= tMax && tMax <= this.tMax)
		return new this.constructor(...this.getConstructorParameters().slice(0, -2), tMin, tMax)
	}

    /**
     * Curve parameter t for point p on curve.
     */
    abstract pointT(p: V3): number

	/**
	 * The point on the line that is closest to the given point.
	 */
	closestPointToPoint(p: V3): V3 {
		return this.at(this.closestTToPoint(p))
	}

	isValidT(t: number): boolean {
		return le(this.tMin, t) && le(t, this.tMax)
	}

	diff(t: number, eps: number): V3 {
		return this.at(t).to(this.at(t + eps))
	}


	closestTToPoint(p: V3, tStart?: number): number {
		// this.at(t) has minimal distance to p when this.tangentAt(t) is perpendicular to
		// the vector between this.at(t) and p. This is the case iff the dot product of the two is 0.
		// f = (this.at(t) - p) . (this.tangentAt(t)
		// df = this.tangentAt(t) . this.tangentAt(t) + (this.at(t) - p) . this.ddt(t)
		//    = this.tangentAt(t)² + (this.at(t) - p) . this.ddt(t)
		const f = t => this.at(t).minus(p).dot(this.tangentAt(t)) // 5th degree polynomial
		const df = t => this.tangentAt(t).squared() + (this.at(t).minus(p).dot(this.ddt(t)))

		const STEPS = 32
		const startT = undefined !== tStart ? tStart :
			arrayFromFunction(STEPS, i => this.tMin + (this.tMax - this.tMin) * i / STEPS)
				.withMax(t => -this.at(t).distanceTo(p))

		return newtonIterateWithDerivative(f, startT, 16, df)
	}

	/**
	 * So different edges on the same curve do not have different vertices, they are always generated
	 * on fixed points this.at(k * this.tIncrement), with k taking integer values
	 *
	 */
	calcSegmentPoints(aT: number, bT: number, a: V3, b: V3, reversed: boolean, includeFirst: boolean): V3[] {
		assert(this.tIncrement, 'tIncrement not defined on ' + this)
		const inc = this.tIncrement
		const points = []
		if (includeFirst) points.push(a)
		assert(reversed != aT < bT)
		if (aT < bT) {
			const start = Math.ceil((aT + NLA_PRECISION) / inc)
			const end = Math.floor((bT - NLA_PRECISION) / inc)
			for (let i = start; i <= end; i++) {
				points.push(this.at(i * inc))
			}
		} else {
			const start = Math.floor((aT - NLA_PRECISION) / inc)
			const end = Math.ceil((bT + NLA_PRECISION) / inc)
			for (let i = start; i >= end; i--) {
				points.push(this.at(i * inc))
			}
		}
		points.push(b)
		return points
	}

	/**
	 *
	 * @param p
	 * @param tStart Defines interval with tEnd in which a start value for t will be searched.
	 * Result is not necessarily in this interval.
	 * @param tEnd
	 */
	distanceToPoint(p: V3, tStart?: number, tEnd?: number) {
		const closestT = this.closestTToPoint(p, tStart, tEnd)
		return this.at(closestT).distanceTo(p)
	}

	asSegmentDistanceToPoint(p, tStart, tEnd) {
		let t = this.closestTToPoint(p, tStart, tEnd)
		t = clamp(t, tStart, tEnd)
		return this.at(t).distanceTo(p)
	}

	/**
	 * Behavior when curves are colinear: self intersections
	 */
	isInfosWithCurve(curve: Curve): ISInfo[] {
		return Curve.ispsRecursive(this, this.tMin, this.tMax, curve, curve.tMin, curve.tMax)
	}


	static integrate(curve: Curve, startT: number, endT: number, steps: int): number {
		const step = (endT - startT) / steps
		let length = 0
		let p = curve.at(startT)
		let i = 0, t = startT + step
		for (; i < steps; i++, t += step) {
			const next = curve.at(t)
			length += p.distanceTo(next)
			p = next
		}
		return length
	}

	/**
	 * Curve point at parameter t.
	 */
	abstract at(t: number): V3

	/**
	 * Tangent of curve at parameter t. This is also the first derivative of {@see at}
	 */
	abstract tangentAt(t: number): V3

	/**
	 * Derivative of tangentAt for parameter t at t.
	 */
	abstract ddt(t: number): V3

	abstract containsPoint(p: V3): boolean

	abstract isInfosWithLine(anchorWC: V3, dirWC: V3, tMin?: number, tMax?: number, lineMin?: number, lineMax?: number): ISInfo[]

	abstract transform(m4: M4, desc?: string): Curve

	abstract isTsWithSurface(surface: Surface): number[]

	abstract isTsWithPlane(plane: P3): number[]

	arcLength(startT: number, endT: number, steps?: int): number {
		assert(startT < endT, 'startT < endT')
		return glqInSteps(t => this.tangentAt(t).length(), startT, endT, steps)
	}

	/**
	 * iff for any t, this.at(t) == curve.at(t)
	 */
	abstract likeCurve(curve: Curve): boolean

	abstract equals(obj: any): boolean

    abstract hashCode(): int

	/**
	 * Return whether the curves occupy the same points in space. They do
	 * not necessarily need to share the same parameter values.
	 *
	 *
	 * iff for every t, there is an s so that this.at(t) == curve.at(s)
	 * and for every s, there is a t so that curve.at(s) == this.a(t)
	 */
	abstract isColinearTo(curve: Curve): boolean

	getAABB(tMin = this.tMin, tMax = this.tMax): AABB {
		tMin = isFinite(tMin) ? tMin : this.tMin
		tMax = isFinite(tMax) ? tMax : this.tMax
		const tMinAt = this.at(tMin), tMaxAt = this.at(tMax)
		const roots = this.roots()
		const mins = new Array(3), maxs = new Array(3)
		for (let dim = 0; dim < 3; dim++) {
			const tRoots = roots[dim]
			mins[dim] = Math.min(tMinAt.e(dim), tMaxAt.e(dim))
			maxs[dim] = Math.max(tMinAt.e(dim), tMaxAt.e(dim))
			for (const tRoot of tRoots) {
				if (tMin < tRoot && tRoot < tMax) {
					mins[dim] = Math.min(mins[dim], this.at(tRoot).e(dim))
					maxs[dim] = Math.max(maxs[dim], this.at(tRoot).e(dim))
				}
			}
		}
		return new AABB(V3.fromArray(mins), V3.fromArray(maxs))
	}

	static hlol = 0

    abstract roots(): number[][]

    static ispsRecursive(curve1: Curve, tMin: number, tMax: number, curve2: Curve, sMin: number, sMax: number): ISInfo[] {
        // the recursive function finds good approximates for the intersection points
        // curve1 function uses newton iteration to improve the result as much as possible
        function handleStartTS(startT: number, startS: number) {
            if (!result.some(info => eq(info.tThis, startT) && eq(info.tOther, startS))) {
                const f1 = (t: number, s: number) => curve1.tangentAt(t).dot(curve1.at(t).minus(curve2.at(s)))
                const f2 = (t: number, s: number) => curve2.tangentAt(s).dot(curve1.at(t).minus(curve2.at(s)))
                // f = (b1, b2, t1, t2) = b1.tangentAt(t1).dot(b1.at(t1).minus(b2.at(t2)))
                const dfdt1 = (b1, b2, t1, t2) => b1.ddt(t1).dot(b1.at(t1).minus(b2.at(t2))) + (b1.tangentAt(t1).squared())
                const dfdt2 = (b1, b2, t1, t2) => -b1.tangentAt(t1).dot(b2.tangentAt(t2))
                const ni = newtonIterate2dWithDerivatives(f1, f2, startT, startS, 16,
                    dfdt1.bind(undefined, curve1, curve2), dfdt2.bind(undefined, curve1, curve2),
                    (t, s) => -dfdt2(curve2, curve1, s, t), (t, s) => -dfdt1(curve2, curve1, s, t))
                assert(isFinite(ni.x))
                assert(isFinite(ni.y))
                if (ni == null) console.log(startT, startS, curve1.sce, curve2.sce)
                result.push({tThis: ni.x, tOther: ni.y, p: curve1.at(ni.x)})
            }
        }

        // returns whether an intersection was immediately found (i.e. without further recursion)
        function findRecursive(tMin: number, tMax: number, sMin: number, sMax: number,
                               curve1AABB: AABB, curve2AABB: AABB, depth = 0) {
            const EPS = NLA_PRECISION
            if (curve1AABB.fuzzyTouchesAABB(curve2AABB)) {
                const tMid = (tMin + tMax) / 2
                const sMid = (sMin + sMax) / 2
                if (Math.abs(tMax - tMin) < EPS || Math.abs(sMax - sMin) < EPS) {
                    handleStartTS(tMid, sMid)
                    return true
                } else {
                    const curve1AABBleft = curve1.getAABB(tMin, tMid)
                    const curve2AABBleft = curve2.getAABB(sMin, sMid)
                    let curve1AABBright, curve2AABBright
                    // if one of the following calls immediately finds an intersection, we don't want to call the others
                    // as that will lead to the same intersection being output multiple times
                    findRecursive(tMin, tMid, sMin, sMid, curve1AABBleft, curve2AABBleft, depth + 1)
                    || findRecursive(tMin, tMid, sMid, sMax, curve1AABBleft, curve2AABBright = curve2.getAABB(sMid, sMax), depth + 1)
                    || findRecursive(tMid, tMax, sMin, sMid, curve1AABBright = curve1.getAABB(tMid, tMax), curve2AABBleft, depth + 1)
                    || findRecursive(tMid, tMax, sMid, sMax, curve1AABBright, curve2AABBright, depth + 1)
                }
            }
            return false
        }

        const result: ISInfo[] = []
        findRecursive(tMin, tMax, sMin, sMax, curve1.getAABB(tMin, tMax), curve2.getAABB(sMin, sMax))
        return fuzzyUniquesF(result, info => info.tThis)
    }

	reversed(): Curve {
		throw new Error()
	}

	clipPlane(plane: P3): Curve[] {
		const ists = this.isTsWithPlane(plane).filter(ist => this.tMin <= ist && ist <= this.tMax)
		return getIntervals(ists, this.tMin, this.tMax).mapFilter(([a, b]) => {
			const midT = (a + b) / 2
			return !eq(a, b) && plane.distanceToPointSigned(this.at(midT)) < 0 && this.withBounds(a, b)
		})
	}

	static breakDownIC(implicitCurve: MathFunctionR2_R,
	                   {sMin, sMax, tMin, tMax}: {sMin: number, sMax: number, tMin: number, tMax: number},
	                   sStep: number, tStep: number,
	                   stepSize: number,
	                   dids?: R2_R,
	                   didt?: R2_R): {points: V3[], tangents: V3[]}[] {
		const EPS = 1 / (1 << 20)
		//undefined == dids && (dids = (s, t) => (implicitCurve(s + EPS, t) - implicitCurve(s, t)) / EPS)
		//undefined == didt && (didt = (s, t) => (implicitCurve(s, t + EPS) - implicitCurve(s, t)) / EPS)

		const bounds = (s, t) => sMin <= s && s <= sMax && tMin <= t && t <= tMax
		const deltaS = sMax - sMin, deltaT = tMax - tMin
		const sRes = ceil(deltaS / sStep), tRes = ceil(deltaT / tStep)
		const grid = new Array(sRes * tRes).fill(0)
		arrayFromFunction(tRes, i => grid.slice(sRes * i, sRes * (i + 1)).map(v => v ? 'X' : '_').join('')).join('\n')
		const at = (i: int, j: int) => grid[j * sRes + i]
		const set = (i: int, j: int) => 0 <= i && i < sRes && 0 <= j && j < tRes && (grid[j * sRes + i] = 1)
		const result: {points: V3[], tangents: V3[]}[] = []
		const logTable = []
		for (let i = 0; i < sRes; i++) {
			search: for (let j = 0; j < tRes; j++) {
				if (at(i, j)) continue
				set(i, j)
				let s = sMin + (i + 0.5) * sStep, t = tMin + (j + 0.5) * tStep
				const startS = s, startT = t
				// basically curvePoint
				for (let k = 0; k < 8; k++) {
					const fp = implicitCurve(s, t)
					const dfpdx = implicitCurve.x(s, t), dfpdy = implicitCurve.y(s, t)
					if(0 == dfpdx * dfpdx + dfpdy * dfpdy) {
						// top of a hill, keep looking
						continue search
					}
					const scale = fp / (dfpdx * dfpdx + dfpdy * dfpdy)
					s -= scale * dfpdx
					t -= scale * dfpdy
				}
				const li = floor((s - sMin) / sStep), lj = floor((t - tMin) / tStep)
				logTable.push({i, j, li, lj, startS, startT, s, t, 'bounds(s, t)': bounds(s, t), 'ic(s,t)': implicitCurve(s, t)})
				if (!(i == li && j == lj) && at(li, lj)) {
					continue search
				}
				set(li, lj)
				// s, t are now good starting coordinates to use follow algo
				if (bounds(s, t) && eq0(implicitCurve(s, t))) {
					console.log(V(s, t).sce)
					const subresult = mkcurves(implicitCurve, s, t, stepSize, implicitCurve.x, implicitCurve.y, bounds)
					for (const curvedata of subresult) {
					assert (curvedata.points.length> 2)
						for (const {x, y} of curvedata.points) {
							const lif = (x - sMin) / sStep, ljf = (y - tMin) / tStep
							set((lif - 0.5) | 0, (ljf - 0.5) | 0)
							set((lif - 0.5) | 0, (ljf + 0.5) | 0)
							set((lif + 0.5) | 0, (ljf - 0.5) | 0)
							set((lif + 0.5) | 0, (ljf + 0.5) | 0)
						}
					}
					result.pushAll(subresult)
				}

			}
		}
		//console.table(logTable)
		for (const {points} of result) {
			for (let i = 0; i < points.length - 1; i++) {
				assert(!points[i].equals(points[i + 1]))
			}
		}
		return result
	}

}

function mkcurves(implicitCurve: MathFunctionR2_R,
                  sStart: number, tStart: number,
                  stepSize: number,
                  dids: R2_R,
                  didt: R2_R,
                  bounds: (s: number, t: number) => boolean): {points: V3[], tangents: V3[]}[] {
	const start = V(sStart, tStart)
	checkDerivate(s => implicitCurve(s, 0), s => dids(s, 0), -1, 1, 0)
	checkDerivate(t => implicitCurve(0, t), t => didt(0, t), -1, 1, 0)
	const {points, tangents} = followAlgorithm2d(implicitCurve, start, stepSize, bounds)
	if (points[0].distanceTo(points.last()) < stepSize && points.length > 2) {
		// this is a loop: split it
		for (let i = 0; i < points.length - 1; i++) {
			assert(!points[i].equals(points[i + 1]))
		}
		const half = floor(points.length / 2)
		const points1 = points.slice(0, half), points2 = points.slice(half - 1, points.length)
		const tangents1 = tangents.slice(0, half), tangents2 = tangents.slice(half - 1, tangents.length)
		tangents2[tangents2.length - 1] = tangents1[0]
		points2[tangents2.length - 1] = points1[0]
		for (let i = 0; i < points1.length - 1; i++) {
			assert(!points1[i].equals(points1[i + 1]))
		}
		for (let i = 0; i < points2.length - 1; i++) {
			assert(!points2[i].equals(points2[i + 1]))
		}
		return [{points: points1, tangents: tangents1}, {points: points2, tangents: tangents2}]
	} else {
		// not a loop: check in the other direction
		const {points: reversePoints, tangents: reverseTangents} = followAlgorithm2d(implicitCurve, start, -stepSize, bounds)
		const result = followAlgorithm2d(implicitCurve, reversePoints.last(), stepSize, bounds, undefined, reverseTangents.last().negated())
		assert(result.points.length > 2)
		return [result]
	}
}

type R2_R = (s: number, t: number) => number
function curvePoint(implicitCurve: R2_R, startPoint: V3,
                    dids: R2_R,
                    didt: R2_R) {
	const eps = 1 / (1 << 20)
	let p = startPoint
	for (let i = 0; i < 8; i++) {
		const fp = implicitCurve(p.x, p.y)
		const dfpdx = dids(p.x, p.y), dfpdy = didt(p.x, p.y)
		const scale = fp / (dfpdx * dfpdx + dfpdy * dfpdy)
		//console.log(p.$)
		p = p.minus(new V3(scale * dfpdx, scale * dfpdy, 0))
	}
	return p
}
function curvePointMF(mf: MathFunctionR2_R, startPoint: V3, steps: int = 8, eps: number = 1 / (1 << 30)) {
	let p = startPoint
	for (let i = 0; i < steps; i++) {
		const fp = mf(p.x, p.y)
		const dfpdx = mf.x(p.x, p.y), dfpdy = mf.y(p.x, p.y)
		const scale = fp / (dfpdx * dfpdx + dfpdy * dfpdy)
		//console.log(p.$)
		p = p.minus(new V3(scale * dfpdx, scale * dfpdy, 0))
		if (abs(fp) <= eps) break
	}
	return p
}