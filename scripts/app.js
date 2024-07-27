async function slide_1_elements() {
    // Render the boxplot
    await render_boxplot_slide_1();
}

async function render_boxplot_slide_1() {
    var margin = {top: 10, right: 30, bottom:30, left: 55}
    var width = 750 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;

    var svg = d3.select("#slide_1_boxplot")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Load the data
    await d3.csv("https://raw.githubusercontent.com/sacheth-sv/narrative_story_project/main/data/state_policy_summary.csv", function(data) {
        // Need to compute the summary statistics
        console.log(data)
        var summary = d3.nest()
            .key(function(d) {return d.Strict_Label;})
            .rollup(function(d) {
                console.log(d.length)
                // Need to compute Q1, median, Q3, the IQR, and the min and max. Min & Max should be 0.95 and 0.5 to avoid outliers
                var q1 = d3.quantile(d.map(function(g) {return g.infection_ratio;}).sort(d3.ascending), .25);
                var q3 = d3.quantile(d.map(function(g) {return g.infection_ratio;}).sort(d3.ascending), .75);
                var median = d3.quantile(d.map(function(g) {return g.infection_ratio;}).sort(d3.ascending), .5);
                var IQR = q3 - q1;
                var max = d3.quantile(d.map(function(g) {return g.infection_ratio;}).sort(d3.ascending), .95);
                var min = d3.quantile(d.map(function(g) {return g.infection_ratio;}).sort(d3.ascending), .05);
                var avg = d3.mean(d.map(function(g) {return g.infection_ratio;}));
                return {q1: q1, median: median, q3: q3, IQR: IQR, min: min, max: max, num_states: d.length, avg: avg};
            }).entries(data);

        console.log(summary)

        // Y Scale
        var y = d3.scaleLinear().domain([.1, .35]).range([height, 0]);
        svg.append("g").call(d3.axisLeft(y));

        // X Scale
        var x = d3.scaleBand().domain(["Strict", "Moderate", "Lax"]).range([0, width]).padding(0.4);
        // increase font size of x-axis labels
        svg.append("g").attr("transform", "translate(0," + height + ")").call(d3.axisBottom(x)).selectAll("text").attr("font-size", "15px");

        // Create the tooltips
        var Tooltip = d3.select("#slide_1_boxplot")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("position", "absolute")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("max-width", "200px")
            .style("padding", "5px");
        
        tooltipMouseover = function(d) {
            Tooltip.style("opacity", 1);
            d3.select(this).style("stroke", "black").style("opacity", 1);
        }

        tooltipMousemove = function(d) {
            html_text = d.value.num_states + " states have a " + d.key + " policy with an average infection ratio of " + d3.format(".2f")(d.value.avg);
            Tooltip.html(html_text)
                .style("top", (event.pageY) -90 + "px")
                .style("left", (event.pageX) -240 + "px");
        }

        tooltipMouseleave = function(d) {
            Tooltip.style("opacity", 0);
            d3.select(this).style("stroke", "none").style("opacity", 0.8);
        }

        // vertical lines
        var boxWidth = 100;
        var boxPadding = 13;
        svg.selectAll("vertLines")
            .data(summary)
            .enter()
            .append("line")
            .attr("x1", function(d) {return x(d.key)+boxPadding+boxWidth/2;})
            .attr("x2", function(d) {return x(d.key)+boxPadding+boxWidth/2;})
            .attr("y1", function(d) {return y(d.value.min);})
            .attr("y2", function(d) {return y(d.value.max);})
            .attr("stroke", "black")
            .style("width", 40);
        
        // Plot the boxes
        var clickedBox = "Strict";
        svg.selectAll("box")
            .data(summary)
            .enter()
            .append("rect")
            .attr("x", function(d) {return x(d.key)+boxPadding;})
            .attr("y", function(d) {return y(d.value.q3);})
            .attr("height", function(d) {return y(d.value.q1) - y(d.value.q3);})
            .attr("width", boxWidth)
            .attr("stroke", "black")
            .style("fill", "#69b3a2")
            .on("mouseover", function(d) {
                tooltipMouseover(d);
            })
            .on("mousemove", function(d) {
                tooltipMousemove(d);
            })
            .on("mouseout", function(d) {
                tooltipMouseleave(d);
            })
            .on("click", function(d) {
                svg.selectAll("rect").style("fill", "#69b3a2");
                d3.select(this).style("fill", "#468a7a");
                render_table_slide_1(d.key);
            });

        // Plot the median
        svg.selectAll("medians")
            .data(summary)
            .enter()
            .append("line")
            .attr("x1", function(d) {return x(d.key)+boxPadding;})
            .attr("x2", function(d) {return x(d.key)+boxWidth+boxPadding;})
            .attr("y1", function(d) {return y(d.value.median);})
            .attr("y2", function(d) {return y(d.value.median);})
            .attr("stroke", "black")
            .style("width", 80);

        // Add the y-axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height/2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font-size", "15px")
            .text("Infection Ratio");
    });

}

async function render_table_slide_1(strictness_level) {
    await d3.csv("https://raw.githubusercontent.com/sacheth-sv/narrative_story_project/main/data/state_policy_summary.csv", function(data) {
        var table = d3.select("#slide_1_table").html("").append("table").attr("class", "table").append("tbody");
        var usable_data = data.filter(function(d) {return d.Strict_Label == strictness_level;});
        console.log(usable_data);
        // the first row will contain the states seperated by commas
        // the second row will contain the average number of contact reduction policies
        // the third row will contain the average number of mask wearing policies
        // the fourth row will contain the average number of notification policies
        // the fifth row will contain the average infection ratio
        var states = usable_data.map(function(d) {return d.state_abbr;});
        if (states.length < 10) {
            states = states.join(", ");
        } else {
            states = states.slice(0, 10).join(", ") + "...";
        }
        var avg_contact = d3.mean(usable_data.map(function(d) {return d.contact_reduce_num;}));
        var avg_mask = d3.mean(usable_data.map(function(d) {return d.mask_vaccine_num;}));
        var avg_notification = d3.mean(usable_data.map(function(d) {return d.notification_num;}));
        var avg_infection = d3.mean(usable_data.map(function(d) {return d.infection_ratio;}));

        html_text = "<tr><td><strong>States</strong></td><td>" + states + "</td>"
        table.append("tr").html(html_text);
        html_text = "<tr><td><strong>Average Contact Reduction Policies</strong></td><td>" + d3.format(".2f")(avg_contact) + "</td>"
        table.append("tr").html(html_text);
        html_text = "<tr><td><strong>Average Mask Wearing Policies</strong></td><td>" + d3.format(".2f")(avg_mask) + "</td>"
        table.append("tr").html(html_text);
        html_text = "<tr><td><strong>Average Notification Policies</strong></td><td>" + d3.format(".2f")(avg_notification) + "</td>"
        table.append("tr").html(html_text);
        html_text = "<tr><td><strong>Average Infection Ratio</strong></td><td>" + d3.format(".2f")(avg_infection) + "</td>"
        table.append("tr").html(html_text);

        var p = d3.select("#slide_1_table").append("p");
        var p_text = "If the number of contact reduction policies is increased by 1"
        p.text("");
    });

}

async function compute_predicted_infected(strictness_level) {
    return -.1*strictness_level + .325;
}