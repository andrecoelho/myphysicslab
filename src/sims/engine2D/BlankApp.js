// Copyright 2016 Erik Neumann.  All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('myphysicslab.sims.engine2D.BlankApp');

goog.require('myphysicslab.lab.engine2D.CircularEdge');
goog.require('myphysicslab.lab.engine2D.ConcreteVertex');
goog.require('myphysicslab.lab.engine2D.ContactSim');
goog.require('myphysicslab.lab.engine2D.ExtraAccel');
goog.require('myphysicslab.lab.engine2D.Joint');
goog.require('myphysicslab.lab.engine2D.Polygon');
goog.require('myphysicslab.lab.engine2D.Scrim');
goog.require('myphysicslab.lab.engine2D.Shapes');
goog.require('myphysicslab.lab.engine2D.StraightEdge');
goog.require('myphysicslab.lab.engine2D.ThrusterSet');
goog.require('myphysicslab.lab.engine2D.Walls');
goog.require('myphysicslab.lab.graph.AutoScale');
goog.require('myphysicslab.lab.graph.DisplayGraph');
goog.require('myphysicslab.lab.graph.EnergyBarGraph');
goog.require('myphysicslab.lab.graph.GraphLine');
goog.require('myphysicslab.lab.model.Arc');
goog.require('myphysicslab.lab.model.CollisionAdvance');
goog.require('myphysicslab.lab.model.ConstantForceLaw');
goog.require('myphysicslab.lab.model.CoordType');
goog.require('myphysicslab.lab.model.DampingLaw');
goog.require('myphysicslab.lab.model.ExpressionVariable');
goog.require('myphysicslab.lab.model.Force');
goog.require('myphysicslab.lab.model.ForceLaw');
goog.require('myphysicslab.lab.model.Gravity2Law');
goog.require('myphysicslab.lab.model.GravityLaw');
goog.require('myphysicslab.lab.model.Line');
goog.require('myphysicslab.lab.model.ModifiedEuler');
goog.require('myphysicslab.lab.model.PointMass');
goog.require('myphysicslab.lab.model.RungeKutta');
goog.require('myphysicslab.lab.model.SimList');
goog.require('myphysicslab.lab.model.SimObject');
goog.require('myphysicslab.lab.model.Spring');
goog.require('myphysicslab.lab.util.AffineTransform');
goog.require('myphysicslab.lab.util.Clock');
goog.require('myphysicslab.lab.util.ClockTask');
goog.require('myphysicslab.lab.util.DoubleRect');
goog.require('myphysicslab.lab.util.ParameterBoolean');
goog.require('myphysicslab.lab.util.ParameterNumber');
goog.require('myphysicslab.lab.util.ParameterString');
goog.require('myphysicslab.lab.util.RandomLCG');
goog.require('myphysicslab.lab.util.Terminal');
goog.require('myphysicslab.lab.util.Util');
goog.require('myphysicslab.lab.util.Vector');
goog.require('myphysicslab.lab.view.DisplayClock');
goog.require('myphysicslab.lab.view.DisplayLine');
goog.require('myphysicslab.lab.view.DisplayShape');
goog.require('myphysicslab.lab.view.DisplaySpring');
goog.require('myphysicslab.lab.view.DisplayText');
goog.require('myphysicslab.lab.view.HorizAlign');
goog.require('myphysicslab.lab.view.LabCanvas');
goog.require('myphysicslab.lab.view.ScreenRect');
goog.require('myphysicslab.lab.view.SimView');
goog.require('myphysicslab.lab.view.VerticalAlign');
goog.require('myphysicslab.sims.common.CommonControls');
goog.require('myphysicslab.sims.common.TabLayout');
goog.require('myphysicslab.sims.engine2D.Engine2DApp');

goog.scope(function() {

var lab = myphysicslab.lab;
var sims = myphysicslab.sims;

var AffineTransform = lab.util.AffineTransform;
var Arc = lab.model.Arc;
var AutoScale = lab.graph.AutoScale;
var CircularEdge = lab.engine2D.CircularEdge;
var Clock = lab.util.Clock;
var ClockTask = lab.util.ClockTask;
var CollisionAdvance = lab.model.CollisionAdvance;
var CommonControls = sims.common.CommonControls;
var ConcreteVertex = lab.engine2D.ConcreteVertex;
var ConstantForceLaw = lab.model.ConstantForceLaw;
var ContactSim = lab.engine2D.ContactSim;
var CoordType = lab.model.CoordType;
var DampingLaw = lab.model.DampingLaw;
var DisplayClock = lab.view.DisplayClock;
var DisplayGraph = lab.graph.DisplayGraph;
var DisplayLine = lab.view.DisplayLine;
var DisplayShape = lab.view.DisplayShape;
var DisplaySpring = lab.view.DisplaySpring;
var DisplayText = lab.view.DisplayText;
var DoubleRect = lab.util.DoubleRect;
var EnergyBarGraph = lab.graph.EnergyBarGraph;
var Engine2DApp = sims.engine2D.Engine2DApp;
var ExpressionVariable = lab.model.ExpressionVariable;
var ExtraAccel = lab.engine2D.ExtraAccel;
var Force = lab.model.Force;
var ForceLaw = lab.model.ForceLaw;
var GraphLine = lab.graph.GraphLine;
var Gravity2Law = lab.model.Gravity2Law;
var GravityLaw = lab.model.GravityLaw;
var HorizAlign = lab.view.HorizAlign;
var Joint = lab.engine2D.Joint;
var LabCanvas = lab.view.LabCanvas;
var Line = lab.model.Line;
var ModifiedEuler = lab.model.ModifiedEuler;
var ParameterBoolean = lab.util.ParameterBoolean;
var ParameterNumber = lab.util.ParameterNumber;
var ParameterString = lab.util.ParameterString;
var PointMass = lab.model.PointMass;
var Polygon = lab.engine2D.Polygon;
var RandomLCG = lab.util.RandomLCG;
var RungeKutta = lab.model.RungeKutta;
var ScreenRect = lab.view.ScreenRect;
var Scrim = lab.engine2D.Scrim;
var Shapes = lab.engine2D.Shapes;
var SimList = lab.model.SimList;
var SimObject = lab.model.SimObject;
var SimView = lab.view.SimView;
var Spring = lab.model.Spring;
var StraightEdge = lab.engine2D.StraightEdge;
var TabLayout = sims.common.TabLayout;
var Terminal = lab.util.Terminal;
var ThrusterSet = lab.engine2D.ThrusterSet;
var Util = lab.util.Util;
var Vector = lab.util.Vector;
var VerticalAlign = lab.view.VerticalAlign;
var Walls = lab.engine2D.Walls;

/** Intended for scripting, this provides a ContactSim with no RigidBody objects or
ForceLaws. The RigidBody objects and ForceLaws should be created via scripting such as
a URL-script; see {@link Terminal}.

* @param {!TabLayout.elementIds} elem_ids specifies the names of the HTML
*    elementId's to look for in the HTML document; these elements are where the user
*    interface of the simulation is created.
* @constructor
* @final
* @struct
* @extends {Engine2DApp}
* @export
*/
myphysicslab.sims.engine2D.BlankApp = function(elem_ids) {
  var simRect = new DoubleRect(-6, -6, 6, 6);
  var sim = new ContactSim();
  var advance = new CollisionAdvance(sim);
  Engine2DApp.call(this, elem_ids, simRect, sim, advance);
  this.addPlaybackControls();
  //this.addStandardControls();
  this.makeEasyScript();
  this.graphSetup();
};
var BlankApp = myphysicslab.sims.engine2D.BlankApp;
goog.inherits(BlankApp, Engine2DApp);

if (!Util.ADVANCED) {
  /** @inheritDoc */
  BlankApp.prototype.toString = function() {
    return this.toStringShort().slice(0, -1)
        + BlankApp.superClass_.toString.call(this);
  };
};

/** @inheritDoc */
BlankApp.prototype.getClassName = function() {
  return 'BlankApp';
};

}); // goog.scope
