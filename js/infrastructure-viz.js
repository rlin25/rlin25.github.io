// D3.js Infrastructure Visualization for FrizzlesRubric
class InfrastructureVisualization {
    constructor(containerId, data) {
        this.container = d3.select(containerId);
        this.data = data;
        this.width = 1200;
        this.height = 800;
        this.margin = { top: 40, right: 40, bottom: 40, left: 40 };
        
        // Base scaling factors
        this.baseRadius = 25;
        this.baseFontSize = {
            instanceIcon: 10,
            instanceLabel: 11,
            portLabel: 12,
            ipLabel: 11,
            vpcLabel: 14,
            subnetLabel: 12,
            subnetCidr: 10,
            sgLabel: 10
        };
        
        this.setupSVG();
        this.setupScales();
        this.calculatePositions();
        this.renderVisualization();
    }
    
    setupSVG() {
        this.svg = this.container
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${this.width} ${this.height}`)
            .style('background', '#fafafa');
            
        // Define gradients and patterns
        this.defs = this.svg.append('defs');
        this.setupGradients();
        this.setupFilters();
        
        // Create layer groups
        this.layers = {
            vpc: this.svg.append('g').attr('class', 'vpc-layer'),
            subnets: this.svg.append('g').attr('class', 'subnets-layer'),
            connections: this.svg.append('g').attr('class', 'connections-layer'),
            securityGroups: this.svg.append('g').attr('class', 'security-groups-layer'),
            instances: this.svg.append('g').attr('class', 'instances-layer'),
            labels: this.svg.append('g').attr('class', 'labels-layer')
        };
    }
    
    setupGradients() {
        // Depth gradient for 2.5D effect
        const depthGradient = this.defs.append('linearGradient')
            .attr('id', 'depth-gradient')
            .attr('x1', '0%').attr('y1', '0%')
            .attr('x2', '100%').attr('y2', '100%');
            
        depthGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#ffffff')
            .attr('stop-opacity', 0.8);
            
        depthGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#f5f5f5')
            .attr('stop-opacity', 0.4);
            
        // Instance gradient
        const instanceGradient = this.defs.append('radialGradient')
            .attr('id', 'instance-gradient')
            .attr('cx', '30%').attr('cy', '30%');
            
        instanceGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#ffffff')
            .attr('stop-opacity', 0.8);
            
        instanceGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#000000')
            .attr('stop-opacity', 0.1);
    }
    
    setupFilters() {
        // Drop shadow filter
        const dropShadow = this.defs.append('filter')
            .attr('id', 'drop-shadow')
            .attr('x', '-50%').attr('y', '-50%')
            .attr('width', '200%').attr('height', '200%');
            
        dropShadow.append('feDropShadow')
            .attr('dx', 2).attr('dy', 4)
            .attr('stdDeviation', 3)
            .attr('flood-color', '#000000')
            .attr('flood-opacity', 0.2);
            
        // Glow filter for hover effects
        const glow = this.defs.append('filter')
            .attr('id', 'glow')
            .attr('x', '-50%').attr('y', '-50%')
            .attr('width', '200%').attr('height', '200%');
            
        const feGaussianBlur = glow.append('feGaussianBlur')
            .attr('stdDeviation', '3')
            .attr('result', 'coloredBlur');
            
        const feMerge = glow.append('feMerge');
        feMerge.append('feMergeNode').attr('in', 'coloredBlur');
        feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
    }
    
    setupScales() {
        this.xScale = d3.scaleLinear()
            .domain([0, 100])
            .range([this.margin.left, this.width - this.margin.right]);
            
        this.yScale = d3.scaleLinear()
            .domain([0, 100])
            .range([this.margin.top, this.height - this.margin.bottom]);
    }
    
    calculatePositions() {
        this.positions = {};
        
        // Calculate scaling factors based on current dimensions
        const baseWidth = 1200;
        const baseHeight = 800;
        this.scaleFactor = Math.min(this.width / baseWidth, this.height / baseHeight);
        this.nodeRadius = this.baseRadius * this.scaleFactor;
        
        // Calculate responsive font sizes
        this.fontSize = {};
        for (const [key, value] of Object.entries(this.baseFontSize)) {
            this.fontSize[key] = Math.max(8, value * this.scaleFactor);
        }
        
        // VPC boundary
        this.positions.vpc = {
            x: this.margin.left,
            y: this.margin.top,
            width: this.width - this.margin.left - this.margin.right,
            height: this.height - this.margin.top - this.margin.bottom
        };
        
        // Determine layout based on aspect ratio
        const aspectRatio = this.width / this.height;
        this.isVerticalLayout = aspectRatio < 1.2; // Switch to vertical when width/height < 1.2
        
        console.log('Aspect ratio:', aspectRatio.toFixed(2), 'Layout:', this.isVerticalLayout ? 'vertical' : 'horizontal');
        
        // Subnet positioning - adaptive layout
        let subnetWidth, subnetHeight;
        
        if (this.isVerticalLayout) {
            // Vertical layout - subnets stacked vertically
            subnetWidth = this.positions.vpc.width * 0.85;
            subnetHeight = this.positions.vpc.height * 0.4;
            
            this.positions.subnets = {
                public: {
                    x: this.positions.vpc.x + (this.positions.vpc.width - subnetWidth) / 2,
                    y: this.positions.vpc.y + 20,
                    width: subnetWidth,
                    height: subnetHeight
                },
                private: {
                    x: this.positions.vpc.x + (this.positions.vpc.width - subnetWidth) / 2,
                    y: this.positions.vpc.y + subnetHeight + 40,
                    width: subnetWidth,
                    height: subnetHeight
                }
            };
        } else {
            // Horizontal layout - subnets side by side
            subnetWidth = this.positions.vpc.width * 0.45;
            subnetHeight = this.positions.vpc.height * 0.8;
            
            this.positions.subnets = {
                public: {
                    x: this.positions.vpc.x + 20,
                    y: this.positions.vpc.y + 20,
                    width: subnetWidth,
                    height: subnetHeight
                },
                private: {
                    x: this.positions.vpc.x + this.positions.vpc.width - subnetWidth - 20,
                    y: this.positions.vpc.y + 20,
                    width: subnetWidth,
                    height: subnetHeight
                }
            };
        }
        
        // Instance positioning - adaptive based on layout
        this.positions.instances = {
            bastion: {
                x: this.positions.subnets.public.x + subnetWidth/2,
                y: this.positions.subnets.public.y + subnetHeight/2 + 5,
                subnet: 'public'
            },
            orchestrator: {
                x: this.positions.subnets.private.x + subnetWidth/2 + (this.isVerticalLayout ? 0 : 30),
                y: this.positions.subnets.private.y + (this.isVerticalLayout ? 60 : 60 + 10 + 5),
                subnet: 'private'
            }
        };
        
        // Position ML experts in a grid - adjust for layout
        let expertCols, expertRows, expertSpacing, startX, startY;
        
        if (this.isVerticalLayout) {
            // Vertical layout - more compact grid
            expertCols = 3;
            expertRows = 2;
            expertSpacing = { x: subnetWidth/4, y: subnetHeight/3.5 };
            startX = this.positions.subnets.private.x + 40;
            startY = this.positions.subnets.private.y + 120;
        } else {
            // Horizontal layout - original spacing
            expertCols = 3;
            expertRows = 2;
            expertSpacing = { x: subnetWidth/4, y: subnetHeight/4 };
            startX = this.positions.subnets.private.x + 40;
            startY = this.positions.subnets.private.y + 150 + 5;
        }
        
        ['clarity', 'grammar', 'documentation', 'structure', 'granularity'].forEach((expert, i) => {
            const col = i % expertCols;
            const row = Math.floor(i / expertCols);
            
            this.positions.instances[expert] = {
                x: startX + col * expertSpacing.x,
                y: startY + row * expertSpacing.y,
                subnet: 'private'
            };
        });
        
        // Position non-ML experts - adjust for layout
        if (this.isVerticalLayout) {
            // Vertical layout - position at bottom of private subnet
            this.positions.instances.tooling = {
                x: this.positions.subnets.private.x + 60,
                y: this.positions.subnets.private.y + subnetHeight - 60,
                subnet: 'private'
            };
            
            this.positions.instances.repetition = {
                x: this.positions.subnets.private.x + subnetWidth - 60,
                y: this.positions.subnets.private.y + subnetHeight - 60,
                subnet: 'private'
            };
        } else {
            // Horizontal layout - original positions
            this.positions.instances.tooling = {
                x: this.positions.subnets.private.x + 50,
                y: this.positions.subnets.private.y + subnetHeight - 80 + 5,
                subnet: 'private'
            };
            
            this.positions.instances.repetition = {
                x: this.positions.subnets.private.x + subnetWidth - 80,
                y: this.positions.subnets.private.y + subnetHeight - 80 + 5,
                subnet: 'private'
            };
        }
    }
    
    renderVisualization() {
        this.renderVPC();
        this.renderSubnets();
        this.renderSecurityGroups();
        this.renderConnections();
        this.renderInstances();
        this.renderLabels();
    }
    
    renderVPC() {
        this.layers.vpc.append('rect')
            .attr('x', this.positions.vpc.x)
            .attr('y', this.positions.vpc.y)
            .attr('width', this.positions.vpc.width)
            .attr('height', this.positions.vpc.height)
            .attr('class', 'vpc-boundary')
            .style('fill', 'none')
            .style('stroke', '#ddd')
            .style('stroke-width', 2)
            .style('stroke-dasharray', '10,5');
            
        // VPC label
        this.layers.labels.append('text')
            .attr('x', this.positions.vpc.x + 10)
            .attr('y', this.positions.vpc.y - 10)
            .attr('class', 'vpc-label')
            .style('font-family', 'Inter, sans-serif')
            .style('font-size', `${this.fontSize.vpcLabel}px`)
            .style('font-weight', '600')
            .style('fill', '#666')
            .text(`VPC: ${this.data.vpc.cidr}`);
    }
    
    renderSubnets() {
        Object.entries(this.positions.subnets).forEach(([type, pos]) => {
            const subnet = this.data.vpc.subnets.find(s => s.type === type);
            if (!subnet) return;
            
            this.layers.subnets.append('rect')
                .attr('x', pos.x)
                .attr('y', pos.y)
                .attr('width', pos.width)
                .attr('height', pos.height)
                .attr('class', `subnet-${type}`)
                .style('fill', type === 'public' ? '#e3f2fd' : '#e8f5e8')
                .style('stroke', type === 'public' ? '#90caf9' : '#81c784')
                .style('stroke-width', 1)
                .style('opacity', 0.7);
                
            // Subnet label
            this.layers.labels.append('text')
                .attr('x', pos.x + 10)
                .attr('y', pos.y + 20)
                .attr('class', 'subnet-label')
                .style('font-family', 'Inter, sans-serif')
                .style('font-size', `${this.fontSize.subnetLabel}px`)
                .style('font-weight', '500')
                .style('fill', '#555')
                .text(`${subnet.name || `${type} Subnet`}`);
                
            this.layers.labels.append('text')
                .attr('x', pos.x + 10)
                .attr('y', pos.y + 35)
                .attr('class', 'subnet-cidr')
                .style('font-family', 'Consolas, monospace')
                .style('font-size', `${this.fontSize.subnetCidr}px`)
                .style('fill', '#777')
                .text(subnet.cidr);
        });
    }
    
    renderSecurityGroups() {
        this.data.securityGroups.forEach(sg => {
            const instances = sg.instances.map(id => this.data.instances.find(i => i.id === id));
            if (instances.length === 0) return;
            
            // Calculate bounding box for security group
            const positions = instances.map(inst => this.positions.instances[inst.id]);
            const minX = Math.min(...positions.map(p => p.x)) - 30;
            const maxX = Math.max(...positions.map(p => p.x)) + 30;
            const minY = Math.min(...positions.map(p => p.y)) - 30;
            const maxY = Math.max(...positions.map(p => p.y)) + 30;
            
            this.layers.securityGroups.append('rect')
                .attr('x', minX)
                .attr('y', minY)
                .attr('width', maxX - minX)
                .attr('height', maxY - minY)
                .attr('class', `security-group ${sg.id}`)
                .style('fill', 'none')
                .style('stroke', sg.color)
                .style('stroke-width', 2)
                .style('stroke-dasharray', '8,4')
                .style('opacity', 0.6);
                
            // Security group label
            this.layers.labels.append('text')
                .attr('x', minX + 5)
                .attr('y', minY - 5)
                .attr('class', 'sg-label')
                .style('font-family', 'Inter, sans-serif')
                .style('font-size', `${this.fontSize.sgLabel}px`)
                .style('font-weight', '500')
                .style('fill', sg.color)
                .text(sg.id);
        });
    }
    
    renderConnections() {
        this.data.connections.forEach(conn => {
            const sourcePos = this.positions.instances[conn.source];
            const targetPos = this.positions.instances[conn.target];
            
            if (!sourcePos || !targetPos) return;
            
            const line = this.layers.connections.append('line')
                .attr('id', `line-${conn.id}`)
                .attr('x1', sourcePos.x)
                .attr('y1', sourcePos.y)
                .attr('x2', targetPos.x)
                .attr('y2', targetPos.y)
                .attr('class', `connection-line ${conn.type}`)
                .style('stroke', conn.type === 'api' ? '#7b1fa2' : '#f57c00')
                .style('stroke-width', 2)
                .style('stroke-opacity', 0.4)
                .style('stroke-dasharray', conn.type === 'api' ? '5,5' : '3,3');
        });
    }
    
    renderInstances() {
        this.data.instances.forEach(instance => {
            const pos = this.positions.instances[instance.id];
            if (!pos) return;
            
            const instanceGroup = this.layers.instances.append('g')
                .attr('class', 'instance')
                .attr('data-id', instance.id)
                .attr('transform', `translate(${pos.x}, ${pos.y})`)
                .style('cursor', 'grab');
            
            // Add event handlers
            instanceGroup
                .on('mouseenter', this.onComponentHover.bind(this))
                .on('mouseleave', this.onComponentLeave.bind(this))
                .on('click', this.onComponentClick.bind(this));
            
            // Add drag behavior
            instanceGroup.call(this.setupDragBehavior(instance));
            
            // Instance circle
            instanceGroup.append('circle')
                .attr('r', this.nodeRadius)
                .attr('class', 'instance-circle')
                .style('fill', instance.color)
                .style('stroke', '#fff')
                .style('stroke-width', Math.max(1, 3 * this.scaleFactor))
                .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))');
            
            // Instance icon or text
            instanceGroup.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '0.35em')
                .style('fill', '#fff')
                .style('font-family', 'Inter, sans-serif')
                .style('font-size', `${this.fontSize.instanceIcon}px`)
                .style('font-weight', '600')
                .text(this.getInstanceIcon(instance.type));
        });
    }
    
    renderLabels() {
        this.data.instances.forEach(instance => {
            const pos = this.positions.instances[instance.id];
            if (!pos) return;
            
            // Instance name
            this.layers.labels.append('text')
                .attr('id', `label-name-${instance.id}`)
                .attr('x', pos.x)
                .attr('y', pos.y + this.nodeRadius + 15)
                .attr('class', 'instance-label')
                .style('text-anchor', 'middle')
                .style('font-family', 'Inter, sans-serif')
                .style('font-size', `${this.fontSize.instanceLabel}px`)
                .style('font-weight', '500')
                .style('fill', '#333')
                .text(instance.name);
                
            // Port number for experts
            if (instance.port) {
                this.layers.labels.append('text')
                    .attr('id', `label-port-${instance.id}`)
                    .attr('x', pos.x)
                    .attr('y', pos.y + this.nodeRadius + 27)
                    .attr('class', 'port-label')
                    .style('text-anchor', 'middle')
                    .style('font-family', 'Consolas, monospace')
                    .style('font-size', `${this.fontSize.portLabel}px`)
                    .style('fill', '#666')
                    .text(`:${instance.port}`);
            }
            
            // Private IP
            this.layers.labels.append('text')
                .attr('id', `label-ip-${instance.id}`)
                .attr('x', pos.x)
                .attr('y', pos.y + this.nodeRadius + (instance.port ? 39 : 27))
                .attr('class', 'ip-label')
                .style('text-anchor', 'middle')
                .style('font-family', 'Consolas, monospace')
                .style('font-size', `${this.fontSize.ipLabel}px`)
                .style('fill', '#888')
                .text(instance.privateIp || instance.publicIp);
        });
    }
    
    getInstanceIcon(type) {
        const icons = {
            'bastion': 'SSH',
            'orchestrator': 'API',
            'ml-expert': 'ML',
            'non-ml-expert': 'SVC'
        };
        return icons[type] || '?';
    }
    
    setupDragBehavior(instance) {
        const self = this;
        
        return d3.drag()
            .on('start', function(event, d) {
                // Change cursor and add dragging class
                d3.select(this)
                    .style('cursor', 'grabbing')
                    .classed('dragging', true);
                    
                // Stop any ongoing transitions
                d3.select(this).interrupt();
            })
            .on('drag', function(event, d) {
                const newX = event.x;
                const newY = event.y;
                
                // Get subnet boundaries for this instance
                const constraints = self.getSubnetConstraints(instance);
                
                // Constrain position within subnet boundaries
                const constrainedX = Math.max(constraints.minX, Math.min(constraints.maxX, newX));
                const constrainedY = Math.max(constraints.minY, Math.min(constraints.maxY, newY));
                
                // Update position
                d3.select(this)
                    .attr('transform', `translate(${constrainedX}, ${constrainedY})`);
                
                // Update stored position
                self.positions.instances[instance.id] = {
                    x: constrainedX,
                    y: constrainedY,
                    subnet: instance.subnet
                };
                
                // Update connection lines
                self.updateConnectionLines(instance.id, constrainedX, constrainedY);
                
                // Update labels that follow this instance
                self.updateInstanceLabels(instance.id, constrainedX, constrainedY);
                
                // Update security groups
                self.updateSecurityGroups();
            })
            .on('end', function(event, d) {
                // Reset cursor and remove dragging class
                d3.select(this)
                    .style('cursor', 'grab')
                    .classed('dragging', false);
            });
    }
    
    getSubnetConstraints(instance) {
        // Define padding from subnet edges
        const padding = 40 * this.scaleFactor;
        const instanceRadius = this.nodeRadius;
        
        // Get the appropriate subnet boundaries
        let subnetBounds;
        if (instance.subnet === 'public') {
            subnetBounds = this.positions.subnets.public;
        } else if (instance.subnet === 'private' || instance.subnet === 'private-2') {
            subnetBounds = this.positions.subnets.private;
        } else {
            // Default to private subnet
            subnetBounds = this.positions.subnets.private;
        }
        
        return {
            minX: subnetBounds.x + padding + instanceRadius,
            maxX: subnetBounds.x + subnetBounds.width - padding - instanceRadius,
            minY: subnetBounds.y + padding + instanceRadius,
            maxY: subnetBounds.y + subnetBounds.height - padding - instanceRadius
        };
    }
    
    updateConnectionLines(instanceId, newX, newY) {
        // Update all connections involving this instance
        this.data.connections.forEach(conn => {
            const line = d3.select(`#line-${conn.id}`);
            
            if (conn.source === instanceId) {
                // Update source position
                line.attr('x1', newX).attr('y1', newY);
            } else if (conn.target === instanceId) {
                // Update target position  
                line.attr('x2', newX).attr('y2', newY);
            }
        });
    }
    
    updateInstanceLabels(instanceId, newX, newY) {
        const instance = this.data.instances.find(i => i.id === instanceId);
        if (!instance) return;
        
        // Update instance name label
        d3.select(`#label-name-${instanceId}`)
            .attr('x', newX)
            .attr('y', newY + this.nodeRadius + 15);
        
        // Update port label if it exists
        if (instance.port) {
            d3.select(`#label-port-${instanceId}`)
                .attr('x', newX)
                .attr('y', newY + this.nodeRadius + 27);
        }
        
        // Update IP label
        d3.select(`#label-ip-${instanceId}`)
            .attr('x', newX)
            .attr('y', newY + this.nodeRadius + (instance.port ? 39 : 27));
    }
    
    updateSecurityGroups() {
        // Clear existing security groups and their labels
        this.layers.securityGroups.selectAll('*').remove();
        this.layers.labels.selectAll('.sg-label').remove();
        
        // Re-render security groups with updated positions
        this.renderSecurityGroups();
    }
    
    
    onComponentHover(event, d) {
        const component = d3.select(event.currentTarget);
        const componentId = component.attr('data-id');
        const pos = this.positions.instances[componentId];
        
        if (!pos) return;
        
        // Don't apply hover effects if currently dragging
        if (component.classed('dragging')) return;
        
        // Apply scale while preserving position
        component
            .transition()
            .duration(200)
            .attr('transform', `translate(${pos.x}, ${pos.y}) scale(1.1)`)
            .style('filter', 'url(#glow)');
        
        // Show connection previews
        this.showConnectionPreviews(componentId);
    }
    
    onComponentLeave(event, d) {
        const component = d3.select(event.currentTarget);
        const componentId = component.attr('data-id');
        const pos = this.positions.instances[componentId];
        
        if (!pos) return;
        
        // Don't reset hover effects if currently dragging
        if (component.classed('dragging')) return;
        
        // Reset to original transform
        component
            .transition()
            .duration(200)
            .attr('transform', `translate(${pos.x}, ${pos.y}) scale(1)`)
            .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))');
        
        // Hide connection previews
        this.hideConnectionPreviews();
    }
    
    onComponentClick(event, d) {
        event.stopPropagation();
        const componentId = d3.select(event.currentTarget).attr('data-id');
        const instanceData = this.data.instances.find(i => i.id === componentId);
        
        // Trigger full connection animation
        this.animateConnections(componentId, 1);
        
        // Show detail panel (will be implemented in component-panel.js)
        if (window.componentDetailPanel) {
            window.componentDetailPanel.show(instanceData);
        }
    }
    
    showConnectionPreviews(componentId) {
        const connections = this.getDirectConnections(componentId);
        
        connections.forEach(connection => {
            const line = d3.select(`#line-${connection.id}`);
            line.classed('preview', true)
               .style('stroke-opacity', 0.8)
               .style('stroke-width', 3);
        });
    }
    
    hideConnectionPreviews() {
        d3.selectAll('.connection-line')
            .classed('preview', false)
            .style('stroke-opacity', 0.4)
            .style('stroke-width', 2);
    }
    
    animateConnections(componentId, depth = 1) {
        const connections = this.getConnectionsAtDepth(componentId, depth);
        
        // Clear previous animations
        d3.selectAll('.connection-line').classed('animated', false);
        d3.selectAll('.connection-particle').remove();
        
        connections.forEach(connection => {
            const line = d3.select(`#line-${connection.id}`);
            line.classed('animated', true)
               .style('stroke-opacity', 1)
               .style('stroke-width', 3);
               
            // Add animated particles for API connections
            if (connection.type === 'api') {
                this.animateDataFlow(connection);
            }
        });
    }
    
    animateDataFlow(connection) {
        const line = d3.select(`#line-${connection.id}`);
        const x1 = parseFloat(line.attr('x1'));
        const y1 = parseFloat(line.attr('y1'));
        const x2 = parseFloat(line.attr('x2'));
        const y2 = parseFloat(line.attr('y2'));
        
        // Create moving particles along line
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const particle = this.svg.append('circle')
                    .attr('class', 'connection-particle')
                    .attr('r', 3)
                    .attr('cx', x1)
                    .attr('cy', y1)
                    .style('fill', connection.type === 'api' ? '#7b1fa2' : '#f57c00')
                    .style('opacity', 0.8);
                
                particle.transition()
                    .duration(2000)
                    .ease(d3.easeLinear)
                    .attr('cx', x2)
                    .attr('cy', y2)
                    .style('opacity', 0)
                    .remove();
            }, i * 200);
        }
    }
    
    getDirectConnections(componentId) {
        return this.data.connections.filter(conn => 
            conn.source === componentId || conn.target === componentId
        );
    }
    
    getConnectionsAtDepth(componentId, depth) {
        const visited = new Set();
        const connections = [];
        
        const traverse = (currentId, currentDepth) => {
            if (currentDepth > depth || visited.has(currentId)) return;
            visited.add(currentId);
            
            this.data.connections.forEach(conn => {
                if (conn.source === currentId && !visited.has(conn.target)) {
                    connections.push(conn);
                    if (currentDepth < depth) {
                        traverse(conn.target, currentDepth + 1);
                    }
                }
                if (conn.target === currentId && !visited.has(conn.source)) {
                    connections.push(conn);
                    if (currentDepth < depth) {
                        traverse(conn.source, currentDepth + 1);
                    }
                }
            });
        };
        
        traverse(componentId, 0);
        return connections;
    }
    
    // Public methods for accessibility controls
    focusComponent(componentId) {
        const component = this.layers.instances.select(`[data-id="${componentId}"]`);
        const pos = this.positions.instances[componentId];
        
        if (!component.empty() && pos) {
            this.animateConnections(componentId, 1);
            
            // Highlight the component using SVG transform
            component
                .transition()
                .duration(500)
                .attr('transform', `translate(${pos.x}, ${pos.y}) scale(1.2)`)
                .transition()
                .duration(300)
                .attr('transform', `translate(${pos.x}, ${pos.y}) scale(1)`);
        }
    }
    
    updateDimensions(newWidth, newHeight) {
        // Update internal dimensions
        const aspectRatio = this.width / this.height;
        const oldWidth = this.width;
        const oldHeight = this.height;
        
        this.width = Math.max(400, newWidth - 40); // Minimum width with padding
        this.height = Math.max(300, newHeight || this.width / aspectRatio);
        
        console.log('Updating D3 dimensions from:', oldWidth, 'x', oldHeight, 'to:', this.width, 'x', this.height);
        
        // Update SVG viewBox
        this.svg.attr('viewBox', `0 0 ${this.width} ${this.height}`);
        
        // Update scales
        this.setupScales();
        
        // Recalculate positions and scaling factors
        this.calculatePositions();
        
        console.log('New scale factor:', this.scaleFactor, 'Node radius:', this.nodeRadius);
        
        // Update all visual elements
        this.updateVisualizationLayout();
    }
    
    updateVisualizationLayout() {
        // Update VPC boundary
        const vpcRect = this.layers.vpc.select('.vpc-boundary');
        if (!vpcRect.empty()) {
            vpcRect
                .attr('x', this.positions.vpc.x)
                .attr('y', this.positions.vpc.y)
                .attr('width', this.positions.vpc.width)
                .attr('height', this.positions.vpc.height);
        }
        
        // Update VPC label
        const vpcLabel = this.layers.labels.select('.vpc-label');
        if (!vpcLabel.empty()) {
            vpcLabel
                .attr('x', this.positions.vpc.x + 10)
                .attr('y', this.positions.vpc.y - 10)
                .style('font-size', `${this.fontSize.vpcLabel}px`);
        }
        
        // Update subnets
        Object.entries(this.positions.subnets).forEach(([type, pos]) => {
            const subnet = this.layers.subnets.select(`.subnet-${type}`);
            if (!subnet.empty()) {
                subnet
                    .attr('x', pos.x)
                    .attr('y', pos.y)
                    .attr('width', pos.width)
                    .attr('height', pos.height);
            }
        });
        
        // Update subnet labels with responsive font sizes
        this.data.vpc.subnets.forEach(subnet => {
            const pos = this.positions.subnets[subnet.type];
            if (pos) {
                // Update subnet name labels
                this.layers.labels.selectAll('.subnet-label')
                    .filter(function() {
                        const x = d3.select(this).attr('x');
                        return Math.abs(x - (pos.x + 10)) < 5; // Match by position
                    })
                    .attr('x', pos.x + 10)
                    .attr('y', pos.y + 20)
                    .style('font-size', `${this.fontSize.subnetLabel}px`);
                
                // Update subnet CIDR labels
                this.layers.labels.selectAll('.subnet-cidr')
                    .filter(function() {
                        const x = d3.select(this).attr('x');
                        return Math.abs(x - (pos.x + 10)) < 5; // Match by position
                    })
                    .attr('x', pos.x + 10)
                    .attr('y', pos.y + 35)
                    .style('font-size', `${this.fontSize.subnetCidr}px`);
            }
        });
        
        // Update instances positions and sizes
        this.data.instances.forEach(instance => {
            const pos = this.positions.instances[instance.id];
            if (pos) {
                const instanceGroup = this.layers.instances.select(`[data-id="${instance.id}"]`);
                if (!instanceGroup.empty()) {
                    instanceGroup.attr('transform', `translate(${pos.x}, ${pos.y})`);
                    
                    // Update circle radius and stroke width
                    instanceGroup.select('circle')
                        .attr('r', this.nodeRadius)
                        .style('stroke-width', Math.max(1, 3 * this.scaleFactor));
                    
                    // Update text size
                    instanceGroup.select('text')
                        .style('font-size', `${this.fontSize.instanceIcon}px`);
                }
                
                // Update labels with responsive sizing
                const nameLabel = d3.select(`#label-name-${instance.id}`);
                if (!nameLabel.empty()) {
                    nameLabel
                        .attr('x', pos.x)
                        .attr('y', pos.y + this.nodeRadius + 15)
                        .style('font-size', `${this.fontSize.instanceLabel}px`);
                }
                
                const portLabel = d3.select(`#label-port-${instance.id}`);
                if (!portLabel.empty()) {
                    portLabel
                        .attr('x', pos.x)
                        .attr('y', pos.y + this.nodeRadius + 27)
                        .style('font-size', `${this.fontSize.portLabel}px`);
                }
                
                const ipLabel = d3.select(`#label-ip-${instance.id}`);
                if (!ipLabel.empty()) {
                    ipLabel
                        .attr('x', pos.x)
                        .attr('y', pos.y + this.nodeRadius + (instance.port ? 39 : 27))
                        .style('font-size', `${this.fontSize.ipLabel}px`);
                }
            }
        });
        
        // Update connections
        this.data.connections.forEach(conn => {
            const sourcePos = this.positions.instances[conn.source];
            const targetPos = this.positions.instances[conn.target];
            
            if (sourcePos && targetPos) {
                const line = this.layers.connections.select(`#line-${conn.id}`);
                if (!line.empty()) {
                    line
                        .attr('x1', sourcePos.x)
                        .attr('y1', sourcePos.y)
                        .attr('x2', targetPos.x)
                        .attr('y2', targetPos.y);
                }
            }
        });
        
        // Update security groups
        this.updateSecurityGroups();
    }
    
    showAllConnections() {
        this.data.connections.forEach(conn => {
            const line = d3.select(`#line-${conn.id}`);
            line.style('stroke-opacity', 0.8)
               .style('stroke-width', 2);
        });
        
        setTimeout(() => {
            this.hideConnectionPreviews();
        }, 3000);
    }
}

// Global functions for accessibility controls
function focusComponent(componentId) {
    if (window.infrastructureViz) {
        window.infrastructureViz.focusComponent(componentId);
    }
}

function showAllConnections() {
    if (window.infrastructureViz) {
        window.infrastructureViz.showAllConnections();
    }
}