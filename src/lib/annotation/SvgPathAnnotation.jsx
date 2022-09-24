

import React, { Component } from "react";
import PropTypes from "prop-types";
import { functor, uniqueId } from "../utils";

class SvgPathAnnotation extends Component {
	constructor(props) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}
	handleClick(e) {
		const { onClick } = this.props;

		if (onClick) {
			const { xScale, yScale, datum } = this.props;
			onClick({ xScale, yScale, datum }, e);
		}
	}
	render() {
		const { className } = this.props;
		const { xAccessor, xScale, yScale, path } = this.props;

		const { x, y, fill, tooltip } = helper(this.props, xAccessor, xScale, yScale);
		const position =
			tooltip === "Go long"
				? `M ${x} ${y + 60} ${x},${y + 10}`
				: `M ${x} ${y - 60} ${x},${y - 10}`;

		const id = uniqueId("arrow");

		return (<g className={className} onClick={this.handleClick}>
			<title>{tooltip}</title>
			<defs>
				<marker
					id={`arrowhead-${id}`}
					viewBox="0 0 10 10"
					refX="7"
					refY="5"
					markerUnits="strokeWidth"
					markerWidth="4"
					markerHeight="3"
					orient="auto"
				>
					<path
						d="M 0 0 L 10 5 L 0 10 z"
						stroke="none"
						fill={fill}
					></path>
				</marker>
			</defs>

			<path
				d={position}
				stroke={fill}
				strokeWidth="8"
				fill={fill}
				markerEnd={`url(#arrowhead-${id})`}
			></path>

		</g>);
	}
}

function helper(props, xAccessor, xScale, yScale) {
	const { x, y, datum, fill, tooltip, plotData } = props;

	const xFunc = functor(x);
	const yFunc = functor(y);

	const [xPos, yPos] = [xFunc({ xScale, xAccessor, datum, plotData }), yFunc({ yScale, datum, plotData })];

	return {
		x: xPos,
		y: yPos,
		fill: functor(fill)(datum),
		tooltip: functor(tooltip)(datum),
	};
}

SvgPathAnnotation.propTypes = {
	className: PropTypes.string,
	path: PropTypes.func.isRequired,
	onClick: PropTypes.func,
	xAccessor: PropTypes.func,
	xScale: PropTypes.func,
	yScale: PropTypes.func,
	datum: PropTypes.object,
	stroke: PropTypes.string,
	fill: PropTypes.string,
	opacity: PropTypes.number,
};

SvgPathAnnotation.defaultProps = {
	className: "react-stockcharts-svgpathannotation",
	opacity: 1,
	x: ({ xScale, xAccessor, datum }) => xScale(xAccessor(datum)),
};

export default SvgPathAnnotation;
