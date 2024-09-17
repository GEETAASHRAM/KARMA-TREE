// script.js

document.getElementById('karmaForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const subject = document.getElementById('subject').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    

    // Validate inputs
    if (!subject || !startDate || !endDate) {
        alert("Please fill out all fields.");
        return;
    }

    // Generate Karma Tree using D3.js
    generateKarmaTree(subject, startDate, endDate);
});

// function generateKarmaTree(subject, startDate, endDate) {
//     // Clear any existing SVG elements
//     d3.select("#karmaTreeSvg").selectAll("*").remove();

//     const svg = d3.select("#karmaTreeSvg");
//     const width = +svg.attr("width");
//     const height = +svg.attr("height");

//     // Sample data for Karma Tree (can be dynamically generated based on input)
//     const data = {
//         nodes: [
//             { id: subject, type: 'subject' },
//             { id: 'Action 1', type: 'positive' },
//             { id: 'Action 2', type: 'negative' },
//             { id: 'Action 3', type: 'positive' },
//             { id: 'Outcome 1', type: 'positive' },
//             { id: 'Outcome 2', type: 'negative' }
//         ],
//         links: [
//             { source: subject, target: 'Action 1' },
//             { source: subject, target: 'Action 2' },
//             { source: subject, target: 'Action 3' },
//             { source: 'Action 1', target: 'Outcome 1' },
//             { source: 'Action 2', target: 'Outcome 2' }
//         ]
//     };

//     const simulation = d3.forceSimulation(data.nodes)
//         .force("link", d3.forceLink(data.links).id(d => d.id).distance(150))
//         .force("charge", d3.forceManyBody().strength(-300))
//         .force("center", d3.forceCenter(width / 2, height / 2));

//     const link = svg.append("g")
//         .attr("class", "links")
//         .selectAll("line")
//         .data(data.links)
//         .enter().append("line")
//         .attr("stroke-width", 2)
//         .attr("stroke", "#999");

//     const node = svg.append("g")
//         .attr("class", "nodes")
//         .selectAll("circle")
//         .data(data.nodes)
//         .enter().append("circle")
//         .attr("r", 10)
//         .attr("fill", d => d.type === 'positive' ? '#4caf50' : '#f44336')
//         .call(d3.drag()
//             .on("start", dragstarted)
//             .on("drag", dragged)
//             .on("end", dragended));

//     node.append("title")
//         .text(d => d.id);

//     const label = svg.append("g")
//         .attr("class", "labels")
//         .selectAll("text")
//         .data(data.nodes)
//         .enter().append("text")
//         .attr("dy", -12)
//         .attr("text-anchor", "middle")
//         .text(d => d.id);

//     simulation.on("tick", () => {
//         link
//             .attr("x1", d => d.source.x)
//             .attr("y1", d => d.source.y)
//             .attr("x2", d => d.target.x)
//             .attr("y2", d => d.target.y);

//         node
//             .attr("cx", d => d.x)
//             .attr("cy", d => d.y);

//         label
//             .attr("x", d => d.x)
//             .attr("y", d => d.y);
//     });

//     function dragstarted(event, d) {
//         if (!event.active) simulation.alphaTarget(0.3).restart();
//         d.fx = d.x;
//         d.fy = d.y;
//     }

//     function dragged(event, d) {
//         d.fx = event.x;
//         d.fy = event.y;
//     }

//     function dragended(event, d) {
//         if (!event.active) simulation.alphaTarget(0);
//         d.fx = null;
//         d.fy = null;
//     }
// }

function generateKarmaTree() {
    const subject = document.getElementById('subject').value;
    const eventType = document.getElementById('eventType').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const otherInfluences = document.getElementById('otherInfluences').value;

    // Validate inputs
    if (!subject || !eventType || !startDate || !endDate) {
        alert("Please fill out all required fields.");
        return;
    }

    // Sample data generation based on inputs
    // In a real application, this data should be generated dynamically
    const data = generateSampleData(subject, eventType, startDate, endDate, otherInfluences);

    // Clear any existing SVG elements
    d3.select("#karmaTreeSvg").selectAll("*").remove();

    const svg = d3.select("#karmaTreeSvg");
    const width = +svg.attr("width");
    const height = +svg.attr("height");

    const simulation = d3.forceSimulation(data.nodes)
        .force("link", d3.forceLink(data.links).id(d => d.id).distance(150))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("x", d3.forceX(d => d.time === 'before' ? width / 4 : d.time === 'after' ? 3 * width / 4 : width / 2))
        .force("y", d3.forceY(height / 2));

    const link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(data.links)
        .enter().append("line")
        .attr("stroke-width", 2)
        .attr("stroke", "#999");

    const node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(data.nodes)
        .enter().append("circle")
        .attr("r", 10)
        .attr("fill", d => {
            if (d.type === 'input') return '#4caf50'; // Green for inputs
            if (d.type === 'output') return '#2196f3'; // Blue for outputs
            if (d.type === 'intersection') return '#ff9800'; // Orange for intersections
            return '#9e9e9e'; // Gray for subject
        })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .on("mouseover", function(event, d) {
            d3.select("#tooltip")
                .style("opacity", 1)
                .html(`ID: ${d.id}<br>Type: ${d.type}<br>Time: ${d.time}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select("#tooltip").style("opacity", 0);
        });

    const label = svg.append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(data.nodes)
        .enter().append("text")
        .attr("dy", -12)
        .attr("text-anchor", "middle")
        .text(d => d.id);

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        label
            .attr("x", d => d.x)
            .attr("y", d => d.y);
    });

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}

// Function to generate sample data based on inputs
function generateSampleData(subject, eventType, startDate, endDate, otherInfluences) {
    // This function should dynamically generate data based on real inputs
    // For demonstration purposes, static data is provided
    return {
        nodes: [
            { id: subject, type: 'subject', time: 'present' },
            { id: 'Action 1', type: 'input', time: 'before' },
            { id: 'Action 2', type: 'input', time: 'before' },
            { id: 'Outcome 1', type: 'output', time: 'after' },
            { id: 'Outcome 2', type: 'output', time: 'after' },
            { id: 'Karmic Intersection', type: 'intersection', time: 'before-after' }
        ],
        links: [
            { source: subject, target: 'Action 1' },
            { source: subject, target: 'Action 2' },
            { source: 'Action 1', target: 'Outcome 1' },
            { source: 'Action 2', target: 'Outcome 2' },
            { source: 'Action 1', target: 'Karmic Intersection' },
            { source: 'Karmic Intersection', target: 'Outcome 2' }
        ]
    };
}


// Search functionality
// Enhanced search functionality
document.getElementById('search').addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    
    // Highlight nodes based on search term
    const matchingNodes = d3.selectAll('circle').filter(d => d.id.toLowerCase().includes(searchTerm));
    
    if (searchTerm === "") {
        // Reset all nodes if search input is cleared
        d3.selectAll('circle').style('stroke', null).style('stroke-width', null);
        d3.selectAll('text').style('fill', null); // Reset node labels as well
    } else {
        // Reset all nodes
        d3.selectAll('circle').style('stroke', null).style('stroke-width', null);
        d3.selectAll('text').style('fill', null); // Reset node labels
        
        // Apply highlighting to matching nodes
        matchingNodes.style('stroke', '#ffeb3b').style('stroke-width', 3);
        matchingNodes.each(function(d) {
            // Bring the node to focus by coloring its text label
            d3.select(this).style('stroke-width', 3);
            d3.select(this.nextSibling).style('fill', '#ffeb3b'); // Highlight label
        });
        
        if (matchingNodes.empty()) {
            console.log('No matches found.');
            // You could also show a message in the UI if no nodes match
        }
    }
});


// Filter functionality
document.getElementById('filter').addEventListener('change', function() {
    const filterValue = this.value;
    d3.selectAll('circle').style('opacity', function(d) {
        if (filterValue === 'all') return 1;
        return d.type === filterValue ? 1 : 0.1;
    });
});

// Export functionality
document.getElementById('exportButton').addEventListener('click', function() {
    const svgElement = document.querySelector("#karmaTreeSvg");
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);

    const image = new Image();
    const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    image.onload = function() {
        const canvas = document.createElement('canvas');
        canvas.width = svgElement.getBoundingClientRect().width;
        canvas.height = svgElement.getBoundingClientRect().height;
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);
        URL.revokeObjectURL(url);

        // Download as PNG
        const link = document.createElement('a');
        link.href = canvas.toDataURL();
        link.download = 'karma_tree.png';
        link.click();
    };

    image.src = url;
});

const zoomHandler = d3.zoom()
    .on("zoom", () => {
        svg.attr("transform", d3.event.transform);
    });
svg.call(zoomHandler);

node.on("click", function(event, d) {
    // Logic to expand or reveal further node details
    alert(`Details for: ${d.id}`);
});


const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

node.on("mouseover", function(event, d) {
    tooltip.transition().duration(200).style("opacity", .9);
    tooltip.html(`Details for ${d.id}`)
        .style("left", (event.pageX + 5) + "px")
        .style("top", (event.pageY - 28) + "px");
})
.on("mouseout", function(d) {
    tooltip.transition().duration(500).style("opacity", 0);
});


node.attr("fill", d => {
    if (d.type === "input") return "green"; // Positive
    if (d.type === "output") return "blue"; // Neutral
    if (d.type === "intersection") return "orange"; // Karmic Crossroads
});

function updateKarmaTree() {
    const timeValue = document.getElementById("timeSlider").value;
    // Update tree rendering based on time progression
    // E.g., Show past events, and future forecasts dynamically
}

 // Time-slider logic
document.getElementById('timeSlider').addEventListener('input', function() {
    const value = this.value;
    // Update the visualization based on time progression value
    // Placeholder for actual logic to filter nodes/links by time
});
