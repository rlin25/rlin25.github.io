// D3.js Infrastructure Visualization for Frizzle's Rubric
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
        console.log('calculatePositions called, placedNodes length:', this.placedNodes ? this.placedNodes.length : 'undefined');
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
        
        // Initialize collision detection arrays
        this.placedNodes = [];
        this.minNodeDistance = this.nodeRadius * 4; // Minimum distance between node centers (increased for better separation)
        console.log('Collision detection initialized - minNodeDistance:', this.minNodeDistance, 'nodeRadius:', this.nodeRadius);
        
        // VPC boundary
        this.positions.vpc = {
            x: this.margin.left,
            y: this.margin.top,
            width: this.width - this.margin.left - this.margin.right,
            height: this.height - this.margin.top - this.margin.bottom
        };
        
        // Determine layout based on aspect ratio
        const aspectRatio = this.width / this.height;
        this.isVerticalLayout = aspectRatio < 1.5; // Switch to vertical when width/height < 1.5 (more aggressive)
        
        console.log('LAYOUT CALCULATION - Dimensions:', this.width, 'x', this.height);
        console.log('LAYOUT CALCULATION - Aspect ratio:', aspectRatio.toFixed(2), 'Layout:', this.isVerticalLayout ? 'VERTICAL' : 'HORIZONTAL');
        
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
        this.positions.instances = {};
        
        // Position fixed instances with collision detection
        const bastionPreferred = {
            x: this.positions.subnets.public.x + (this.isVerticalLayout ? subnetWidth/3 : subnetWidth/3),
            y: this.positions.subnets.public.y + subnetHeight/2 + 5,
            subnet: 'public'
        };
        
        const webappPreferred = {
            x: this.positions.subnets.public.x + (this.isVerticalLayout ? 2*subnetWidth/3 : 2*subnetWidth/3),
            y: this.positions.subnets.public.y + subnetHeight/2 + 5,
            subnet: 'public'
        };
        
        const orchestratorPreferred = {
            x: this.positions.subnets.private.x + subnetWidth/2 + (this.isVerticalLayout ? 0 : 30),
            y: this.positions.subnets.private.y + (this.isVerticalLayout ? 60 : 60 + 10 + 5),
            subnet: 'private'
        };
        
        this.positions.instances.bastion = this.findNonOverlappingPosition(
            bastionPreferred, 
            this.positions.subnets.public
        );
        
        this.positions.instances.webapp = this.findNonOverlappingPosition(
            webappPreferred, 
            this.positions.subnets.public
        );
        
        this.positions.instances.orchestrator = this.findNonOverlappingPosition(
            orchestratorPreferred, 
            this.positions.subnets.private
        );
        
        // Position ML experts in a grid with collision detection
        let expertCols, expertRows, expertSpacing, startX, startY;
        
        if (this.isVerticalLayout) {
            // Vertical layout - spacing based on node distance
            expertCols = 3;
            expertRows = 2;
            expertSpacing = { 
                x: Math.max(this.minNodeDistance * 1.2, subnetWidth/4), 
                y: Math.max(this.minNodeDistance * 1.2, subnetHeight/3.5) 
            };
            startX = this.positions.subnets.private.x + 60;
            startY = this.positions.subnets.private.y + 120;
        } else {
            // Horizontal layout - spacing based on node distance
            expertCols = 3;
            expertRows = 2;
            expertSpacing = { 
                x: Math.max(this.minNodeDistance * 1.2, subnetWidth/4), 
                y: Math.max(this.minNodeDistance * 1.2, subnetHeight/4) 
            };
            startX = this.positions.subnets.private.x + 60;
            startY = this.positions.subnets.private.y + 150 + 5;
        }
        
        ['clarity', 'grammar', 'documentation', 'structure', 'granularity'].forEach((expert, i) => {
            const col = i % expertCols;
            const row = Math.floor(i / expertCols);
            
            const preferredPos = {
                x: startX + col * expertSpacing.x,
                y: startY + row * expertSpacing.y,
                subnet: 'private'
            };
            
            // Find non-overlapping position
            this.positions.instances[expert] = this.findNonOverlappingPosition(
                preferredPos, 
                this.positions.subnets.private
            );
        });
        
        // Position non-ML experts with collision detection
        if (this.isVerticalLayout) {
            // Vertical layout - position at bottom of private subnet
            const toolingPreferred = {
                x: this.positions.subnets.private.x + 60,
                y: this.positions.subnets.private.y + subnetHeight - 60,
                subnet: 'private'
            };
            
            const repetitionPreferred = {
                x: this.positions.subnets.private.x + subnetWidth - 60,
                y: this.positions.subnets.private.y + subnetHeight - 60,
                subnet: 'private'
            };
            
            this.positions.instances.tooling = this.findNonOverlappingPosition(
                toolingPreferred, 
                this.positions.subnets.private
            );
            
            this.positions.instances.repetition = this.findNonOverlappingPosition(
                repetitionPreferred, 
                this.positions.subnets.private
            );
        } else {
            // Horizontal layout - original positions
            const toolingPreferred = {
                x: this.positions.subnets.private.x + 50,
                y: this.positions.subnets.private.y + subnetHeight - 80 + 5,
                subnet: 'private'
            };
            
            const repetitionPreferred = {
                x: this.positions.subnets.private.x + subnetWidth - 80,
                y: this.positions.subnets.private.y + subnetHeight - 80 + 5,
                subnet: 'private'
            };
            
            this.positions.instances.tooling = this.findNonOverlappingPosition(
                toolingPreferred, 
                this.positions.subnets.private
            );
            
            this.positions.instances.repetition = this.findNonOverlappingPosition(
                repetitionPreferred, 
                this.positions.subnets.private
            );
        }
    }
    
    // Collision detection methods
    checkCollision(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.minNodeDistance;
    }
    
    checkCollisionWithPlaced(position) {
        return this.placedNodes.some(placedPos => this.checkCollision(position, placedPos));
    }
    
    findNonOverlappingPosition(preferredPos, subnetBounds) {
        // First check if preferred position is collision-free
        if (!this.checkCollisionWithPlaced(preferredPos)) {
            this.placedNodes.push(preferredPos);
            console.log('✓ Preferred position accepted:', preferredPos);
            return preferredPos;
        }
        
        console.log('✗ Collision detected for preferred position:', preferredPos, 'Searching for alternative...');
        
        // If collision detected, find alternative position using spiral pattern
        const maxAttempts = 100;
        const padding = Math.max(60, 60 * this.scaleFactor); // Increased padding
        const minX = subnetBounds.x + padding + this.nodeRadius;
        const maxX = subnetBounds.x + subnetBounds.width - padding - this.nodeRadius;
        const minY = subnetBounds.y + padding + this.nodeRadius;
        const maxY = subnetBounds.y + subnetBounds.height - padding - this.nodeRadius;
        
        // Try spiral pattern around preferred position with larger increments
        const maxRadius = Math.min(subnetBounds.width, subnetBounds.height) / 3;
        for (let radius = this.minNodeDistance; radius <= maxRadius; radius += this.minNodeDistance * 0.75) {
            for (let angle = 0; angle < 2 * Math.PI; angle += Math.PI / 6) { // Fewer angle steps for faster search
                const candidate = {
                    x: Math.max(minX, Math.min(maxX, preferredPos.x + radius * Math.cos(angle))),
                    y: Math.max(minY, Math.min(maxY, preferredPos.y + radius * Math.sin(angle))),
                    subnet: preferredPos.subnet
                };
                
                // Check if candidate position is within bounds and collision-free
                if (candidate.x >= minX && candidate.x <= maxX && 
                    candidate.y >= minY && candidate.y <= maxY && 
                    !this.checkCollisionWithPlaced(candidate)) {
                    this.placedNodes.push(candidate);
                    console.log('✓ Alternative position found (spiral):', candidate);
                    return candidate;
                }
            }
        }
        
        // If spiral search fails, try grid-based search
        const gridStep = this.minNodeDistance * 0.8;
        for (let x = minX; x <= maxX; x += gridStep) {
            for (let y = minY; y <= maxY; y += gridStep) {
                const candidate = {
                    x: x,
                    y: y,
                    subnet: preferredPos.subnet
                };
                
                if (!this.checkCollisionWithPlaced(candidate)) {
                    this.placedNodes.push(candidate);
                    console.log('✓ Alternative position found (grid):', candidate);
                    return candidate;
                }
            }
        }
        
        // If grid search fails, try random positions as fallback
        for (let i = 0; i < maxAttempts; i++) {
            const candidate = {
                x: minX + Math.random() * (maxX - minX),
                y: minY + Math.random() * (maxY - minY),
                subnet: preferredPos.subnet
            };
            
            if (!this.checkCollisionWithPlaced(candidate)) {
                this.placedNodes.push(candidate);
                return candidate;
            }
        }
        
        // Last resort: return preferred position even if it overlaps (with warning)
        console.warn('Could not find non-overlapping position for', preferredPos, 'using preferred position');
        this.placedNodes.push(preferredPos);
        return preferredPos;
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
            .style('text-shadow', '1px 1px 2px rgba(255,255,255,0.8), -1px -1px 2px rgba(255,255,255,0.8), 1px -1px 2px rgba(255,255,255,0.8), -1px 1px 2px rgba(255,255,255,0.8)')
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
                
            // Subnet label - Public label on blue rectangle, Private label on green rectangle
            const labelText = type === 'public' ? 'Public Subnet' : 'Private Subnet (Main)';
            const labelCidr = type === 'public' ? '172.31.49.0/24' : '172.31.48.0/24';
            
            this.layers.labels.append('text')
                .attr('x', pos.x + 10)
                .attr('y', pos.y + 20)
                .attr('class', `subnet-label subnet-label-${type}`)
                .attr('data-subnet-type', type)
                .style('font-family', 'Inter, sans-serif')
                .style('font-size', `${this.fontSize.subnetLabel}px`)
                .style('font-weight', '500')
                .style('fill', '#555')
                .style('text-shadow', '1px 1px 2px rgba(255,255,255,0.8), -1px -1px 2px rgba(255,255,255,0.8), 1px -1px 2px rgba(255,255,255,0.8), -1px 1px 2px rgba(255,255,255,0.8)')
                .text(labelText);
                
            this.layers.labels.append('text')
                .attr('x', pos.x + 10)
                .attr('y', pos.y + 35)
                .attr('class', `subnet-cidr subnet-cidr-${type}`)
                .attr('data-subnet-type', type)
                .style('font-family', 'Consolas, monospace')
                .style('font-size', `${this.fontSize.subnetCidr}px`)
                .style('fill', '#777')
                .style('text-shadow', '1px 1px 2px rgba(255,255,255,0.8), -1px -1px 2px rgba(255,255,255,0.8), 1px -1px 2px rgba(255,255,255,0.8), -1px 1px 2px rgba(255,255,255,0.8)')
                .text(labelCidr);
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
                
            // Security group label - positioned at top right corner
            this.layers.labels.append('text')
                .attr('x', maxX - 5)
                .attr('y', minY - 5)
                .attr('class', 'sg-label')
                .style('font-family', 'Inter, sans-serif')
                .style('font-size', `${this.fontSize.sgLabel}px`)
                .style('font-weight', '500')
                .style('fill', sg.color)
                .style('text-anchor', 'end')
                .style('text-shadow', '1px 1px 2px rgba(255,255,255,0.8), -1px -1px 2px rgba(255,255,255,0.8), 1px -1px 2px rgba(255,255,255,0.8), -1px 1px 2px rgba(255,255,255,0.8)')
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
            
            // Calculate label positions with collision avoidance
            const labelPositions = this.calculateLabelPositions(pos, instance);
            
            // Instance name
            this.layers.labels.append('text')
                .attr('id', `label-name-${instance.id}`)
                .attr('x', labelPositions.name.x)
                .attr('y', labelPositions.name.y)
                .attr('class', 'instance-label')
                .style('text-anchor', 'middle')
                .style('font-family', 'Inter, sans-serif')
                .style('font-size', `${this.fontSize.instanceLabel}px`)
                .style('font-weight', '500')
                .style('fill', '#333')
                .style('text-shadow', '1px 1px 2px rgba(255,255,255,0.8), -1px -1px 2px rgba(255,255,255,0.8), 1px -1px 2px rgba(255,255,255,0.8), -1px 1px 2px rgba(255,255,255,0.8)')
                .text(instance.name);
                
            // Port number for experts
            if (instance.port) {
                this.layers.labels.append('text')
                    .attr('id', `label-port-${instance.id}`)
                    .attr('x', labelPositions.port.x)
                    .attr('y', labelPositions.port.y)
                    .attr('class', 'port-label')
                    .style('text-anchor', 'middle')
                    .style('font-family', 'Consolas, monospace')
                    .style('font-size', `${this.fontSize.portLabel}px`)
                    .style('fill', '#666')
                    .style('text-shadow', '1px 1px 2px rgba(255,255,255,0.8), -1px -1px 2px rgba(255,255,255,0.8), 1px -1px 2px rgba(255,255,255,0.8), -1px 1px 2px rgba(255,255,255,0.8)')
                    .text(`:${instance.port}`);
            }
            
            // Private IP
            this.layers.labels.append('text')
                .attr('id', `label-ip-${instance.id}`)
                .attr('x', labelPositions.ip.x)
                .attr('y', labelPositions.ip.y)
                .attr('class', 'ip-label')
                .style('text-anchor', 'middle')
                .style('font-family', 'Consolas, monospace')
                .style('font-size', `${this.fontSize.ipLabel}px`)
                .style('fill', '#888')
                .style('text-shadow', '1px 1px 2px rgba(255,255,255,0.8), -1px -1px 2px rgba(255,255,255,0.8), 1px -1px 2px rgba(255,255,255,0.8), -1px 1px 2px rgba(255,255,255,0.8)')
                .text(instance.privateIp || instance.publicIp);
        });
    }
    
    calculateLabelPositions(nodePos, instance) {
        const baseOffset = 15;
        const lineHeight = 12;
        
        // Default positions (below node)
        let positions = {
            name: {
                x: nodePos.x,
                y: nodePos.y + this.nodeRadius + baseOffset
            },
            port: {
                x: nodePos.x,
                y: nodePos.y + this.nodeRadius + baseOffset + lineHeight
            },
            ip: {
                x: nodePos.x,
                y: nodePos.y + this.nodeRadius + baseOffset + (instance.port ? lineHeight * 2 : lineHeight)
            }
        };
        
        // Check if labels would overlap with other nodes
        const labelBounds = this.getLabelBounds(positions, instance);
        
        // If there's overlap, try alternative positions
        if (this.checkLabelOverlap(labelBounds)) {
            // Try positioning above the node
            positions.name.y = nodePos.y - this.nodeRadius - baseOffset;
            positions.port.y = nodePos.y - this.nodeRadius - baseOffset - lineHeight;
            positions.ip.y = nodePos.y - this.nodeRadius - baseOffset - (instance.port ? lineHeight * 2 : lineHeight);
            
            const newLabelBounds = this.getLabelBounds(positions, instance);
            
            // If still overlapping, try to the right
            if (this.checkLabelOverlap(newLabelBounds)) {
                positions.name.x = nodePos.x + this.nodeRadius + 20;
                positions.name.y = nodePos.y - (instance.port ? lineHeight : lineHeight/2);
                positions.port.x = nodePos.x + this.nodeRadius + 20;
                positions.port.y = nodePos.y;
                positions.ip.x = nodePos.x + this.nodeRadius + 20;
                positions.ip.y = nodePos.y + lineHeight;
            }
        }
        
        return positions;
    }
    
    getLabelBounds(positions, instance) {
        const textWidth = 60; // Approximate text width
        const textHeight = 12; // Approximate text height
        
        let bounds = [
            {
                x: positions.name.x - textWidth/2,
                y: positions.name.y - textHeight/2,
                width: textWidth,
                height: textHeight
            }
        ];
        
        if (instance.port) {
            bounds.push({
                x: positions.port.x - textWidth/2,
                y: positions.port.y - textHeight/2,
                width: textWidth,
                height: textHeight
            });
        }
        
        bounds.push({
            x: positions.ip.x - textWidth/2,
            y: positions.ip.y - textHeight/2,
            width: textWidth,
            height: textHeight
        });
        
        return bounds;
    }
    
    checkLabelOverlap(labelBounds) {
        return labelBounds.some(labelBound => {
            return this.placedNodes.some(node => {
                const nodeLeft = node.x - this.nodeRadius;
                const nodeRight = node.x + this.nodeRadius;
                const nodeTop = node.y - this.nodeRadius;
                const nodeBottom = node.y + this.nodeRadius;
                
                const labelLeft = labelBound.x;
                const labelRight = labelBound.x + labelBound.width;
                const labelTop = labelBound.y;
                const labelBottom = labelBound.y + labelBound.height;
                
                return !(labelRight < nodeLeft || labelLeft > nodeRight || 
                        labelBottom < nodeTop || labelTop > nodeBottom);
            });
        });
    }
    
    getInstanceIcon(type) {
        const icons = {
            'bastion': 'SSH',
            'webapp': 'WEB',
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
        
        // Calculate new label positions with collision avoidance
        const labelPositions = this.calculateLabelPositions({x: newX, y: newY}, instance);
        
        // Update instance name label
        d3.select(`#label-name-${instanceId}`)
            .attr('x', labelPositions.name.x)
            .attr('y', labelPositions.name.y);
        
        // Update port label if it exists
        if (instance.port) {
            d3.select(`#label-port-${instanceId}`)
                .attr('x', labelPositions.port.x)
                .attr('y', labelPositions.port.y);
        }
        
        // Update IP label
        d3.select(`#label-ip-${instanceId}`)
            .attr('x', labelPositions.ip.x)
            .attr('y', labelPositions.ip.y);
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
        
        // Show detail panel
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
    
    
    getDirectConnections(componentId) {
        return this.data.connections.filter(conn => 
            conn.source === componentId || conn.target === componentId
        );
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
        Object.entries(this.positions.subnets).forEach(([type, pos]) => {
            if (pos) {
                // Update subnet name labels by data attribute
                this.layers.labels.selectAll(`.subnet-label-${type}`)
                    .attr('x', pos.x + 10)
                    .attr('y', pos.y + 20)
                    .style('font-size', `${this.fontSize.subnetLabel}px`);
                
                // Update subnet CIDR labels by data attribute  
                this.layers.labels.selectAll(`.subnet-cidr-${type}`)
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
                
                // Update labels with responsive sizing and collision avoidance
                const labelPositions = this.calculateLabelPositions(pos, instance);
                
                const nameLabel = d3.select(`#label-name-${instance.id}`);
                if (!nameLabel.empty()) {
                    nameLabel
                        .attr('x', labelPositions.name.x)
                        .attr('y', labelPositions.name.y)
                        .style('font-size', `${this.fontSize.instanceLabel}px`);
                }
                
                const portLabel = d3.select(`#label-port-${instance.id}`);
                if (!portLabel.empty()) {
                    portLabel
                        .attr('x', labelPositions.port.x)
                        .attr('y', labelPositions.port.y)
                        .style('font-size', `${this.fontSize.portLabel}px`);
                }
                
                const ipLabel = d3.select(`#label-ip-${instance.id}`);
                if (!ipLabel.empty()) {
                    ipLabel
                        .attr('x', labelPositions.ip.x)
                        .attr('y', labelPositions.ip.y)
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
    
}