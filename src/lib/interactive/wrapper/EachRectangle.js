/* eslint-disable no-debugger */
import React, { Component } from "react";
import PropTypes from "prop-types";

import { ascending as d3Ascending } from "d3-array";
import { noop, strokeDashTypes, isDefined } from "../../utils";
import { saveNodeType, isHover } from "../utils";
import { getXValue } from "../../utils/ChartDataUtil";


import RectangleSimple from "../components/RectangleSimple";
import ClickableCircle from "../components/ClickableCircle";
import HoverTextNearMouse from "../components/HoverTextNearMouse";

class EachRectangle extends Component {
	constructor(props) {
		super(props);

		this.handleEdge1Drag = this.handleEdge1Drag.bind(this);
		this.handleEdge2Drag = this.handleEdge2Drag.bind(this);

		this.handleDragStart = this.handleDragStart.bind(this);
		this.handleLineDrag = this.handleLineDrag.bind(this);

		// this.handleEdge1DragStart = this.handleEdge1DragStart.bind(this);
		// this.handleEdge2DragStart = this.handleEdge2DragStart.bind(this);

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
		const {
			x1Value, y1Value,
			x2Value, y2Value,
		} = this.props;

		this.dragStart = {
			x1Value, y1Value,
			x2Value, y2Value,
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
	// handleEdge1DragStart() {
	// 	this.setState({
	// 		anchor: "edge2"
	// 	});
	// }
	// handleEdge2DragStart() {
	// 	this.setState({
	// 		anchor: "edge1"
	// 	});
	// }
	handleDragComplete(...rest) {
		this.setState({
			anchor: undefined
		});
		this.props.onDragComplete(...rest);
	}
	handleEdge1Drag(moreProps) {
		const { index, onDrag } = this.props;
		const { end } = this.props;

		const [x1Value, y1Value] = getNewXY(moreProps);

		onDrag(index, {
			x1Value,
			y1Value,
			x2Value: end[0],
			y2Value: end[1],
		});
	}
	handleEdge2Drag(moreProps) {
		const { index, onDrag } = this.props;
		const {
			start
		} = this.props;

		const [x2Value, y2Value] = getNewXY(moreProps);

		onDrag(index, {
			x1Value: start[0],
			y1Value: start[1],
			x2Value,
			y2Value,
		});
	}
	getEdgeCircle({ x, y, dragHandler, cursor, fill, edge }) {
		const { hover } = this.state;
		const {
			edgeStroke,
			edgeStrokeWidth,
			r,
			selected,
			onDragComplete
		} = this.props;

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
			stroke,
			strokeWidth,
			strokeOpacity,
			strokeDasharray,
			r,
			edgeStrokeWidth,
			edgeFill,
			edgeStroke,
			edgeInteractiveCursor,
			lineInteractiveCursor,
			hoverText,
			selected,
			start,
			end,
			onDragComplete,
			interactive,
		} = this.props;

		console.log(start, end, "OOK");
		const {
			enable: hoverTextEnabled,
			...restHoverTextProps
		} = hoverText;

		const { hover, anchor } = this.state;

		const hoverHandler = interactive
			? { onHover: this.handleHover, onUnHover: this.handleHover }
			: {};

		const line1Edge = isDefined(start) && isDefined(end)
			? <g>
				{this.getEdgeCircle({
					x: start[0],
					y: start[1],
					dragHandler: this.handleEdge1Drag,
					cursor: "react-stockcharts-move-cursor",
					fill: "red",
					edge: "line1edge1",
				})}
				{this.getEdgeCircle({
					x: end[0],
					y: end[1],
					dragHandler: this.handleEdge2Drag,
					cursor: "react-stockcharts-move-cursor",
					fill: "green",
					edge: "line1edge2",
				})}
			</g>
			: null;
		const line2Edge = isDefined(start) && isDefined(end)
			? <g>
				{this.getEdgeCircle({
					x: end[0],
					y: start[1],
					// dragHandler: this.handleEdge1Drag,
					// cursor: "react-stockcharts-move-cursor",
					fill: "blue",
					edge: "line2edge1",
				})}
				{this.getEdgeCircle({
					x: start[0],
					y: end[1],
					// dragHandler: this.handleEdge2Drag,
					// cursor: "react-stockcharts-move-cursor",
					fill: "yellow",
					edge: "line2edge2",
				})}
			</g>
			: null;
		return <g>
			<RectangleSimple
				ref={this.saveNodeType("rectangle")}
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
				edgeInteractiveCursor={edgeInteractiveCursor}
				lineInteractiveCursor={lineInteractiveCursor}
				hoverText={hoverText}

				stroke={stroke}
				strokeWidth={(hover || selected) ? strokeWidth + 1 : strokeWidth}
				strokeOpacity={strokeOpacity}
				fill={edgeFill}
				fillOpacity={strokeOpacity}
				interactiveCursorClass="react-stockcharts-move-cursor"

				onDragStart={this.handleDragStart}
				onDrag={this.handleLineDrag}
				onDragComplete={onDragComplete}
				getHoverInteractive={this.props.getHoverInteractive}
			/>
			{line1Edge}
			{line2Edge}
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

EachRectangle.propTypes = {
	x1Value: PropTypes.any,
	x2Value: PropTypes.any,
	y1Value: PropTypes.any,
	y2Value: PropTypes.any,

	index: PropTypes.number,

	onDrag: PropTypes.func.isRequired,
	onEdge1Drag: PropTypes.func.isRequired,
	onEdge2Drag: PropTypes.func.isRequired,
	onDragComplete: PropTypes.func.isRequired,
	onSelect: PropTypes.func.isRequired,
	onUnSelect: PropTypes.func.isRequired,

	r: PropTypes.number.isRequired,
	strokeOpacity: PropTypes.number.isRequired,
	defaultClassName: PropTypes.string,

	selected: PropTypes.bool,

	// stroke: PropTypes.string.isRequired,
	strokeWidth: PropTypes.number.isRequired,
	strokeDasharray: PropTypes.oneOf(strokeDashTypes),

	edgeStrokeWidth: PropTypes.number.isRequired,
	edgeStroke: PropTypes.string.isRequired,
	// edgeInteractiveCursor: PropTypes.string.isRequired,
	// lineInteractiveCursor: PropTypes.string.isRequired,
	edgeFill: PropTypes.string.isRequired,
	hoverText: PropTypes.object.isRequired,
};

EachRectangle.defaultProps = {
	onDrag: noop,
	onEdge1Drag: noop,
	onEdge2Drag: noop,
	onDragComplete: noop,
	onSelect: noop,
	onUnSelect: noop,
	interactive: true,

	selected: false,

	edgeStroke: "#000000",
	edgeFill: "#d4d422",
	edgeStrokeWidth: 2,
	r: 5,
	strokeWidth: 1,
	strokeOpacity: 0.2,
	strokeDasharray: "Solid",
	hoverText: {
		enable: false,
	}
};

export default EachRectangle;