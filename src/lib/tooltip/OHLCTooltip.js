import React, { Component } from "react";
import PropTypes from "prop-types";
import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
import displayValuesFor from "./displayValuesFor";
import getYesterdayDate from "./getYesterdayDate";
import GenericChartComponent from "../GenericChartComponent";

import { isDefined, functor } from "../utils";
import ToolTipText from "./ToolTipText";
import ToolTipTSpanLabel from "./ToolTipTSpanLabel";
class OHLCTooltip extends Component {
	constructor(props) {
		super(props);
		this.renderSVG = this.renderSVG.bind(this);
	}
	renderSVG(moreProps) {
		const { displayValuesFor } = this.props;
		const {
			xDisplayFormat,
			accessor,
			volumeFormat,
			ohlcFormat,
			percentFormat,
			displayTexts,
			onChange,
			visible
		} = this.props;

		const {
			chartConfig: { width, height },
		} = moreProps;
		const { displayXAccessor, fullData } = moreProps;

		const currentItem = displayValuesFor(this.props, moreProps);
		const yesterdayItem = getYesterdayDate(fullData, currentItem);

		let displayDate, open, high, low, close, yesterdayClose, volume, percentChange;
		displayDate = open = high = low = close = yesterdayClose = volume = percentChange =
      displayTexts.na;

		if (isDefined(currentItem) && isDefined(accessor(currentItem))) {
			const item = accessor(currentItem);

			volume = isDefined(item.volume)
				? volumeFormat(item.volume)
				: displayTexts.na;

			displayDate = xDisplayFormat(displayXAccessor(item));
			open = ohlcFormat(item.open);
			high = ohlcFormat(item.high);
			low = ohlcFormat(item.low);
			close = ohlcFormat(item.close);
			yesterdayClose = isDefined(yesterdayItem) ? ohlcFormat(yesterdayItem.close) : null;
			percentChange = isDefined(yesterdayItem) ? percentFormat((item.close - yesterdayClose) / yesterdayClose) : "n/a";

			if (onChange) {
				onChange({ displayDate, open, high, low, close, volume, percentChange });
			}
		}

		const { origin: originProp } = this.props;
		const origin = functor(originProp);
		const [x, y] = origin(width, height);

		const itemsToDisplay = {
			displayDate,
			open,
			high,
			low,
			close,
			percentChange,
			volume,
			x,
			y,
		};

		return this.props.children(this.props, moreProps, itemsToDisplay);
	}
	render() {
		return (
			<GenericChartComponent
				clip={false}
				svgDraw={this.renderSVG}
				drawOn={["mousemove"]}
			/>
		);
	}
}

OHLCTooltip.propTypes = {
	className: PropTypes.string,
	accessor: PropTypes.func,
	xDisplayFormat: PropTypes.func,
	children: PropTypes.func,
	volumeFormat: PropTypes.func,
	percentFormat: PropTypes.func,
	ohlcFormat: PropTypes.func,
	origin: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
	fontFamily: PropTypes.string,
	fontSize: PropTypes.number,
	onClick: PropTypes.func,
	displayValuesFor: PropTypes.func,
	textFill: PropTypes.string,
	labelFill: PropTypes.string,
	displayTexts: PropTypes.object,
	onChange: PropTypes.func,
	visible: PropTypes.bool,
};

const displayTextsDefault = {
	d: "Date: ",
	o: " O: ",
	h: " H: ",
	l: " L: ",
	c: " C: ",
	v: " Vol: ",
	p: " P: ",
	na: "n/a",
	u: "Last update: "
};

OHLCTooltip.defaultProps = {
	accessor: (d) => {
		return {
			date: d.date,
			open: d.open,
			high: d.high,
			low: d.low,
			close: d.close,
			volume: d.volume,
		};
	},
	xDisplayFormat: timeFormat("%Y-%m-%d"),
	volumeFormat: format(".4s"),
	percentFormat: format(".2%"),
	ohlcFormat: format(".2f"),
	displayValuesFor: displayValuesFor,
	origin: [0, 0],
	children: defaultDisplay,
	displayTexts: displayTextsDefault,
};

function defaultDisplay(props, moreProps, itemsToDisplay) {
	/* eslint-disable */
  const {
    className,
    textFill,
    labelFill,
    onClick,
    fontFamily,
    fontSize,
    visible,
    serverTime = "2021-01-01 00:00",
    isIntraday,
    dir,
    onUpdateServerTime = () => { console.log("onUpdateServerTime") },
    getOHLCData
  } = props;
  /* eslint-enable */

	const displayTextsRTL = {
		d: ":תאריך",
		o: ":פתיחה",
		h: ":גבוה",
		l: ":נמוך",
		c: ":סגירה",
		v: ":מחזורים",
		p: ":שינוי",
		u: ":עדכון אחרון",
		na: "לא זמין",
	};

	const displayTexts = dir === "rtl" ? displayTextsRTL : props.displayTexts;
	let ltrDateXPosition = "0px";
	let rtlDateXPosition = "1300px";
	if (isIntraday) {
		ltrDateXPosition = "-30px";
		rtlDateXPosition = "1345";
	}

	const {
		displayDate,
		open,
		high,
		low,
		close,
		percentChange,
		volume,
		x,
		y,
	} = itemsToDisplay;
	// if (!visible) return null

	const OHLCData = {
		serverTime: serverTime,
		percentChange: percentChange,
		volume: volume,
		close: close,
		low: low,
		high: high,
		open: open,
		displayDate: displayDate
	};

	if (getOHLCData) {
		getOHLCData(OHLCData);
	}

	const getRTL = () => {
		return (
			<g
				className={`react-stockcharts-tooltip-hover ${className}`}
				transform={`translate(${x + 60}, ${y + 8})`}
				onClick={onClick}
				fill="white"
			>
				<image onClick={onUpdateServerTime} x="225px" y="-10px" href="./assets/cycle_arrow.png" height="24" width="24"/>
				<ToolTipText
					x={0}
					y={0}
					fontFamily={fontFamily}
					fontSize={fontSize || 14}
				>
					<tspan key="value_U" fill="white" dy="6px" x="30px">{serverTime || ""}</tspan>
					<ToolTipTSpanLabel fill="white" key="label_U" x="150px">
						{serverTime ? displayTexts.u : ""}
					</ToolTipTSpanLabel>
					<tspan key="value_U_divider" fill="#567E9C" dx="45px">|</tspan>

					<tspan key="value_P" fill="white" dx="30px">{percentChange}</tspan>
					<ToolTipTSpanLabel fill="white" key="label_P" x="360px">
						{displayTexts.p}
					</ToolTipTSpanLabel>
					<tspan key="value_P_divider" fill="#567E9C" dx="20px">|</tspan>

					<tspan key="value_Vol" fill="white" dx="30px">{volume}</tspan>
					<ToolTipTSpanLabel fill="white" key="label_Vol" x="510px">
						{displayTexts.v}
					</ToolTipTSpanLabel>
					<tspan key="value_Vol_divider" fill="#567E9C" dx="20px">|</tspan>

					<tspan key="value_C" fill="white" dx="30px">{close}</tspan>
					<ToolTipTSpanLabel fill="white" key="label_C" x="675px">
						{displayTexts.c}
					</ToolTipTSpanLabel>
					<tspan key="value_C_divider" fill="#567E9C" dx="20px">|</tspan>

					<tspan key="value_L" fill="white" dx="30px">{low}</tspan>
					<ToolTipTSpanLabel fill="white" key="label_L" x="830px">
						{displayTexts.l}
					</ToolTipTSpanLabel>
					<tspan key="value_L_divider" fill="#567E9C" dx="20px">|</tspan>

					<tspan key="value_H" fill="white" dx="30px">{high}</tspan>
					<ToolTipTSpanLabel fill="white" key="label_H" x="975px">
						{displayTexts.h}
					</ToolTipTSpanLabel>
					<tspan key="value_H_divider" fill="#567E9C" dx="20px">|</tspan>

					<tspan key="value_O" fill="white" dx="30px">{open}</tspan>
					<ToolTipTSpanLabel fill="white" key="label_O" x="1120px">
						{displayTexts.o}
					</ToolTipTSpanLabel>
					<tspan key="value_O_divider" fill="#567E9C" dx="20px">|</tspan>

					<tspan key="value" fill="white" dx="30px">{displayDate}</tspan>
					<ToolTipTSpanLabel fill="white" key="label" x={rtlDateXPosition}>
						{displayTexts.d}
					</ToolTipTSpanLabel>
					<tspan key="value_divider" fill="#567E9C" dx="20px">|</tspan>
				</ToolTipText>
			</g>
		);
	};

	const getLTR = () => {
		return (
			<g
				className={`react-stockcharts-tooltip-hover ${className}`}
				transform={`translate(${x + 60}, ${y + 8})`}
				onClick={onClick}
				fill="white"
			>
				<image onClick={onUpdateServerTime} x="890px" y="-10px" href="./assets/cycle_arrow.png" height="24" width="24"/>
				<ToolTipText
					x={0}
					y={0}
					fontFamily={fontFamily}
					fontSize={fontSize || 14}
				>
					<ToolTipTSpanLabel fill="white" key="label" dy="6px" x={ltrDateXPosition}>
						{displayTexts.d}
					</ToolTipTSpanLabel>
					<tspan key="value" fill="white">{displayDate}</tspan>
					<tspan key="value_divider" fill="#567E9C" x="130">|</tspan>

					<ToolTipTSpanLabel fill="white" key="label_O" dx="30px">
						{displayTexts.o}
					</ToolTipTSpanLabel>
					<tspan key="value_O" fill="white">{open}</tspan>
					<tspan key="value_O_divider" fill="#567E9C" x="250">|</tspan>

					<ToolTipTSpanLabel fill="white" key="label_H" dx="30px">
						{displayTexts.h}
					</ToolTipTSpanLabel>
					<tspan key="value_H" fill="white">{high}</tspan>
					<tspan key="value_H_divider" fill="#567E9C" x="368px">|</tspan>

					<ToolTipTSpanLabel fill="white" key="label_L" dx="30px">
						{displayTexts.l}
					</ToolTipTSpanLabel>
					<tspan key="value_L" fill="white">{low}</tspan>
					<tspan key="value_L_divider" fill="#567E9C" x="485px">|</tspan>

					<ToolTipTSpanLabel fill="white" key="label_C" dx="30px">
						{displayTexts.c}
					</ToolTipTSpanLabel>
					<tspan key="value_C" fill="white">{close}</tspan>
					<tspan key="value_C_divider" fill="#567E9C" x="603px">|</tspan>

					<ToolTipTSpanLabel fill="white" key="label_Vol" dx="30px">
						{displayTexts.v}
					</ToolTipTSpanLabel>
					<tspan key="value_Vol" fill="white">{volume}</tspan>
					<tspan key="value_Vol_divider" fill="#567E9C" x="735px">|</tspan>

					<ToolTipTSpanLabel fill="white" key="label_P" dx="30px">
						{displayTexts.p}
					</ToolTipTSpanLabel>
					<tspan key="value_P" fill="white">{percentChange}</tspan>
					<tspan key="value_P_divider" fill="#567E9C" x="855px">|</tspan>

					<ToolTipTSpanLabel fill="white" key="label_U" dx="60px">
						{serverTime ? displayTexts.u : ""}
					</ToolTipTSpanLabel>
					<tspan key="value_U" fill="white">{serverTime || ""}</tspan>
					<tspan key="value_U_divider" fill="#567E9C" dx="20px">{serverTime ? "|" : ""}</tspan>
				</ToolTipText>
			</g>
		);
	};

	// const renderTooltip = () => dir === "rtl" ? getRTL() : getLTR();
	// return (
	// 	<g>
	// 		<rect
	// 			id="myGroup"
	// 			width="100%"
	// 			height="20px"
	// 			fill="black"
	// 			transform={`translate(${x}, ${y})`}
	// 		></rect>
	// 		{renderTooltip()}
	// 	</g>
	// );
}

export default OHLCTooltip;
