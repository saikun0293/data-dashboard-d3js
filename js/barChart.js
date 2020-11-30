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

    vis.x = d3.scaleBand().range([0,vis.width]).padding(0.4)
    vis.y = d3.scaleLinear().range([vis.height,0])

    vis.t = d3.transition().duration(500)

    
    vis.g = d3.select(vis.parentElement)
                .append("svg")
                .attr('width',vis.width+vis.margin.right+vis.margin.left)
                .attr('height',vis.height+vis.margin.top+vis.margin.bottom)
                .append("g")
                .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    vis.xAxis = vis.g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + vis.height + ")")
        
  
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

    console.log(vis.data)
    vis.updateVis()
  }

  updateVis(){
    let vis = this
    vis.x.domain(vis.data.map(d=>d.category))
    vis.y.domain([0, d3.max(vis.data,d=>d[vis.variable])*1.05])

    vis.xAxis.call(d3.axisBottom(vis.x).tickFormat(d=>d.charAt(0).toUpperCase() + d.slice(1)))
    vis.yAxis.call(d3.axisLeft(vis.y).ticks(4))
    vis.yAxisLabel.text(vis.title)

    vis.bar = vis.g.selectAll(".bar").data(vis.data)

    vis.bar.exit().transition(vis.t).remove()

    vis.bar.enter()
      .append("rect")
      .merge(vis.bar)
      .transition(vis.t)
      .attr('x',d=>vis.x(d.category))
      .attr('y',d=>vis.y(d[vis.variable]))
      .attr('width',vis.x.bandwidth)
      .attr('height',d=>vis.height - vis.y(d[vis.variable]))
      .attr('fill','grey')

  }
}