# Weaviate Setup Guide

## URL Format

The Weaviate URL should be just the endpoint without the protocol:

### For Weaviate Cloud Services (Recommended)
```
iq67zgnppoeiesnak2.c0.us-west3.gcp.weaviate.cloud
```

**Examples:**
```
buildcore.weaviate.network
iq67zgnppoeiesnak2.c0.us-west3.gcp.weaviate.cloud
my-cluster.weaviate.network
```

### For Local Development
```
localhost:8080
```

## Environment Variables

Create a `.env` file in your project root with:

```env
# Weaviate Configuration
WEAVIATE_URL=iq67zgnppoeiesnak2.c0.us-west3.gcp.weaviate.cloud
WEAVIATE_API_KEY=sk-your-api-key-here
```

## Getting Started with Weaviate Cloud Services

1. **Sign up** at [Weaviate Cloud Services](https://console.weaviate.cloud/)
2. **Create a new cluster** (free tier available)
3. **Copy your cluster endpoint** (not the full URL)
4. **Add them to your `.env` file**

## Testing Your Connection

Run the test script to verify your connection:

```bash
npm run test-weaviate
```

## Common Issues

### 1. Network Connectivity
- Check your internet connection
- Verify the endpoint is accessible
- Check firewall/proxy settings

### 2. Authentication
- Ensure your API key is correct
- Check if the API key has proper permissions
- Verify the API key isn't expired

### 3. URL Format
- Use only the endpoint (no https:// prefix)
- Don't include trailing slashes
- Don't include paths after the domain

## Example Valid URLs

✅ **Correct:**
- `buildcore.weaviate.network`
- `iq67zgnppoeiesnak2.c0.us-west3.gcp.weaviate.cloud`
- `localhost:8080`

❌ **Incorrect:**
- `https://buildcore.weaviate.network` (includes protocol)
- `buildcore.weaviate.network/` (trailing slash)
- `buildcore.weaviate.network/v1` (extra path) 