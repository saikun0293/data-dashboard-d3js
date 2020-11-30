/*
*    main.js
*    Mastering Data Visualization with D3.js
*    FreedomCorp Dashboard
*/

let filteredData,stackedArea,donutChart
let barChart1,barChart2,barChart3

let parseTime = d3.timeParse("%d/%m/%Y")

d3.json("data/calls.json").then(function(data){ 
    filteredData = data.map(function(d){
        d.date = parseTime(d.date)
        return d
    })

    stackedArea = new StackedAreaChart("#stacked-area")
    donutChart = new DonutChart("#company-size")
    barChart1 = new BarChart("#units_sold","Units sold per call")
    barChart2 = new BarChart("#call_revenue","Average Call Revenue (USD)")
    barChart3 = new BarChart("#call_duration","Average Call Duration (seconds)")
})

$("#var-select").on("change",()=>stackedArea.wrangleData())
