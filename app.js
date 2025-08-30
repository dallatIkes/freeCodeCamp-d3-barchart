async function fetchData() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json');
        const json = await response.json();
        const dataset = json.data;
        return dataset;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function main() {
    const dataset = await fetchData();
    console.log(dataset);

    // set dimensions
    const w = 1200;
    const h = 650;
    const x_padding = 40;
    const y_padding = 20;
    const barWidth = (w - 2 * x_padding) / dataset.length;

    // x scale
    const min_year = dataset[0][0].substring(0, 4);
    const max_year = dataset[dataset.length - 1][0].substring(0, 4);
    console.log(min_year, max_year);

    const x_scale = d3
        .scaleTime()
        .domain([new Date(min_year), new Date(max_year)])
        .range([x_padding, w - x_padding]);

    // y scale
    const min_gdp = d3.min(dataset, (d) => d[1]);
    const max_gdp = d3.max(dataset, (d) => d[1]);
    console.log(min_gdp, max_gdp);

    const y_scale = d3
        .scaleLinear()
        .domain([0, max_gdp])
        .range([h - y_padding, y_padding]);;

    // create svg element
    const svg = d3
        .select('div')
        .append('svg')
        .attr('width', w)
        .attr('height', h)
        .style('background', 'blue');

    // create tooltip
    const tooltip = d3.select('body')
        .append('div')
        .attr('id', 'tooltip')

    // create bars
    svg
        .selectAll('rect')
        .data(dataset)
        .enter()
        .append('rect')
        .attr('x', (d, i) => x_scale(new Date(d[0])))
        .attr('y', d => y_scale(d[1]))
        .attr('width', barWidth)
        .attr('height', d => h - y_padding - y_scale(d[1]))
        .attr('class', 'bar')
        .attr('data-date', d => d[0])
        .attr('data-gdp', d => d[1])

    // adding interactivity with tooltip
    svg
        .selectAll('rect')
        .on('mouseover', (event, d) => {
            tooltip.transition()
                .duration(200)
                .style('opacity', 0.9);
            tooltip.html(`Date: ${d[0]}<br>GDP: $${d[1]} Billion`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px')
                .attr('data-date', d[0]);
        })
        .on('mouseout', () => {
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });

    // add axes
    const x_axis = d3.axisBottom(x_scale);
    const y_axis = d3.axisLeft(y_scale);

    svg
        .append('g')
        .attr('id', 'x-axis')
        .attr('transform', `translate(0, ${h - y_padding})`)
        .call(d3.axisBottom(x_scale));

    svg
        .append('g')
        .attr('id', 'y-axis')
        .attr('transform', `translate(${x_padding}, 0)`)
        .call(d3.axisLeft(y_scale));
}

main()