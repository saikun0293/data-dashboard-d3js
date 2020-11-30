/*
*    main.js
*    Mastering Data Visualization with D3.js
*    FreedomCorp Dashboard
*/

let newData,filteredData,stackedArea,donutChart
let barChart1,barChart2,barChart3
let timeline

let parseTime = d3.timeParse("%d/%m/%Y")
let formatTime = d3.timeFormat("%d/%m/%Y")

d3.json("data/calls.json").then(function(data){ 
    newData = data.map(function(d){
        d.date = parseTime(d.date)
        return d
    })

    filteredData = newData

    stackedArea = new StackedAreaChart("#stacked-area")
    donutChart = new DonutChart("#company-size")
    barChart1 = new BarChart("#units_sold","Units sold per call")
    barChart2 = new BarChart("#call_revenue","Average Call Revenue (USD)")
    barChart3 = new BarChart("#call_duration","Average Call Duration (seconds)")
    timeline = new Timeline("#timeline")
})

brushed = ()=>{
    let selection = d3.event.selection || timeline.x.range()
    let newValues = selection.map(timeline.x.invert)
    updateCharts(newValues)
}

updateCharts = (newValues)=>{
    filteredData = newData.filter(d=>{
        return d.date>=newValues[0] && d.date<=newValues[1]
    })

    donutChart.wrangleData()
    barChart1.wrangleData()
    barChart2.wrangleData()
    barChart3.wrangleData()
    stackedArea.wrangleData()
}

$("#var-select").on("change",()=>{
    stackedArea.wrangleData()
    timeline.wrangleData()
})
