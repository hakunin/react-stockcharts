

import React, { Component } from "react";
import PropTypes from "prop-types";

import { isDefined, noop } from "../utils";

import {
	getValueFromOverride,
	terminate,
	saveNodeType,
	isHoverForInteractiveType,
} from "./utils";

import EachHorizontalLine from "./wrapper/EachHorizontalLine";
import StraightLine from "./components/StraightLine";
import MouseLocationIndicator from "./components/MouseLocationIndicator";
import HoverTextNearMouse from "./components/HoverTextNearMouse";

class HorizontalLine extends Component {
	constructor(props) {
		super(props);
		this.handleEnd = this.handleEnd.bind(this);
		this.handleDragLine = this.handleDragLine.bind(this);
		this.handleDragLineComplete = this.handleDragLineComplete.bind(this);

		this.terminate = terminate.bind(this);
		this.saveNodeType = saveNodeType.bind(this);

		this.getSelectionState = isHoverForInteractiveType("trends")
			.bind(this);
		this.getHoverInteractive = this.getHoverInteractive.bind(this);

		this.state = {};
		this.nodes = [];
	}
	handleDragLine(index, newXYValue, otherProps) {
		this.setState({
			override: {
				...otherProps,
				index,
				...newXYValue
			}
		});
	}
	handleDragLineComplete(moreProps) {
		const { override } = this.state;
		if (isDefined(override)) {
			const { trends } = this.props;
			const newTrends = trends
				.map((each, idx) => idx === override.index
					? {
						...each,
						start: [override.x1Value, override.y1Value],
						end: [override.x2Value, override.y2Value],
						selected: true,
					}
					: {
						...each,
						selected: false,
					});

			this.setState({
				override: null,
			}, () => {
				this.props.onComplete(newTrends, moreProps);
			});
		}
	}
	// handleDrawLine(xyValue) {
	// 	const { current } = this.state;
	// 	if (isDefined(current) && isDefined(current.start)) {
	// 		this.mouseMoved = true;
	// 		this.setState({
	// 			current: {
	// 				start: current.start,
	// 				end: xyValue,
	// 			}
	// 		});
	// 	}
	// }
	// handleStart(xyValue, moreProps, e) {
	// 	const { current } = this.state;

	// 	if (isNotDefined(current) || isNotDefined(current.start)) {
	// 		this.mouseMoved = false;

	// 		this.setState({
	// 			current: {
	// 				start: xyValue,
	// 				end: null,
	// 			},
	// 		}, () => {
	// 			this.props.onStart(moreProps, e);
	// 		});
	// 	}
	// }
	handleEnd(xyValue, moreProps, e) {
		const { trends, appearance, type } = this.props;

		const newTrends = [
			...trends.map(d => ({ ...d, selected: false })),
			{
				start: [xyValue[0], xyValue[1]],
				end: [xyValue[0] + 1, xyValue[1]],
				selected: true,
				appearance,
				type,
			}
		];
		this.setState({
			current: null,
			trends: newTrends
		}, () => {
			this.props.onComplete(newTrends, moreProps, e);
		});
	}

	getHoverInteractive(hovering, horizontalLine) {
		horizontalLine.hovering = hovering;
		const { isHover } = this.props;
		isHover(hovering, horizontalLine);
	}

	render() {
		const { appearance } = this.props;
		const { enabled, snap, shouldDisableSnap, snapTo, type } = this.props;
		const { currentPositionRadius, currentPositionStroke } = this.props;
		const { currentPositionstrokeOpacity, currentPositionStrokeWidth } = this.props;
		const { hoverText, trends } = this.props;
		const { current, override } = this.state;
		const tempLine = isDefined(current) && isDefined(current.end)
			? <StraightLine
				type={type}
				noHover
				x1Value={current.start[0]}
				y1Value={current.start[1]}
				x2Value={current.end !== null ? current.end[0] : 0}
				y2Value={current.end !== null ? current.end[1] : 0}
				stroke={appearance.stroke}
				strokeWidth={appearance.strokeWidth}
				strokeOpacity={appearance.strokeOpacity}
				current={current}
			 />
			: null;
		return <g>
			{trends.map((each, idx) => {
				const eachAppearance = isDefined(each.appearance)
					? { ...appearance, ...each.appearance }
					: appearance;

				const hoverTextWithDefault = {
					...HorizontalLine.defaultProps.hoverText,
					...hoverText
				};
				return <EachHorizontalLine
					key={idx}
					ref={this.saveNodeType(idx)}
					index={idx}
					type={each.type}
					selected={each.selected}
					x1Value={getValueFromOverride(override, idx, "x1Value", each.start[0])}
					y1Value={getValueFromOverride(override, idx, "y1Value", each.start[1])}
					x2Value={getValueFromOverride(override, idx, "x2Value", each.end[0])}
					y2Value={getValueFromOverride(override, idx, "y2Value", each.end[1])}
					stroke={eachAppearance.stroke}
					strokeWidth={eachAppearance.strokeWidth}
					strokeOpacity={eachAppearance.strokeOpacity}
					strokeDasharray={eachAppearance.strokeDasharray}
					edgeStroke={eachAppearance.edgeStroke}
					edgeFill={eachAppearance.edgeFill}
					edgeStrokeWidth={eachAppearance.edgeStrokeWidth}
					r={eachAppearance.r}
					hoverText={hoverTextWithDefault}
					onDrag={this.handleDragLine}
					onDragComplete={this.handleDragLineComplete}
					edgeInteractiveCursor="react-stockcharts-move-cursor"
					lineInteractiveCursor="react-stockcharts-move-cursor"
					getHoverInteractive={hovering => this.getHoverInteractive(hovering, each)}
				/>;
			})}
			{tempLine}
			<MouseLocationIndicator
				enabled={enabled}
				snap={snap}
				shouldDisableSnap={shouldDisableSnap}
				snapTo={snapTo}
				r={currentPositionRadius}
				stroke={currentPositionStroke}
				strokeOpacity={currentPositionstrokeOpacity}
				strokeWidth={currentPositionStrokeWidth}
				// onMouseDown={this.handleStart}
				onClick={this.handleEnd}
				// onMouseMove={this.handleDrawLine}
			/>
		</g>;
	}
}


HorizontalLine.propTypes = {
	snap: PropTypes.bool.isRequired,
	enabled: PropTypes.bool.isRequired,
	snapTo: PropTypes.func,
	shouldDisableSnap: PropTypes.func.isRequired,

	onStart: PropTypes.func.isRequired,
	onComplete: PropTypes.func.isRequired,
	onSelect: PropTypes.func,
	onDoubleClick: PropTypes.func,

	currentPositionStroke: PropTypes.string,
	currentPositionStrokeWidth: PropTypes.number,
	currentPositionstrokeOpacity: PropTypes.number,
	currentPositionRadius: PropTypes.number,
	type: PropTypes.oneOf([
		"horizontal"
	]),
	hoverText: PropTypes.object.isRequired,

	trends: PropTypes.array.isRequired,
};

HorizontalLine.defaultProps = {
	type: "horizontal",

	onComplete: noop,
	// onStart: noop,
	// onSelect: noop,

	currentPositionStroke: "#000000",
	currentPositionstrokeOpacity: 1,
	currentPositionStrokeWidth: 3,
	currentPositionRadius: 0,

	shouldDisableSnap: e => (e.button === 2 || e.shiftKey),
	hoverText: {
		...HoverTextNearMouse.defaultProps,
		enable: true,
		bgHeight: "auto",
		bgWidth: "auto",
		text: "Click to select object",
		selectedText: "",
	},
	trends: [],

	appearance: {
		stroke: "#000000",
		strokeOpacity: 1,
		strokeWidth: 1,
		strokeDasharray: "Solid",
		edgeStrokeWidth: 1,
		edgeFill: "#FF0000",
		edgeStroke: "#FF0000",
		r: 6,
	}
};

export default HorizontalLine;
