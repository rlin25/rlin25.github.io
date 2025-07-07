// Infrastructure data based on actual FrizzlesRubric deployment
const infrastructureData = {
  vpc: { 
    cidr: "172.31.0.0/16", 
    id: "vpc-frizzlesrubric",
    subnets: [
      { 
        id: "subnet-public", 
        cidr: "172.31.48.0/20", 
        type: "public",
        name: "Public Subnet"
      },
      { 
        id: "subnet-private-1", 
        cidr: "172.31.48.0/20", 
        type: "private",
        name: "Private Subnet (Main)"
      },
      { 
        id: "subnet-private-2", 
        cidr: "172.31.24.0/20", 
        type: "private",
        name: "Private Subnet (AZ-B)"
      }
    ]
  },
  instances: [
    { 
      id: "bastion", 
      name: "Bastion Host",
      type: "bastion", 
      subnet: "public", 
      color: "#f57c00",
      publicIp: "18.220.216.176",
      privateIp: "172.31.48.xxx",
      securityGroup: "sg-bastion-public",
      keyFile: "frizzlesrubric-key-7.pem",
      ports: [22, 80, 443],
      instanceType: "t2.micro"
    },
    { 
      id: "webapp", 
      name: "Web Application",
      type: "webapp", 
      subnet: "public", 
      color: "#2196f3",
      publicIp: "18.189.35.55",
      privateIp: "172.31.24.xxx",
      securityGroup: "sg-webapp-public",
      keyFile: "frizzlesrubric-key-10.pem",
      ports: [22, 80, 443, 8080],
      instanceType: "t3.medium"
    },
    { 
      id: "orchestrator", 
      name: "Central Orchestrator",
      type: "orchestrator", 
      subnet: "private", 
      color: "#7b1fa2",
      privateIp: "172.31.48.224",
      securityGroup: "sg-private",
      keyFile: "frizzlesrubric-key-8.pem",
      instanceType: "t3.medium"
    },
    { 
      id: "clarity", 
      name: "Clarity Expert",
      type: "ml-expert", 
      subnet: "private", 
      port: 8003, 
      color: "#81c784",
      privateIp: "172.31.48.199",
      securityGroup: "sg-private",
      keyFile: "frizzlesrubric-key-1.pem",
      model: "Fine-tuned DistilBERT",
      dataset: "Custom clarity + Gemini 2.5",
      instanceType: "g4dn.xlarge"
    },
    { 
      id: "grammar", 
      name: "Grammar Expert",
      type: "ml-expert", 
      subnet: "private", 
      port: 8004, 
      color: "#66bb6a",
      privateIp: "172.31.48.99",
      securityGroup: "sg-private",
      keyFile: "frizzlesrubric-key-2.pem",
      model: "Fine-tuned DistilBERT",
      dataset: "Jfleg grammar dataset",
      instanceType: "g4dn.xlarge"
    },
    { 
      id: "documentation", 
      name: "Documentation Expert",
      type: "ml-expert", 
      subnet: "private", 
      port: 8005, 
      color: "#4caf50",
      privateIp: "172.31.48.22",
      securityGroup: "sg-private",
      keyFile: "frizzlesrubric-key-3.pem",
      model: "Fine-tuned DistilBERT",
      dataset: "Custom documentation + Gemini 2.5",
      instanceType: "g4dn.xlarge"
    },
    { 
      id: "structure", 
      name: "Structure Expert",
      type: "ml-expert", 
      subnet: "private", 
      port: 8006, 
      color: "#43a047",
      privateIp: "172.31.48.104",
      securityGroup: "sg-private",
      keyFile: "frizzlesrubric-key-4.pem",
      model: "Fine-tuned DistilBERT",
      dataset: "Custom structure + Gemini 2.5",
      instanceType: "g4dn.xlarge"
    },
    { 
      id: "granularity", 
      name: "Granularity Expert",
      type: "ml-expert", 
      subnet: "private", 
      port: 8007, 
      color: "#388e3c",
      privateIp: "172.31.48.12",
      securityGroup: "sg-private",
      keyFile: "frizzlesrubric-key-5.pem",
      model: "Fine-tuned DistilBERT",
      dataset: "Custom granularity + Gemini 2.5",
      instanceType: "g4dn.xlarge"
    },
    { 
      id: "tooling", 
      name: "Tooling Expert",
      type: "non-ml-expert", 
      subnet: "private", 
      port: 8008, 
      color: "#1976d2",
      privateIp: "172.31.48.208",
      securityGroup: "sg-private",
      keyFile: "frizzlesrubric-key-6.pem",
      implementation: "Python regex keyword matching",
      dataSource: "Predefined AI tools list",
      instanceType: "t3.medium"
    },
    { 
      id: "repetition", 
      name: "Repetition Expert",
      type: "non-ml-expert", 
      subnet: "private-2",
      port: 8009, 
      color: "#00796b",
      privateIp: "172.31.24.150",
      securityGroup: "sg-private",
      keyFile: "frizzlesrubric-key-9.pem",
      implementation: "DynamoDB lookup with boto3",
      dataSource: "Historical prompts database",
      instanceType: "t3.medium"
    }
  ],
  connections: [
    { id: "orch-clarity", source: "orchestrator", target: "clarity", type: "api", port: 8003 },
    { id: "orch-grammar", source: "orchestrator", target: "grammar", type: "api", port: 8004 },
    { id: "orch-documentation", source: "orchestrator", target: "documentation", type: "api", port: 8005 },
    { id: "orch-structure", source: "orchestrator", target: "structure", type: "api", port: 8006 },
    { id: "orch-granularity", source: "orchestrator", target: "granularity", type: "api", port: 8007 },
    { id: "orch-tooling", source: "orchestrator", target: "tooling", type: "api", port: 8008 },
    { id: "orch-repetition", source: "orchestrator", target: "repetition", type: "api", port: 8009 },
    { id: "webapp-orchestrator", source: "webapp", target: "orchestrator", type: "api", port: 8000 },
    { id: "bastion-webapp", source: "bastion", target: "webapp", type: "ssh", port: 22 },
    { id: "bastion-orchestrator", source: "bastion", target: "orchestrator", type: "ssh", port: 22 },
    { id: "bastion-clarity", source: "bastion", target: "clarity", type: "ssh", port: 22 },
    { id: "bastion-grammar", source: "bastion", target: "grammar", type: "ssh", port: 22 },
    { id: "bastion-documentation", source: "bastion", target: "documentation", type: "ssh", port: 22 },
    { id: "bastion-structure", source: "bastion", target: "structure", type: "ssh", port: 22 },
    { id: "bastion-granularity", source: "bastion", target: "granularity", type: "ssh", port: 22 },
    { id: "bastion-tooling", source: "bastion", target: "tooling", type: "ssh", port: 22 },
    { id: "bastion-repetition", source: "bastion", target: "repetition", type: "ssh", port: 22 }
  ],
  securityGroups: [
    {
      id: "sg-bastion-public",
      name: "Bastion Public Security Group",
      color: "#f57c00",
      instances: ["bastion"],
      inbound: [
        { type: "SSH", port: 22, source: "Custom IP set", description: "SSH access from developer IPs" },
        { type: "HTTP", port: 80, source: "0.0.0.0/0", description: "HTTP traffic" },
        { type: "HTTPS", port: 443, source: "0.0.0.0/0", description: "HTTPS traffic" }
      ],
      outbound: [
        { type: "All Traffic", destination: "172.31.0.0/16", description: "VPC internal communication" },
        { type: "SSH", port: 22, destination: "sg-private", description: "SSH to private instances" },
        { type: "SSH", port: 22, destination: "sg-webapp-public", description: "SSH to webapp" }
      ]
    },
    {
      id: "sg-webapp-public",
      name: "Webapp Public Security Group",
      color: "#2196f3",
      instances: ["webapp"],
      inbound: [
        { type: "SSH", port: 22, source: "sg-bastion-public", description: "SSH from bastion host" },
        { type: "HTTP", port: 80, source: "0.0.0.0/0", description: "HTTP traffic from internet" },
        { type: "HTTPS", port: 443, source: "0.0.0.0/0", description: "HTTPS traffic from internet" },
        { type: "Custom TCP", port: 8080, source: "0.0.0.0/0", description: "Web application port from internet" }
      ],
      outbound: [
        { type: "All Traffic", destination: "0.0.0.0/0", description: "Internet access" },
        { type: "Custom TCP", port: 8000, destination: "172.31.48.224/32", description: "API calls to orchestrator" }
      ]
    },
    {
      id: "sg-private", 
      name: "Private Instances Security Group",
      color: "#4caf50",
      instances: ["orchestrator", "clarity", "grammar", "documentation", "structure", "granularity", "tooling", "repetition"],
      inbound: [
        { type: "SSH", port: 22, source: "sg-bastion-public", description: "SSH from bastion host" },
        { type: "Custom TCP", port: "8003-8009", source: "172.31.48.224/32", description: "API access from orchestrator" },
        { type: "Custom TCP", port: 8000, source: "sg-webapp-public", description: "API access from webapp" }
      ],
      outbound: [
        { type: "All Traffic", destination: "0.0.0.0/0", description: "Internet access for updates" }
      ]
    }
  ],
  keyManagement: {
    strategy: "Individual key pairs per instance",
    location: "C:/Users/Richa/.ssh/",
    naming: "frizzlesrubric-key-[instance-number].pem",
    totalKeys: 9
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = infrastructureData;
}