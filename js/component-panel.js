// Component Detail Panel for Infrastructure Visualization
class ComponentDetailPanel {
    constructor(containerId) {
        this.container = d3.select('body');
        this.isVisible = false;
        this.currentComponent = null;
        
        this.setupPanel();
    }
    
    setupPanel() {
        // No overlay needed for side-by-side layout
            
        this.panel = this.container
            .append('div')
            .attr('class', 'detail-panel sidebar')
            .style('position', 'fixed')
            .style('top', '0')
            .style('right', '-400px')  // Hidden initially
            .style('width', '400px')
            .style('height', '100vh')
            .style('background', 'rgba(255, 255, 255, 0.98)')
            .style('backdrop-filter', 'blur(15px)')
            .style('border-left', '1px solid #e0e0e0')
            .style('box-shadow', '-8px 0 32px rgba(0,0,0,0.15)')
            .style('padding', '0')
            .style('overflow', 'hidden')
            .style('z-index', 1000)
            .style('transition', 'right 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)')
            .style('font-family', 'Inter, sans-serif');
            
        // Sidebar header
        const header = this.panel.append('div')
            .attr('class', 'sidebar-header')
            .style('padding', '20px 20px 0 20px')
            .style('border-bottom', '1px solid #f0f0f0')
            .style('margin-bottom', '0');
            
        // Close button
        header.append('button')
            .attr('class', 'close-btn')
            .style('position', 'absolute')
            .style('top', '20px')
            .style('right', '20px')
            .style('background', '#f8f9fa')
            .style('border', '1px solid #e9ecef')
            .style('border-radius', '50%')
            .style('width', '32px')
            .style('height', '32px')
            .style('font-size', '18px')
            .style('cursor', 'pointer')
            .style('color', '#666')
            .style('transition', 'all 0.3s ease')
            .style('z-index', '1001')
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('justify-content', 'center')
            .text('×')
            .on('click', (event) => {
                event.stopPropagation();
                this.hide();
            })
            .on('mouseenter', function() { 
                d3.select(this)
                    .style('background', '#e9ecef')
                    .style('color', '#333'); 
            })
            .on('mouseleave', function() { 
                d3.select(this)
                    .style('background', '#f8f9fa')
                    .style('color', '#666'); 
            });
            
        // Content container with scroll
        this.contentContainer = this.panel.append('div')
            .attr('class', 'sidebar-content')
            .style('height', 'calc(100vh - 60px)')
            .style('overflow-y', 'auto')
            .style('padding', '20px')
            .style('padding-top', '10px');
            
        // No need for global click handler since we have the overlay
    }
    
    show(componentData) {
        this.currentComponent = componentData;
        this.populateContent(componentData);
        
        // Resize main content to make room for sidebar
        d3.select('body')
            .transition()
            .duration(400)
            .style('margin-right', '400px');
        
        // Show sidebar
        this.panel
            .transition()
            .duration(400)
            .style('right', '0px');
            
        this.isVisible = true;
        
        // Trigger window resize event to update D3 visualization
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 450);
    }
    
    hide() {
        // Reset main content width
        d3.select('body')
            .transition()
            .duration(400)
            .style('margin-right', '0px');
        
        // Hide sidebar
        this.panel
            .transition()
            .duration(400)
            .style('right', '-400px');
            
        this.isVisible = false;
        
        // Trigger window resize event to update D3 visualization
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 450);
    }
    
    populateContent(component) {
        // Clear existing content
        this.contentContainer.selectAll('.content').remove();
        
        const content = this.contentContainer.append('div').attr('class', 'content');
        
        // Component header
        const header = content.append('div')
            .style('margin-bottom', '20px');
            
        header.append('h2')
            .style('color', component.color)
            .style('margin-bottom', '8px')
            .style('font-size', '1.5rem')
            .style('font-weight', '700')
            .style('line-height', '1.2')
            .text(component.name);
            
        header.append('p')
            .style('color', '#666')
            .style('margin-bottom', '10px')
            .style('font-size', '0.9rem')
            .text(this.getComponentPurpose(component));
            
        // Component type badge
        header.append('span')
            .style('display', 'inline-block')
            .style('background', component.color)
            .style('color', '#fff')
            .style('padding', '3px 8px')
            .style('border-radius', '12px')
            .style('font-size', '0.75rem')
            .style('font-weight', '500')
            .style('text-transform', 'uppercase')
            .text(this.getComponentTypeLabel(component.type));
            
        // Technical details section
        const details = content.append('div')
            .attr('class', 'technical-details')
            .style('margin-bottom', '25px');
            
        details.append('h3')
            .style('margin-bottom', '15px')
            .style('font-size', '1.1rem')
            .style('font-weight', '600')
            .style('color', '#2c3e50')
            .text('Technical Details');
            
        const detailsList = details.append('div');
        this.addComponentDetails(detailsList, component);
        
        // Configuration section
        if (component.type === 'ml-expert' || component.type === 'orchestrator' || component.type === 'non-ml-expert' || component.type === 'webapp') {
            this.addConfigurationSection(content, component);
        }
        
        // SSH configuration section for instances
        if (component.id !== 'bastion') {
            this.addSSHConfiguration(content, component);
        }
        
        // Security information
        this.addSecurityInformation(content, component);
    }
    
    getComponentPurpose(component) {
        const purposes = {
            'bastion': 'Secure SSH gateway providing controlled access to private subnet resources through ProxyJump configuration',
            'webapp': 'Public-facing web application serving the Frizzle\'s Rubric interface with direct API access to the orchestrator',
            'orchestrator': 'Central API coordinator managing async requests across all 7 evaluation experts with timeout handling',
            'clarity': 'ML-based evaluation of prompt clarity and instruction specificity using fine-tuned DistilBERT',
            'grammar': 'Grammar and syntax validation using fine-tuned language model trained on Jfleg dataset',
            'documentation': 'Assessment of context completeness and example provision using custom training data',
            'structure': 'Evaluation of logical flow and hierarchical organization in prompt structure',
            'granularity': 'Analysis of appropriate detail level and instruction precision for optimal AI responses',
            'tooling': 'Keyword-based detection of AI tools and framework mentions using Python regex patterns',
            'repetition': 'Database lookup service for duplicate prompt detection using DynamoDB hash comparison'
        };
        
        return purposes[component.id] || 'Infrastructure component for distributed AI evaluation system';
    }
    
    getComponentTypeLabel(type) {
        const labels = {
            'bastion': 'SSH Gateway',
            'webapp': 'Web Application',
            'orchestrator': 'API Gateway', 
            'ml-expert': 'ML Service',
            'non-ml-expert': 'Data Service'
        };
        return labels[type] || 'Service';
    }
    
    addComponentDetails(container, component) {
        const details = [
            { label: 'Instance Type', value: component.instanceType || 'N/A' },
            { label: 'Private IP', value: component.privateIp },
            { label: 'Security Group', value: component.securityGroup },
            { label: 'SSH Key', value: component.keyFile || 'N/A' }
        ];
        
        if (component.publicIp) {
            details.unshift({ label: 'Public IP', value: component.publicIp });
        }
        
        if (component.port) {
            details.splice(2, 0, { label: 'Service Port', value: component.port });
        }
        
        if (component.type === 'ml-expert') {
            details.push(
                { label: 'Model Type', value: component.model },
                { label: 'Training Dataset', value: component.dataset }
            );
        } else if (component.type === 'non-ml-expert') {
            details.push(
                { label: 'Implementation', value: component.implementation },
                { label: 'Data Source', value: component.dataSource }
            );
        }
        
        details.forEach(detail => {
            const item = container.append('div')
                .style('margin-bottom', '10px')
                .style('padding', '8px')
                .style('background', '#f8f9fa')
                .style('border-radius', '4px')
                .style('border-left', `3px solid ${component.color}`);
                
            item.append('div')
                .style('font-size', '0.75rem')
                .style('color', '#666')
                .style('text-transform', 'uppercase')
                .style('letter-spacing', '0.5px')
                .style('font-weight', '500')
                .text(detail.label);
                
            item.append('div')
                .style('font-family', detail.label.includes('IP') || detail.label.includes('Port') ? 'Consolas, monospace' : 'Inter, sans-serif')
                .style('font-size', '0.9rem')
                .style('font-weight', '500')
                .style('color', '#2c3e50')
                .style('margin-top', '2px')
                .text(detail.value);
        });
    }
    
    addConfigurationSection(container, component) {
        const configSection = container.append('div')
            .style('margin-bottom', '25px');
            
        configSection.append('h3')
            .style('margin-bottom', '15px')
            .style('font-size', '1.1rem')
            .style('font-weight', '600')
            .style('color', '#2c3e50')
            .text('Configuration');
            
        const codeContainer = configSection.append('div')
            .style('background', '#1a202c')
            .style('border-radius', '6px')
            .style('overflow', 'hidden')
            .style('box-shadow', '0 2px 8px rgba(0,0,0,0.1)');
            
        const codeHeader = codeContainer.append('div')
            .style('background', '#2d3748')
            .style('color', '#e2e8f0')
            .style('padding', '10px 15px')
            .style('font-size', '0.8rem')
            .style('font-weight', '600')
            .text(this.getConfigurationTitle(component));
            
        const codeBlock = codeContainer.append('pre')
            .style('background', '#1a202c')
            .style('color', '#e2e8f0')
            .style('padding', '15px')
            .style('margin', '0')
            .style('overflow-x', 'auto')
            .style('font-family', 'Consolas, Monaco, monospace')
            .style('font-size', '0.8rem')
            .style('line-height', '1.4');
            
        codeBlock.append('code')
            .text(this.getCodeSnippet(component));
    }
    
    addSSHConfiguration(container, component) {
        const sshSection = container.append('div')
            .style('margin-bottom', '25px');
            
        sshSection.append('h3')
            .style('margin-bottom', '15px')
            .style('font-size', '1.1rem')
            .style('font-weight', '600')
            .style('color', '#2c3e50')
            .text('SSH Access');
            
        const sshContainer = sshSection.append('div')
            .style('background', '#1a202c')
            .style('border-radius', '6px')
            .style('overflow', 'hidden')
            .style('box-shadow', '0 2px 8px rgba(0,0,0,0.1)');
            
        const sshHeader = sshContainer.append('div')
            .style('background', '#2d3748')
            .style('color', '#e2e8f0')
            .style('padding', '10px 15px')
            .style('font-size', '0.8rem')
            .style('font-weight', '600')
            .text('SSH Configuration (~/.ssh/config)');
            
        const sshBlock = sshContainer.append('pre')
            .style('background', '#1a202c')
            .style('color', '#e2e8f0')
            .style('padding', '15px')
            .style('margin', '0')
            .style('overflow-x', 'auto')
            .style('font-family', 'Consolas, Monaco, monospace')
            .style('font-size', '0.8rem')
            .style('line-height', '1.4');
            
        sshBlock.append('code')
            .text(this.getSSHConfig(component));
    }
    
    addSecurityInformation(container, component) {
        const securitySection = container.append('div');
            
        securitySection.append('h3')
            .style('margin-bottom', '15px')
            .style('font-size', '1.1rem')
            .style('font-weight', '600')
            .style('color', '#2c3e50')
            .text('Security Configuration');
            
        const sg = infrastructureData.securityGroups.find(s => 
            s.instances.includes(component.id)
        );
        
        if (sg) {
            const sgInfo = securitySection.append('div')
                .style('background', '#f8f9fa')
                .style('border', '1px solid #e9ecef')
                .style('border-radius', '6px')
                .style('padding', '15px');
                
            sgInfo.append('h4')
                .style('margin-bottom', '10px')
                .style('color', sg.color)
                .style('font-size', '0.9rem')
                .style('font-weight', '600')
                .text(sg.name);
                
            // Inbound rules
            sgInfo.append('div')
                .style('margin-bottom', '10px')
                .style('font-size', '0.8rem')
                .style('font-weight', '600')
                .style('color', '#555')
                .text('Inbound Rules:');
                
            sg.inbound.forEach(rule => {
                const ruleDiv = sgInfo.append('div')
                    .style('margin-left', '10px')
                    .style('margin-bottom', '5px')
                    .style('font-size', '0.75rem')
                    .style('color', '#666');
                    
                ruleDiv.append('span')
                    .style('font-family', 'Consolas, monospace')
                    .style('background', '#e9ecef')
                    .style('padding', '2px 6px')
                    .style('border-radius', '3px')
                    .style('margin-right', '8px')
                    .text(`${rule.type}:${rule.port}`);
                    
                ruleDiv.append('span')
                    .text(`from ${rule.source}`);
            });
        }
    }
    
    getConfigurationTitle(component) {
        if (component.id === 'orchestrator') return 'API Orchestrator Configuration';
        if (component.type === 'ml-expert') return `${component.name} Model Configuration`;
        if (component.type === 'non-ml-expert') return `${component.name} Service Configuration`;
        return 'Configuration';
    }
    
    getCodeSnippet(component) {
        if (component.id === 'webapp') {
            return `# Web Application Configuration
FLASK_APP = 'frizzles_app.py'
FLASK_ENV = 'production'
HOST = '0.0.0.0'
PORT = 8080

# API Configuration
ORCHESTRATOR_URL = 'http://172.31.48.224:8000'
API_TIMEOUT = 45  # seconds
MAX_RETRIES = 3

# Security Configuration
CORS_ORIGINS = ['*']  # Public internet access
SSL_CERT_PATH = '/etc/ssl/certs/frizzles.crt'
SSL_KEY_PATH = '/etc/ssl/private/frizzles.key'

@app.route('/api/evaluate', methods=['POST'])
def evaluate_prompt():
    prompt = request.json.get('prompt')
    
    try:
        response = requests.post(
            f'{ORCHESTRATOR_URL}/evaluate',
            json={'prompt': prompt},
            timeout=API_TIMEOUT
        )
        return jsonify(response.json())
    except requests.RequestException as e:
        return jsonify({'error': str(e)}), 500`;
        }
        
        if (component.id === 'orchestrator') {
            return `# Central Orchestrator Configuration
EXPERT_TIMEOUT = 30  # seconds per expert
CONCURRENT_REQUESTS = True

EXPERTS = {
    'clarity': '172.31.48.199:8003',
    'grammar': '172.31.48.99:8004', 
    'documentation': '172.31.48.22:8005',
    'structure': '172.31.48.104:8006',
    'granularity': '172.31.48.12:8007',
    'tooling': '172.31.48.208:8008',
    'repetition': '172.31.24.150:8009'
}

async def evaluate_prompt(prompt):
    tasks = [call_expert(name, config, prompt) 
             for name, config in EXPERTS.items()]
    results = await asyncio.gather(*tasks, 
                                   return_exceptions=True)
    return aggregate_results(results)`;
        }
        
        if (component.type === 'ml-expert') {
            return `# ${component.name} DistilBERT Configuration
MODEL_PATH = '/opt/models/${component.id}-distilbert'
TOKENIZER = 'distilbert-base-uncased'
MAX_LENGTH = 512
BATCH_SIZE = 8
DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'

# Fine-tuning dataset: ${component.dataset}
TRAINING_EPOCHS = 3
LEARNING_RATE = 5e-5
WARMUP_STEPS = 500

# API endpoint configuration
PORT = ${component.port}
HOST = '0.0.0.0'

# Model inference
def evaluate(prompt):
    inputs = tokenizer(prompt, return_tensors='pt',
                      truncation=True, padding=True, 
                      max_length=MAX_LENGTH)
    with torch.no_grad():
        outputs = model(**inputs)
        probabilities = torch.softmax(outputs.logits, dim=-1)
        return probabilities[0][1].item()  # Clarity score`;
        }
        
        if (component.id === 'tooling') {
            return `# Tooling Expert - Keyword Detection
AI_TOOLS = {
    'models': ['gpt', 'claude', 'gemini', 'llama', 'bert'],
    'frameworks': ['tensorflow', 'pytorch', 'huggingface'],
    'platforms': ['colab', 'jupyter', 'wandb', 'mlflow'],
    'apis': ['openai api', 'anthropic api', 'google ai']
}

def evaluate(prompt):
    found_tools = []
    prompt_lower = prompt.lower()
    
    for category, tools in AI_TOOLS.items():
        for tool in tools:
            if re.search(r'\\b' + re.escape(tool) + r'\\b', 
                        prompt_lower):
                found_tools.append(tool)
    
    # Score based on tool diversity
    unique_tools = len(set(found_tools))
    if unique_tools == 0: return 0.0
    elif unique_tools <= 2: return 0.3
    elif unique_tools <= 5: return 0.7
    else: return 1.0`;
        }
        
        if (component.id === 'repetition') {
            return `# Repetition Expert - DynamoDB Lookup
import boto3
import hashlib

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('prompt-history')

def evaluate(prompt):
    # Hash prompt for deduplication
    prompt_hash = hashlib.sha256(
        prompt.strip().lower().encode()
    ).hexdigest()
    
    try:
        # Check for existing prompt
        response = table.get_item(Key={'prompt_hash': prompt_hash})
        
        if 'Item' in response:
            # Exact match found - high repetition penalty
            return {
                'score': 0.0,
                'confidence': 1.0,
                'details': {
                    'repetition_type': 'exact_match',
                    'first_seen': response['Item']['timestamp'],
                    'count': response['Item']['count']
                }
            }
        else:
            # Store new prompt
            table.put_item(Item={
                'prompt_hash': prompt_hash,
                'original_prompt': prompt,
                'timestamp': int(time.time()),
                'count': 1
            })
            return {'score': 1.0, 'confidence': 1.0}
    except Exception as e:
        return {'score': 0.5, 'error': str(e)}`;
        }
        
        return '# Configuration details not available for this component';
    }
    
    getSSHConfig(component) {
        const hostName = component.id === 'webapp' ? 'frizzles-webapp' :
                        component.id === 'orchestrator' ? 'orchestrator' : 
                        component.id === 'clarity' ? 'clarity-expert' :
                        component.id === 'grammar' ? 'grammar-expert' :
                        component.id === 'documentation' ? 'documentation-expert' :
                        component.id === 'structure' ? 'structure-expert' :
                        component.id === 'granularity' ? 'granularity-expert' :
                        component.id === 'tooling' ? 'tooling-expert' :
                        component.id === 'repetition' ? 'repetition-expert' :
                        component.id;
        
        return `# SSH configuration for ${component.name}
Host ${hostName}
    HostName ${component.privateIp}
    User ubuntu
    IdentityFile C:/Users/Richa/.ssh/${component.keyFile}
    ProxyJump frizzlesrubric-bastion
    ForwardAgent yes
    ServerAliveInterval 60

# Usage:
# ssh ${hostName}

# Direct command execution:
# ssh ${hostName} "sudo systemctl status ${component.id}-service"`;
    }
}

// Initialize the detail panel when the page loads
document.addEventListener('DOMContentLoaded', function() {
    window.componentDetailPanel = new ComponentDetailPanel();
});