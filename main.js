// SETUP: Define dimensions and margins for the charts
const margin = { top: 50, right: 30, bottom: 60, left: 70 },
      width = 800 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

// 1: CREATE SVG CONTAINERS
// Line Chart Container
const svgLine = d3.select("#lineChart")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Bar Chart Container
const svgBar = d3.select("#barChart")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// 2: LOAD DATA
d3.csv("movies.csv").then(data => {
    // 2.a: Reformat Data
    data.forEach(d => {
        d.gross = +d.gross;   // Convert score to a number
        d.year = +d.title_year;    // Convert year to a number
        d.director = d.director_name;
        d.score = d.imdb_score;
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

    // console.log(cleanData);
    
    // 3.b: Group by and summarize (aggregate gross by year)
    const dataMap = d3.rollup(cleanData,
        v => d3.mean(v, d => d.gross),
        d => d.year
    );
    
    // console.log(dataMap);

    // 3.c: Convert to array and sort by year
    const dataArr = Array.from(dataMap,
            ([year, gross]) => ({ year, gross })
        )
        .sort((a, b) => a.year - b.year)
    ;

    // console.log(dataArr);

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

    /* ===================== BAR CHART ===================== */
    // 3. PREPARE Bar DATA
    // 3.a Clean data
    const barCleanData = data.filter(d =>
        d.director != ''
        && d.score != null
    );

    console.log("Clean bar data: ", barCleanData);
    
    // 3.b Group by [director] & aggregate [score]
    const barMap = d3.rollup(barCleanData
        ,v => d3.mean(v, d => d.score)
        ,d => d.director
    );
    
    console.log("Bar: ", barMap);

    // 3.c Sort & get top 6
    const barFinalData = Array.from(barMap, // convert to array
            ([director, score]) => ({ director, score })
        )
        .sort((a, b) => b.score - a.score) // sort by score, desc
        .slice(0, 6)  
    ;

    console.log("Final bar data: ", barFinalData);

    // 4: SCALE AXES
    // 4.a: x-axis (director)
    let barXScale = d3.scaleBand() // Use instead of scaleLinear() for bar charts
        .domain(barFinalData.map(d => d.director)) // Extract unique categories for x-axis
        .range([0, width]) // START low, INCREASE
        .padding(0.1); // Add space between bars

    // 4.b: y-axis (score)
    let barYScale = d3.scaleLinear()
        .domain([0, d3.max(barFinalData, d => d.score)])
        .range([height,0]); // START high, DECREASE

    // 5: PLOT DATA
    svgBar.selectAll("rect")
        .data(barFinalData)
        .enter()
        .append("rect")
        .attr("x", d => barXScale(d.director))
        .attr("y", d => barYScale(d.score))
        .attr("width", barXScale.bandwidth())
        .attr("height", d => height - barYScale(d.score))
        .attr("fill", "blue")
        ;
    
    // 6: ADD AXES
    // 6.a: x-axis
    svgBar.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(barXScale));

    // 6.b: y-axis
    svgBar.append("g")
        .call(d3.axisLeft(barYScale));

    // 7: ADD LABELS
    // 7.a: title
    svgBar.append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .text("Top 6 Director's IMDb Scores");

    // 7.b: x-axis
    svgBar.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + (margin.bottom / 2) + 10)
        .text("Directors");
    
        // 7.c: y-axis
    svgBar.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left / 2)
        .attr("x", -height / 2)
        .text("Score");

});
