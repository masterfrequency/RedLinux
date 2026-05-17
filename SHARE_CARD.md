# RedLinux Social Share Card

## Overview

The RedLinux social share card is automatically displayed when the repository link is shared on social media platforms. The card includes the project's branding, description, and visual identity to attract potential users and contributors.

## Share Card Details

**Image**: `redlinux_share_card.png`

- **Dimensions**: 1200x630 pixels (optimized for social media)
- **Format**: PNG with high-fidelity graphics
- **Location**: `/client/public/redlinux_share_card.png`

**Metadata**:

- **Title**: RedLinux v4.1 - Autonomous Red Team Operations Framework
- **Description**: A cutting-edge red team operations framework with advanced OSINT, network infiltration, exploit development, and C2 capabilities.
- **URL**: https://github.com/masterfrequency/RedLinux
- **Image URL**: https://raw.githubusercontent.com/masterfrequency/RedLinux/main/client/public/redlinux_share_card.png

## How It Works

When you share the RedLinux repository link on social media platforms (Facebook, Twitter, LinkedIn, etc.), the platform automatically fetches the Open Graph metadata from the `index.html` file. This metadata includes:

- **og:title**: The project title
- **og:description**: A brief description of the project
- **og:image**: The URL to the share card image
- **og:url**: The repository URL

## Supported Platforms

The share card is optimized for:

- **Twitter/X**: Uses Twitter Card metadata
- **Facebook**: Uses Open Graph metadata
- **LinkedIn**: Uses Open Graph metadata
- **Discord**: Displays the image with metadata
- **Slack**: Displays the image with metadata

## Customization

To customize the share card:

1. Edit the image at `/client/public/redlinux_share_card.png`
2. Update the metadata in `/client/index.html` if needed
3. Commit and push the changes

## Testing

To test the share card before sharing:

1. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
2. **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
3. **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/

Simply paste the repository URL into these tools to preview how the share card will appear.

---

_RedLinux v4.1 - Autonomous Red Team Operations Framework_
