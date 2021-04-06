import { LitElement, html, css } from 'lit-element';
import crossfilter from 'crossfilter2';

import { range } from 'd3-array';
import { csvParse } from 'd3-dsv';
import { scaleBand } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { BarChart, CompositeChart, config, legend, LineChart, units } from 'dc';
import 'dc/src/compat/d3v6';

config.defaultColors(schemeCategory10);

import { data } from './data.js';

export class DcCompositeBarLine extends LitElement {

    static get styles() {
        return css`
            :host {
                display: flex;
                flex-direction: column;
            }
            div {
                width: 700px;
                height: 500px;
            }
        `;
    }

  render() {
    const el = document.createElement('div'),
        el2 = document.createElement('div'),
        composite = new CompositeChart(el),
        bar = new BarChart(composite),
        bar2 = new BarChart(el2),
        line = new LineChart(composite),
        ndx = crossfilter(csvParse(data, r => ({
            type: r.type,
            amount: +r.amount,
            period: r.period
        }))),
        dims = {
            year: ndx.dimension(d => +d.period.substr(0, 4)),
            month: ndx.dimension(d => +d.period.substr(4))
        },
        groups = {
            baseAmount: dims.year.group().reduceSum(d => d.type === 'base' ? d.amount : 0),
            topAmount: dims.year.group().reduceSum(d => d.type === 'top' ? d.amount : 0),
            baseAmountM: dims.month.group().reduceSum(d => d.type === 'base' ? d.amount : 0),
            topAmountM: dims.month.group().reduceSum(d => d.type === 'top' ? d.amount : 0),
            diffAmount: dims.year.group().reduceSum(d => d.type === 'top' ? +d.amount : -d.amount)
        };

    composite
        .width(700)
        .height(500)
        .dimension(dims.year)
        .brushOn(false)
        .legend(legend().x(80).y(20).itemHeight(13).gap(5))
        .x(scaleBand().domain(range(2020,2030)))
        .xUnits(units.ordinal)
        .elasticY(true)
        .compose([
            bar
                .addFilterHandler((filters, filter)=>[filter])
                .group(groups.baseAmount, 'base')
                .stack(groups.topAmount, 'top'),
            line
                .colors('red')
                .group(groups.diffAmount)
                .useRightYAxis(true)
        ])
        .render();

    bar2
        .width(700)
        .height(400)
        .x(scaleBand().domain(range(1,12)))
        .xUnits(units.ordinal)
        .dimension(dims.month)
        .group(groups.baseAmountM)
        .stack(groups.topAmountM, 'top')
        .addFilterHandler((filters, filter)=>[filter])
        .render(); 

    return html`<link href="../node_modules/dc/dist/style/dc.css" rel="stylesheet">${el}${el2}`;
  }
}
