/*
*    main.js
*    Mastering Data Visualization with D3.js
*    FreedomCorp Dashboard
*/

let filteredData,stackedArea1
let parseTime = d3.timeParse("%d/%m/%Y")

d3.json("data/calls.json").then(function(data){ 
    console.log(data)
    filteredData = data.map(function(d){
        d.date = parseTime(d.date)
        return d
    })

    stackedArea1 = new StackedAreaChart("#stacked-area")
})

$("#var-select").on("change",()=>stackedArea1.wrangleData())
