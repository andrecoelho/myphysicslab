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

goog.provide('myphysicslab.lab.model.Spring');

goog.require('myphysicslab.lab.model.AbstractSimObject');
goog.require('myphysicslab.lab.model.CoordType');
goog.require('myphysicslab.lab.model.Force');
goog.require('myphysicslab.lab.model.ForceLaw');
goog.require('myphysicslab.lab.model.MassObject');
goog.require('myphysicslab.lab.model.Line');
goog.require('myphysicslab.lab.util.DoubleRect');
goog.require('myphysicslab.lab.util.GenericVector');
goog.require('myphysicslab.lab.util.Vector');
goog.require('myphysicslab.lab.util.Util');

goog.scope(function() {

var AbstractSimObject = myphysicslab.lab.model.AbstractSimObject;
var CoordType = myphysicslab.lab.model.CoordType;
var DoubleRect = myphysicslab.lab.util.DoubleRect;
var Force = myphysicslab.lab.model.Force;
var ForceLaw = myphysicslab.lab.model.ForceLaw;
var GenericVector = myphysicslab.lab.util.GenericVector;
var MassObject = myphysicslab.lab.model.MassObject;
var NF = myphysicslab.lab.util.Util.NF;
var Util = myphysicslab.lab.util.Util;
var Vector = myphysicslab.lab.util.Vector;

/** Represents a spring attached between two {@link MassObject}s, generates a
{@link Force} which depends on how the Spring is stretched. Damping is proportional to
the relative velocity of the two objects.

To attach one end to a fixed point you can attach to an infinite mass MassObject or a
{@link myphysicslab.lab.engine2D.Scrim Scrim}.

## Compress-only mode

The `compressOnly` argument of the constructor sets the spring to *compress only mode*
which behaves normally if the spring is in compression (the length is less than the rest
length) but it temporarily disconnects from the second attachment point during extension
(when the length is more than rest length). During extension, the Spring's start point
is at the first attachment point on `body1`, but the end point is rest-length away from
start point in the direction of the second attachment point.

* @param {string} name language-independent name of this object
* @param {!MassObject} body1 body to attach to start point of the
*    Spring
* @param {!GenericVector} attach1_body attachment point in body
*    coords of body1
* @param {!MassObject} body2 body to attach to end point of the
*    Spring
* @param {!GenericVector} attach2_body attachment point in body
*    coords of body2
* @param {number} restLength length of spring when it has no force
* @param {number=} stiffness amount of force per unit distance of stretch
* @param {boolean=} compressOnly Sets the spring to 'compress only mode' which
*    behaves normally if the spring is in compression but disconnects
*    from the second attachment point during extension.
* @constructor
* @struct
* @extends {AbstractSimObject}
* @implements {ForceLaw}
* @implements {myphysicslab.lab.model.Line}
*/
myphysicslab.lab.model.Spring = function(name, body1, attach1_body,
      body2, attach2_body, restLength, stiffness, compressOnly) {
  AbstractSimObject.call(this, name);
  /** body to attach point1 to
  * @type {!MassObject}
  * @private
  */
  this.body1_ = body1;
  /** attachment point in body coords for body1
  * @type {!Vector}
  * @private
  */
  this.attach1_ = Vector.clone(attach1_body);
  /** body to attach point2 to
  * @type {!MassObject}
  * @private
  */
  this.body2_ = body2;
  /** attachment point in body coords for body2
  * @type {!Vector}
  * @private
  */
  this.attach2_ = Vector.clone(attach2_body);
  /**
  * @type {number}
  * @private
  */
  this.restLength_ = restLength;
  /**
  * @type {number}
  * @private
  */
  this.stiffness_ = (stiffness === undefined) ? 0 : stiffness;
  /**
  * @type {number}
  * @private
  */
  this.damping_ = 0;
  /**
  * @const
  * @type {boolean}
  * @private
  */
  this.compressOnly_ = compressOnly || false;
};
var Spring = myphysicslab.lab.model.Spring;
goog.inherits(Spring, AbstractSimObject);

if (!Util.ADVANCED) {
  /** @inheritDoc */
  Spring.prototype.toString = function() {
    return Spring.superClass_.toString.call(this).slice(0, -1)
        +', body1_:"'+this.body1_.getName()+'"'
        +', attach1_: '+this.attach1_
        +', body2_:"'+this.body2_.getName()+'"'
        +', attach2_: '+this.attach2_
        +', restLength_: '+NF(this.restLength_)
        +', stiffness_: '+NF(this.stiffness_)
        +', damping_: '+NF(this.damping_)
        +', compressOnly_: '+this.compressOnly_
        +'}';
  };
};

/** @inheritDoc */
Spring.prototype.getClassName = function() {
  return 'Spring';
};

/** @inheritDoc */
Spring.prototype.calculateForces = function() {
  var point1 = this.getStartPoint();
  var point2 = this.getEndPoint();
  var v = point2.subtract(point1);
  var len = v.length();
  // force on body 1 is in direction of v
  // amount of force is proportional to stretch of spring
  // spring force is - stiffness * stretch
  var sf = -this.stiffness_ * (len - this.restLength_);
  var fx = -sf * (v.getX() / len);
  var fy = -sf * (v.getY() / len);
  var f = new Vector(fx, fy, 0);
  if (this.damping_ != 0) {
    // damping does not happen for 'compress only' when uncompressed
    if (!this.compressOnly_ || len < this.restLength_ - 1E-10) {
      var v1 = this.body1_.getVelocity(this.attach1_);
      var v2 = this.body2_.getVelocity(this.attach2_);
      var df = v1.subtract(v2).multiply(-this.damping_);
      f = f.add(df);
    }
  }
  return [ new Force('spring', this.body1_,
        /*location=*/point1, CoordType.WORLD,
        /*direction=*/f, CoordType.WORLD),
    new Force('spring', this.body2_,
        /*location=*/point2, CoordType.WORLD,
        /*direction=*/f.multiply(-1), CoordType.WORLD) ];
};

/** @inheritDoc */
Spring.prototype.disconnect = function() {
};

/** Returns attachment point for body 1, in body coordinates of body 1.
@return {!Vector} attachment point for body 1, in body coordinates of body 1.
*/
Spring.prototype.getAttach1 = function() {
  return this.attach1_;
};

/** Returns attachment point for body 2, in body coordinates of body 2.
@return {!Vector} attachment point for body 2, in body coordinates of body 2.
*/
Spring.prototype.getAttach2 = function() {
  return this.attach2_;
};

/** @inheritDoc */
Spring.prototype.getBodies = function() {
  return [ this.body1_, this.body2_ ];  // include the spring also?
};

/** Returns the RigidBody that start point of the spring is attached to.
@return {!MassObject} the RigidBody that start point of the spring is attached to.
*/
Spring.prototype.getBody1 = function() {
  return this.body1_;
};

/** Returns the RigidBody that end point of the spring is attached to.
@return {!MassObject} the RigidBody that end point of the spring is attached to.
*/
Spring.prototype.getBody2 = function() {
  return this.body2_;
};

/** @inheritDoc */
Spring.prototype.getBoundsWorld = function() {
  return DoubleRect.make(this.getStartPoint(), this.getEndPoint());
};

/** Returns the amount of damping for this spring. Damping is proportional to the
relative velocity of the two points.
@return {number} amount of damping for this spring
*/
Spring.prototype.getDamping = function() {
  return this.damping_;
};

/** @inheritDoc */
Spring.prototype.getEndPoint = function() {
  if (this.attach2_ == null || this.body2_ == null)
    throw new Error();
  var p2 = this.body2_.bodyToWorld(this.attach2_);
  if (this.compressOnly_) {
    // 'compress only mode'
    var p1 = this.getStartPoint();
    var dist = p1.distanceTo(p2);
    var rlen = this.restLength_;
    if (dist <= rlen) {
      // spring is compressed, so it works as normal
      return p2;
    } else {
      // spring is not compressed, so the end is restLength from p1
      // in the direction towards p2.
      var n = p2.subtract(p1).normalize();
      return p1.add(n.multiply(rlen));
    }
  } else {
    return p2;
  }
};

/** Returns the distance between start and end points of this spring
@return {number} the distance between start and end points of this spring
*/
Spring.prototype.getLength = function() {
  return this.getEndPoint().distanceTo(this.getStartPoint());
};

/** @inheritDoc */
Spring.prototype.getPotentialEnergy = function() {
  // spring potential energy = 0.5*stiffness*(stretch^2)
  var stretch = this.getStretch();
  return 0.5 * this.stiffness_ * stretch * stretch;
};

/** Returns the length of this spring when no force is applied.
@return {number} rest length of this spring
*/
Spring.prototype.getRestLength = function() {
  return this.restLength_;
};

/** @inheritDoc */
Spring.prototype.getStartPoint = function() {
  if (this.attach1_ == null || this.body1_ == null)
    throw new Error();
  return this.body1_.bodyToWorld(this.attach1_) ;
};

/** Returns stiffness of this spring.
@return {number} stiffness of this spring.
*/
Spring.prototype.getStiffness = function() {
  return this.stiffness_;
};

/** Positive stretch means the spring is expanded, negative stretch means compressed.
@return {number} the amount that this line is stretched from its rest length
*/
Spring.prototype.getStretch = function() {
  return this.getLength() - this.restLength_;
};

/** @inheritDoc */
Spring.prototype.getVector = function() {
  return this.getEndPoint().subtract(this.getStartPoint());
};

/** Sets the value of damping for this spring. Damping is proportional to the relative
velocity of the two points.
@param {number} damping the value of damping for this spring
@return {!Spring} this Spring to allow chaining of setters
*/
Spring.prototype.setDamping = function(damping) {
  this.damping_ = damping
  return this;
};

/** Sets the rest length of this spring, which is used for calculating the stretch.
When length of spring is the rest length, then no force is applied at either end.
@param {number} value the rest length of this spring
*/
Spring.prototype.setRestLength = function(value) {
  this.restLength_ = value;
};

/** Sets stiffness of this spring
@param {number} stiffness the stiffness of this spring
@return {!Spring} this Spring to allow chaining of setters
*/
Spring.prototype.setStiffness = function(stiffness) {
  this.stiffness_ = stiffness;
  return this;
};

}); // goog.scope
