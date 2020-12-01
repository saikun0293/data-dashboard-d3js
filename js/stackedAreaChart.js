class StackedAreaChart{
    constructor(_parentElement){
        this.parentElement = _parentElement
        this.initVis()
    }

    initVis(){
        let vis = this

        vis.t = ()=>d3.transition().duration(1000)

        vis.margin = {top: 80, right: 20, bottom: 100, left: 100}
        vis.width = 800 - vis.margin.left - vis.margin.right
        vis.height = 500 - vis.margin.top - vis.margin.bottom

        vis.g = d3.select(vis.parentElement)
            .append("svg")
            .attr('width',vis.width+vis.margin.left+vis.margin.right)
            .attr('height',vis.height+vis.margin.top+vis.margin.bottom)
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


            
        vis.xAxis = vis.g.append("g")
                .attr("class","axis axis--x")
                .attr("transform",`translate(0,${vis.height})`)

        vis.yAxis = vis.g.append("g")
                .attr("class", "axis axis--y")
                        

        vis.addLegend()
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
        
        vis.x.domain(d3.extent(vis.data,d=>d.date))

        vis.max = d3.max(vis.data.map(d=>{
            return({
                date:d.date,
                value:d.south+d.northeast+d.midwest+d.west
            })
        }),d=>d.value)*1.05

        vis.y.domain([0,vis.max])

        vis.layer = vis.g.selectAll(".layer").data(vis.stack(vis.data))

        vis.layer.exit().remove()

        vis.layer.enter()
            .append("path")
            .attr("class","layer")
            .attr("fill",d=>vis.z(d.key))
            .merge(vis.layer)
            .attr("d",vis.area)

        vis.xAxis.transition(vis.t()).call(d3.axisBottom(vis.x).ticks(10))
        vis.yAxis.transition(vis.t()).call(d3.axisLeft(vis.y).ticks(5))
    }

    addLegend(){
        let vis = this

        vis.legend = vis.g.append("g")
                    .attr('width',vis.width)
                    .attr('height',30)
        vis.directions = ["northeast","west","south","midwest"]

        vis.directions.forEach((direction,index)=>{
            vis.legendCol = vis.legend.append("g")
                .attr("transform",`translate(${(vis.width/4)*index+60},-30)`)
            vis.legendCol.append("text")
                .attr('font-size','15px')
                .text(direction.charAt(0).toUpperCase() + direction.slice(1))
            vis.legendCol.append("rect")
                .attr('width',10)
                .attr('height',10)
                .attr('transform',`translate(-15,-10)`)
                .attr('fill',vis.z(direction))
        })

    }
}