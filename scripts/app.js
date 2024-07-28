async function slide_1_elements() {
    // Render the boxplot
    await render_boxplot_slide_1();
}

async function slide_2_elements() {
    // Render the boxplot
    await render_boxplot_slide_2();
}

async function slide_3_elements() {
    // Render the lineplot
    await render_lineplot_slide_3();
    await render_table_slide_3();
}

async function render_boxplot_slide_1() {
    var margin = {top: 10, right: 30, bottom:30, left: 55}
    var width = 700 - margin.left - margin.right;
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
                var avg = d3.mean(d.map(function(g) {return g.infection_ratio;}));
                return {q1: q1, median: median, q3: q3, IQR: IQR, min: min, max: max, num_states: d.length, avg: avg};
            }).entries(data);

 
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
            html_text = d.value.num_states + " states have a " + d.key + " policy with an average infection ratio of " + d3.format(".3f")(d.value.avg);
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

        // add the slope annotation
        svg.append("defs").append("marker")
            .attr("id", "arrow")
            .attr("viewBox", "0 0 10 10")
            .attr("refX", 5)
            .attr("refY", 5)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M 0 0 L 10 5 L 0 10 z");

        // create a second arrow facing the opposite direction
        svg.append("defs").append("marker")
            .attr("id", "arrowOther")
            .attr("viewBox", "0 0 10 10")
            .attr("refX", 5)
            .attr("refY", 5)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "180")
            .append("path")
            .attr("d", "M 0 0 L 10 5 L 0 10 z");

        svg.append("path")
            .attr("d", d3.line()([[x("Lax")+boxPadding+boxWidth/2, 30],[x("Strict")+boxPadding+boxWidth/2, 60]]))
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5")
            .attr("marker-end", "url(#arrow)");

        // add bolded text annotation with a rotation
        svg.append("text")
            .attr("x", x("Strict")+boxPadding+boxWidth/2)
            .attr("y", 20)
            .text("As the number of policies increase, the infection ratio decreases")
            .style("font-size", "15px")
            .style("font-weight", "bold")
            .attr("transform", "rotate(-3.7," + (x("Moderate")+boxPadding+boxWidth/2) + ",500)");

        // add a horizontal line at the bottom of the chart
        svg.append("line")
            .attr("x1", 30)
            .attr("x2", width-30)
            .attr("y1", height-50)
            .attr("y2", height-50)
            .attr("stroke", "black")
            .attr("stroke-width", 3)
            .attr("stroke-dasharray", "5")
            .attr("marker-end", "url(#arrow)")
            .attr("marker-start", "url(#arrowOther)");

        // add a text annotation at the bottom of the chart
        svg.append("text")
            .attr("y", height-60)
            .attr("x", 50)
            .text("More Policies")
            .style("font-size", "15px")
            .style("font-style", "italic");

        svg.append("text")
            .attr("y", height-60)
            .attr("x", width-125)
            .text("Less Policies")
            .style("font-size", "15px")
            .style("font-style", "italic");

    });

}

async function render_table_slide_1(strictness_level) {
    await d3.csv("https://raw.githubusercontent.com/sacheth-sv/narrative_story_project/main/data/state_policy_summary.csv", function(data) {
        var table = d3.select("#slide_1_table").html("").append("table").attr("class", "table").append("tbody");
        var usable_data = data.filter(function(d) {return d.Strict_Label == strictness_level;});
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
        html_text = "<tr><td><strong>Average Contact Reduction Policies</strong></td><td>" + d3.format(".3f")(avg_contact) + "</td>"
        table.append("tr").html(html_text);
        html_text = "<tr><td><strong>Average Average Mask/Vaccination Policies</strong></td><td>" + d3.format(".3f")(avg_mask) + "</td>"
        table.append("tr").html(html_text);
        html_text = "<tr><td><strong>Average Notification Policies</strong></td><td>" + d3.format(".3f")(avg_notification) + "</td>"
        table.append("tr").html(html_text);
        html_text = "<tr><td><strong>Average Infection Ratio</strong></td><td>" + d3.format(".3f")(avg_infection) + "</td>"
        table.append("tr").html(html_text);

        var p = d3.select("#slide_1_table").append("p");
        var p_text = "Assuming we have a population of 100,000 people, if we increased the number of contact reduction policies by even 1, we can decrease the number of infections by 130"
        p.text(p_text);
    });

}

async function render_boxplot_slide_2() {
    var margin = {top: 10, right: 30, bottom:30, left: 70}
    var width = 700 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;

    var svg = d3.select("#slide_2_boxplot")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Load the data
    await d3.csv("https://raw.githubusercontent.com/sacheth-sv/narrative_story_project/main/data/state_policy_summary.csv", function(data) {
        // Need to compute the summary statistics
        var summary = d3.nest()
            .key(function(d) {return d.Strict_Label;})
            .rollup(function(d) {
                // Need to compute Q1, median, Q3, the IQR, and the min and max. Min & Max should be 0.95 and 0.5 to avoid outliers
                var q1 = d3.quantile(d.map(function(g) {return g.fatality_ratio;}).sort(d3.ascending), .25);
                var q3 = d3.quantile(d.map(function(g) {return g.fatality_ratio;}).sort(d3.ascending), .75);
                var median = d3.quantile(d.map(function(g) {return g.fatality_ratio;}).sort(d3.ascending), .5);
                var IQR = q3 - q1;
                var max = d3.quantile(d.map(function(g) {return g.fatality_ratio;}).sort(d3.ascending), .95);
                var min = d3.quantile(d.map(function(g) {return g.fatality_ratio;}).sort(d3.ascending), .05);
                var avg = d3.mean(d.map(function(g) {return g.fatality_ratio;}));
                return {q1: q1, median: median, q3: q3, IQR: IQR, min: min, max: max, num_states: d.length, avg: avg};
            }).entries(data);


        // Y Scale
        var y = d3.scaleLinear().domain([0.0001, .005]).range([height, 0]);
        svg.append("g").call(d3.axisLeft(y));

        // X Scale
        var x = d3.scaleBand().domain(["Strict", "Moderate", "Lax"]).range([0, width]).padding(0.4);
        // increase font size of x-axis labels
        svg.append("g").attr("transform", "translate(0," + height + ")").call(d3.axisBottom(x)).selectAll("text").attr("font-size", "15px");

        // Create the tooltips
        var Tooltip = d3.select("#slide_2_boxplot")
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
        }

        tooltipMousemove = function(d) {
            html_text = d.value.num_states + " states have a " + d.key + " policy with an average fatality ratio of " + d3.format(".5f")(d.value.avg);
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
        svg.selectAll("box")
            .data(summary)
            .enter()
            .append("rect")
            .attr("x", function(d) {return x(d.key)+boxPadding;})
            .attr("y", function(d) {return y(d.value.q3);})
            .attr("height", function(d) {return y(d.value.q1) - y(d.value.q3);})
            .attr("width", boxWidth)
            .attr("stroke", "black")
            .style("fill", "#ff6f61")
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
                svg.selectAll("rect").style("fill", "#ff6f61");
                d3.select(this).style("fill", "#d71300");
                render_table_slide_2(d.key);
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
            .text("Fatality Ratio");

        // add the slope annotation
        svg.append("defs").append("marker")
            .attr("id", "arrow")
            .attr("viewBox", "0 0 10 10")
            .attr("refX", 5)
            .attr("refY", 5)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M 0 0 L 10 5 L 0 10 z");

        // create a second arrow facing the opposite direction
        svg.append("defs").append("marker")
            .attr("id", "arrowOther")
            .attr("viewBox", "0 0 10 10")
            .attr("refX", 5)
            .attr("refY", 5)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "180")
            .append("path")
            .attr("d", "M 0 0 L 10 5 L 0 10 z");

        svg.append("path")
            .attr("d", d3.line()([[x("Lax")+boxPadding+boxWidth/2, 30],[x("Strict")+boxPadding+boxWidth/2, 60]]))
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5")
            .attr("marker-end", "url(#arrow)");

        // add bolded text annotation with a rotation
        svg.append("text")
            .attr("x", x("Strict")+boxPadding+boxWidth/2)
            .attr("y", 20)
            .text("As the number of policies increase, the fatality ratio decreases")
            .style("font-size", "15px")
            .style("font-weight", "bold")
            .attr("transform", "rotate(-3.7," + (x("Moderate")+boxPadding+boxWidth/2) + ",500)");
        
        // add a horizontal line at the bottom of the chart
        svg.append("line")
            .attr("x1", 30)
            .attr("x2", width-30)
            .attr("y1", height-50)
            .attr("y2", height-50)
            .attr("stroke", "black")
            .attr("stroke-width", 3)
            .attr("stroke-dasharray", "5")
            .attr("marker-end", "url(#arrow)")
            .attr("marker-start", "url(#arrowOther)");

        // add a text annotation at the bottom of the chart
        svg.append("text")
            .attr("y", height-60)
            .attr("x", 50)
            .text("More Policies")
            .style("font-size", "15px")
            .style("font-style", "italic");

        svg.append("text")
            .attr("y", height-60)
            .attr("x", width-125)
            .text("Less Policies")
            .style("font-size", "15px")
            .style("font-style", "italic");
    });

}

async function render_table_slide_2(strictness_level) {
    await d3.csv("https://raw.githubusercontent.com/sacheth-sv/narrative_story_project/main/data/state_policy_summary.csv", function(data) {
        var table = d3.select("#slide_2_table").html("").append("table").attr("class", "table").append("tbody");
        var usable_data = data.filter(function(d) {return d.Strict_Label == strictness_level;});
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
        var avg_infection = d3.mean(usable_data.map(function(d) {return d.fatality_ratio;}));

        html_text = "<tr><td><strong>States</strong></td><td>" + states + "</td>"
        table.append("tr").html(html_text);
        html_text = "<tr><td><strong>Average Contact Reduction Policies</strong></td><td>" + d3.format(".3f")(avg_contact) + "</td>"
        table.append("tr").html(html_text);
        html_text = "<tr><td><strong>Average Mask/Vaccination Policies</strong></td><td>" + d3.format(".3f")(avg_mask) + "</td>"
        table.append("tr").html(html_text);
        html_text = "<tr><td><strong>Average Notification Policies</strong></td><td>" + d3.format(".3f")(avg_notification) + "</td>"
        table.append("tr").html(html_text);
        html_text = "<tr><td><strong>Average Fatality Ratio</strong></td><td>" + d3.format(".5f")(avg_infection) + "</td>"
        table.append("tr").html(html_text);

        var p = d3.select("#slide_2_table").append("p");
        var p_text = "Assuming we have a population of 100,000 people, if we increased the number of vaccination policies by even 1, we can save 4 more people from dying"
        p.text(p_text);
    });

}

async function render_lineplot_slide_3() {
    // Load the data
    await d3.csv("https://raw.githubusercontent.com/sacheth-sv/narrative_story_project/main/data/case_counts_cleaned.csv" , function(data) {
        var list_of_states = data.map(row => row.state)
        list_of_states = d3.set(list_of_states).values()

        // set the default state to be Washington
        var state_data = data.filter(function(d) {return d.state == "Washington";});
        update_lineplot_slide_3(state_data, "rolling_avg_cases");

        // set the options in the option button
        d3.select("#stateSelectionDropdown")
        .selectAll('myOptions')
            .data(list_of_states)
        .enter()
        .append('option')
        .text(function (d) { return d; }) // text showed in the menu
        .attr("value", function (d) { return d; }) // corresponding value returned by the button

        d3.select("#stateSelectionDropdown").on("change", function() {
            // clear all elements in the #slide_3_lineplot div
            d3.select("#slide_3_lineplot").html("");
            var selected_state = d3.select(this).property("value");
            var state_data = data.filter(function(d) {return d.state == selected_state;});
            var metric = d3.select("#valueSelectionDropdown").node().value
            if (metric == "New Infections") {
                update_lineplot_slide_3(state_data, "rolling_avg_cases");
            } else {
                update_lineplot_slide_3(state_data, "rolling_avg_fatalities");
            }
        });

        d3.select("#valueSelectionDropdown").on("change", function() {
            // clear all elements in the #slide_3_lineplot div
            d3.select("#slide_3_lineplot").html("");
            var selected_state = d3.select("#stateSelectionDropdown").node().value;
            var state_data = data.filter(function(d) {return d.state == selected_state;});
            var metric = d3.select(this).node().value
            if (metric == "New Infections") {
                update_lineplot_slide_3(state_data, "rolling_avg_cases");
            } else {
                update_lineplot_slide_3(state_data, "rolling_avg_fatalities");
            }
        });

    });
}

async function update_lineplot_slide_3(origData, metric) {
    var data = JSON.parse(JSON.stringify(origData));
    var margin = {top: 10, right: 10, bottom:30, left: 70}
    var width = d3.select(".navi").node().getBoundingClientRect().width - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;

    // parse the date
    var parseDate = d3.timeParse("%Y-%m-%d");

    // set the ranges
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    // define the line
    var valueline = d3.line()
        .x(function(d) {return x(d.date);})
        .y(function(d) {return y(d[metric]);});

    // append the svg object to the body of the page
    var svg = d3.select("#slide_3_lineplot")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    data.forEach(function(d) {
        d.date = parseDate(d.date);
        d[metric] = +d[metric];
    });

    // scale the range of the data
    x.domain(d3.extent(data, function(d) {return d.date;}));
    y.domain([Math.min(d3.min(data, function(d) {return d[metric];}), 0), d3.max(data, function(d) {return d[metric];})]);

    // add the valueline path
    if (metric == "rolling_avg_cases") {
        svg.append("path")
            .data([data])
            .attr("class", "infectionLine")
            .attr("d", valueline);
    } else {
        svg.append("path")
            .data([data])
            .attr("class", "fatalityLine")
            .attr("d", valueline);
    }

    // add the x-axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // add the y-axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // add the y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height/2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "15px")
        .text(function() {
            if (metric == "rolling_avg_cases") {
                return "New Infections";
            } else {
                return "New Fatalities";
            }
        });

    // Create the tooltips
    var Tooltip = d3.select("#slide_3_lineplot")
        .append("div")
        .style("hidden", true)
        .attr("class", "tooltip")
        .style("opacity", 1)
        .style("background-color", "white")
        .style("position", "absolute")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("max-width", "200px")
        .style("padding", "5px");
    
    tooltipMouseover = function(d) {
        Tooltip.style("hidden", false);
        d3.select(".tooltip").style("stroke", "black").style("hidden", false);
    }

    tooltipMousemove = function(d) {
        date_string = d.date.toLocaleString('default', {month: 'long', day: 'numeric', year: 'numeric'});
        if (metric == "rolling_avg_cases") {
            html_text ="<p><strong>" + date_string + "</strong></p><p>New Infections: " + d.rolling_avg_cases + "</p>";
        } else {
            html_text ="<p><strong>" + date_string + "</strong></p><p>New Fatalities: " + d.rolling_avg_fatalities + "</p>";
        }
        Tooltip.html(html_text)
            .style("top", (event.pageY) -50 + "px")
            .style("left", (event.pageX) -120 + "px")
            .style("position", "absolute")
            .style("font-size", "10px")
            .style("line-height", "1px")
            .style("margin", 0);
    }

    tooltipMouseleave = function(d) {
        Tooltip.style("hidden", true);
        d3.select(".tooltip").style("stroke", "none").style("hidden", true);
    }

    // add the points on the line
    svg.selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function(d) {return x(d.date);})
        .attr("cy", function(d) {return y(d[metric]);})
        .attr("r", 2) //"#69b3a2"
        .style("fill", function() {
            if (metric == "rolling_avg_cases") {
                return "#69b3a2";
            } else {
                return "#ff6f61";
            }
        })
        .on("mouseover", function(d) {
            tooltipMouseover(d);
        })
        .on("mousemove", function(d) {
            tooltipMousemove(d);
        })
        .on("mouseout", function(d) {
            tooltipMouseleave(d);
        });

    // Load the CSV for the state policy cleaned
    d3.csv("https://raw.githubusercontent.com/sacheth-sv/narrative_story_project/main/data/state_policies_cleaned.csv", function(policy_data) {
        // filter the data to only include the state of interest
        var state_policies = policy_data.filter(function(d) {return d.state == data[0].state;});

        // Retain only the following columns: state, Policy Type, restriction_date, and restriction_type
        state_policies = state_policies.map(function(d) {
            return {state: d.state, policy_type: d["Policy Type"], restriction_date: d.restriction_date, restriction_type: d.restriction_type};
        });

        // Keep only the state policies that have a restriction_type of "start"
        state_policies = state_policies.filter(function(d) {return d.restriction_type == "start";});

        // Create another column that is a concatenation of the Policy Type and the restriction_date
        state_policies = state_policies.map(function(d) {
            return {state: d.state, policy_type: d.policy_type, restriction_date: d.restriction_date, policy_date: d.policy_type + " (" + d.restriction_date + ")"};
        });

        // Retain only records that have a unique policy_date
        var unique_records = d3.map(state_policies, function(d) {return d.policy_date;}).keys();

        // Keep the first occurence
        state_policies = unique_records.map(function(d) {
            return state_policies.find(function(e) {return e.policy_date == d;});
        });

        // Keep only the following columns: state, policy_type, restriction_date
        state_policies = state_policies.map(function(d) {
            return {state: d.state, policy_type: d.policy_type, restriction_date: d.restriction_date};
        });

        // Create shorthand for the state_policies polciy_type: Notifications -> N, Mask/Vaccine Mandate -> V, Contact Reduction -> C. Put this in new column called policy_label
        state_policies = state_policies.map(function(d) {
            if (d.policy_type == "Notification") {
                return {state: d.state, policy_type: d.policy_type, restriction_date: d.restriction_date, policy_label: "N"};
            } else if (d.policy_type == "Mask/Vaccine Mandate") {
                return {state: d.state, policy_type: d.policy_type, restriction_date: d.restriction_date, policy_label: "V"};
            } else {
                return {state: d.state, policy_type: d.policy_type, restriction_date: d.restriction_date, policy_label: "C"};
            }
        });


        // Add the policy dates to the lineplot as annotations
        // Create a new date parser with the format of the restriction_date
        var labelParseDate = d3.timeParse("%Y-%m-%d %H:%M:%S");

        // add a line from the policy marker to the x-axis
        svg.append("g")
            .attr("class", "policy_markers")
            .selectAll("line")
            .data(state_policies)
            .enter()
            .append("line")
            .attr("x1", function(d) {return x(labelParseDate(d.restriction_date));})
            .attr("x2", function(d) {return x(labelParseDate(d.restriction_date));})
            .attr("y1", function(d) {
                // if the policy_label is N, cy=300, if V, cy=400, if C, cy=500
                if (d.policy_label == "N") {
                    return 200;
                } else if (d.policy_label == "V") {
                    return 100;
                } else {
                    return 50;
                }
            })
            .attr("y2", height)
            .attr("stroke", "gray")
            .style("width", 40);

        // Create a circle for each policy date and add a line to the x-axis
        svg.append("g")
            .attr("class", "policy_markers")
            .selectAll("circle")
            .data(state_policies)
            .enter()
            .append("circle")
            .attr("cx", function(d) {return x(labelParseDate(d.restriction_date));})
            .attr("cy", function(d) {
                // if the policy_label is N, cy=300, if V, cy=400, if C, cy=500
                if (d.policy_label == "N") {
                    return 200;
                } else if (d.policy_label == "V") {
                    return 100;
                } else {
                    return 50;
                }
            })
            .attr("r", 10)
            .style("fill", "white")
            .style("stroke", "black");

        // add the text to the policy markers
        svg.append("g")
            .attr("class", "policy_markers")
            .selectAll("text")
            .data(state_policies)
            .enter()
            .append("text")
            .attr("x", function(d) {return x(labelParseDate(d.restriction_date));})
            .attr("y", function(d) {
                // if the policy_label is N, cy=300, if V, cy=400, if C, cy=500
                if (d.policy_label == "N") {
                    return 200;
                } else if (d.policy_label == "V") {
                    return 100;
                } else {
                    return 50;
                }
            })
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .text(function(d) {return d.policy_label;})
            .style("font-size", "15px")
            .style("fill", "black");
    });

}

async function render_table_slide_3() {
    d3.csv("https://raw.githubusercontent.com/sacheth-sv/narrative_story_project/main/data/state_policies_cleaned.csv", function(policy_data) {

        // filter the data to only include the state of interest
        var state_policies = policy_data.filter(function(d) {return d.state == "Washington";});

        // Retain only the following columns: state, Policy Type, restriction_date, and restriction_type
        state_policies = state_policies.map(function(d) {
            return {state: d.state, policy_type: d["Policy Type"], restriction_date: d.restriction_date, restriction_type: d.restriction_type, restriction_description: d.restriction_desc};
        });

        // Keep only the state policies that have a restriction_type of "start"
        state_policies = state_policies.filter(function(d) {return d.restriction_type == "start";});

        // Sort the state_policies by date
        state_policies.sort(function(a, b) {
            return new Date(a.restriction_date) - new Date(b.restriction_date);
        });

        // Create a table in #slide_3_table div with the following columns: restriction_date, restriction_description, and policy_type
        var table = d3.select("#slide_3_table").html("").append("table").attr("class", "table");
        // add the row headers
        var header = table.append("thead").append("tr");
        header.append("th").text("Restriction Date").attr("class", "col-lg-2 col-md-2 col-sm-2");
        header.append("th").text("Restriction Description").attr("class", "col-lg-8 col-md-8 col-sm-8");
        header.append("th").text("Policy Type").attr("class", "col-lg-2 col-md-2 col-sm-2");

        var tableBody = table.append("tbody");
        // parse the date in a readable format: day Month, Year
        var labelParseDate = d3.timeParse("%Y-%m-%d %H:%M:%S");        

        // add each of the rows
        state_policies.forEach(function(d) {
            var row = tableBody.append("tr");
            row.append("td").text(labelParseDate(d.restriction_date).toLocaleString('default', {month: 'long', day: 'numeric', year: 'numeric'})).attr("class", "col-lg-2 col-md-2 col-sm-2");
            row.append("td").text(d.restriction_description).attr("class", "col-lg-8 col-md-8 col-sm-8");
            row.append("td").text(d.policy_type).attr("class", "col-lg-2 col-md-2 col-sm-2");
        });


        
    });
}