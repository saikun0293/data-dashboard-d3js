/*
*    donutChart.js
*    Source: Section 10, Lecture 5
*    Mastering Data Visualization with D3.js
*    FreedomCorp Dashboard
*/

DonutChart = function(_parentElement){
    this.parentElement = _parentElement
    this.initVis()
};

DonutChart.prototype.initVis = function(){
    var vis = this

    vis.margin = { left:60, right:100, top:0, bottom:0 }
    vis.width = 350 - vis.margin.left - vis.margin.right
    vis.height = 200 - vis.margin.top - vis.margin.bottom
    vis.radius = Math.min(vis.width, vis.height) / 2

    vis.keys = ["large","medium","small"]

    vis.color = d3.scaleOrdinal()
        .domain(vis.keys)
        .range(d3.schemeAccent)

    vis.pie = d3.pie()
        .padAngle(0.03)
        .value(d=>d.value)
        .sort(null)

    vis.arc = d3.arc()
        .innerRadius(vis.radius - 60)
        .outerRadius(vis.radius - 30)

    vis.svg = d3.select(vis.parentElement)
        .append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)

    vis.g = vis.svg.append("g")
        .attr("transform", "translate(" + (vis.margin.left + (vis.width / 2)) + 
            ", " + (vis.margin.top + (vis.height / 2)) + ")")

    vis.g.append("text")
        .attr("y",-85)
        .attr("x",-vis.width/2+10)
        .attr("font-size", "15px")
        .attr("text-anchor", "start")
        .text("Company Size")


    vis.addLegend()
    vis.wrangleData()
}

DonutChart.prototype.wrangleData = function(){
    var vis = this

    vis.nestedData = d3.nest()
        .key(d=>d["company_size"])
        .entries(filteredData)

    vis.data = vis.nestedData.map(d=>{
        let obj = {}
        obj.company_size = d.key
        obj.value = d.values.length
        return obj
    })

    console.log(vis.data)

    vis.updateVis()
}

DonutChart.prototype.updateVis = function(){
    var vis = this

    vis.path = vis.g.selectAll("path");

    vis.data0 = vis.path.data()
    vis.data1 = vis.pie(vis.data)

    // JOIN elements with new data.
    vis.path = vis.path.data(vis.data1, key);

    // EXIT old elements from the screen.
    vis.path.exit()
        .datum(function(d, i) { return findNeighborArc(i, vis.data1, vis.data0, key) || d; })
        .transition()
        .duration(750)
        .attrTween("d", arcTween)
        .remove();
    
    // UPDATE elements still on the screen.
    vis.path.transition()
        .duration(750)
        .attrTween("d", arcTween)

    // ENTER new elements in the array.
    vis.path.enter()
        .append("path")
        .each(function(d, i) { this._current = findNeighborArc(i,vis.data0,vis.data1, key) || d; }) 
        .attr("fill",d=>vis.color(d.data.company_size))
        .transition()
        .duration(750)
            .attrTween("d", arcTween);

    function key(d){
        return d.company_size
    }

    function findNeighborArc(i, data0, data1, key) {
        var d;
        return (d = findPreceding(i, data0, data1, key)) ? {startAngle: d.endAngle, endAngle: d.endAngle}
            : (d = findFollowing(i, data0, data1, key)) ? {startAngle: d.startAngle, endAngle: d.startAngle}
            : null;
    }

    // Find the element in data0 that joins the highest preceding element in data1.
    function findPreceding(i, data0, data1, key) {
        var m = data0.length;
        while (--i >= 0) {
            var k = key(data1[i]);
            for (var j = 0; j < m; ++j) {
                if (key(data0[j]) === k) return data0[j];
            }
        }
    }

    // Find the element in data0 that joins the lowest following element in data1.
    function findFollowing(i, data0, data1, key) {
        var n = data1.length, m = data0.length;
        while (++i < n) {
            var k = key(data1[i]);
            for (var j = 0; j < m; ++j) {
                if (key(data0[j]) === k) return data0[j];
            }
        }
    }

    function arcTween(d) {
        var i = d3.interpolate(this._current, d);
        this._current = i(1)
        return function(t) { return vis.arc(i(t)); };
    }

}

DonutChart.prototype.addLegend=function(){
    let vis = this
    vis.legend = vis.svg
        .append("g")
        .attr('transform',`translate(${vis.width+40},${vis.margin.top})`)
    
    vis.keys.forEach((key,index)=>{
        vis.legendRow = vis.legend.append("g")    
            .attr('transform',`translate(80,${80+index*30})`)
        
        vis.legendRow.append("text")
            .attr('font-size','15px')
            .attr('text-anchor','end')
            .text(key.charAt(0).toUpperCase() + key.slice(1))

        vis.legendRow.append("rect")
            .attr('width',10)
            .attr('height',10)
            .attr('transform',`translate(10,-10)`)
            .attr('fill',vis.color(key))
    })
}