import React, { Component } from "react";
import PropTypes from "prop-types";

import { noop } from "../../utils";
import { saveNodeType, isHover } from "../utils";
import { getXValue } from "../../utils/ChartDataUtil";

import HoverTextNearMouse from "../components/HoverTextNearMouse";
import InteractiveText from "../components/InteractiveText";

class EachText extends Component {
	constructor(props) {
		super(props);

		this.handleHover = this.handleHover.bind(this);

		this.handleDragStart = this.handleDragStart.bind(this);
		this.handleDrag = this.handleDrag.bind(this);
		this.handleDouble = this.handleDouble.bind(this);

		this.isHover = isHover.bind(this);
		this.saveNodeType = saveNodeType.bind(this);
		this.nodes = {};

		this.state = {
			hover: false,
		};
	}
	handleDragStart(moreProps) {
		const {
			position,
		} = this.props;
		const { mouseXY } = moreProps;
		const { chartConfig: { yScale }, xScale } = moreProps;
		const [mouseX, mouseY] = mouseXY;

		const [textCX, textCY] = position;
		const dx = mouseX - xScale(textCX);
		const dy = mouseY - yScale(textCY);

		this.dragStartPosition = {
			position, dx, dy
		};
	}
	handleDrag(moreProps) {
		const { index, onDrag, selected } = this.props;
		const {
			// eslint-disable-next-line no-unused-vars
			mouseXY: [mouseX, mouseY],
			chartConfig: { yScale },
			xAccessor,
			mouseXY,
			plotData,
			xScale,
		} = moreProps;

		const { hover } = this.state;

		if (hover && selected) {

			const { dx, dy } = this.dragStartPosition;
			const xValue = xScale.invert(
				xScale(getXValue(xScale, xAccessor, mouseXY, plotData)) - dx
			);
			// xScale.invert(xScale(xAccessor(currentItem)) - dx);
			const xyValue = [
				xValue,
				yScale.invert(mouseY - dy)
			];

			onDrag(index, xyValue);
		}
	}
	handleHover(moreProps) {
		const {
			position,
			bgFill,
			bgOpacity,
			bgStroke,
			bgStrokeWidth,
			textFill,
			fontFamily,
			fontSize,
			fontWeight,
			fontStyle,
			text,
			hoverText,
			selected,
			onDoubleClick,
		} = this.props;

		if (moreProps.hovering) {
			onDoubleClick({
				position,
				bgFill,
				bgOpacity,
				bgStroke,
				bgStrokeWidth,
				textFill,
				fontFamily,
				fontSize,
				fontWeight,
				fontStyle,
				text,
				hoverText,
				selected, moreProps
			});
		} else {
			onDoubleClick(null);
		}

		if (this.state.hover !== moreProps.hovering) {
			this.setState({
				hover: moreProps.hovering
			});
		}
	}
	handleDouble(moreProps, e) {
		const { onDoubleClick, position } = this.props;

		onDoubleClick(moreProps, e, position);
	}
	render() {
		const {
			position,
			bgFill,
			bgOpacity,
			bgStroke,
			bgStrokeWidth,
			textFill,
			fontFamily,
			fontSize,
			fontWeight,
			fontStyle,
			text,
			hoverText,
			selected,
			onDragComplete,
			onDoubleClick
		} = this.props;
		const { hover } = this.state;

		const hoverHandler = {
			onHover: this.handleHover,
			onUnHover: this.handleHover
		};

		const {
			enable: hoverTextEnabled,
			selectedText: hoverTextSelected,
			text: hoverTextUnselected,
			...restHoverTextProps
		} = hoverText;


		return <g>
			<InteractiveText
				ref={this.saveNodeType("text")}
				selected={selected || hover}
				interactiveCursorClass="react-stockcharts-move-cursor"
				{...hoverHandler}

				onDragStart={this.handleDragStart}
				onDrag={this.handleDrag}
				onDoubleClick={onDoubleClick}
				onDragComplete={onDragComplete}
				position={position}
				bgFill={bgFill}
				bgOpacity={bgOpacity}
				bgStroke={bgStroke || textFill}
				bgStrokeWidth={bgStrokeWidth}
				textFill={textFill}
				fontFamily={fontFamily}
				fontStyle={fontStyle}
				fontWeight={fontWeight}
				fontSize={fontSize}
				text={text}
			/>
			<HoverTextNearMouse
				show={hoverTextEnabled && hover}
				{...restHoverTextProps}
				text={selected ? hoverTextSelected : hoverTextUnselected}
			/>
		</g>;
	}
}
/*
export function getNewXY(moreProps, snapTo) {
	const { xScale, xAccessor, plotData, mouseXY } = moreProps;

	const currentItem = getCurrentItem(xScale, xAccessor, mouseXY, plotData);
	const x = xAccessor(currentItem);
	const y = snapTo(currentItem);

	return [x, y];
}
 */
EachText.propTypes = {
	index: PropTypes.number,

	position: PropTypes.array.isRequired,
	bgFill: PropTypes.string.isRequired,
	bgOpacity: PropTypes.number.isRequired,
	bgStrokeWidth: PropTypes.number.isRequired,
	bgStroke: PropTypes.string,
	textFill: PropTypes.string.isRequired,

	fontWeight: PropTypes.string.isRequired,
	fontFamily: PropTypes.string.isRequired,
	fontStyle: PropTypes.string.isRequired,
	fontSize: PropTypes.number.isRequired,

	text: PropTypes.string.isRequired,
	selected: PropTypes.bool.isRequired,

	onDrag: PropTypes.func.isRequired,
	onDragComplete: PropTypes.func.isRequired,
	onDoubleClick: PropTypes.func.isRequired,

	hoverText: PropTypes.object.isRequired,
};

EachText.defaultProps = {
	onDrag: noop,
	onDragComplete: noop,
	onDoubleClick: noop,
	bgOpacity: 1,
	bgStrokeWidth: 1,
	selected: false,
	fill: "#8AAFE2",
	hoverText: {
		...HoverTextNearMouse.defaultProps,
		enable: true,
		bgHeight: "auto",
		bgWidth: "auto",
		text: "Click to select object",
	}
};

export default EachText;
