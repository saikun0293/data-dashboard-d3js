/*
*    main.js
*    Mastering Data Visualization with D3.js
*    FreedomCorp Dashboard
*/

let filteredData,stackedArea,donutChart
let parseTime = d3.timeParse("%d/%m/%Y")

d3.json("data/calls.json").then(function(data){ 
    filteredData = data.map(function(d){
        d.date = parseTime(d.date)
        return d
    })

    stackedArea = new StackedAreaChart("#stacked-area")
    donutChart = new DonutChart("#company-size")
})

$("#var-select").on("change",()=>stackedArea.wrangleData())
