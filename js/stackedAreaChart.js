/*
*    stackedAreaChart.js
*    Source: https://bl.ocks.org/mbostock/3885211
*    Mastering Data Visualization with D3.js
*    FreedomCorp Dashboard
*/

class StackedAreaChart{
    constructor(_parentElement){
        this.parentElement = _parentElement
        this.initVis()
    }

    initVis(){
        let vis = this

        vis.t = d3.transition().duration(500)

        vis.margin = {top: 10, right: 20, bottom: 100, left: 100}
        vis.width = 800 - vis.margin.left - vis.margin.right
        vis.height = 500 - vis.margin.top - vis.margin.bottom

        vis.g = d3.select(vis.parentElement)
            .append("svg")
            .attr('width',vis.width)
            .attr('height',vis.height)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

                
        vis.x = d3.scaleTime().range([0, vis.width])
        vis.y = d3.scaleLinear().range([vis.height, 0])
        vis.z = d3.scaleOrdinal(d3.schemePastel1)

        vis.area = d3.area()
            .x(function(d) {
                return vis.x(d.data.date); })
            .y0(function(d) { return vis.y(d[0]); })
            .y1(function(d) { return vis.y(d[1]); })

        
        vis.stack = d3.stack()
                        .keys(["west","south","midwest","northeast"])

        console.log(vis.height)

        vis.xAxis = vis.g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", `translate(0,${vis.height})`)
            
            
        vis.yAxis = vis.g.append("g")
                .attr("class", "axis axis--y")
                        

        vis.wrangleData()
    }

    wrangleData(){
        let vis = this

        vis.property = $("#var-select").val()
        vis.nestedData = d3.nest()
            .key(d=>d.date)
            .entries(filteredData)

        vis.data = vis.nestedData.map(d=>{
            let obj = {}
            obj.date = new Date(d.key)
            obj.west = 0
            obj.south = 0
            obj.midwest = 0
            obj.northeast = 0

            d.values.forEach(e=>{
                if(e.team==="west")obj.west+=e[vis.property]
                else if(e.team==="south")obj.south+=e[vis.property]
                else if(e.team==="midwest")obj.midwest+=e[vis.property]
                else if(e.team==="northeast")obj.northeast+=e[vis.property]
            })
            return obj
        })
        vis.updateVis()
    }

    updateVis(){
        let vis = this
        
        vis.x.domain(d3.extent(filteredData,d=>d.date));
        vis.max = d3.max(vis.data.map(d=>{
            return({
                date:d.date,
                value:d.south+d.northeast+d.midwest+d.west
            })
        }),d=>d.value)*1.05

        vis.y.domain([0,vis.max])

        vis.layer = vis.g.selectAll(".layer").data(vis.stack(vis.data))

        vis.layer.exit().transition(vis.t).remove()

        vis.layer.enter()
            .append("path")
            .attr("class","layer")
            .attr("fill",d=>vis.z(d.key))
            .merge(vis.layer)
            .transition(vis.t)
            .attr("d",vis.area)

        // console.log(vis.stack(vis.data))

        // vis.layer.filter(function(d) { return d[d.length - 1][1] - d[d.length - 1][0] > 0.01; })
        //     .append("text")
        //     .attr("x", vis.width - 6)
        //     .attr("y", function(d) { return y((d[d.length - 1][0] + d[d.length - 1][1]) / 2); })
        //     .attr("dy", ".35em")
        //     .style("font", "10px sans-serif")
        //     .style("text-anchor", "end")
        //     .text(function(d) { return d.key; });
        vis.xAxis.transition(vis.t).call(d3.axisBottom(vis.x))
        vis.yAxis.transition(vis.t).call(d3.axisLeft(vis.y).ticks(5))
    }
}