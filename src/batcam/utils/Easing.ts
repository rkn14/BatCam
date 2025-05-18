/*
	TERMS OF USE - EASING EQUATIONS
	---------------------------------------------------------------------------------
	Open source under the BSD License.

	Copyright © 2001 Robert Penner All rights reserved.

	Redistribution and use in source and binary forms, with or without
	modification, are permitted provided that the following conditions are met:

	Redistributions of source code must retain the above copyright notice, this
	list of conditions and the following disclaimer. Redistributions in binary
	form must reproduce the above copyright notice, this list of conditions and
	the following disclaimer in the documentation and/or other materials provided
	with the distribution. Neither the name of the author nor the names of
	contributors may be used to endorse or promote products derived from this
	software without specific prior written permission.

	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
	AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
	IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
	DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE
	FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
	DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
	SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
	CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
	OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
	OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	---------------------------------------------------------------------------------
*/

export type EasingFn = (
	t: number,
	b: number,
	c: number,
	d: number,
	a?: number,
	p?: number,
) => number;

const PI_M2 = Math.PI * 2;
const PI_D2 = Math.PI / 2;

export const linear: EasingFn = (t, b, c, d) => (c * t) / d + b;
export const none = linear;

export const easeInSine: EasingFn = (t, b, c, d) =>
	-c * Math.cos((t / d) * PI_D2) + c + b;

export const easeOutSine: EasingFn = (t, b, c, d) =>
	c * Math.sin((t / d) * PI_D2) + b;

export const easeInOutSine: EasingFn = (t, b, c, d) =>
	(-c / 2) * (Math.cos((Math.PI * t) / d) - 1) + b;

export const easeInQuad: EasingFn = (t, b, c, d) => {
	t /= d;
	return c * t * t + b;
};

export const easeOutQuad: EasingFn = (t, b, c, d) => {
	t /= d;
	return -c * t * (t - 2) + b;
};

export const easeInOutQuad: EasingFn = (t, b, c, d) => {
	t /= d / 2;
	if (t < 1) return (c / 2) * t * t + b;
	t--;
	return (-c / 2) * (t * (t - 2) - 1) + b;
};

export const easeInCubic: EasingFn = (t, b, c, d) => {
	t /= d;
	return c * t * t * t + b;
};

export const easeOutCubic: EasingFn = (t, b, c, d) => {
	t = t / d - 1;
	return c * (t * t * t + 1) + b;
};

export const easeInOutCubic: EasingFn = (t, b, c, d) => {
	t /= d / 2;
	if (t < 1) return (c / 2) * t * t * t + b;
	t -= 2;
	return (c / 2) * (t * t * t + 2) + b;
};

export const easeInQuart: EasingFn = (t, b, c, d) => {
	t /= d;
	return c * t * t * t * t + b;
};

export const easeOutQuart: EasingFn = (t, b, c, d) => {
	t = t / d - 1;
	return -c * (t * t * t * t - 1) + b;
};

export const easeInOutQuart: EasingFn = (t, b, c, d) => {
	t /= d / 2;
	if (t < 1) return (c / 2) * t * t * t * t + b;
	t -= 2;
	return (-c / 2) * (t * t * t * t - 2) + b;
};

export const easeInQuint: EasingFn = (t, b, c, d) => {
	t /= d;
	return c * t * t * t * t * t + b;
};

export const easeOutQuint: EasingFn = (t, b, c, d) => {
	t = t / d - 1;
	return c * (t * t * t * t * t + 1) + b;
};

export const easeInOutQuint: EasingFn = (t, b, c, d) => {
	t /= d / 2;
	if (t < 1) return (c / 2) * t * t * t * t * t + b;
	t -= 2;
	return (c / 2) * (t * t * t * t * t + 2) + b;
};

export const easeInExpo: EasingFn = (t, b, c, d) =>
	t === 0 ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;

export const easeOutExpo: EasingFn = (t, b, c, d) =>
	t === d ? b + c : c * (-Math.pow(2, -10 * (t / d)) + 1) + b;

export const easeInOutExpo: EasingFn = (t, b, c, d) => {
	if (t === 0) return b;
	if (t === d) return b + c;
	t /= d / 2;
	if (t < 1) return (c / 2) * Math.pow(2, 10 * (t - 1)) + b;
	t--;
	return (c / 2) * (-Math.pow(2, -10 * t) + 2) + b;
};

export const easeInCirc: EasingFn = (t, b, c, d) =>
	-c * (Math.sqrt(1 - ((t / d) * t) / d) - 1) + b;

export const easeOutCirc: EasingFn = (t, b, c, d) => {
	t = t / d - 1;
	return c * Math.sqrt(1 - t * t) + b;
};

export const easeInOutCirc: EasingFn = (t, b, c, d) => {
	t /= d / 2;
	if (t < 1) return (-c / 2) * (Math.sqrt(1 - t * t) - 1) + b;
	t -= 2;
	return (c / 2) * (Math.sqrt(1 - t * t) + 1) + b;
};

export const easeInBack: EasingFn = (t, b, c, d, s = 1.70158) => {
	t /= d;
	return c * t * t * ((s + 1) * t - s) + b;
};

export const easeOutBack: EasingFn = (t, b, c, d, s = 1.70158) => {
	t = t / d - 1;
	return c * (t * t * ((s + 1) * t + s) + 1) + b;
};

export const easeInOutBack: EasingFn = (t, b, c, d, s = 1.70158) => {
	t /= d / 2;
	s *= 1.525;
	if (t < 1) return (c / 2) * (t * t * ((s + 1) * t - s)) + b;
	t -= 2;
	return (c / 2) * (t * t * ((s + 1) * t + s) + 2) + b;
};

export const easeInElastic: EasingFn = (t, b, c, d, a = c, p = d * 0.3) => {
	let s: number;
	if (t === 0) return b;
	t /= d;
	if (t === 1) return b + c;
	if (a < Math.abs(c)) {
		a = c;
		s = p / 4;
	} else {
		s = (p / PI_M2) * Math.asin(c / a);
	}
	t--;
	return -(a * Math.pow(2, 10 * t) * Math.sin(((t * d - s) * PI_M2) / p)) + b;
};

export const easeOutElastic: EasingFn = (t, b, c, d, a = c, p = d * 0.3) => {
	let s: number;
	if (t === 0) return b;
	t /= d;
	if (t === 1) return b + c;
	if (a < Math.abs(c)) {
		a = c;
		s = p / 4;
	} else {
		s = (p / PI_M2) * Math.asin(c / a);
	}
	return a * Math.pow(2, -10 * t) * Math.sin(((t * d - s) * PI_M2) / p) + c + b;
};

export const easeInOutElastic: EasingFn = (t, b, c, d, a = c, p = d * 0.45) => {
	let s: number;
	if (t === 0) return b;
	t /= d / 2;
	if (t === 2) return b + c;
	if (a < Math.abs(c)) {
		a = c;
		s = p / 4;
	} else {
		s = (p / PI_M2) * Math.asin(c / a);
	}
	if (t < 1) {
		t--;
		return (
			-0.5 * (a * Math.pow(2, 10 * t) * Math.sin(((t * d - s) * PI_M2) / p)) + b
		);
	}
	t--;
	return (
		a * Math.pow(2, -10 * t) * Math.sin(((t * d - s) * PI_M2) / p) * 0.5 + c + b
	);
};

export const easeInBounce: EasingFn = (t, b, c, d) =>
	c - easeOutBounce(d - t, 0, c, d) + b;

export const easeOutBounce: EasingFn = (t, b, c, d) => {
	t /= d;
	if (t < 1 / 2.75) {
		return c * (7.5625 * t * t) + b;
	} else if (t < 2 / 2.75) {
		t -= 1.5 / 2.75;
		return c * (7.5625 * t * t + 0.75) + b;
	} else if (t < 2.5 / 2.75) {
		t -= 2.25 / 2.75;
		return c * (7.5625 * t * t + 0.9375) + b;
	} else {
		t -= 2.625 / 2.75;
		return c * (7.5625 * t * t + 0.984375) + b;
	}
};

export const easeInOutBounce: EasingFn = (t, b, c, d) => {
	if (t < d / 2) {
		return easeInBounce(t * 2, 0, c, d) * 0.5 + b;
	}
	return easeOutBounce(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
};

export const Easing = {
	linear,
	none,
	easeInSine,
	easeOutSine,
	easeInOutSine,
	easeInQuad,
	easeOutQuad,
	easeInOutQuad,
	easeInCubic,
	easeOutCubic,
	easeInOutCubic,
	easeInQuart,
	easeOutQuart,
	easeInOutQuart,
	easeInQuint,
	easeOutQuint,
	easeInOutQuint,
	easeInExpo,
	easeOutExpo,
	easeInOutExpo,
	easeInCirc,
	easeOutCirc,
	easeInOutCirc,
	easeInBack,
	easeOutBack,
	easeInOutBack,
	easeInElastic,
	easeOutElastic,
	easeInOutElastic,
	easeInBounce,
	easeOutBounce,
	easeInOutBounce,
};
