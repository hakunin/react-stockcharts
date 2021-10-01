/* eslint-disable no-debugger */
import React, { Component } from "react";
import PropTypes from "prop-types";

import GenericChartComponent from "../../GenericChartComponent";
import { getMouseCanvas } from "../../GenericComponent";

import {
	isDefined,
	noop,
	hexToRGBA,
	strokeDashTypes,
} from "../../utils";

class CircleSimple extends Component {
	constructor(props) {
		super(props);

		this.renderSVG = this.renderSVG.bind(this);
		this.drawOnCanvas = this.drawOnCanvas.bind(this);
		this.isHover = this.isHover.bind(this);
	}
	isHover(moreProps) {
		const { onHover, getHoverInteractive } = this.props;

		if (isDefined(onHover)) {
			const { x1Value, x2Value, y1Value, y2Value } = this.props;
			const { mouseXY, xScale } = moreProps;
			const { chartConfig: { yScale } } = moreProps;

			const start = [xScale(x1Value), yScale(y1Value)];
			const end = [xScale(x2Value), yScale(y2Value)];
			const r = start[1] - end[1];

			const hoveringCenter = Math.pow(mouseXY[0] - start[0], 2) + Math.pow(mouseXY[1] - start[1], 2) <= r * r;

			if (getHoverInteractive) {
				getHoverInteractive(hoveringCenter);
			}
			return hoveringCenter;
		}
		return false;
	}
	drawOnCanvas(ctx, moreProps) {
		const { strokeWidth, fill, fillOpacity } = this.props;

		const { x1, y1, y2 } = helper(this.props, moreProps);

		const height = y2 - y1;

		ctx.lineWidth = strokeWidth;

		ctx.beginPath();
		ctx.arc(x1, y1, height, 0, 2 * Math.PI, true);
		if (fill) {
			ctx.fillStyle = hexToRGBA(fill, fillOpacity);
			ctx.fill();
		}
		ctx.stroke();
	}
	renderSVG(moreProps) {
		const { stroke, strokeWidth, strokeOpacity, fill } = this.props;

		const { x1, y1, y2 } = helper(this.props, moreProps);
		const height = y2 - y1;

		return (
			<circle
				cx={x1}
				cy={y1}
				r={height}
				stroke={stroke}
				strokeOpacity={strokeOpacity}
				strokeWidth={strokeWidth}
				fill={fill}
			/>
		);
	}
	render() {
		const { selected, interactiveCursorClass } = this.props;
		const { onDragStart, onDrag, onDragComplete, onHover, onUnHover } = this.props;

		return <GenericChartComponent
			isHover={this.isHover}

			svgDraw={this.renderSVG}
			canvasToDraw={getMouseCanvas}
			canvasDraw={this.drawOnCanvas}

			interactiveCursorClass={interactiveCursorClass}
			selected={selected}

			onDragStart={onDragStart}
			onDrag={onDrag}
			onDragComplete={onDragComplete}
			onHover={onHover}
			onUnHover={onUnHover}

			drawOn={["mousemove", "mouseleave", "pan", "drag"]}
		/>;
	}
}

function helper(props, moreProps) {
	const { x1Value, x2Value, y1Value, y2Value, type } = props;

	const { xScale, chartConfig: { yScale } } = moreProps;

	const modLine = generateLine({
		type,
		start: [x1Value, y1Value],
		end: [x2Value, y2Value],
		xScale,
		yScale,
	});


	const x1 = xScale(modLine.x1);
	const y1 = yScale(modLine.y1);
	const x2 = xScale(modLine.x2);
	const y2 = yScale(modLine.y2);

	return {
		x1, y1, x2, y2
	};
}

export function getSlope(start, end) {
	const m /* slope */ = end[0] === start[0]
		? undefined
		: (end[1] - start[1]) / (end[0] - start[0]);
	return m;
}
export function getYIntercept(m, end) {
	const b /* y intercept */ = -1 * m * end[0] + end[1];
	return b;
}

export function generateLine({
	type, start, end, xScale, yScale
}) {
	const m /* slope */ = getSlope(start, end);
	// console.log(end[0] - start[0], m)
	const b /* y intercept */ = getYIntercept(m, start);

	switch (type) {
		case "CIRCLE":
			return getLineCoordinates({
				type, start, end, xScale, yScale, m, b
			});
	}
}

function getLineCoordinates({
	start, end
}) {

	const [x1, y1] = start;
	const [x2, y2] = end;
	if (end[0] === start[0]) {
		return {
			x1,
			y1: start[1],
			x2: x1,
			y2: end[1],
		};
	}

	return {
		x1, y1,
		x2, y2,
	};
}

CircleSimple.propTypes = {
	x1Value: PropTypes.any.isRequired,
	x2Value: PropTypes.any.isRequired,
	y1Value: PropTypes.any.isRequired,
	y2Value: PropTypes.any.isRequired,

	interactiveCursorClass: PropTypes.string,

	type: PropTypes.oneOf(["CIRCLE"]).isRequired,

	onDragStart: PropTypes.func.isRequired,
	onDrag: PropTypes.func.isRequired,
	onDragComplete: PropTypes.func.isRequired,
	onHover: PropTypes.func,
	onUnHover: PropTypes.func,

	children: PropTypes.func.isRequired,
	tolerance: PropTypes.number.isRequired,
	selected: PropTypes.bool.isRequired,

	stroke: PropTypes.string.isRequired,
	strokeOpacity: PropTypes.number.isRequired,
	strokeWidth: PropTypes.number.isRequired,
	strokeDasharray: PropTypes.oneOf(strokeDashTypes),
	fill: PropTypes.string.isRequired,
	fillOpacity: PropTypes.number.isRequired,
	edgeStrokeWidth: PropTypes.number.isRequired,
	edgeFill: PropTypes.string.isRequired,
	edgeStroke: PropTypes.string.isRequired,
};

CircleSimple.defaultProps = {
	onDragStart: noop,
	onDrag: noop,
	onDragComplete: noop,

	strokeDasharray: "Solid",
	children: noop,
	tolerance: 7,
	selected: false,
};

export default CircleSimple;