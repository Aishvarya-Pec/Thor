# 🚀 New Cloudflare Account Setup Guide

## Step 1: Login to New Cloudflare Account
```bash
npx wrangler login
```
This will open your browser to authenticate with your new Cloudflare account.

## Step 2: Deploy with New Account
```bash
cd builder
npm run deploy:new
```

## Step 3: Verify Deployment
Check that your new deployment is working at the provided URL.

## Step 4: Update README
Update the live demo URL in README.md with the new deployment URL.

---

# Deployment Checklist - Error Prevention Guide

This checklist ensures your Thor application deploys without errors and handles issues gracefully.

## Pre-Deployment Checks

### 1. Environment Variables ✅
- [ ] `.env` and `.dev.vars` have matching API keys
- [ ] `OPEN_ROUTER_API_KEY` is valid and active
- [ ] `BACKUP_OPEN_ROUTER_API_KEY` is configured for redundancy
- [ ] All required Clerk authentication keys are present

### 2. Model Configuration ✅
- [ ] Primary models are available on OpenRouter
- [ ] Fallback models are configured
- [ ] Model names match OpenRouter's current API
- [ ] Rate limits are considered for your usage tier

### 3. Error Handling ✅
- [ ] Error boundaries are in place for React errors
- [ ] API retry logic is implemented
- [ ] Rate limiting detection is active
- [ ] Graceful degradation for failed services

### 4. Build Configuration
- [ ] All dependencies are compatible
- [ ] TypeScript compilation passes
- [ ] No console errors in development
- [ ] Production build completes successfully

## Deployment Commands

```bash
# 1. Type check
npm run typecheck

# 2. Lint check
npm run lint

# 3. Build for production
npm run build

# 4. Test build locally
npm run preview

# 5. Deploy to Cloudflare Pages
npm run deploy
```

## Post-Deployment Verification

### 1. Application Health
- [ ] Application loads without hydration errors
- [ ] All models show as available in health check
- [ ] Chat functionality works with all models
- [ ] Error boundaries handle edge cases gracefully

### 2. API Endpoints
- [ ] `/api/chat` responds correctly
- [ ] Model health checks return proper status
- [ ] Error responses include helpful messages
- [ ] Rate limiting headers are present when needed

### 3. Error Monitoring
- [ ] Error boundaries log errors appropriately
- [ ] Failed requests are retried automatically
- [ ] Users see helpful error messages
- [ ] No sensitive information in error logs

## Troubleshooting Common Issues

### Rate Limiting
```bash
# Check your OpenRouter usage dashboard
# Implement exponential backoff in retry logic
# Consider upgrading your OpenRouter plan
```

### Model Availability
```bash
# Verify model names on OpenRouter API
# Update model names in constants.ts if needed
# Check fallback models are working
```

### Hydration Errors
```bash
# Ensure server and client render the same HTML
# Check for conditional rendering differences
# Verify all components handle loading states
```

### API Key Issues
```bash
# Verify API keys are active on OpenRouter
# Check both .env and .dev.vars files
# Ensure backup keys are configured
```

## Maintenance

### Regular Checks
- [ ] Monitor OpenRouter API usage and costs
- [ ] Update model names when OpenRouter adds new models
- [ ] Review error logs for new patterns
- [ ] Test all models periodically

### Updates
- [ ] Keep dependencies updated
- [ ] Monitor for new OpenRouter model releases
- [ ] Update fallback models as needed
- [ ] Review and improve error handling

## Emergency Contacts

- **OpenRouter Support**: For API key and rate limiting issues
- **Cloudflare Support**: For deployment and hosting issues
- **Development Team**: For application-specific bugs

---

*Last updated: $(date)*
*Next review: $(date -d '+30 days')*