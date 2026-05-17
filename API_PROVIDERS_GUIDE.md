# RedLinux API Providers Integration Guide

## Executive Summary

RedLinux integrates with three primary intelligence providers to enable autonomous reconnaissance, vulnerability discovery, and threat intelligence. This guide explains each provider's capabilities, benefits, and integration requirements.

---

## 1. SHODAN - Global Device Intelligence

### Overview

SHODAN is the world's first search engine for internet-connected devices. It continuously scans the internet and indexes billions of devices, services, and vulnerabilities.

### Key Capabilities

| Capability                | Description                          | Use Case                        |
| ------------------------- | ------------------------------------ | ------------------------------- |
| **Device Discovery**      | Find exposed devices globally        | Identify target infrastructure  |
| **Service Enumeration**   | Detect running services and versions | Map attack surface              |
| **Vulnerability Mapping** | Identify known CVEs on devices       | Prioritize exploitation targets |
| **Geolocation**           | Pinpoint device locations            | Geographic targeting            |
| **Historical Data**       | Track changes over time              | Trend analysis                  |
| **Autonomous Scanning**   | Continuous monitoring                | Real-time threat detection      |

### Benefits for Red Team Operations

1. **Reconnaissance Acceleration**
   - Eliminate manual reconnaissance
   - Discover hidden infrastructure
   - Identify shadow IT and rogue devices
   - Map entire attack surface in minutes

2. **Vulnerability Prioritization**
   - Automatically identify exploitable systems
   - Filter by severity and exploitability
   - Reduce time-to-exploitation
   - Maximize impact per operation

3. **Intelligence Synthesis**
   - Correlate multiple data points
   - Identify patterns and relationships
   - Generate actionable intelligence
   - Support strategic planning

4. **Operational Efficiency**
   - Reduce manual effort by 80%+
   - Enable autonomous operations
   - Scale reconnaissance across multiple targets
   - Integrate with other tools

### Integration with RedLinux

```javascript
// SHODAN queries are automatically executed during engagement
// Results are stored and analyzed by AI strategist

// Example: Automatic reconnaissance
const autoRecon = async (target) => {
  const results = await shodan.search(`org:"${target}"`);
  // Returns: devices, services, vulnerabilities, locations
  return analyzeWithAI(results);
};

// Example: Vulnerability-focused search
const findVulnerabilities = async (target) => {
  const results = await shodan.search(`org:"${target}" vuln:CVE`);
  // Prioritizes exploitable systems
  return rankByExploitability(results);
};
```

### Pricing & Quotas

| Tier       | Cost    | Queries/Month | Features              |
| ---------- | ------- | ------------- | --------------------- |
| Free       | $0      | 1             | Basic search          |
| Lite       | $49/mo  | 10,000        | Advanced filters      |
| Standard   | $199/mo | 100,000       | Historical data       |
| Enterprise | Custom  | Unlimited     | API priority, support |

**Recommendation**: Start with Lite tier for active operations

### Getting Started

1. **Create Account**: https://account.shodan.io/
2. **Verify Email**: Check confirmation email
3. **Generate API Key**: Account Settings → API Key
4. **Test Query**:
   ```bash
   curl "https://api.shodan.io/shodan/host/8.8.8.8?key=YOUR_API_KEY"
   ```
5. **Integrate into RedLinux**: Paste API key in SetupWizard

---

## 2. Censys - Attack Surface Intelligence

### Overview

Censys provides comprehensive data on internet-connected systems through continuous scanning of the entire IPv4 address space. It specializes in certificate data, service discovery, and attack surface mapping.

### Key Capabilities

| Capability                | Description                    | Use Case                  |
| ------------------------- | ------------------------------ | ------------------------- |
| **Certificate Analysis**  | Query SSL/TLS certificate data | Identify infrastructure   |
| **Service Discovery**     | Find services across IP ranges | Map network topology      |
| **Subdomain Enumeration** | Discover subdomains from certs | Expand attack surface     |
| **Historical Tracking**   | Monitor changes over time      | Detect new infrastructure |
| **Autonomous Scanning**   | Continuous internet scanning   | Real-time discovery       |
| **Bulk Queries**          | Search entire datasets         | Large-scale operations    |

### Benefits for Red Team Operations

1. **Infrastructure Discovery**
   - Identify all company domains and subdomains
   - Discover internal infrastructure exposed externally
   - Find development and staging environments
   - Locate backup and disaster recovery systems

2. **Certificate Intelligence**
   - Extract email addresses from certificates
   - Identify organizational structure
   - Find related companies and subsidiaries
   - Discover certificate authorities and patterns

3. **Attack Surface Expansion**
   - Identify secondary and tertiary targets
   - Discover supply chain relationships
   - Find business partner infrastructure
   - Locate cloud resources and CDNs

4. **Autonomous Threat Hunting**
   - Continuous monitoring of target infrastructure
   - Automatic detection of new services
   - Alert on certificate changes
   - Real-time threat intelligence

### Integration with RedLinux

```javascript
// Censys integration for attack surface mapping
const mapAttackSurface = async (domain) => {
  const certs = await censys.certificates.search(`parsed.names: ${domain}`);
  // Returns: subdomains, infrastructure, organizational structure
  return expandAttackSurface(certs);
};

// Example: Subdomain discovery
const discoverSubdomains = async (domain) => {
  const results = await censys.certificates.search(`parsed.names: *.${domain}`);
  // Extracts all subdomains from certificate data
  return extractSubdomains(results);
};

// Example: Infrastructure mapping
const mapInfrastructure = async (domain) => {
  const ips = await censys.ipv4.search(
    `location.country: US AND services.service_name: http`,
  );
  // Maps IP addresses to infrastructure
  return correlateWithDomain(ips, domain);
};
```

### Pricing & Quotas

| Tier         | Cost    | Queries/Day | Features          |
| ------------ | ------- | ----------- | ----------------- |
| Free         | $0      | 120         | Basic search      |
| Academic     | $0      | 1,000       | For researchers   |
| Professional | $500/mo | 50,000      | Advanced features |
| Enterprise   | Custom  | Unlimited   | Priority support  |

**Recommendation**: Professional tier for production red team operations

### Getting Started

1. **Create Account**: https://search.censys.io/account/api
2. **Generate Credentials**: API → Generate API ID and Secret
3. **Test Query**:
   ```bash
   curl -u "YOUR_API_ID:YOUR_API_SECRET" \
     "https://censys.io/api/v1/search/certificates" \
     -d '{"query":"parsed.names: example.com"}'
   ```
4. **Integrate into RedLinux**: Paste both API ID and Secret in SetupWizard

---

## 3. GreyNoise - Threat Intelligence & Noise Filtering

### Overview

GreyNoise provides internet background noise filtering and threat intelligence. It distinguishes between legitimate security researchers, automated scanners, and actual malicious activity.

### Key Capabilities

| Capability                  | Description                       | Use Case                |
| --------------------------- | --------------------------------- | ----------------------- |
| **Noise Filtering**         | Identify benign internet scanners | Reduce false positives  |
| **Threat Classification**   | Categorize malicious vs benign    | Prioritize real threats |
| **Autonomous Scanning**     | Continuous threat monitoring      | Real-time detection     |
| **Intelligence Enrichment** | Add context to IP addresses       | Enhance threat analysis |
| **Community Data**          | Crowdsourced threat intel         | Collaborative defense   |
| **Riot Dataset**            | Identify known good IPs           | Whitelist management    |

### Benefits for Red Team Operations

1. **Operational Stealth**
   - Identify detection systems
   - Avoid triggering security alerts
   - Blend with background noise
   - Evade automated defenses

2. **Intelligence Enrichment**
   - Understand target's threat landscape
   - Identify competing threat actors
   - Assess defensive capabilities
   - Plan evasion strategies

3. **False Positive Reduction**
   - Filter out security researchers
   - Ignore automated scanners
   - Focus on real threats
   - Improve analysis accuracy

4. **Threat Correlation**
   - Link related malicious activity
   - Identify threat actor patterns
   - Track infrastructure reuse
   - Support attribution analysis

### Integration with RedLinux

```javascript
// GreyNoise integration for threat intelligence
const enrichThreatIntel = async (ipAddress) => {
  const classification = await greynoise.query(ipAddress);
  // Returns: threat level, classification, context
  return analyzeWithContext(classification);
};

// Example: Identify detection systems
const findDetectionSystems = async (targetRange) => {
  const results = await greynoise.bulkQuery(targetRange);
  // Identifies honeypots, EDR systems, security appliances
  return filterDetectionSystems(results);
};

// Example: Assess defensive capabilities
const assessDefenses = async (target) => {
  const intel = await greynoise.getIntel(target);
  // Analyzes threat activity against target
  return evaluateDefensivePosture(intel);
};
```

### Pricing & Quotas

| Tier       | Cost   | Queries/Day | Features           |
| ---------- | ------ | ----------- | ------------------ |
| Community  | Free   | 500         | Basic threat intel |
| Enterprise | Custom | Unlimited   | Advanced analytics |
| Managed    | Custom | Unlimited   | Dedicated support  |

**Recommendation**: Enterprise tier for continuous operations

### Getting Started

1. **Create Account**: https://viz.greynoise.io/settings/api
2. **Generate API Key**: Settings → API → Generate Key
3. **Test Query**:
   ```bash
   curl -H "key: YOUR_API_KEY" \
     "https://api.greynoise.io/v3/query/ip?ip=1.1.1.1"
   ```
4. **Integrate into RedLinux**: Paste API key in SetupWizard

---

## Comparative Analysis

### Feature Comparison

| Feature             | SHODAN     | Censys     | GreyNoise  |
| ------------------- | ---------- | ---------- | ---------- |
| Device Discovery    | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   | ⭐⭐⭐     |
| Service Enumeration | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   | ⭐⭐⭐     |
| Vulnerability Data  | ⭐⭐⭐⭐⭐ | ⭐⭐⭐     | ⭐⭐       |
| Certificate Data    | ⭐⭐⭐     | ⭐⭐⭐⭐⭐ | ⭐         |
| Threat Intelligence | ⭐⭐⭐     | ⭐⭐       | ⭐⭐⭐⭐⭐ |
| Historical Data     | ⭐⭐⭐⭐   | ⭐⭐⭐⭐   | ⭐⭐⭐     |
| Real-time Updates   | ⭐⭐⭐⭐   | ⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐ |
| API Reliability     | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   | ⭐⭐⭐⭐   |

### Use Case Matrix

| Scenario                | Primary   | Secondary | Tertiary  |
| ----------------------- | --------- | --------- | --------- |
| Initial Reconnaissance  | SHODAN    | Censys    | GreyNoise |
| Infrastructure Mapping  | Censys    | SHODAN    | GreyNoise |
| Vulnerability Discovery | SHODAN    | Censys    | -         |
| Threat Assessment       | GreyNoise | SHODAN    | Censys    |
| Evasion Planning        | GreyNoise | SHODAN    | Censys    |
| Large-scale Scanning    | Censys    | SHODAN    | GreyNoise |

---

## Integration Best Practices

### 1. Quota Management

```javascript
// Implement request queuing to respect rate limits
const requestQueue = [];
const processQueue = async () => {
  while (requestQueue.length > 0) {
    const request = requestQueue.shift();
    await executeRequest(request);
    await sleep(1000); // Rate limiting
  }
};
```

### 2. Caching Strategy

```javascript
// Cache results to minimize API calls
const cache = new Map();
const getCachedResult = async (query, provider) => {
  const key = `${provider}:${query}`;
  if (cache.has(key)) return cache.get(key);

  const result = await provider.query(query);
  cache.set(key, result);
  return result;
};
```

### 3. Error Handling

```javascript
// Implement robust error handling
const executeWithFallback = async (query) => {
  try {
    return await primaryProvider.query(query);
  } catch (error) {
    console.warn(`Primary provider failed: ${error}`);
    return await secondaryProvider.query(query);
  }
};
```

### 4. Data Validation

```javascript
// Validate and sanitize API responses
const validateResponse = (response, schema) => {
  if (!response || typeof response !== "object") {
    throw new Error("Invalid response format");
  }

  // Validate against schema
  return validateAgainstSchema(response, schema);
};
```

---

## Troubleshooting

### Common Issues

**Issue**: "Invalid API Key"

- **Solution**: Verify key format and expiration in provider dashboard
- **Action**: Regenerate key if necessary

**Issue**: "Rate limit exceeded"

- **Solution**: Implement request queuing and rate limiting
- **Action**: Upgrade to higher tier plan

**Issue**: "Connection timeout"

- **Solution**: Check firewall rules and provider status
- **Action**: Implement retry logic with exponential backoff

**Issue**: "No results found"

- **Solution**: Verify query syntax and target validity
- **Action**: Check provider documentation for query format

---

## Security Considerations

### API Key Protection

✅ **DO**:

- Store keys in encrypted database
- Rotate keys every 90 days
- Use separate keys for dev/prod
- Monitor API usage for anomalies
- Implement access controls

❌ **DON'T**:

- Commit keys to version control
- Share keys via email or chat
- Use same key across environments
- Log keys in error messages
- Expose keys in client-side code

### Data Privacy

- All API data is encrypted in transit (HTTPS)
- RedLinux stores results in encrypted database
- No data is shared with third parties
- Compliance with GDPR, CCPA, etc.

---

## Advanced Configuration

### Custom Filters

```javascript
// Create custom search filters for specific scenarios
const customFilters = {
  criticalVulnerabilities: `vuln:CVE AND severity:critical`,
  exposedDatabases: `port:27017 OR port:5432 OR port:3306`,
  webApplications: `port:80 OR port:443 OR port:8080`,
  cloudInfrastructure: `aws OR azure OR gcp`,
};
```

### Automated Workflows

```javascript
// Implement automated reconnaissance workflows
const autonomousRecon = async (target) => {
  const shodanResults = await shodan.search(target);
  const censysResults = await censys.search(target);
  const greynoise = await greynoise.analyze(shodanResults);

  return synthesizeIntelligence(shodanResults, censysResults, greynoise);
};
```

---

## Resources

- **SHODAN Documentation**: https://shodan.readthedocs.io/
- **Censys API Docs**: https://censys.io/api/
- **GreyNoise API Docs**: https://docs.greynoise.io/
- **RedLinux Integration Guide**: See SETUP_GUIDE.md

---

## Version Information

- **Guide Version**: 1.0
- **Last Updated**: May 2026
- **Compatible with RedLinux**: v4.1+
