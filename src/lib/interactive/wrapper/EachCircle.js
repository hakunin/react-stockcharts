/* eslint-disable semi */
/* eslint-disable no-debugger */
import React, { Component } from "react";
import PropTypes from "prop-types";

import { ascending as d3Ascending } from "d3-array";
import { noop, strokeDashTypes, isDefined } from "../../utils";
import { saveNodeType, isHover } from "../utils";
import { getXValue } from "../../utils/ChartDataUtil";


import CircleSimple from "../components/CircleSimple";
import ClickableCircle from "../components/ClickableCircle";
import HoverTextNearMouse from "../components/HoverTextNearMouse";

class EachCircle extends Component {
	constructor(props) {
		super(props);

		this.handleTopEdgeDrag = this.handleTopEdgeDrag.bind(this);
		this.handleBottomEdgeDrag = this.handleBottomEdgeDrag.bind(this);

		this.handleDragStart = this.handleDragStart.bind(this);
		this.handleLineDrag = this.handleLineDrag.bind(this);

		this.handleDragComplete = this.handleDragComplete.bind(this);

		this.getEdgeCircle = this.getEdgeCircle.bind(this);
		this.handleHover = this.handleHover.bind(this);

		this.isHover = isHover.bind(this);
		this.saveNodeType = saveNodeType.bind(this);
		this.nodes = {};

		this.state = {
			hover: false,
		};
	}

	handleHover(moreProps) {
		if (this.state.hover !== moreProps.hovering) {
			this.setState({
				hover: moreProps.hovering
			});
		}
	}
	handleDragStart() {
		const { start, end } = this.props;

		this.dragStart = {
			x1Value: start[0],
			y1Value: start[1],
			x2Value: end[0],
			y2Value: end[1],
		};
	}
	handleLineDrag(moreProps) {
		const { index, onDrag } = this.props;

		const {
			x1Value, y1Value,
			x2Value, y2Value,
		} = this.dragStart;

		const { xScale, chartConfig: { yScale }, xAccessor, fullData } = moreProps;
		const { startPos, mouseXY } = moreProps;

		const x1 = xScale(x1Value);
		const y1 = yScale(y1Value);
		const x2 = xScale(x2Value);
		const y2 = yScale(y2Value);

		const dx = startPos[0] - mouseXY[0];
		const dy = startPos[1] - mouseXY[1];

		const newX1Value = getXValue(xScale, xAccessor, [x1 - dx, y1 - dy], fullData);
		const newY1Value = yScale.invert(y1 - dy);
		const newX2Value = getXValue(xScale, xAccessor, [x2 - dx, y2 - dy], fullData);
		const newY2Value = yScale.invert(y2 - dy);

		onDrag(index, {
			x1Value: newX1Value,
			y1Value: newY1Value,
			x2Value: newX2Value,
			y2Value: newY2Value,
		});
	}
	handleDragComplete(...rest) {
		this.setState({
			anchor: undefined
		});
		this.props.onDragComplete(...rest);
	}
	handleTopEdgeDrag(moreProps) {
		const { index, onDrag } = this.props;
		const { start, end } = this.props;

		const [x1Value, y2Value] = getNewXY(moreProps);

		if ((start[1] - (start[1] - (y2Value - start[1]))) > 0.5) {
			onDrag(index, {
				x1Value: start[0],
				y1Value: start[1],
				x2Value: end[0],
				y2Value: start[1] - (y2Value - start[1]),
			});
		}
	}
	handleBottomEdgeDrag(moreProps) {
		const { index, onDrag } = this.props;
		const { start, end } = this.props;

		const [x1Value, y2Value] = getNewXY(moreProps);

		if ((start[1] - y2Value) > 0.5) {
			onDrag(index, {
				x1Value: start[0],
				y1Value: start[1],
				x2Value: end[0],
				y2Value,
			});
		}
	}
	getEdgeCircle({ x, y, dragHandler, cursor, fill, edge }) {
		const { hover } = this.state;
		const { appearance } = this.props;
		const { edgeFill, edgeStroke, edgeStrokeWidth, r } = appearance;

		const { selected, onDragComplete } = this.props;

		return <ClickableCircle
			ref={this.saveNodeType(edge)}

			show={selected || hover}
			cx={x}
			cy={y}
			r={r}
			fill={fill}
			stroke={edgeStroke}
			strokeWidth={edgeStrokeWidth}
			interactiveCursorClass={cursor}

			onDragStart={this.handleDragStart}
			onDrag={dragHandler}
			onDragComplete={onDragComplete} />;
	}
	render() {
		const {
			type,
			selected,
			start,
			end,
			onDragComplete,
			interactive,
			hoverText,
			appearance
		} = this.props;

		const {
			stroke,
			strokeOpacity,
			strokeWidth,
			strokeDasharray,

			fill,
			fillOpacity,

			edgeStrokeWidth,
			edgeFill,
			edgeStroke,
			r,
		} = appearance;

		const {
			enable: hoverTextEnabled,
			...restHoverTextProps
		} = hoverText;

		const { hover, anchor } = this.state;

		const hoverHandler = interactive
			? { onHover: this.handleHover, onUnHover: this.handleHover }
			: {};

		const topEdge = isDefined(start) && isDefined(end)
			? <g>
				{this.getEdgeCircle({
					x: start[0],
					y: start[1] + (start[1] - end[1]),
					dragHandler: this.handleTopEdgeDrag,
					cursor: "react-stockcharts-move-cursor",
					fill: edgeFill,
					edge: "line0edge0",
				})}
			</g>
			: null;
		const bottomEdge = isDefined(start) && isDefined(end)
			? <g>
				{this.getEdgeCircle({
					x: start[0],
					y: end[1],
					dragHandler: this.handleBottomEdgeDrag,
					cursor: "react-stockcharts-move-cursor",
					fill: edgeFill,
					edge: "line2edge2",
				})}
			</g>
			: null;

		return <g>
			<CircleSimple
				ref={this.saveNodeType("circle")}
				selected={selected || hover}

				{...hoverHandler}

				anchor={anchor}
				x1Value={start[0]}
				y1Value={start[1]}
				x2Value={end[0]}
				y2Value={end[1]}
				type={type}
				strokeDasharray={strokeDasharray}
				r={r}
				edgeStrokeWidth={edgeStrokeWidth}
				edgeFill={edgeFill}
				edgeStroke={edgeStroke}
				hoverText={hoverText}

				stroke={stroke}
				strokeWidth={(hover || selected) ? strokeWidth + 1 : strokeWidth}
				strokeOpacity={strokeOpacity}
				fill={fill}
				fillOpacity={fillOpacity}
				interactiveCursorClass="react-stockcharts-move-cursor"

				onDragStart={this.handleDragStart}
				onDrag={this.handleLineDrag}
				onDragComplete={onDragComplete}
				getHoverInteractive={this.props.getHoverInteractive}
			/>
			{topEdge}
			{bottomEdge}
			<HoverTextNearMouse
				show={hoverTextEnabled && hover && !selected}
				{...restHoverTextProps} />
		</g>;
	}
}

export function getNewXY(moreProps) {
	const { xScale, chartConfig: { yScale }, xAccessor, plotData, mouseXY } = moreProps;
	const mouseY = mouseXY[1];

	const x = getXValue(xScale, xAccessor, mouseXY, plotData);

	const [small, big] = yScale.domain().slice().sort(d3Ascending);
	const y = yScale.invert(mouseY);
	const newY = Math.min(Math.max(y, small), big);

	return [x, newY];
}

EachCircle.propTypes = {
	x1Value: PropTypes.any,
	x2Value: PropTypes.any,
	y1Value: PropTypes.any,
	y2Value: PropTypes.any,

	index: PropTypes.number,
	selected: PropTypes.bool,
	hoverText: PropTypes.object.isRequired,

	onDrag: PropTypes.func.isRequired,
	onDragComplete: PropTypes.func.isRequired,

	appearance: PropTypes.shape({
		stroke: PropTypes.string.isRequired,
		strokeOpacity: PropTypes.number.isRequired,
		strokeWidth: PropTypes.number.isRequired,
		strokeDasharray: PropTypes.oneOf(strokeDashTypes),
		fill: PropTypes.string.isRequired,
		fillOpacity: PropTypes.number.isRequired,
		edgeStrokeWidth: PropTypes.number.isRequired,
		edgeFill: PropTypes.string.isRequired,
		edgeStroke: PropTypes.string.isRequired,
	}).isRequired,
};

EachCircle.defaultProps = {
	onDrag: noop,
	onDragComplete: noop,
	interactive: true,

	selected: false,
	hoverText: {
		enable: false,
	}
};

export default EachCircle;