

import React, { Component } from "react";
import PropTypes from "prop-types";

import { hexToRGBA, isNotDefined } from "../utils";

import GenericChartComponent from "../GenericChartComponent";
import { getAxisCanvas } from "../GenericComponent";

class RSIStraightRect extends Component {
	constructor(props) {
		super(props);
		this.renderSVG = this.renderSVG.bind(this);
		this.drawOnCanvas = this.drawOnCanvas.bind(this);
	}
	drawOnCanvas(ctx, moreProps) {
		const { stroke, strokeWidth, opacity, yValue, position } = this.props;
		const { chartConfig: { yScale, width } } = moreProps;

		ctx.beginPath();

		ctx.strokeStyle = hexToRGBA(stroke, opacity);
		ctx.lineWidth = strokeWidth;

		const { x1, y1, x2, y2 } = getLineCoordinates(yScale, yValue, width);

		if (position === "top") {
			ctx.moveTo(x1, y1 - strokeWidth / 2);
			ctx.lineTo(x2, y2 - strokeWidth / 2);
		}

		if (position === "bottom") {
			ctx.moveTo(x1, y1 + strokeWidth / 2);
			ctx.lineTo(x2, y2 + strokeWidth / 2);
		}

		ctx.stroke();
	}
	render() {
		return <GenericChartComponent
			svgDraw={this.renderSVG}
			canvasDraw={this.drawOnCanvas}
			canvasToDraw={getAxisCanvas}
			drawOn={["pan"]}
		/>;
	}
	renderSVG(moreProps) {
		const { width, chartConfig: { yScale } } = moreProps;
		const { className, yValue, stroke, strokeWidth, opacity } = this.props;

		const lineCoordinates = getLineCoordinates(yScale, yValue, width);

		return (
			<line
				className={className}
				stroke={stroke}
				strokeWidth={strokeWidth}
				strokeOpacity={opacity}
				{...lineCoordinates}
			/>
		);
	}
}

function getLineCoordinates(yScale, yValue, width) {
	return { x1: 0, y1: Math.round(yScale(yValue)), x2: width, y2: Math.round(yScale(yValue))}
}

RSIStraightRect.propTypes = {
	className: PropTypes.string,
	stroke: PropTypes.string,
	strokeWidth: PropTypes.number,
	opacity: PropTypes.number.isRequired,
	yValue: function(props, propName/* , componentName */) {
		if (isNotDefined(props[propName])) return new Error("yValue is required");
	},
};

RSIStraightRect.defaultProps = {
	className: "line",
	stroke: "#dcf2f7",
	opacity: 1,
};

export default RSIStraightRect;
