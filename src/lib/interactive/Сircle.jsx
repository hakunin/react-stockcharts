/* eslint-disable no-debugger */
import React, { Component } from "react";
import PropTypes from "prop-types";

import { isDefined, isNotDefined, noop, strokeDashTypes } from "../utils";

import {
	terminate,
	saveNodeType,
	isHoverForInteractiveType,
} from "./utils";

import MouseLocationIndicator from "./components/MouseLocationIndicator";
import HoverTextNearMouse from "./components/HoverTextNearMouse";
import EachCircle from "./wrapper/EachCircle";

class Circle extends Component {
	constructor(props) {
		super(props);

		this.handleStart = this.handleStart.bind(this);
		this.handleEnd = this.handleEnd.bind(this);
		this.handleDrawLine = this.handleDrawLine.bind(this);
		this.handleDragLine = this.handleDragLine.bind(this);
		this.handleDragLineComplete = this.handleDragLineComplete.bind(this);

		this.terminate = terminate.bind(this);
		this.saveNodeType = saveNodeType.bind(this);

		this.getSelectionState = isHoverForInteractiveType("circle")
			.bind(this);

		this.getHoverInteractive = this.getHoverInteractive.bind(this);

		this.state = {
		};
		this.nodes = [];
	}
	handleDragLine(index, newXYValue) {
		this.setState({
			override: {
				index,
				start: [newXYValue.x1Value, newXYValue.y1Value],
				end: [newXYValue.x2Value, newXYValue.y2Value],
				...newXYValue,
			}
		});

	}
	handleDragLineComplete(moreProps) {
		const { override } = this.state;
		const { circle } = this.props;

		if (isDefined(override)) {
			const newTrends = circle
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
	handleDrawLine(xyValue) {
		const { current } = this.state;
		if (isDefined(current) && isDefined(current.start)) {
			this.mouseMoved = true;
			this.setState({
				current: {
					start: current.start,
					end: xyValue,
				}
			});
		}
	}
	handleStart(xyValue, moreProps, e) {
		const { current } = this.state;

		if (isNotDefined(current) || isNotDefined(current.start)) {
			this.mouseMoved = false;

			this.setState({
				current: {
					start: xyValue,
					end: null,
				},
			}, () => {
				this.props.onStart(moreProps, e);
			});
		}
	}
	handleEnd(xyValue, moreProps, e) {
		const { current } = this.state;
		const { circle, appearance, type } = this.props;

		if (this.mouseMoved
			&& isDefined(current)
			&& isDefined(current.start)
		) {
			const newTrends = [
				...circle.map(d => ({ ...d, selected: false })),
				{
					...current,
					selected: true,
					end: xyValue,
					appearance,
					type,
				}
			];
			this.setState({
				current: null,
				circle: newTrends
			}, () => {
				this.props.onComplete(newTrends, moreProps, e);
			});
		}
	}

	getHoverInteractive(hovering, circle) {
		circle.hovering = hovering;
		const { isHover } = this.props;
		isHover(hovering, circle);
	}

	render() {
		const { appearance, selected } = this.props;
		const { enabled, type } = this.props;
		const { currentPositionRadius, currentPositionStroke } = this.props;
		const { currentPositionstrokeOpacity, currentPositionStrokeWidth } = this.props;
		const { hoverText, circle } = this.props;
		const { current, override } = this.state;
		const overrideIndex = isDefined(override) ? override.index : null;

		const tempLine = isDefined(current) && isDefined(current.end)
			? <EachCircle
				interactive={false}
				{...current}
				type={type}
				hoverText={hoverText}
				selected={selected}
				appearance={appearance}
			/>
			: null;

		return <g>
			{circle.map((each, idx) => {
				const eachAppearance = isDefined(each.appearance)
					? { ...appearance, ...each.appearance }
					: appearance;

				const hoverTextWithDefault = {
					...Circle.defaultProps.hoverText,
					...hoverText
				};

				return <EachCircle key={idx}
					ref={this.saveNodeType(idx)}
					index={idx}
					selected={each.selected}
					hoverText={hoverTextWithDefault}
					{...(idx === overrideIndex ? override : each)}
					appearance={eachAppearance}
					type={type}
					onDrag={this.handleDragLine}
					onDragComplete={this.handleDragLineComplete}
					getHoverInteractive={hovering => this.getHoverInteractive(hovering, each)}
				/>;
			})}
			{tempLine}
			<MouseLocationIndicator
				enabled={enabled}
				snap={false}
				r={currentPositionRadius}
				stroke={currentPositionStroke}
				opacity={currentPositionstrokeOpacity}
				strokeWidth={currentPositionStrokeWidth}
				onMouseDown={this.handleStart}
				onClick={this.handleEnd}
				onMouseMove={this.handleDrawLine} />
		</g>;


	}
}

Circle.propTypes = {
	enabled: PropTypes.bool.isRequired,

	onStart: PropTypes.func.isRequired,
	onComplete: PropTypes.func.isRequired,
	onSelect: PropTypes.func,

	currentPositionStroke: PropTypes.string,
	currentPositionStrokeWidth: PropTypes.number,
	currentPositionstrokeOpacity: PropTypes.number,
	currentPositionRadius: PropTypes.number,
	type: PropTypes.oneOf([
		"CIRCLE"
	]).isRequired,
	hoverText: PropTypes.object.isRequired,

	circle: PropTypes.array.isRequired,

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
	}).isRequired
};

Circle.defaultProps = {
	type: "RECTANGLE",

	onStart: noop,
	onComplete: noop,
	onSelect: noop,

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
	},
	circle: [],

	appearance: {
		stroke: "#000000",
		strokeOpacity: 1,
		strokeWidth: 1,
		strokeDasharray: "Solid",

		fill: "#e33232",
		fillOpacity: 0.2,

		edgeStrokeWidth: 1,
		edgeFill: "#FF0000",
		edgeStroke: "#FF0000",
		r: 6,
	}
};

export default Circle;
