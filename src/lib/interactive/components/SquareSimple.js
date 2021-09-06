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

class SquareSimple extends Component {
	constructor(props) {
		super(props);

		this.renderSVG = this.renderSVG.bind(this);
		this.drawOnCanvas = this.drawOnCanvas.bind(this);
		this.isHover = this.isHover.bind(this);
	}
	isHover(moreProps) {
		const { tolerance, onHover, getHoverInteractive } = this.props;

		if (isDefined(onHover)) {
			const { x1Value, x2Value, y1Value, y2Value, type } = this.props;
			const { mouseXY, xScale } = moreProps;
			const { chartConfig: { yScale } } = moreProps;
			const hoveringTop = isHovering({
				x1Value,
				y1Value,
				x2Value,
				y2Value: y1Value,
				mouseXY,
				type,
				tolerance,
				xScale,
				yScale,
			});

			const hoveringRight = isHovering({
				x1Value: x2Value,
				y1Value,
				x2Value,
				y2Value,
				mouseXY,
				type,
				tolerance,
				xScale,
				yScale,
			});

			const hoveringBottom = isHovering({
				x1Value,
				y1Value: y1Value,
				x2Value,
				y2Value,
				mouseXY,
				type,
				tolerance,
				xScale,
				yScale,
			});

			const hoveringLeft = isHovering({
				x1Value,
				y1Value,
				x2Value: x1Value,
				y2Value,
				mouseXY,
				type,
				tolerance,
				xScale,
				yScale,
			});

			if (getHoverInteractive) {
				getHoverInteractive(hoveringTop || hoveringRight || hoveringBottom || hoveringLeft);
			}
			return hoveringTop || hoveringRight || hoveringBottom || hoveringLeft;
		}
		return false;
	}
	drawOnCanvas(ctx, moreProps) {
		const { strokeWidth, fill, fillOpacity } = this.props;

		const { x1, y1, x2, y2 } = helper(this.props, moreProps);
		console.log(x1, y1, x2, y2, 'sadadasdasdasda');
		const width = x2 - x1;
		const height = x2 - x1; 

		ctx.lineWidth = strokeWidth;

		ctx.beginPath();
		ctx.rect(x1, y1, width, height);
		ctx.stroke();
		if (fill) {
			ctx.fillStyle = hexToRGBA(fill, fillOpacity);
			ctx.fill();
		}
	}
	renderSVG(moreProps) {
		const { stroke, strokeWidth, strokeOpacity, strokeDasharray, fill } = this.props;

		const { x1, y1, x2, y2 } = helper(this.props, moreProps);

		return (
			<rect
				strokeWidth={strokeWidth}
				lineWidth={strokeWidth}
				strokeDasharray={strokeDasharray}
				stroke={stroke}
				strokeOpacity={strokeOpacity}
				x1={x1}
				y1={y1}
				x2={x2}
				y2={y2}
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

export function isHovering2(start, end, [mouseX, mouseY], tolerance) {
	const m = getSlope(start, end);

	if (isDefined(m)) {
		const b = getYIntercept(m, end);
		const y = m * mouseX + b;
		return (mouseY < y + tolerance)
			&& mouseY > (y - tolerance)
			&& mouseX > Math.min(start[0], end[0]) - tolerance
			&& mouseX < Math.max(start[0], end[0]) + tolerance;
	} else {
		return mouseY >= Math.min(start[1], end[1])
			&& mouseY <= Math.max(start[1], end[1])
			&& mouseX < start[0] + tolerance
			&& mouseX > start[0] - tolerance;
	}
}

export function isHovering({
	x1Value, y1Value,
	x2Value, y2Value,
	mouseXY,
	type,
	tolerance,
	xScale,
	yScale,
}) {

	const line = generateLine({
		type,
		start: [x1Value, y1Value],
		end: [x2Value, y2Value],
		xScale,
		yScale,
	});

	const start = [xScale(line.x1), yScale(line.y1)];
	const end = [xScale(line.x2), yScale(line.y2)];

	const m = getSlope(start, end);
	const [mouseX, mouseY] = mouseXY;

	if (isDefined(m)) {
		const b = getYIntercept(m, end);
		const y = m * mouseX + b;

		return mouseY < (y + tolerance)
			&& mouseY > (y - tolerance)
			&& mouseX > Math.min(start[0], end[0]) - tolerance
			&& mouseX < Math.max(start[0], end[0]) + tolerance;
	} else {
		return mouseY >= Math.min(start[1], end[1])
			&& mouseY <= Math.max(start[1], end[1])
			&& mouseX < start[0] + tolerance
			&& mouseX > start[0] - tolerance;
	}
}

function helper(props, moreProps) {
	const { x1Value, x2Value, y1Value, y2Value, type } = props;
	console.log(x1Value, x2Value, y1Value, y2Value,'llllllllllllllllllllllll');
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
		case "SQUARE":
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

SquareSimple.propTypes = {
	x1Value: PropTypes.any.isRequired,
	x2Value: PropTypes.any.isRequired,
	y1Value: PropTypes.any.isRequired,
	y2Value: PropTypes.any.isRequired,

	interactiveCursorClass: PropTypes.string,

	type: PropTypes.oneOf(["SQUARE"]).isRequired,

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

SquareSimple.defaultProps = {
	onDragStart: noop,
	onDrag: noop,
	onDragComplete: noop,

	strokeDasharray: "Solid",
	children: noop,
	tolerance: 7,
	selected: false,
};

export default SquareSimple;