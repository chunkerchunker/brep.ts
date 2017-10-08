/// <reference path="../node_modules/ts3dutils/index.d.ts" />
/// <reference path="../node_modules/tsgl/index.d.ts" />

// Object.keys(ts3dutils).map(x => `import ${x} = ts3dutils.${x}`).join('\n')
import Tuple2 = ts3dutils.Tuple2
import Tuple3 = ts3dutils.Tuple3
import Tuple4 = ts3dutils.Tuple4
import FloatArray = ts3dutils.FloatArray
import raddd = ts3dutils.raddd
import V3 = ts3dutils.V3
import V = ts3dutils.V
import M4 = ts3dutils.M4
import Matrix = ts3dutils.Matrix
import Vector = ts3dutils.Vector
import P3YZ = ts3dutils.P3YZ
import P3ZX = ts3dutils.P3ZX
import P3XY = ts3dutils.P3XY
import Transformable = ts3dutils.Transformable
import TAU = ts3dutils.TAU
import NLA_DEBUG = ts3dutils.NLA_DEBUG
import NLA_PRECISION = ts3dutils.NLA_PRECISION
import disableConsole = ts3dutils.disableConsole
import enableConsole = ts3dutils.enableConsole
import hasConstructor = ts3dutils.hasConstructor
import getIntervals = ts3dutils.getIntervals
import assertVectors = ts3dutils.assertVectors
import assertInst = ts3dutils.assertInst
import assertNumbers = ts3dutils.assertNumbers
import assert = ts3dutils.assert
import assertNever = ts3dutils.assertNever
import assertf = ts3dutils.assertf
import lerp = ts3dutils.lerp
import eq0 = ts3dutils.eq0
import eq02 = ts3dutils.eq02
import eq = ts3dutils.eq
import eq2 = ts3dutils.eq2
import lt = ts3dutils.lt
import gt = ts3dutils.gt
import le = ts3dutils.le
import ge = ts3dutils.ge
import eqAngle = ts3dutils.eqAngle
import zeroAngle = ts3dutils.zeroAngle
import snap = ts3dutils.snap
import snap2 = ts3dutils.snap2
import snapEPS = ts3dutils.snapEPS
import snap0 = ts3dutils.snap0
import canonAngle = ts3dutils.canonAngle
import round10 = ts3dutils.round10
import floor10 = ts3dutils.floor10
import ceil10 = ts3dutils.ceil10
import GOLDEN_RATIO = ts3dutils.GOLDEN_RATIO
import repeatString = ts3dutils.repeatString
import mod = ts3dutils.mod
import arraySwap = ts3dutils.arraySwap
import arrayCopy = ts3dutils.arrayCopy
import clamp = ts3dutils.clamp
import between = ts3dutils.between
import fuzzyBetween = ts3dutils.fuzzyBetween
import randomColor = ts3dutils.randomColor
import mapPush = ts3dutils.mapPush
import arrayCopyStep = ts3dutils.arrayCopyStep
import arrayCopyBlocks = ts3dutils.arrayCopyBlocks
import arrayRange = ts3dutils.arrayRange
import arrayFromFunction = ts3dutils.arrayFromFunction
import fuzzyUniques = ts3dutils.fuzzyUniques
import fuzzyUniquesF = ts3dutils.fuzzyUniquesF
import addOwnProperties = ts3dutils.addOwnProperties
import defaultRoundFunction = ts3dutils.defaultRoundFunction
import forceFinite = ts3dutils.forceFinite
import floatHashCode = ts3dutils.floatHashCode
import combinations = ts3dutils.combinations
import arithmeticGeometricMean = ts3dutils.arithmeticGeometricMean
import EllipticF = ts3dutils.EllipticF
import EllipticE = ts3dutils.EllipticE
import DEG = ts3dutils.DEG
import rad2deg = ts3dutils.rad2deg
import numberToStr = ts3dutils.numberToStr
import SCE = ts3dutils.SCE
import STR = ts3dutils.STR
import isCCW = ts3dutils.isCCW
import doubleSignedArea = ts3dutils.doubleSignedArea
import pqFormula = ts3dutils.pqFormula
import solveCubicReal2 = ts3dutils.solveCubicReal2
import checkDerivate = ts3dutils.checkDerivate
import getRoots = ts3dutils.getRoots
import bisect = ts3dutils.bisect
import newtonIterate = ts3dutils.newtonIterate
import newtonIterate1d = ts3dutils.newtonIterate1d
import newtonIterateWithDerivative = ts3dutils.newtonIterateWithDerivative
import newtonIterateSmart = ts3dutils.newtonIterateSmart
import newtonIterate2d = ts3dutils.newtonIterate2d
import newtonIterate2dWithDerivatives = ts3dutils.newtonIterate2dWithDerivatives
import gaussLegendre24Xs = ts3dutils.gaussLegendre24Xs
import gaussLegendre24Weights = ts3dutils.gaussLegendre24Weights
import gaussLegendreQuadrature24 = ts3dutils.gaussLegendreQuadrature24
import glq24_11 = ts3dutils.glq24_11
import glqInSteps = ts3dutils.glqInSteps
import midpointRuleQuadrature = ts3dutils.midpointRuleQuadrature
import callsce = ts3dutils.callsce
import AABB = ts3dutils.AABB
import MINUS = ts3dutils.MINUS
import int = ts3dutils.int

import CustomMap = javasetmap_ts.JavaMap
import CustomSet = javasetmap_ts.JavaSet
import Pair = javasetmap_ts.Pair
import Equalable = javasetmap_ts.Equalable

import GL_COLOR = tsgl.GL_COLOR
import DRAW_MODES = tsgl.DRAW_MODES
import Mesh = tsgl.Mesh
import GL_COLOR_BLACK = tsgl.GL_COLOR_BLACK
import SHADER_VAR_TYPES = tsgl.SHADER_VAR_TYPES
import isArray = tsgl.isArray
import Shader = tsgl.Shader
import Texture = tsgl.Texture
import currentGL = tsgl.currentGL
import ShaderType = tsgl.ShaderType
import LightGLContext = tsgl.LightGLContext
import pushQuad = tsgl.pushQuad

const {PI, cos, sin, min, max, tan, sign, ceil, floor, abs, sqrt, pow, atan2, round} = Math
// import LightGLContext = tsgl.LightGLContext