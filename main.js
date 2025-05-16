// SETUP: Define dimensions and margins for the charts
const margin = { top: 50, right: 30, bottom: 60, left: 70 },
      width = 800 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

// 1: CREATE SVG CONTAINERS
// 1: Line Chart Container
const svgLine = d3.select("#lineChart")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// 2: LOAD DATA
d3.csv("movies.csv").then(data => {
    // 2.a: Reformat Data
    data.forEach(d => {
        d.gross = +d.gross;   // Convert score to a number
        d.year = +d.title_year;    // Convert year to a number
    });

    // Check your work
    console.log(data);

    /* ===================== LINE CHART ===================== */

    // 3: PREPARE LINE CHART DATA (Total Gross by Year)
    // 3.a: Filter out entries with null gross values
    const cleanData = data.filter(d => d.gross != null
	    && d.year != null
	    && d.year >= 2010   // Filter for years >= 2010
    );

    console.log(cleanData);
    
    // 3.b: Group by and summarize (aggregate gross by year)
    const dataMap = d3.rollup(cleanData,
        v => d3.mean(v, d => d.gross),
        d => d.year
    );
    
    console.log(dataMap);

    // 3.c: Convert to array and sort by year
    const dataArr = Array.from(dataMap,
            ([year, gross]) => ({ year, gross })
        )
        .sort((a, b) => a.year - b.year)
    ;

    console.log(dataArr);

    // Check your work
    // console.log(lineData);

    // 4: SET SCALES FOR LINE CHART
    // 4.a: X scale (Year)
    let xYear = d3.scaleLinear()
        .domain([2010, d3.max(dataArr, d => d.year)])
        .range([0, width]); // START low, INCREASE
    // *In this case, we want domain’s min to be 2010 since that’s our lowest year

    
    // 4.b: Y scale (Gross)
    // Think backwards for y!
    let yGross = d3.scaleLinear()
        .domain([0, d3.max(dataArr, d => d.gross)])
        .range([height,0]); // START high, DECREASE
    

    // 4.c: Define line generator for plotting line
    const line = d3.line()
        .x(d => xYear(d.year))
        .y(d => yGross(d.gross));

    // 5: PLOT LINE
    svgLine.append("path")
		.datum(dataArr)
        .attr("d", line)
        .attr("stroke", "blue")
        .attr("stroke-width", 5)
        .attr("fill", "none")
    ;

    // 6: ADD AXES FOR LINE CHART
    // 6.a: X-axis (Year)
    svgLine.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xYear)
            .tickFormat(d3.format("d")) // remove decimals
        )
        ;


    // 6.b: Y-axis (Gross)
    svgLine.append("g")
        .call(d3.axisLeft(yGross)
            .tickFormat(d => d / 1000000 + "M") // condense millions
    );


    // 7: ADD LABELS FOR LINE CHART
    // 7.a: Chart Title
    svgLine.append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .text("Trends in Average Gross Movie Revenue (2010-2016)");
        
        
    // 7.b: X-axis label (Year)
    svgLine.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + (margin.bottom / 2) + 10)
        .text("Year");
        
        
    // 7.c: Y-axis label (Total Gross)
    svgLine.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", (-margin.left / 2) - 10)
        .attr("x", -height / 2)
        .text("Gross Revenue ($)");
});
