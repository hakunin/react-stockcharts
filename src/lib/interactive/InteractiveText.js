/* eslint-disable react/no-direct-mutation-state */


import React, { Component } from "react";
import PropTypes from "prop-types";

import { isDefined, noop } from "../utils";

import {
	getValueFromOverride,
	terminate,
	saveNodeType,
	isHoverForInteractiveType,
} from "./utils";
import EachText from "./wrapper/EachText";
import HoverTextNearMouse from "./components/HoverTextNearMouse";
import GenericChartComponent from "../GenericChartComponent";
import { getMouseCanvas } from "../GenericComponent";

class InteractiveText extends Component {
	constructor(props) {
		super(props);

		this.handleDrag = this.handleDrag.bind(this);
		this.handleDouble = this.handleDouble.bind(this);
		this.handleDoubleClick = this.handleDoubleClick.bind(this);
		this.handleDragComplete = this.handleDragComplete.bind(this);
		this.terminate = terminate.bind(this);

		this.saveNodeType = saveNodeType.bind(this);
		this.getSelectionState = isHoverForInteractiveType("textList")
			.bind(this);

		this.nodes = [];
		this.state = {};
	}
	handleDrag(index, position) {
		this.setState({
			override: {
				index,
				position,
			}
		});
	}
	handleDragComplete(moreProps) {
		const { override } = this.state;
		const newOverride = override && override.position || null;

		this.state = {
			...this.state,
			currentText: {
				...this.state.currentText,
				position: newOverride
			}
		};

		if (isDefined(override)) {
			const { textList } = this.props;
			const newTextList = textList
				.map((each, idx) => {
					const selected = (idx === override.index);
					return selected
						? {
							...each,
							position: override.position,
							selected,
						}
						: {
							...each,
							selected
						};
				});

			this.setState({
				currentText: this.state.currentText
			}, () => {
				this.props.onDragComplete(newTextList, moreProps);
			});

			this.state = {
				...this.state,
				override: null
			};
		}
	}
	handleDrawLine(xyValue) {
		const { current } = this.state;

		if (isDefined(current) && isDefined(current.start)) {
			this.setState({
				current: {
					start: current.start,
					end: xyValue,
				}
			});
		}
	}
	handleDoubleClick(moreProps, e) {
		const { onDoubleClick } = this.props;
		const { currentText } = this.state;

		if (onDoubleClick && currentText !== null) {
			onDoubleClick(currentText, moreProps, e);
		}
	}

	handleDouble(props) {
		this.setState({
			currentText: props
		});
	}

	render() {
		const { textList, defaultText, hoverText } = this.props;
		const { override } = this.state;

		return <g>
			{textList.map((each, idx) => {
				const defaultHoverText = InteractiveText.defaultProps.hoverText;
				const props = {
					...defaultText,
					...each,
					hoverText: {
						...defaultHoverText,
						...hoverText,
						...(each.hoverText || {})
					},
				};
				return <EachText key={idx}
					ref={this.saveNodeType(idx)}
					index={idx}
					{...props}
					selected={each.selected}
					position={getValueFromOverride(override, idx, "position", each.position)}

					onDrag={this.handleDrag}
					onDoubleClick={this.handleDouble}
					onDragComplete={this.handleDragComplete}
					edgeInteractiveCursor="react-stockcharts-move-cursor"
				/>;
			})}
			<GenericChartComponent
				onDoubleClick={this.handleDoubleClick}

				svgDraw={noop}
				canvasDraw={noop}
				canvasToDraw={getMouseCanvas}

				drawOn={["mousemove", "pan"]}
			/>;
		</g>;
	}
}

InteractiveText.propTypes = {
	onChoosePosition: PropTypes.func.isRequired,
	onDragComplete: PropTypes.func.isRequired,
	onSelect: PropTypes.func,
	onDoubleClick: PropTypes.func,

	defaultText: PropTypes.shape({
		bgFill: PropTypes.string.isRequired,
		bgOpacity: PropTypes.number.isRequired,
		bgStrokeWidth: PropTypes.number,
		bgStroke: PropTypes.string,
		textFill: PropTypes.string.isRequired,
		fontFamily: PropTypes.string.isRequired,
		fontWeight: PropTypes.string.isRequired,
		fontStyle: PropTypes.string.isRequired,
		fontSize: PropTypes.number.isRequired,
		text: PropTypes.string.isRequired,
	}).isRequired,

	hoverText: PropTypes.object.isRequired,
	textList: PropTypes.array.isRequired,
	enabled: PropTypes.bool.isRequired,
};

InteractiveText.defaultProps = {
	onChoosePosition: noop,
	onDragComplete: noop,
	onSelect: noop,
	onDoubleClick: noop,

	defaultText: {
		bgFill: "#D3D3D3",
		bgOpacity: 1,
		bgStrokeWidth: 1,
		textFill: "#F10040",
		fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
		fontSize: 12,
		fontStyle: "normal",
		fontWeight: "normal",
		text: "Lorem ipsum..."
	},
	hoverText: {
		...HoverTextNearMouse.defaultProps,
		enable: true,
		bgHeight: "auto",
		bgWidth: "auto",
		text: "Click to select object",
		selectedText: "",
	},
	textList: [],
};

InteractiveText.contextTypes = {
	subscribe: PropTypes.func.isRequired,
	unsubscribe: PropTypes.func.isRequired,
	generateSubscriptionId: PropTypes.func.isRequired,
	chartId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

export default InteractiveText;
