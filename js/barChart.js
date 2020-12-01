class BarChart{
  constructor(_parentElement,title){
    this.parentElement = _parentElement
    this.title = title
    this.initVis()
  }
  initVis(){
    let vis = this
    vis.margin = {top: 30, right: 20, bottom: 30, left: 100}
    vis.width = 450 - vis.margin.left - vis.margin.right
    vis.height = 160 - vis.margin.top - vis.margin.bottom

    vis.x = d3.scaleBand()
              .domain(["electronics","furniture","appliances","materials"])
              .range([0,vis.width]).padding(0.4)

    vis.y = d3.scaleLinear().range([vis.height,0])

    vis.t = ()=>d3.transition().duration(1000)

    
    vis.g = d3.select(vis.parentElement)
                .append("svg")
                .attr('width',vis.width+vis.margin.right+vis.margin.left)
                .attr('height',vis.height+vis.margin.top+vis.margin.bottom)
                .append("g")
                .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    vis.xAxis = vis.g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + vis.height + ")")

    vis.xAxisCall = d3.axisBottom().tickFormat(d=>d.charAt(0).toUpperCase() + d.slice(1))
    vis.yAxisCall = d3.axisLeft().ticks(4)  
  
    vis.yAxis = vis.g.append("g")
        .attr("class", "axis axis--y")
    
    vis.yAxisLabel = vis.g.append("text")
        .attr('x', -20)
        .attr("y", -18)
        .attr('font-size','15px')

    vis.wrangleData()
  }

  wrangleData(){
    let vis = this
    vis.variable = vis.parentElement.slice(1)

    vis.nestedData = d3.nest()
                      .key(d=>d.category)
                      .entries(filteredData)

    vis.data = vis.nestedData.map(d=>{
      let obj = {}
      obj.category = d.key
      obj[vis.variable] = 0
      d.values.forEach(e=>{
        obj[vis.variable]+=e[vis.variable]
      })
      obj[vis.variable]/=d.values.length
      return obj
    })
    vis.updateVis()
  }

  updateVis(){
    let vis = this
    vis.y.domain([0, d3.max(vis.data,d=>d[vis.variable])*1.05])

    vis.xAxisCall.scale(vis.x)
    vis.xAxis.transition(vis.t()).call(vis.xAxisCall)
    vis.yAxisCall.scale(vis.y)
    vis.yAxis.transition(vis.t()).call(vis.yAxisCall)

    vis.yAxisLabel.text(vis.title)

    vis.bar = vis.g.selectAll(".bar").data(vis.data,d=>d.category)

    vis.bar.exit().transition(vis.t()).remove()

    vis.bar.enter()
      .append("rect")
      .attr('class','bar')
      .attr('width',vis.x.bandwidth)
      .attr('x',d=>vis.x(d.category))
      .attr('y',vis.y(0))
      .attr('height',d=>vis.height - vis.y(0))
      .attr('fill','grey')
      .merge(vis.bar)
      .transition(vis.t())
      .attr('y',d=>vis.y(d[vis.variable]))
      .attr('height',d=>vis.height - vis.y(d[vis.variable]))
      

  }
}