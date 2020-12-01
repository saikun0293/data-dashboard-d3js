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
    vis.updateVis()
}

DonutChart.prototype.updateVis = function(){
    var vis = this

    vis.path = vis.g.selectAll("path").data(vis.pie(vis.data))

    // EXIT old elements from the screen.
    vis.path.exit()
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
        .attr("fill",d=>vis.color(d.data.company_size))
        .transition()
        .duration(750)
            .attrTween("d", arcTween);

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