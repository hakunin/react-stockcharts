

import React from "react";
import { TypeChooser } from "react-stockcharts/lib/helper";

import ContentSection from "lib/content-section";
import Row from "lib/row";
import Section from "lib/section";

import CandleStickChartWithRectangle from "lib/charts/CandleStickChartWithRectangle";

class RectanglePage extends React.Component {
	render() {
		return (
			<ContentSection title={RectanglePage.title}>
				<Row>
					<Section colSpan={2}>
						<aside dangerouslySetInnerHTML={{ __html: require("md/EQUIDISTANT-CHANNEL") }}></aside>
					</Section>
				</Row>
				<Row>
					<Section colSpan={2}>
						<TypeChooser>
							{type => <CandleStickChartWithRectangle data={this.props.someData} type={type} />}
						</TypeChooser>
					</Section>
				</Row>
			</ContentSection>
		);
	}
}

RectanglePage.title = "Rectangle Page";

export default RectanglePage;
