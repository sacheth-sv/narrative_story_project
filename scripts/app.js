async function slide_1_elements() {
    // Render the boxplot
    await render_boxplot_slide_1();
    // Render the table
    await render_table_slide_1();
}

async function render_boxplot_slide_1() {
    var margin = {top: 10, right: 30, bottom:30, left: 40}
    var width = 800 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;

    var svg = d3.select("#slide_1_boxplot")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Load the data
    d3.csv("data/state_policy_summary.csv", function(data) {
        // Need to compute the summary statistics
        var summary = d3.nest()
            .key(function(d) {return d.Strict_Label;})
            .rollup(function(d) {
                // Need to compute Q1, median, Q3, the IQR, and the min and max. Min & Max should be 0.95 and 0.5 to avoid outliers
                var q1 = d3.quantile(d.map(function(g) {return g.infection_ratio;}).sort(d3.ascending), .25);
                var q3 = d3.quantile(d.map(function(g) {return g.infection_ratio;}).sort(d3.ascending), .75);
                var median = d3.quantile(d.map(function(g) {return g.infection_ratio;}).sort(d3.ascending), .5);
                var IQR = q3 - q1;
                var max = d3.quantile(d.map(function(g) {return g.infection_ratio;}).sort(d3.ascending), .95);
                var min = d3.quantile(d.map(function(g) {return g.infection_ratio;}).sort(d3.ascending), .05);
                return {q1: q1, median: median, q3: q3, IQR: IQR, min: min, max: max};
            }).entries(data);

        // Y Scale
        var y = d3.scaleLinear().domain([0, 1]).range([height, 0]);
        svg.append("g").call(d3.axisLeft(y));

        // X Scale
        var x = d3.scaleBand().domain(["No Policy", "Some Policy", "Strict Policy"]).range([0, width]).padding(0.4);
        svg.append("g").attr("transform", "translate(0," + height + ")").call(d3.axisBottom(x));

        // Plot the boxes
        var boxWidth = 100
        svg.selectAll("box")
            .data(summary)
            .enter()
            .append("rect")
            .attr("x", function(d) {return x(d.key)-boxWidth/2;})
            .attr("y", function(d) {return y(d.value.q3);})
            .attr("height", function(d) {return y(d.value.q1) - y(d.value.q3);})
            .attr("width", boxWidth)
            .attr("stroke", "black")
            .style("fill", "#69b3a2");

        // Plot the median
        svg.selectAll("medians")
            .data(summary)
            .enter()
            .append("line")
            .attr("x1", function(d) {return x(d.key)-boxWidth/2;})
            .attr("x2", function(d) {return x(d.key)+boxWidth/2;})
            .attr("y1", function(d) {return y(d.value.median);})
            .attr("y2", function(d) {return y(d.value.median);})
            .attr("stroke", "black")
            .style("width", 80);
    });

}

async function render_table_slide_1() {

}