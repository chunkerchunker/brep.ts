QUnit.module('PICurve')
QUnit.test('pointT', function (assert) {
    const pic = PICurve.forStartEnd(
        new ProjectedCurveSurface(
        	new BezierCurve(
        		V(0.20296874999999998, 0.11703124999999998, 1.2),
		        V(0.20296874999999998, 0.2240625, 1.2),
		        V(0.14500000000000002, 0.2890625, 1.2),
		        V(0.010937499999999989, 0.2890625, 1.2), 0, 1),
	        V(0, 0, -1), 0, 1, -Infinity, Infinity),
        new EllipsoidSurface(V3.O, V3.X, V3.Y, V3.Z),
	    V(0.010937499999999989, 0.2890625, -0.9572477433702835),
	    V(0.20296874999999998, 0.11703124999999998, -0.9721663299286162), 0.02, 1)
    const p = V(0.010937499999999989, 0.2890625, 0.9572477433702835)
    assert.ok(isNaN(pic.pointT(p)))
})
QUnit.test('isTsWithSurface', function (assert) {
    const pcs = new ProjectedCurveSurface(BezierCurve.EX2D, V3.Z, undefined, undefined, -2, 2).scale(0.2,0.2,1).rotateX(-90*DEG)
    const ses = SemiEllipsoidSurface.UNIT
    const pic = ses.isCurvesWithSurface(pcs)[0]
    testISTs(assert, pic, new PlaneSurface(P3.XY), 1)
})