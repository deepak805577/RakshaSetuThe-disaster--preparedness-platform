# Deployment Guide - Disaster Preparedness Education System

This guide provides comprehensive instructions for deploying the Disaster Preparedness Education System for Punjab Schools in various environments.

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Environment Setup](#environment-setup)
3. [Development Deployment](#development-deployment)
4. [Production Deployment](#production-deployment)
5. [Cloud Deployment](#cloud-deployment)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Security Considerations](#security-considerations)
8. [Troubleshooting](#troubleshooting)

## System Requirements

### Minimum Hardware Requirements
- **CPU**: 4 cores (8 recommended)
- **RAM**: 8GB (16GB recommended for production)
- **Storage**: 50GB SSD (100GB+ recommended for production)
- **Network**: Stable internet connection (minimum 10 Mbps)

### Software Requirements
- **Operating System**: Ubuntu 20.04 LTS or later / CentOS 8+ / macOS / Windows 10+
- **Docker**: Version 20.10 or later
- **Docker Compose**: Version 2.0 or later
- **Node.js**: Version 18 LTS (if running without Docker)
- **Python**: Version 3.9+ (for AI services)
- **Git**: Latest version

### Browser Compatibility
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- PWA support required for offline functionality

## Environment Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd sih-disaster-app
```

### 2. Environment Variables
Create environment files for different stages:

```bash
# Development environment
cp .env.example .env.development

# Staging environment
cp .env.example .env.staging

# Production environment
cp .env.example .env.production
```

### 3. Configure Environment Variables

#### Backend Environment Variables (.env)
```bash
# Server Configuration
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://yourdomain.com

# Database Configuration
MONGODB_URI=mongodb://username:password@mongodb:27017/disaster_preparedness?authSource=admin
REDIS_URL=redis://:password@redis:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRE=7d

# External Services
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# API Keys for Weather & Disaster Data
IMD_API_KEY=your-imd-api-key
NDMA_API_KEY=your-ndma-api-key
WEATHER_API_KEY=your-weather-api-key

# File Upload Settings
UPLOAD_MAX_SIZE=10mb
API_RATE_LIMIT=100

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret-key
```

#### Frontend Environment Variables
```bash
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_SOCKET_URL=https://api.yourdomain.com
REACT_APP_APP_NAME=Disaster Preparedness App
REACT_APP_VERSION=1.0.0
GENERATE_SOURCEMAP=false
```

## Development Deployment

### Using Docker Compose (Recommended)

1. **Start all services:**
```bash
docker-compose -f docker-compose.yml up -d
```

2. **View logs:**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f ai-service
```

3. **Stop services:**
```bash
docker-compose down
```

### Manual Setup (Without Docker)

1. **Install dependencies:**
```bash
# Backend
cd backend && npm install
cd ../frontend && npm install
cd ../ai-service && pip install -r requirements.txt
```

2. **Start MongoDB and Redis:**
```bash
# Using system services
sudo systemctl start mongod
sudo systemctl start redis

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0
docker run -d -p 6379:6379 --name redis redis:7.2-alpine
```

3. **Start services:**
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm start

# Terminal 3 - AI Service
cd ai-service && python app.py
```

## Production Deployment

### 1. Server Preparation

#### Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip
```

#### Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### Configure Firewall
```bash
# UFW configuration
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Or iptables
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
```

### 2. SSL Certificate Setup

#### Using Let's Encrypt (Recommended)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Test renewal
sudo certbot renew --dry-run
```

#### Manual Certificate
Place your certificates in `./nginx/ssl/`:
```
./nginx/ssl/
├── cert.pem
├── privkey.pem
└── fullchain.pem
```

### 3. Production Deployment

#### Environment Configuration
```bash
# Set production environment
export NODE_ENV=production
export COMPOSE_FILE=docker-compose.yml:docker-compose.prod.yml
```

#### Build and Deploy
```bash
# Build production images
docker-compose build --no-cache

# Start production services
docker-compose up -d

# Initialize database
docker-compose exec backend npm run seed:production
```

#### Verify Deployment
```bash
# Check service status
docker-compose ps

# Check logs
docker-compose logs -f

# Test endpoints
curl -f https://yourdomain.com/api/health
curl -f https://yourdomain.com
```

## Cloud Deployment

### AWS Deployment

#### EC2 Setup
1. Launch EC2 instance (t3.large or larger)
2. Configure security groups (ports 22, 80, 443)
3. Attach Elastic IP
4. Connect via SSH

#### RDS Database Setup
```bash
# Create MongoDB Atlas cluster or use AWS DocumentDB
# Update MONGODB_URI in environment variables
```

#### S3 for File Storage
```bash
# Create S3 bucket for file uploads
# Configure IAM roles and policies
# Update backend to use S3 for file storage
```

#### CloudFront CDN
```bash
# Create CloudFront distribution
# Point to S3 bucket for static assets
# Update frontend build to use CDN URLs
```

### Google Cloud Deployment

#### GKE Kubernetes Setup
```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: disaster-prep-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: disaster-prep
  template:
    metadata:
      labels:
        app: disaster-prep
    spec:
      containers:
      - name: backend
        image: your-registry/disaster-prep-backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: NODE_ENV
          value: "production"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: mongodb-uri
```

### Digital Ocean Deployment

#### App Platform Setup
```yaml
# .do/app.yaml
name: disaster-prep-app
services:
- name: backend
  source_dir: /backend
  github:
    repo: your-username/disaster-prep-app
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 2
  instance_size_slug: basic-xxs
  
- name: frontend
  source_dir: /frontend
  github:
    repo: your-username/disaster-prep-app
    branch: main
  run_command: npm run build
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs

databases:
- name: mongodb
  engine: MONGODB
  version: "5"
  size: basic-xs
  
- name: redis
  engine: REDIS
  version: "7"
  size: basic-xs
```

## Monitoring & Maintenance

### 1. Health Monitoring

#### Setup Monitoring Stack
```bash
# Start monitoring services
docker-compose --profile monitoring up -d

# Access dashboards
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3001 (admin/admin123)
```

#### Key Metrics to Monitor
- **System Metrics**: CPU, Memory, Disk usage
- **Application Metrics**: Response times, Error rates
- **Database Metrics**: Connection pool, Query performance
- **User Metrics**: Active users, Feature usage

### 2. Backup Strategy

#### Database Backup
```bash
# MongoDB backup
docker-compose exec mongodb mongodump --out /backup/$(date +%Y%m%d)

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec mongodb mongodump --out /backup/$DATE
tar -czf /backup/mongo_backup_$DATE.tar.gz /backup/$DATE
aws s3 cp /backup/mongo_backup_$DATE.tar.gz s3://your-backup-bucket/
```

#### File Backup
```bash
# Backup uploaded files
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz ./uploads
aws s3 cp uploads_backup_$(date +%Y%m%d).tar.gz s3://your-backup-bucket/
```

### 3. Log Management

#### Centralized Logging
```bash
# Using ELK Stack
docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -e "discovery.type=single-node" \
  elasticsearch:7.15.0

docker run -d \
  --name kibana \
  -p 5601:5601 \
  --link elasticsearch:elasticsearch \
  kibana:7.15.0
```

#### Log Rotation
```bash
# Configure logrotate
sudo nano /etc/logrotate.d/disaster-prep

/var/log/disaster-prep/*.log {
    daily
    missingok
    rotate 30
    compress
    notifempty
    create 0644 www-data www-data
}
```

### 4. Performance Optimization

#### Database Optimization
```bash
# MongoDB indexes
db.users.createIndex({ email: 1 })
db.users.createIndex({ school: 1, role: 1 })
db.userprogresses.createIndex({ user: 1, module: 1 })
db.drillsessions.createIndex({ user: 1, createdAt: -1 })
```

#### Redis Caching
```bash
# Cache frequently accessed data
# User sessions, API responses, static content
```

#### CDN Configuration
```nginx
# nginx configuration for static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Vary Accept-Encoding;
    gzip_static on;
}
```

## Security Considerations

### 1. Network Security

#### Firewall Configuration
```bash
# Allow only necessary ports
sudo ufw deny incoming
sudo ufw allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

#### SSL/TLS Configuration
```nginx
# nginx SSL configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
ssl_prefer_server_ciphers off;
add_header Strict-Transport-Security "max-age=63072000" always;
```

### 2. Application Security

#### Environment Variables Security
```bash
# Never commit .env files
# Use secrets management in production
# Rotate secrets regularly
```

#### Database Security
```bash
# Enable MongoDB authentication
# Use connection encryption
# Regular security updates
```

#### Input Validation
- Server-side validation on all inputs
- SQL injection prevention
- XSS protection
- CSRF tokens

### 3. Container Security

#### Docker Security
```dockerfile
# Use non-root users
USER nodejs

# Scan images for vulnerabilities
docker scan your-image:latest

# Use minimal base images
FROM node:18-alpine
```

## Troubleshooting

### Common Issues

#### 1. Connection Refused Errors
```bash
# Check service status
docker-compose ps
docker-compose logs service-name

# Check port availability
netstat -tlnp | grep :5000
```

#### 2. Database Connection Issues
```bash
# Check MongoDB status
docker-compose exec mongodb mongo --eval "db.adminCommand('ismaster')"

# Check connection string
docker-compose logs backend | grep -i mongo
```

#### 3. Memory Issues
```bash
# Monitor memory usage
docker stats

# Increase Docker memory limits
# Update docker-compose.yml with resource limits
```

#### 4. SSL Certificate Issues
```bash
# Test SSL configuration
openssl s_client -connect yourdomain.com:443

# Renew Let's Encrypt certificates
sudo certbot renew
```

### Performance Issues

#### 1. Slow API Responses
```bash
# Check database performance
# Review MongoDB slow query log
# Optimize database indexes
# Implement caching strategy
```

#### 2. High Memory Usage
```bash
# Profile Node.js applications
npm install -g clinic
clinic doctor -- node server.js

# Monitor container resource usage
docker stats
```

### Debugging Tools

#### Application Logs
```bash
# View real-time logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Search logs
docker-compose logs backend | grep -i error
```

#### Health Checks
```bash
# API health check
curl -f http://localhost:5000/api/health

# Database health check
docker-compose exec mongodb mongo --eval "db.stats()"

# Redis health check
docker-compose exec redis redis-cli ping
```

## Support and Maintenance

### Regular Maintenance Tasks

#### Weekly
- Check system logs for errors
- Monitor disk usage
- Review security logs
- Test backup restoration

#### Monthly
- Update system packages
- Review and rotate secrets
- Performance monitoring review
- Security vulnerability scans

#### Quarterly
- Full system backup verification
- Disaster recovery testing
- Security audit
- Performance optimization review

### Getting Help

- **Documentation**: Check this guide and API documentation
- **Logs**: Always check application logs first
- **Community**: GitHub issues and discussions
- **Support**: Contact the development team

For additional support, please refer to the project's GitHub repository or contact the development team.

---

**Last Updated**: December 2024
**Version**: 2.1.0
**Maintainer**: Disaster Preparedness Education Team
