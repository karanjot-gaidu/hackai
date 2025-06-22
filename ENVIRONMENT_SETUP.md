"# Environment Setup for Image Generation" 

To get the image generation working, you need to set up the following environment variables:

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Modal API URL (replace with your actual Modal deployment URL)
MODAL_URL=https://karanjot-gaidu--sd-demo-modal-generate.modal.run

# For client-side testing (optional)
NEXT_PUBLIC_MODAL_URL=https://karanjot-gaidu--sd-demo-modal-generate.modal.run

# Supabase Configuration (you should already have these)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Clerk Configuration (you should already have these)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

## Getting Your Modal URL

1. Deploy your Modal app:
   ```bash
   modal deploy main.py
   ```

2. After deployment, Modal will show you the endpoint URLs. Look for something like:
   ```
   https://karanjot-gaidu--sd-demo-modal-generate.modal.run
   ```

3. Use this URL as your `MODAL_URL` environment variable.

## Testing

1. Visit `/test-image` to test the image generation directly
2. Check the browser console for detailed logs
3. Try both "Test Modal Directly" and "Test Our API" buttons

## Common Issues

1. **Modal URL not set**: Make sure `MODAL_URL` is set in your environment
2. **CORS issues**: Modal endpoints should handle CORS automatically
3. **Authentication**: Make sure you're logged in with Clerk
4. **Supabase storage**: If Supabase upload fails, the app will use base64 fallback

## Debugging Steps

1. Check browser console for errors
2. Use the test page at `/test-image`
3. Check server logs in your terminal
4. Verify Modal deployment is running
5. Test Modal health endpoint: `https://karanjot-gaidu--sd-demo-modal-health.modal.run` 
