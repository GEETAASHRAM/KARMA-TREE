// app.js

const width = window.innerWidth * 0.95,
    height = window.innerHeight * 0.85;

const svg = d3.select("#karma-tree-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const treeData = [
    {
        name: "Cosmic Context",
        children: [
            {name: "Galactic Influences"},
            {name: "Solar System Dynamics"},
            {name: "Planetary Alignments"}
        ]
    },
    {
        name: "Environmental Layer",
        children: [
            {name: "Ecosystem Interactions"},
            {name: "Climate Patterns"},
            {name: "Geographical Influences"}
        ]
    },
    // Add more layers here...
];

function drawTree(data) {
    const treeLayout = d3.tree().size([height, width]);
    const nodes = treeLayout(d3.hierarchy(data));
    const links = nodes.descendants().slice(1);

    const link = svg.append("g").selectAll(".link")
        .data(links)
        .enter().append("path")
        .attr("class", "link")
        .attr("d", d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x));

    const nodeEnter = svg.selectAll(".node")
        .data(nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.y}, ${d.x})`);

    nodeEnter.append("circle");

    nodeEnter.append("text")
        .attr("dy", ".35em")
        .attr("x", d => d.children ? -13 : 13)
        .style("text-anchor", d => d.children ? "end" : "start");

    nodeEnter.append("title").text(d => d.data.name);

    nodeEnter.select("circle")
        .on("click", function() {
            d3.select(this).transition()
                .duration(750)
                .attr("r", d => d._children ? 15 : 5);
        });

    nodeEnter.select(".karma-score")
        .text(d => Math.random().toString(36).substring(7))
        .attr("y", d => d.children ? -5 : 5);
}

drawTree(treeData);

// Add drag functionality
function dragStarted(event, d) {
    event.sourceEvent.dataTransfer.effectAllowed = "move";
    event.sourceEvent.dataTransfer.dropEffect = "move";
    event.sourceEvent.dataTransfer.setData("text/plain", d.id);
    d3.event.preventDefault();
}

function dragged(event, d) {
    event.sourceEvent.dataTransfer.dropEffect = "move";
}

function droped(event, d) {
    const dragNode = d3.select(draggedNodesKnot);
    const dropNode = d3.select(d3.event.target);
    const overlap = dropNode.node().getBBox().width / 2;
    const dx = (dropNode.attr("x") - dragNode.attr("x")) * (dragNode.attr("r") / overlap);
    const dy = (dropNode.attr("y") - dragNode.attr("y")) * (dragNode.attr("r") / overlap);
    dragNode.attr("transform", `translate(${dx},${dy})`);
}

svg.on("mousedown", function() {
    const draggedNodesKnot = svg.selectAll(".node");
    const mousedown = d3.mouse(this);
    const drag = d3.drag()
        .on("start", dragStarted)
        .on("drag", dragged)
        .on("end", droped);
    draggedNodesKnot.call(drag);
});

// Add hover effects
svg.selectAll(".node")
    .on("mouseover", function(event, d) {
        d3.select(this).select("circle").transition()
            .duration(200)
            .attr("r", 15);
    })
    .on("mouseout", function(event, d) {
        d3.select(this).select("circle").transition()
            .duration(200)
            .attr("r", 5);
    });

// Add filtering functionality
function filterTree(filterTerm) {
    const filteredData = treeData.filter(node => 
        node.name.toLowerCase().includes(filterTerm.toLowerCase()) ||
        node.children && node.children.some(child => child.name.toLowerCase().includes(filterTerm.toLowerCase()))
    );

    drawTree(filteredData);
}


// Add searching functionality
function searchTree(searchTerm) {
    const searchedData = treeData.reduce((acc, node) => {
        if (node.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            acc.push(node);
        }
        if (node.children) {
            acc = acc.concat(searchNodeChildren(node.children, searchTerm));
        }
        return acc;
    }, []);

    drawTree(searchedData);
}

function searchNodeChildren(children, searchTerm) {
    return children.reduce((acc, child) => {
        if (child.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            acc.push(child);
        }
        if (child.children) {
            acc = acc.concat(searchNodeChildren(child.children, searchTerm));
        }
        return acc;
    }, []);
}

// Add event listeners for filtering and searching
document.getElementById("filter-input").addEventListener("input", function() {
    const filterTerm = this.value.trim();
    if (filterTerm.length > 0) {
        filterTree(filterTerm);
    } else {
        drawTree(treeData);
    }
});

document.getElementById("search-input").addEventListener("input", function() {
    const searchTerm = this.value.trim();
    if (searchTerm.length > 0) {
        searchTree(searchTerm);
    } else {
        drawTree(treeData);
    }
});



function calculateKarma(node) {
    let karmaScore = 0;
    if (node.children) {
        node.children.forEach(child => {
            karmaScore += calculateKarma(child);
        });
    } else {
        karmaScore += parseInt(Math.random() * 100); // Random karma score for leaf nodes
    }
    return karmaScore;
}

function updateKarmaScores() {
    const totalKarma = calculateKarma(treeData);
    document.getElementById("total-karma").textContent = `Total Karma: ${totalKarma}`;
}

updateKarmaScores();

function exportAsImage() {
    const svgElement = document.querySelector("#karma-tree-container svg");
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], {type: "image/svg+xml;charset=utf-8"});
    const url = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "karma_tree.svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}


document.getElementById("export-button").addEventListener("click", exportAsImage);
  
