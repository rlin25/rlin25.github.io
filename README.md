# Richard Lin - Systems Architect & AI Engineer Portfolio

Interactive portfolio website showcasing Frizzle's Rubric, a distributed AI evaluation system built for HackAI competition. Features a live D3.js visualization of AWS infrastructure architecture with 7 specialized evaluation experts.

🌐 **Live Site**: [rlin25.github.io](https://rlin25.github.io)

## Project Overview

This portfolio demonstrates production-level AWS infrastructure design and AI systems architecture through an interactive visualization of Frizzle's Rubric - a distributed AI prompt evaluation system.

### Key Features

- **Interactive D3.js Infrastructure Diagram**: Real-time visualization of AWS VPC architecture
- **Responsive Design**: Adaptive layouts for desktop and mobile devices  
- **Technical Detail Panels**: Click any component to explore technical specifications
- **Real Infrastructure Data**: Based on actual HackAI deployment configurations

### System Architecture

- **7 AI Evaluation Experts**: Fine-tuned DistilBERT models and specialized services
- **AWS VPC Security**: Bastion host architecture with proper subnet isolation
- **Microservices Orchestration**: Central API coordinator with timeout handling
- **Production Scaling**: Multi-AZ deployment with load balancing capabilities

## Technology Stack

- **Frontend**: Vanilla JavaScript, D3.js v7, HTML5, CSS3
- **Visualization**: Interactive SVG with force simulation and drag behavior
- **Infrastructure**: AWS EC2, VPC, Security Groups, DynamoDB
- **ML Models**: Fine-tuned DistilBERT, Python ML pipeline
- **Deployment**: GitHub Pages, automated CI/CD

## Project Structure

```
├── index.html              # Main page with hero section and architecture overview
├── styles.css              # Responsive styling and visual design
├── js/
│   ├── infrastructure-data.js    # Real AWS infrastructure configuration
│   ├── infrastructure-viz.js     # D3.js visualization engine
│   ├── component-panel.js        # Interactive detail panels
│   └── main.js                   # Application initialization
├── auto_push.sh            # Automated deployment script
└── masterplan.md           # Original project specifications
```

## Infrastructure Components

### Public Subnet (172.31.49.0/24)
- **Bastion Host**: SSH gateway with ProxyJump configuration
- **Web Application**: Flask frontend serving evaluation interface

### Private Subnet (172.31.48.0/24)  
- **Central Orchestrator**: API coordination across all experts
- **ML Experts**: Fine-tuned DistilBERT models for clarity, grammar, documentation, structure, granularity
- **Service Experts**: Keyword-based tooling detection, DynamoDB repetition checking

### Security Groups
- **sg-bastion-public**: SSH access control for public instances
- **sg-webapp-public**: Web application security rules
- **sg-private**: Internal communication between evaluation services

## Development

### Quick Setup

To automatically push changes to GitHub after making updates:

```bash
./auto_push.sh "Your commit message"
```

If no message is provided, it will use "Update content" as the default.

### Local Development

1. Clone the repository
2. Serve files with any HTTP server (Python, Node.js, etc.)
3. Open in browser to test changes
4. Use `auto_push.sh` to deploy

### Key Features Implemented

- ✅ **Responsive D3.js visualization** with mobile-first design
- ✅ **Interactive component details** with technical specifications
- ✅ **Dynamic subnet labeling** with proper IP address display
- ✅ **Security group visualization** with top-right corner labels
- ✅ **Node color coding** by service type and functionality
- ✅ **Draggable components** with subnet boundary constraints
- ✅ **Real SSH configurations** and infrastructure details

## Performance

- **Lightweight**: Vanilla JavaScript with minimal dependencies
- **Fast Loading**: Optimized assets with efficient caching
- **Responsive**: Smooth interactions across all device sizes
- **Accessible**: Keyboard navigation and screen reader support

## Awards & Recognition

🏆 **HackAI Winner** - Frizzle's Rubric distributed AI evaluation system

---

*Built with ❤️ using D3.js and modern web technologies*