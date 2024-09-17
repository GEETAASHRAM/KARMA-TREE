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

function generateKarmaTree(subject, startDate, endDate) {
    // Clear any existing SVG elements
    d3.select("#karmaTreeSvg").selectAll("*").remove();

    const svg = d3.select("#karmaTreeSvg");
    const width = +svg.attr("width");
    const height = +svg.attr("height");

    // Sample data for Karma Tree (can be dynamically generated based on input)
    const data = {
        nodes: [
            { id: subject, type: 'subject' },
            { id: 'Action 1', type: 'positive' },
            { id: 'Action 2', type: 'negative' },
            { id: 'Action 3', type: 'positive' },
            { id: 'Outcome 1', type: 'positive' },
            { id: 'Outcome 2', type: 'negative' }
        ],
        links: [
            { source: subject, target: 'Action 1' },
            { source: subject, target: 'Action 2' },
            { source: subject, target: 'Action 3' },
            { source: 'Action 1', target: 'Outcome 1' },
            { source: 'Action 2', target: 'Outcome 2' }
        ]
    };

    const simulation = d3.forceSimulation(data.nodes)
        .force("link", d3.forceLink(data.links).id(d => d.id).distance(150))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2));

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
        .attr("fill", d => d.type === 'positive' ? '#4caf50' : '#f44336')
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append("title")
        .text(d => d.id);

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

// Search functionality
document.getElementById('search').addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    d3.selectAll('circle').style('stroke', function(d) {
        return d.id.toLowerCase().includes(searchTerm) ? '#ffeb3b' : null;
    });
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
